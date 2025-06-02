import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    symbol: false
  });
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordStrength({
      length: hasMinLength,
      number: hasNumber,
      symbol: hasSymbol
    });

    return hasMinLength && hasNumber && hasSymbol;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must meet all requirements", {
        icon: '⚠️',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          borderLeft: '4px solid #D97706'
        }
      });
      setError("Password must meet all requirements");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      await apiService.post("auth/register", { name, email, password });
      toast.success("Registration successful! Please login.", {
        icon: '✅',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          borderLeft: '4px solid #22C55E'
        }
      });
      setTimeout(() => {
        navigate("/login?registered=true");
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.", {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-black p-8 rounded-2xl shadow-xl max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-black text-center text-white mb-8">Create Account</h2>
        <div className="text-center mb-8">
          <span className="text-rose-500 font-bold text-lg">Join RBL Fitness</span>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-xl mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 font-medium mb-1">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-500"
            />
          </div>
          
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
              placeholder="Create a password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-500"
            />
            <div className="mt-2 text-sm">
              <p className={`${passwordStrength.length ? 'text-rose-500' : 'text-gray-500'}`}>
                ✓ At least 8 characters
              </p>
              <p className={`${passwordStrength.number ? 'text-rose-500' : 'text-gray-500'}`}>
                ✓ Contains a number
              </p>
              <p className={`${passwordStrength.symbol ? 'text-rose-500' : 'text-gray-500'}`}>
                ✓ Contains a symbol (!@#$%^&*(),.?":{}|&lt;&gt;)
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-300 font-medium mb-1">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating Account..." : "Register"}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-rose-500 hover:text-rose-400 transition-colors duration-200 font-medium">
                Login here
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

export default RegisterForm;