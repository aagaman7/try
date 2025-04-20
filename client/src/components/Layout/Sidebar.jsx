




// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Users, Package, Briefcase, Tag, 
  Calendar, Users as TrainersIcon, LogOut 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/admin' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Packages', icon: Package, path: '/admin/packages' },
    { label: 'Services', icon: Briefcase, path: '/admin/services' },
    { label: 'Discounts', icon: Tag, path: '/admin/discounts' },
    { label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { label: 'Trainers', icon: TrainersIcon, path: '/admin/trainers' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Fitness Admin</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-300 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;