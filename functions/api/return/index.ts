
import { verifyToken, jsonResponse, errorResponse } from '../../utils';

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await verifyToken(request, env);

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return errorResponse('Unauthorized. Only staff can process returns.', 403);
    }

    try {
        const { bookId } = await request.json();

        // 检查书籍是否已被借出
        const book = await env.DB.prepare('SELECT status FROM Books WHERE id = ?').bind(bookId).first();
        if (!book) return errorResponse('Book not found', 404);
        if (book.status !== 'borrowed') return errorResponse('Book is not borrowed', 400); // 或者保持幂等性返回成功？

        // 查找活跃的借阅记录
        // 我们需要找到 return_date 为 NULL 的最新记录
        const record = await env.DB.prepare(
            'SELECT id FROM BorrowRecords WHERE book_id = ? AND return_date IS NULL'
        ).bind(bookId).first();

        if (!record) {
            // 状态不一致？无论如何都重置书籍状态？
            // 安全起见：直接重置书籍状态
            await env.DB.prepare('UPDATE Books SET status = ? WHERE id = ?').bind('available', bookId).run();
            return jsonResponse({ success: true, message: 'Book marked available (No active record found)' });
        }

        const now = Math.floor(Date.now() / 1000);
        const batch = [
            env.DB.prepare('UPDATE Books SET status = ? WHERE id = ?').bind('available', bookId),
            env.DB.prepare('UPDATE BorrowRecords SET return_date = ?, status = ? WHERE id = ?').bind(now, 'returned', record.id)
        ];

        await env.DB.batch(batch);

        return jsonResponse({ success: true, message: 'Returned successfully' });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
