
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Users, PlusCircle } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return <Outlet />;

    const isActive = (path) => location.pathname === path ? 'text-accent' : 'text-slate-300 hover:text-white';

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="bg-primary text-white shadow-lg">
                <div className="container py-4 flex-between">
                    <Link to="/" className="flex-center gap-2 text-xl font-bold tracking-tight">
                        <BookOpen className="text-accent" />
                        <span>Liberary</span>
                    </Link>

                    <div className="flex-center gap-6">
                        <Link to="/" className={isActive('/')}>仪表盘</Link>
                        <Link to="/books" className={isActive('/books')}>图书列表</Link>

                        {(user.role === 'admin' || user.role === 'staff') && (
                            <Link to="/books/new" className={isActive('/books/new')}>添加图书</Link>
                        )}

                        {user.role === 'admin' && (
                            <Link to="/users" className={isActive('/users')}>用户管理</Link>
                        )}

                        <div className="flex-center gap-4 ml-6 pl-6 border-l border-slate-700">
                            <div className="flex-center gap-2 text-sm text-slate-300">
                                <User size={16} />
                                <span>{user.username} ({user.role})</span>
                            </div>
                            <button onClick={logout} className="text-slate-300 hover:text-accent transition-colors" title="退出登录">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container py-8 animate-fadeIn">
                <Outlet />
            </main>

            <footer className="py-6 text-center text-muted text-sm border-t border-slate-200">
                &copy; {new Date().getFullYear()} Liberary 图书管理系统
            </footer>
        </div>
    );
};

export default Layout;
