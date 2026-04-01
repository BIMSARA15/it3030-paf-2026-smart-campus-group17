import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Campus Hub...</div>;
  }

  // If the user isn't logged in at all, send them to the Landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If the route requires specific roles and the user doesn't have it, redirect them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their own designated dashboard based on their role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'TECHNICIAN') return <Navigate to="/technician" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;