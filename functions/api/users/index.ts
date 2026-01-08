
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestGet(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized', 403);
    }

    try {
        const { results } = await env.DB.prepare('SELECT id, username, role, created_at FROM Users').all();
        return jsonResponse(results);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

import { hashPassword } from '../../utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user) return errorResponse('Unauthorized', 401);

    try {
        const { username, password, role } = await request.json();

        if (!username || !password || !role) {
            return errorResponse('Missing fields', 400);
        }

        // Permission Check
        if (user.role === 'admin') {
            if (role === 'admin') return errorResponse('Cannot create another admin via API', 403);
            // Admin can create staff and reader
        } else if (user.role === 'staff') {
            if (role !== 'reader') return errorResponse('Staff can only create readers', 403);
        } else {
            return errorResponse('Unauthorized', 403);
        }

        // Check existing
        const existing = await env.DB.prepare('SELECT id FROM Users WHERE username = ?').bind(username).first();
        if (existing) return errorResponse('Username already exists', 409);

        // Hash and Insert
        const hashedPassword = await hashPassword(password);
        await env.DB.prepare('INSERT INTO Users (username, password, role) VALUES (?, ?, ?)')
            .bind(username, hashedPassword, role)
            .run();

        return jsonResponse({ message: 'User created successfully' }, 201);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
