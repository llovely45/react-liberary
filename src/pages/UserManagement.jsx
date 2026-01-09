import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, X, User, Calendar, MoreHorizontal } from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'reader' });

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!confirm('确定要更改此用户的角色吗？')) return;
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                fetchUsers();
            } else {
                alert('更新角色失败');
            }
        } catch (e) {
            alert(e.message);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (res.ok) {
                setShowAddModal(false);
                setNewUser({ username: '', password: '', role: 'reader' });
                fetchUsers();
            } else {
                alert(data.error || '创建失败');
            }
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">用户管理</h1>
                    <p className="text-slate-500 text-sm mt-1">管理系统注册用户及权限分配</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary shadow-lg shadow-purple-500/30 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                    <Plus size={18} />
                    <span>添加用户</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">用户信息</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">角色权限</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">加入时间</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u, index) => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td className="p-5 text-sm font-mono text-slate-400">#{u.id}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-slate-900">{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border
                                        ${u.role === 'admin' ? 'bg-purple-100/50 text-purple-700 border-purple-200' :
                                                u.role === 'staff' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-slate-100/50 text-slate-700 border-slate-200'}`}>
                                            <Shield size={12} />
                                            <span className="capitalize">{u.role}</span>
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar size={14} />
                                            {new Date(u.created_at * 1000).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        {currentUser.role === 'admin' && u.username !== 'admin' && (
                                            <div className="relative inline-block">
                                                <select
                                                    className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-shadow cursor-pointer hover:border-purple-400"
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                >
                                                    <option value="reader">Reader</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <MoreHorizontal size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />

                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-fadeIn">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">添加新用户</h3>
                                <p className="text-slate-500 text-sm mt-1">创建一个新的系统访问账号</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 block">用户名</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        placeholder="输入用户名"
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 block">密码</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    placeholder="设置初始密码"
                                />
                                <p className="text-xs text-slate-400">密码将会被安全加密存储。</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 block">角色权限</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="reader">读者 (Reader) - 仅借阅</option>
                                    {currentUser.role === 'admin' && (
                                        <option value="staff">工作人员 (Staff) - 图书管理</option>
                                    )}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all transform active:scale-95"
                                >
                                    确认创建
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
