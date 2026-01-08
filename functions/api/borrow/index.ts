
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user) {
        return errorResponse('Unauthorized', 401);
    }

    try {
        const { bookId, userId } = await request.json();

        // 如果用户是读者，只能为自己借阅
        let targetUserId = user.sub;
        if (user.role === 'admin' || user.role === 'staff') {
            if (userId) targetUserId = userId; // 允许为他人借阅
        }

        // 检查书籍可用性
        const book = await env.DB.prepare('SELECT status FROM Books WHERE id = ?').bind(bookId).first();
        if (!book) return errorResponse('Book not found', 404);
        if (book.status !== 'available') return errorResponse('Book is not available', 400);

        // 事务处理：更新书籍状态，插入借阅记录
        // D1 批量操作 (batching)
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
