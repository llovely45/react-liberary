import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Book, Search, UserPlus, Clock, Shield, Activity, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '早上好';
        if (hour < 18) return '下午好';
        return '晚上好';
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-xl shadow-blue-900/10">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Book size={200} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {getTimeGreeting()}, {user.username} 👋
                    </h1>
                    <p className="text-blue-100/90 text-lg max-w-2xl">
                        欢迎回到 Liberary 图书管理系统。今天您想做些什么？这里是您的控制中心，您可以在此管理图书、用户并查看系统状态。
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="text-blue-500" />
                    <span>快速操作</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCard
                        to="/books"
                        title="浏览馆藏"
                        description="搜索并查阅图书馆中的所有书籍资源"
                        icon={<Search size={24} />}
                        color="bg-emerald-500"
                        delay="delay-100"
                    />

                    {(user.role === 'admin' || user.role === 'staff') && (
                        <ActionCard
                            to="/books/new"
                            title="添加新书"
                            description="录入新的图书信息到数据库中"
                            icon={<Book size={24} />}
                            color="bg-blue-500"
                            delay="delay-200"
                        />
                    )}

                    {user.role === 'admin' && (
                        <ActionCard
                            to="/users"
                            title="用户管理"
                            description="管理系统用户、角色及权限设置"
                            icon={<UserPlus size={24} />}
                            color="bg-purple-500"
                            delay="delay-300"
                        />
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                    icon={<Shield size={20} />}
                    label="当前角色"
                    value={user.role}
                    subtext="权限已激活"
                    iconColor="text-indigo-500"
                    bgColor="bg-indigo-50"
                />
                <StatusCard
                    icon={<Clock size={20} />}
                    label="系统时间"
                    value={new Date().toLocaleTimeString()}
                    subtext={new Date().toLocaleDateString()}
                    iconColor="text-orange-500"
                    bgColor="bg-orange-50"
                />
                <StatusCard
                    icon={<Activity size={20} />}
                    label="系统状态"
                    value="运行正常"
                    subtext="所有服务在线"
                    iconColor="text-emerald-500"
                    bgColor="bg-emerald-50"
                />
            </div>
        </div>
    );
};

const ActionCard = ({ to, title, description, icon, color, delay }) => (
    <Link
        to={to}
        className={`group relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn ${delay}`}
    >
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${color}`} />

        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md ${color}`}>
                {icon}
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center justify-between">
                {title}
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-slate-800 transition-colors" />
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
                {description}
            </p>
        </div>
    </Link>
);

const StatusCard = ({ icon, label, value, subtext, iconColor, bgColor }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-slate-800 capitalize leading-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>
        </div>
    </div>
);

export default Dashboard;
