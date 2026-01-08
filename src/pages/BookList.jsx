
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash, BookOpen, Clock } from 'lucide-react';

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
    }, [query]); // Simple debounce could be added, but relying on manual enter or quick keypress is fine for MVP

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
                alert('Success: ' + data.message);
                fetchBooks();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            alert('Error: ' + e.message);
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
                alert('Success: ' + data.message);
                fetchBooks();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            alert('Error: ' + e.message);
        }
    };

    const handleDelete = async (bookId) => {
        if (!confirm('确定要删除这本书吗？')) return;
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
        <div>
            <div className="flex-between mb-6">
                <h1 className="text-3xl font-bold text-primary">图书目录</h1>
                {(user.role === 'admin' || user.role === 'staff') && (
                    <Link to="/books/new" className="btn btn-primary">
                        <Plus size={18} /> 添加图书
                    </Link>
                )}
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="按书名、作者或 ISBN 搜索..."
                    className="input pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-10 text-muted">正在加载图书...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map(book => (
                        <div key={book.id} className="card hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: book.status === 'available' ? 'var(--accent)' : 'var(--text-muted)' }}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-primary truncate" title={book.title}>{book.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${book.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {book.status}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-main mb-1">{book.author}</p>
                            <p className="text-xs text-muted mb-4">{book.isbn} &bull; {book.publisher}</p>

                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                                {book.status === 'available' && (
                                    <button onClick={() => handleBorrow(book.id)} className="btn btn-primary text-xs py-1 px-3 flex-grow justify-center">
                                        借阅
                                    </button>
                                )}
                                {book.status === 'borrowed' && (user.role === 'admin' || user.role === 'staff') && (
                                    <button onClick={() => handleReturn(book.id)} className="btn btn-secondary text-xs py-1 px-3 flex-grow justify-center">
                                        归还
                                    </button>
                                )}

                                {(user.role === 'admin' || user.role === 'staff') && (
                                    <>
                                        <Link to={`/books/${book.id}/edit`} className="p-2 text-muted hover:text-primary transition-colors">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(book.id)} className="p-2 text-muted hover:text-red-600 transition-colors">
                                            <Trash size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {books.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted">
                            未找到匹配的图书。
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookList;
