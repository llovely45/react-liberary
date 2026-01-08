
import { SignJWT } from 'jose';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }

    // In a real app, hash the password. here we compare plaintext for the MVP/Seed data
    const user = await env.DB.prepare('SELECT * FROM Users WHERE username = ? AND password = ?').bind(username, password).first();

    if (!user) {
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
