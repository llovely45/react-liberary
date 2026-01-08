
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
        // 这种动态构建更新查询的方式可能会更安全，但对于 MVP 版本，我们可以直接进行更新或检查字段。
        // 让我们简化更新逻辑：仅允许更新主要的元数据，不允许修改 ID 或 CreatedAt。
        const { title, author, publisher, description, status } = data; // 解构允许修改的字段

        // 我们根据提供的数据动态构建查询语句
        // 实际上，使用简单的 SQL 更新语句：
        // UPDATE Books SET title=?, author=?, ... WHERE id=?
        // 但我们需要处理部分更新，或者期望传入完整的对象。这里我们支持部分更新。

        // 简单的方法：先获取现有数据，合并后再更新。（需要两次查询）
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
