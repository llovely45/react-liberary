
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

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
        <div className="min-h-screen flex-center bg-body">
            <div className="card w-full max-w-md p-8 animate-fadeIn">
                <div className="flex-center flex-col mb-8 text-center">
                    <div className="w-12 h-12 bg-primary rounded-full flex-center text-accent mb-4">
                        <BookOpen size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">{isLogin ? '欢迎回来' : '加入 Liberary'}</h1>
                    <p className="text-muted text-sm mt-2">
                        {isLogin ? '输入您的凭证以访问图书馆' : '创建一个新的读者账号'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-main mb-1">用户名</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-main mb-1">密码</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full btn btn-primary justify-center shadow-lg shadow-blue-900/20">
                        {isLogin ? '登录' : '创建账号'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted">{isLogin ? "还没有账号？ " : "已有账号？ "}</span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-semibold hover:text-accent transition-colors"
                    >
                        {isLogin ? '注册' : '登录'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
