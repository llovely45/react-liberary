
import { SignJWT } from 'jose';

export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: 'Missing username or password' }), { status: 400 });
        }

        // Check availability
        const existing = await env.DB.prepare('SELECT id FROM Users WHERE username = ?').bind(username).first();
        if (existing) {
            return new Response(JSON.stringify({ error: 'Username already taken' }), { status: 409 });
        }

        // Insert user (default role: reader)
        const result = await env.DB.prepare('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)')
            .bind(username, password, 'reader')
            .run();

        if (!result.success) {
            throw new Error('Failed to create user');
        }

        // Auto-login
        // We need to fetch the ID we just inserted. SQLite autoincrement ID is in result.meta.last_row_id usually, but D1 response structure varies.
        // Safest is to query it back or allow login required. Let's query back.
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
