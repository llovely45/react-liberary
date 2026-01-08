
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestGet(context) {
    const { params, env } = context;
    const id = params.id;

    try {
        const book = await env.DB.prepare('SELECT * FROM Books WHERE id = ?').bind(id).first();
        if (!book) return errorResponse('Book not found', 404);
        return jsonResponse(book);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;
    const user = await verifyToken(request, env);

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return errorResponse('Unauthorized', 403);
    }

    try {
        const data = await request.json();
        // Dynamic update query construction could be safer, but for MVP we might just update explicitly or check fields.
        // Let's simplified update: only allow updating main metadata, not ID or CreatedAt.
        const { title, author, publisher, description, status } = data; // destructure allowed fields

        // We construct a query dynamically based on what's provided
        // Actually, SQL simple update:
        // UPDATE Books SET title=?, author=?, ... WHERE id=?
        // But we need to handle partial updates or expect full object. Let's expect partials.

        // Simple approach: fetch existing, merge, update. (Two Query)
        const existing = await env.DB.prepare('SELECT * FROM Books WHERE id = ?').bind(id).first();
        if (!existing) return errorResponse('Book not found', 404);

        const newTitle = title || existing.title;
        const newAuthor = author || existing.author;
        const newPublisher = publisher || existing.publisher;
        const newDesc = description || existing.description;
        const newStatus = status || existing.status;

        await env.DB.prepare(
            'UPDATE Books SET title=?, author=?, publisher=?, description=?, status=? WHERE id=?'
        ).bind(newTitle, newAuthor, newPublisher, newDesc, newStatus, id).run();

        return jsonResponse({ success: true, message: 'Updated' });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;
    const user = await verifyToken(request, env);

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return errorResponse('Unauthorized', 403);
    }

    try {
        await env.DB.prepare('DELETE FROM Books WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true, message: 'Deleted' });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
