
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, X } from 'lucide-react';

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
                alert('角色已更新');
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
                alert('用户创建成功');
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
        <div>
            <div className="flex-between mb-6">
                <h1 className="text-3xl font-bold text-primary">用户管理</h1>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                    <Plus size={18} /> 添加用户
                </button>
            </div>

            <div className="card overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f0f4f8] border-b border-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-muted">ID</th>
                            <th className="p-4 text-sm font-semibold text-muted">用户名</th>
                            <th className="p-4 text-sm font-semibold text-muted">角色</th>
                            <th className="p-4 text-sm font-semibold text-muted">创建时间</th>
                            <th className="p-4 text-sm font-semibold text-muted text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm text-main">{u.id}</td>
                                <td className="p-4 text-sm font-medium text-primary">{u.username}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold 
                                    ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            u.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        <Shield size={10} />
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-muted">
                                    {new Date(u.created_at * 1000).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    {currentUser.role === 'admin' && u.username !== 'admin' && ( // Simple protect admin
                                        <select
                                            className="text-sm border rounded px-2 py-1 bg-white"
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        >
                                            <option value="reader">Reader</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                        <div className="flex-between mb-4">
                            <h3 className="text-xl font-bold text-primary">添加新用户</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">用户名</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">密码</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    placeholder="明文密码 (将会被加密存储)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">角色</label>
                                <select
                                    className="input"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="reader">读者 (Reader)</option>
                                    {currentUser.role === 'admin' && (
                                        <option value="staff">工作人员 (Staff)</option>
                                    )}
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    创建用户
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
