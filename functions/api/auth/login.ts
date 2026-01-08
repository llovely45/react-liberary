
import { SignJWT } from 'jose';
import { verifyPassword } from '../../utils';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }


    // 0. 检查数据库绑定情况
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding (DB) is missing. Please configure D1 binding in Cloudflare Pages settings.' }), { status: 500 });
    }

    // 1. 环境变量定义的管理员登录
    const adminUser = env.ADMIN_USERNAME || 'admin'; // 默认用户名（可选，可以设置为严格模式）
    // 注意：在生产环境中，应严格依赖环境变量。
    if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD && username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      // 确保管理员存在于数据库中，以便外键约束生效
      const existingAdmin = await env.DB.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first();
      let userId = existingAdmin?.id;

      if (!existingAdmin) {
        const result = await env.DB.prepare('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)')
          .bind(username, 'env-managed', 'admin')
          .run();
        // 获取新生成的 ID。SQLite/D1 通常在 meta 信息中返回，我们可以再次查询或者检查 result.meta.last_row_id（取决于 D1 的类型定义）
        // 最安全的方法是反查数据库
        const newAdmin = await env.DB.prepare('SELECT id FROM Users WHERE username = ?').bind(username).first();
        userId = newAdmin.id;
      } else if (existingAdmin.role !== 'admin') {
        // 如果用户名匹配环境变量，则将其提升为管理员（安全起见）
        await env.DB.prepare('UPDATE Users SET role = ? WHERE id = ?').bind('admin', userId).run();
      }

      // 为管理员生成 Token
      const secret = new TextEncoder().encode(env.JWT_SECRET || 'secret-salt-dev');
      const token = await new SignJWT({ sub: userId, role: 'admin', username: username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(secret);

      return new Response(JSON.stringify({ token, user: { id: userId, username: username, role: 'admin' } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }


    // 2. 标准数据库登录方式
    const user = await env.DB.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // 验证密码（哈希匹配或明文回退）
    let isValid = false;

    // 1. 尝试哈希值匹配
    if (await verifyPassword(password, user.password)) {
      isValid = true;
    }
    // 2. 回退方案：明文匹配（用于旧版或种子用户） - 生产环境中请务必移除
    else if (user.password === password) {
      isValid = true;
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

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
