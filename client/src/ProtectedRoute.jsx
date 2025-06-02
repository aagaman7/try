import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Base Protected Route
const ProtectedRoute = () => {
  const { currentUser, getRedirectPath } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login and save the attempted path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to appropriate dashboard based on role
  if (location.pathname === '/login') {
    return <Navigate to={getRedirectPath()} replace />;
  }

  return <Outlet />;
};

// Admin Route Protection
export const AdminRoute = () => {
  const { isAdmin, currentUser } = useAuth();
  const location = useLocation();
  // console.log("",urrentUser);


  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin()) {
    // If not admin, redirect to home page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Customer Route Protection
export const CustomerRoute = () => {
  const { isCustomer, currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isCustomer()) {
    // If not customer, redirect to admin panel
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
