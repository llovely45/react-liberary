import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, LayoutDashboard, Library, Users as UsersIcon, Plus } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return <Outlet />;

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="fixed top-0 w-full z-50 glass-dark text-white border-b border-white/10 shadow-lg">
                <div className="container h-16 flex-between">
                    <Link to="/" className="flex-center gap-3 group">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Liberary
                        </span>
                    </Link>

                    <div className="flex-center gap-2">
                        <NavLink to="/" icon={<LayoutDashboard size={18} />} text="仪表盘" active={location.pathname === '/'} />
                        <NavLink to="/books" icon={<Library size={18} />} text="图书列表" active={location.pathname === '/books'} />

                        {(user.role === 'admin' || user.role === 'staff') && (
                            <NavLink to="/books/new" icon={<Plus size={18} />} text="添加图书" active={location.pathname === '/books/new'} />
                        )}

                        {user.role === 'admin' && (
                            <NavLink to="/users" icon={<UsersIcon size={18} />} text="用户管理" active={location.pathname === '/users'} />
                        )}
                    </div>

                    <div className="flex-center gap-4 pl-6 border-l border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex-center text-xs font-bold ring-2 ring-white/10">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none">{user.username}</span>
                                <span className="text-xs text-slate-400 mt-1 capitalize">{user.role}</span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white ml-2"
                            title="退出登录"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container pt-24 pb-12 animate-fadeIn relative z-10">
                <Outlet />
            </main>

            <footer className="py-8 text-center border-t border-slate-200 mt-auto bg-white/50 backdrop-blur-sm">
                <p className="text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Liberary 图书管理系统. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

const NavLink = ({ to, icon, text, active }) => (
    <Link
        to={to}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${active
                ? 'bg-primary-light text-white shadow-md shadow-blue-500/10 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }
        `}
    >
        {icon}
        <span>{text}</span>
    </Link>
);

export default Layout;
