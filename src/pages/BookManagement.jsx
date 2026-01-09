import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Book, Calendar, User, Building, FileText } from 'lucide-react';

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
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate('/books')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium">
                <ArrowLeft size={16} className="mr-1" /> 返回图书目录
            </button>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                    <h1 className="text-2xl font-bold text-slate-800">{isEdit ? '编辑图书信息' : '录入新书'}</h1>
                    <p className="text-slate-500 text-sm mt-1">请填写以下详细信息以完善馆藏记录</p>
                </div>

                <div className="p-8">
                    {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex items-center gap-2">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Book size={14} className="text-slate-400" /> ISBN 编号
                                </label>
                                <input
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                    required
                                    disabled={isEdit}
                                    placeholder="e.g. 978-7-115-54608-1"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Book size={14} className="text-slate-400" /> 书名
                                </label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    required
                                    placeholder="输入图书完整名称"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <User size={14} className="text-slate-400" /> 作者
                                </label>
                                <input
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    required
                                    placeholder="图书作者"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <Building size={14} className="text-slate-400" /> 出版社
                                </label>
                                <input
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="出版发行社"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" /> 出版日期
                            </label>
                            <input
                                type="date"
                                name="publication_date"
                                value={formData.publication_date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                                <FileText size={14} className="text-slate-400" /> 内容简介
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                                placeholder="简要描述图书内容..."
                            />
                        </div>

                        {isEdit && (
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <label className="text-sm font-semibold text-orange-800 block mb-2">当前借阅状态</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-orange-900"
                                >
                                    <option value="available">现货可借 (Available)</option>
                                    <option value="borrowed">已借出 (Borrowed)</option>
                                    <option value="lost">遗失 (Lost)</option>
                                </select>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/books')}
                                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center gap-2"
                                disabled={loading}
                            >
                                <Save size={18} />
                                {loading ? '正在保存...' : '保存更改'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookManagement;
