
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        const { bookId, userId } = await request.json();

        // If user is reader, can only borrow for self
        let targetUserId = user.sub;
        if (user.role === 'admin' || user.role === 'staff') {
            if (userId) targetUserId = userId; // Allow borrowing for others
        }

        // Check book availability
        const book = await env.DB.prepare('SELECT status FROM Books WHERE id = ?').bind(bookId).first();
        if (!book) return errorResponse('Book not found', 404);
        if (book.status !== 'available') return errorResponse('Book is not available', 400);

        // Transaction: Update Book, Insert Record
        // D1 batching
        const now = Math.floor(Date.now() / 1000);

        const batch = [
            env.DB.prepare('UPDATE Books SET status = ? WHERE id = ?').bind('borrowed', bookId),
            env.DB.prepare('INSERT INTO BorrowRecords (user_id, book_id, borrow_date) VALUES (?, ?, ?)').bind(targetUserId, bookId, now)
        ];

        await env.DB.batch(batch);

        return jsonResponse({ success: true, message: 'Borrowed successfully' });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
