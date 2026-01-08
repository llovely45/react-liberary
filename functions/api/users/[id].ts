
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;
    const user = await verifyToken(request, env);

    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized', 403);
    }

    try {
        const { role } = await request.json();
        if (!['admin', 'staff', 'reader'].includes(role)) {
            return errorResponse('Invalid role', 400);
        }

        await env.DB.prepare('UPDATE Users SET role = ? WHERE id = ?').bind(role, id).run();
        return jsonResponse({ success: true, message: 'User updated' });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
