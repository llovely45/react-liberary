import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Lock, ArrowRight, Library } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-primary-dark">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-md p-8 relative z-10 animate-fadeIn">
                <div className="glass p-8 md:p-10 rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
                    {/* Decor header */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <Library className="text-white" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {isLogin ? '欢迎回来' : '加入 Liberary'}
                        </h1>
                        <p className="text-slate-500 mt-2">
                            {isLogin ? '请输入您的凭证以继续' : '创建账号开启阅读之旅'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-sm p-4 rounded-xl mb-6 border border-red-200 flex items-start animate-shake">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">用户名</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">密码</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <span>{isLogin ? '马上登录' : '立即注册'}</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-200/60">
                        <span className="text-slate-500 text-sm">
                            {isLogin ? "还没有账号？ " : "已有账号？ "}
                        </span>
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                        >
                            {isLogin ? '免费注册' : '直接登录'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-500/60 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Liberary Management System
                </p>
            </div>
        </div>
    );
};

export default Login;
