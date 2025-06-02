import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiService from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Check if user just registered
    const params = new URLSearchParams(location.search);
    if (params.get('registered')) {
      toast.info("Registration successful! Please login with your credentials.", {
        icon: 'ℹ️',
        style: {
          background: '#EFF6FF',
          color: '#1E40AF',
          borderLeft: '4px solid #3B82F6'
        }
      });
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiService.post("auth/login", { email, password });

      // Store token & user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Update auth context state
      login(data.user);
      
      toast.success("Login successful! Redirecting...", {
        icon: '✅',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          borderLeft: '4px solid #22C55E'
        }
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.", {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-black p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-black text-center text-white mb-8">Welcome Back</h2>
        <div className="text-center mb-8">
          <span className="text-rose-500 font-bold text-lg">RBL Fitness</span>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-300 font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-300 font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-500"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold hover:bg-rose-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-300">
              Don't have an account?{" "}
              <Link to="/register" className="text-rose-500 hover:text-rose-400 transition-colors duration-200 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
        toastStyle={{
          borderRadius: '12px',
          background: '#000',
          color: '#fff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          fontSize: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #f43f5e, #fb7185)'
        }}
      />
    </>
  );
};

export default LoginForm;