
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Book, Search, UserPlus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">仪表盘</h1>
                <p className="text-muted">欢迎回来， {user.username}。</p>
            </div>

            <div className="grid-cols-3">
                <div className="card hover:border-accent">
                    <h3 className="heading mb-2">浏览图书</h3>
                    <p className="text-muted text-sm mb-4">探索我们的馆藏，发现您的下一本读物。</p>
                    <Link to="/books" className="btn btn-primary w-full justify-center">
                        <Search size={18} /> 搜索
                    </Link>
                </div>

                {(user.role === 'admin' || user.role === 'staff') && (
                    <div className="card hover:border-accent">
                        <h3 className="heading mb-2">馆藏管理</h3>
                        <p className="text-muted text-sm mb-4">添加新书或更新现有库存。</p>
                        <Link to="/books/new" className="btn btn-secondary w-full justify-center">
                            <Book size={18} /> 添加图书
                        </Link>
                    </div>
                )}

                {user.role === 'admin' && (
                    <div className="card hover:border-accent">
                        <h3 className="heading mb-2">用户管理</h3>
                        <p className="text-muted text-sm mb-4">管理系统用户和访问权限。</p>
                        <Link to="/users" className="btn btn-secondary w-full justify-center">
                            <UserPlus size={18} /> 管理用户
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-primary mb-4">系统状态</h2>
                <div className="card p-4">
                    <div className="flex-between border-b border-border pb-2 mb-2">
                        <span className="text-muted">您的角色</span>
                        <span className="font-semibold capitalize">{user.role}</span>
                    </div>
                    <div className="flex-between">
                        <span className="text-muted">系统时间</span>
                        <span className="font-semibold">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
