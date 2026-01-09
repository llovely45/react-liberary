import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Library, Sparkles } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
            {/* 动态背景光晕 - 增加视觉深度 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md p-6 relative z-10">
                {/* 主卡片 - 强化毛玻璃效果 */}
                <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/10 relative overflow-hidden">

                    {/* 顶部渐变装饰条 */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />

                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 mb-6 transform transition-transform duration-500 group-hover:rotate-12">
                                <Library className="text-blue-400" size={32} />
                            </div>
                        </div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                            {isLogin ? '欢迎回来' : '创建新账号'}
                            {!isLogin && <Sparkles className="text-yellow-400" size={20} />}
                        </h1>
                        <p className="text-slate-400 mt-2 text-center">
                            {isLogin ? '探索知识的海洋，从这里开始' : '加入我们的社区，开启数字化阅读体验'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-slate-400 ml-1">用户名</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                                    placeholder="输入您的账号"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-slate-400 ml-1">密码</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative"
                        >
                            <span className="relative z-10">{isLogin ? '登录系统' : '完成注册'}</span>
                            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            {/* 按钮内的流光效果 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-white/5">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-slate-400 text-sm hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            {isLogin ? "还没有账号？" : "已有账号？"}
                            <span className="text-blue-400 font-semibold underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500">
                                {isLogin ? '立即注册' : '返回登录'}
                            </span>
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-8 tracking-widest uppercase">
                    &copy; {new Date().getFullYear()} Liberary Management System
                </p>
            </div>
        </div>
    );
};

export default Login;