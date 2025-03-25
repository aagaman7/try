// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up function
  const signup = async (email, password, name) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newUser = { id: Date.now().toString(), email, name, password };
          localStorage.setItem("user", JSON.stringify(newUser));
          setCurrentUser(newUser);
          resolve(newUser);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // Login function
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const storedUser = localStorage.getItem("user");
          if (!storedUser) {
            return reject(new Error("User not found. Please sign up first."));
          }

          const user = JSON.parse(storedUser);

          if (user.email !== email || user.password !== password) {
            return reject(new Error("Invalid email or password."));
          }

          setCurrentUser(user);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  // Logout function
  const logout = async () => {
    return new Promise((resolve) => {
      localStorage.removeItem("user");
      setCurrentUser(null);
      resolve();
    });
  };

  // Reset password function (dummy function)
  const resetPassword = async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
import { useContext } from "react";

export const useAuth = () => {
  return useContext(AuthContext);
};
