// src/components/layout/Navbar.jsx
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-white border-b h-16 px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
            <User size={18} />
          </div>
          <span className="text-sm font-medium">{currentUser?.name || 'Admin'}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;