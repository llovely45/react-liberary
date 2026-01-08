
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BookManagement from './pages/BookManagement';
import UserManagement from './pages/UserManagement';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/books" element={
          <PrivateRoute>
            <BookList />
          </PrivateRoute>
        } />

        <Route path="/books/new" element={
          <PrivateRoute roles={['admin', 'staff']}>
            <BookManagement />
          </PrivateRoute>
        } />

        <Route path="/books/:id/edit" element={
          <PrivateRoute roles={['admin', 'staff']}>
            <BookManagement isEdit />
          </PrivateRoute>
        } />

        <Route path="/users" element={
          <PrivateRoute roles={['admin']}>
            <UserManagement />
          </PrivateRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
