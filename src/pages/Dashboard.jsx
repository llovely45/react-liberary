
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Book, Search, UserPlus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
                <p className="text-muted">Welcome back, {user.username}.</p>
            </div>

            <div className="grid-cols-3">
                <div className="card hover:border-accent">
                    <h3 className="heading mb-2">Browse Books</h3>
                    <p className="text-muted text-sm mb-4">Explore our collection and find your next read.</p>
                    <Link to="/books" className="btn btn-primary w-full justify-center">
                        <Search size={18} /> Search
                    </Link>
                </div>

                {(user.role === 'admin' || user.role === 'staff') && (
                    <div className="card hover:border-accent">
                        <h3 className="heading mb-2">Manage Collection</h3>
                        <p className="text-muted text-sm mb-4">Add new books or update existing library inventory.</p>
                        <Link to="/books/new" className="btn btn-secondary w-full justify-center">
                            <Book size={18} /> Add Book
                        </Link>
                    </div>
                )}

                {user.role === 'admin' && (
                    <div className="card hover:border-accent">
                        <h3 className="heading mb-2">User Management</h3>
                        <p className="text-muted text-sm mb-4">Manage system users and access roles.</p>
                        <Link to="/users" className="btn btn-secondary w-full justify-center">
                            <UserPlus size={18} /> Manage Users
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-primary mb-4">System Status</h2>
                <div className="card p-4">
                    <div className="flex-between border-b border-border pb-2 mb-2">
                        <span className="text-muted">Your Role</span>
                        <span className="font-semibold capitalize">{user.role}</span>
                    </div>
                    <div className="flex-between">
                        <span className="text-muted">System Time</span>
                        <span className="font-semibold">{new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
