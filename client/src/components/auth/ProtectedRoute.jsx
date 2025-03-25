// src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, isLoading } = useAuth();
  
  // While checking authentication status, show loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to login with the return URL
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;