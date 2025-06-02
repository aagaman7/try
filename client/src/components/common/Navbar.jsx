import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path ? "text-rose-500 font-bold" : "text-gray-300 hover:text-white transition-colors duration-200";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black text-white tracking-tight">
                RBL <span className="text-rose-500">Fitness</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium ${isActive('/')}`}>Home</Link>
            <Link to="/membership" className={`font-medium ${isActive('/membership')}`}>Membership</Link>
            
            {currentUser && (
              <Link to="/trainers" className={`font-medium ${isActive('/trainers')}`}>Trainers</Link>
            )}
            <Link to="/about" className={`font-medium ${isActive('/about')}`}>About Us</Link>
            <Link to="/contact" className={`font-medium ${isActive('/contact')}`}>Contact</Link>
            
            {currentUser ? (
              <div className="relative flex items-center space-x-6">
                <Link 
                  to="/dashboard" 
                  className="flex items-center justify-center group"
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center group-hover:bg-rose-600 transition-all duration-300">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-3 px-6 py-2.5 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-all duration-300"
              >
                <span>Login</span>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-white/10 pt-2 pb-4 px-4">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`px-4 py-2.5 rounded-lg text-base font-medium ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/membership" 
              className={`px-4 py-2.5 rounded-lg text-base font-medium ${isActive('/membership')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Membership
            </Link>
            {currentUser && (
              <Link 
                to="/trainers" 
                className={`px-4 py-2.5 rounded-lg text-base font-medium ${isActive('/trainers')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Trainers
              </Link>
            )}
            <Link 
              to="/about" 
              className={`px-4 py-2.5 rounded-lg text-base font-medium ${isActive('/about')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`px-4 py-2.5 rounded-lg text-base font-medium ${isActive('/contact')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {currentUser ? (
              <div className="flex flex-col space-y-3 pt-3 border-t border-white/10">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-white font-medium">My Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-left px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-colors duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center justify-center px-4 py-2.5 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;