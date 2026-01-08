
import { SignJWT } from 'jose';
import { verifyPassword } from '../../utils';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }


    // 0. Check for DB binding
    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding (DB) is missing. Please configure D1 binding in Cloudflare Pages settings.' }), { status: 500 });
    }

    // 1. Environment Variable Admin Login
    const adminUser = env.ADMIN_USERNAME || 'admin'; // Default (optional, can be strict)
    // Note: In production, rely strictly on env vars. 

    if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD && username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      // Ensure admin exists in DB so foreign keys work
      const existingAdmin = await env.DB.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first();
      let userId = existingAdmin?.id;

      if (!existingAdmin) {
        const result = await env.DB.prepare('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)')
          .bind(username, 'env-managed', 'admin')
          .run();
        // Get the new ID. SQLite/D1 returns meta info, let's select it back or rely on result.meta.last_row_id if available (check D1 types)
        // Safest is to select back
        const newAdmin = await env.DB.prepare('SELECT id FROM Users WHERE username = ?').bind(username).first();
        userId = newAdmin.id;
      } else if (existingAdmin.role !== 'admin') {
        // Promote to admin if name matches env var (Safety choice)
        await env.DB.prepare('UPDATE Users SET role = ? WHERE id = ?').bind('admin', userId).run();
      }

      // Generate Token for Admin
      const secret = new TextEncoder().encode(env.JWT_SECRET || 'secret-salt-dev');
      const token = await new SignJWT({ sub: userId, role: 'admin', username: username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('2h')
        .sign(secret);

      return new Response(JSON.stringify({ token, user: { id: userId, username: username, role: 'admin' } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }


    // 2. Standard DB Login
    const user = await env.DB.prepare('SELECT * FROM Users WHERE username = ?').bind(username).first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    // Verify Password (Hashed or Plaintext fallback)
    let isValid = false;

    // 1. Try Hash
    if (await verifyPassword(password, user.password)) {
      isValid = true;
    }
    // 2. Fallback: Plaintext (for legacy/seed users) - REMOVE IN PRODUCTION
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
