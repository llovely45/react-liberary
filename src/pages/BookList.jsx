import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash, BookOpen, User, Calendar, BookX } from 'lucide-react';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const { user } = useAuth();

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (res.ok) setBooks(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const handleBorrow = async (bookId) => {
        if (!confirm('确认借阅这本书吗？')) return;
        try {
            const res = await fetch('/api/borrow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId })
            });
            const data = await res.json();
            if (res.ok) {
                fetchBooks();
            } else {
                alert('借阅失败: ' + data.error);
            }
        } catch (e) {
            alert('错误: ' + e.message);
        }
    };

    const handleReturn = async (bookId) => {
        if (!confirm('确认归还这本书吗？')) return;
        try {
            const res = await fetch('/api/return', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bookId })
            });
            const data = await res.json();
            if (res.ok) {
                fetchBooks();
            } else {
                alert('归还失败: ' + data.error);
            }
        } catch (e) {
            alert('错误: ' + e.message);
        }
    };

    const handleDelete = async (bookId) => {
        if (!confirm('确定要删除这本书吗？此操作不可撤销。')) return;
        try {
            const res = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.ok) fetchBooks();
            else alert('删除失败');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">馆藏图书</h1>
                    <p className="text-slate-500 text-sm mt-1">查看所有图书的状态及信息</p>
                </div>

                {(user.role === 'admin' || user.role === 'staff') && (
                    <Link to="/books/new" className="btn btn-primary shadow-lg shadow-blue-500/30">
                        <Plus size={18} />
                        <span>添加新书</span>
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="搜索书名、作者或 ISBN..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:shadow-md"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book, index) => (
                        <div
                            key={book.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fadeIn"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="p-6 relative">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen size={64} className="text-slate-800" />
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${book.status === 'available'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                                        }`}>
                                        {book.status === 'available' ? '现货可借' : '已借出'}
                                    </div>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                        {book.isbn}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1" title={book.title}>
                                    {book.title}
                                </h3>
                                <p className="text-slate-500 text-sm mb-4 flex items-center gap-1">
                                    <User size={14} />
                                    {book.author}
                                </p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-xs text-slate-400">
                                        <BookOpen size={14} className="mr-2" />
                                        <span className="truncate">{book.publisher}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-400">
                                        <Calendar size={14} className="mr-2" />
                                        <span>{book.year || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                    {book.status === 'available' && (
                                        <button
                                            onClick={() => handleBorrow(book.id)}
                                            className="flex-1 btn bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-transparent"
                                        >
                                            借阅
                                        </button>
                                    )}
                                    {book.status === 'borrowed' && (user.role === 'admin' || user.role === 'staff') && (
                                        <button
                                            onClick={() => handleReturn(book.id)}
                                            className="flex-1 btn bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 border-transparent"
                                        >
                                            归还
                                        </button>
                                    )}

                                    {(user.role === 'admin' || user.role === 'staff') && (
                                        <div className="flex items-center gap-1 ml-auto">
                                            <Link
                                                to={`/books/${book.id}/edit`}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="编辑"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="删除"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && books.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <BookX size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">未找到相关图书</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">
                        尝试调整您的搜索关键词，或添加新书到馆藏中。
                    </p>
                </div>
            )}
        </div>
    );
};

export default BookList;
