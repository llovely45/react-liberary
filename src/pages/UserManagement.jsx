
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

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
                alert('Role updated');
                fetchUsers();
            } else {
                alert('Failed to update role');
            }
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-primary mb-6">User Management</h1>

            <div className="card overflow-hidden p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-muted">ID</th>
                            <th className="p-4 text-sm font-semibold text-muted">Username</th>
                            <th className="p-4 text-sm font-semibold text-muted">Role</th>
                            <th className="p-4 text-sm font-semibold text-muted">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map(u => (
                            <tr key={u.id}>
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
                                    <select
                                        className="text-sm border rounded px-2 py-1"
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    >
                                        <option value="reader">Reader</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
