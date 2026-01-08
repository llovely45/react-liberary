
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

const BookManagement = ({ isEdit }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Initial state
    const [formData, setFormData] = useState({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        publication_date: '',
        description: '',
        status: 'available'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEdit && id) {
            // Fetch book details
            fetch(`/api/books/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) setError(data.error);
                    else setFormData(data);
                });
        }
    }, [isEdit, id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const url = isEdit ? `/api/books/${id}` : '/api/books';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                navigate('/books');
            } else {
                setError(data.error || 'Operation failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate('/books')} className="btn btn-secondary mb-6 text-sm">
                <ArrowLeft size={16} /> 返回目录
            </button>

            <div className="card">
                <h1 className="text-2xl font-bold text-primary mb-6">{isEdit ? '编辑图书' : '添加新书'}</h1>

                {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">ISBN</label>
                            <input name="isbn" value={formData.isbn} onChange={handleChange} className="input" required disabled={isEdit} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">书名</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="input" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">作者</label>
                            <input name="author" value={formData.author} onChange={handleChange} className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">出版社</label>
                            <input name="publisher" value={formData.publisher} onChange={handleChange} className="input" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">出版日期</label>
                        <input type="date" name="publication_date" value={formData.publication_date} onChange={handleChange} className="input" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">简介</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="input h-32" />
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium mb-1">状态</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input">
                                <option value="available">可借阅</option>
                                <option value="borrowed">已借出</option>
                                <option value="lost">遗失</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4">
                        <button type="submit" className="btn btn-primary w-full justify-center" disabled={loading}>
                            <Save size={18} /> {loading ? '保存中...' : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookManagement;
