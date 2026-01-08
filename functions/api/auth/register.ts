
import { SignJWT } from 'jose';

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 });
        }

        // 检查用户名是否可用
        const existing = await env.DB.prepare('SELECT id FROM Users WHERE username = ?').bind(username).first();
        if (existing) {
            return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 });
        }

        // 插入用户（默认角色：读者）
        const result = await env.DB.prepare('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)')
            .bind(username, password, 'reader')
            .run();

        if (!result.success) {
            throw new Error('Failed to create user');
        }

        // 自动登录
        // 我们需要获取刚插入的用户 ID。SQLite 的自增 ID 通常在 result.meta.last_row_id 中，但 D1 的响应结构会有所不同。
        // 最安全的方法是反查数据库，或者要求用户重新登录。这里选择反查。
        const user = await env.DB.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first();

        const secret = new TextEncoder().encode(env.JWT_SECRET || 'secret-salt-dev');
        const token = await new SignJWT({ sub: user.id, role: user.role, username: user.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('2h')
            .sign(secret);

        return new Response(JSON.stringify({ token, user: { id: user.id, username: user.username, role: user.role } }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
