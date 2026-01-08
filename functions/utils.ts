
import { jwtVerify } from 'jose';

export async function verifyToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET || 'secret-salt-dev');
        const { payload } = await jwtVerify(token, secret);
        return payload; // { sub, role, username, ... }
    } catch (e) {
        return null;
    }
}

export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}
