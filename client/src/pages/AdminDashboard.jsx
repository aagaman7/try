import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminProvider } from '../context/AdminContext';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="mb-4">You don't have permission to access the admin panel.</p>
          <Link to="/" className="block w-full bg-blue-600 text-white py-2 px-4 rounded text-center">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4 lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Gym Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{currentUser?.name || 'Admin'}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <nav className={`bg-gray-800 text-white w-64 flex-shrink-0 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin"
                    className={`block py-2 px-4 rounded ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/packages') && !isActive('/admin/services') && !isActive('/admin/trainers') && !isActive('/admin/discounts') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className={`block py-2 px-4 rounded ${isActive('/admin/users') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/packages"
                    className={`block py-2 px-4 rounded ${isActive('/admin/packages') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Packages
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/services"
                    className={`block py-2 px-4 rounded ${isActive('/admin/services') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/trainers"
                    className={`block py-2 px-4 rounded ${isActive('/admin/trainers') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Trainers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/discounts"
                    className={`block py-2 px-4 rounded ${isActive('/admin/discounts') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                  >
                    Discounts
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminDashboard;