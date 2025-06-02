// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../services/apiService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial render
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token && user) {
        setCurrentUser(JSON.parse(user));
        
        // Set the token in the apiService for future requests
        apiService.setAuthToken(token);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function - accepts a user object directly
  const login = (user) => {
    setCurrentUser(user);
  };

  // Logout function
  const logout = async () => {
    try {
      // Optional: Call logout endpoint if your API has one
      // await apiService.post("auth/logout");
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear auth token from API service
      apiService.clearAuthToken();
      
      // Update state
      setCurrentUser(null);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Optional: Add a function to update user profile
  const updateUserProfile = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  // Role checking utilities
  const isAdmin = () => {
    return currentUser?.role === 'Admin';
  };

  const isCustomer = () => {
    return currentUser?.role === 'Member';
  };

  // Get redirect path based on user role
  const getRedirectPath = () => {
    if (isAdmin()) return '/admin';
    if (isCustomer()) return '/';
    return '/login';
  };

  const value = {
    currentUser,
    login,
    logout,
    updateUserProfile,
    isAdmin,
    isCustomer,
    getRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Export the useAuth hook for easy usage
export const useAuth = () => {
  return useContext(AuthContext);
};