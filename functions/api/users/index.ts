
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
