
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const q = url.searchParams.get('q');

    let query = 'SELECT * FROM Books';
    let params = [];

    if (q) {
        query += ' WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? OR publisher LIKE ?';
        const likeQ = `%${q}%`;
        params = [likeQ, likeQ, likeQ, likeQ];
    }

    query += ' ORDER BY created_at DESC';

    try {
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse(results);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return errorResponse('Unauthorized', 403);
    }

    try {
        const { isbn, title, author, publisher, publication_date, description } = await request.json();
        if (!isbn || !title || !author) {
            return errorResponse('Missing required fields');
        }

        const res = await env.DB.prepare(
            'INSERT INTO Books (isbn, title, author, publisher, publication_date, description) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(isbn, title, author, publisher, publication_date, description).run();

        if (res.success) {
            return jsonResponse({ success: true, message: 'Book added' }, 201);
        } else {
            throw new Error('Failed to add book');
        }
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
