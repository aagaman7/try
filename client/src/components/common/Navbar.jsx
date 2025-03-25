import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { currentUser, logout } = useAuth();
  const {currentUser, setCurrentUser}= useState(false);
    const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "text-blue-600" : "text-gray-700 hover:text-blue-600";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //   } catch (error) {
  //     console.error("Failed to log out", error);
  //   }
  // };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="ml-2 text-xl font-bold text-orange-600">RBL Fitness</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium ${isActive('/')}`}>Home</Link>
            <Link to="/membership" className={`font-medium ${isActive('/membership')}`}>Membership</Link>
            <Link to="/schedule" className={`font-medium ${isActive('/Schedule')}`}>Schedule</Link>
            <Link to="/about" className={`font-medium ${isActive('/about')}`}>About Us</Link>
            <Link to="/contact" className={`font-medium ${isActive('/contact')}`}>Contact</Link>
            
            {currentUser ? (
              <div className="relative">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors">
                  Dashboard
                </button>
                <button 
                  // onClick={handleLogout}
                  className="ml-4 text-gray-600 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 transition-colors">
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
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
        <div className="md:hidden bg-white pt-2 pb-4 px-4 shadow-lg">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/membership" 
              className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/membership')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Membership
            </Link>
            <Link 
              to="/about" 
              className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/about')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`px-3 py-2 rounded-md text-base font-medium ${isActive('/contact')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {currentUser ? (
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/dashboard" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    // handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-red-500 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg px-4 py-2 text-center"
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