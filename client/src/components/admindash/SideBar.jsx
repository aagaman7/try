import React from 'react';
import { 
  Dumbbell, 
  Users, 
  Calendar, 
  Package, 
  Tag, 
  X,
  LogOut 
} from 'lucide-react';
import SidebarLink from './SidebarLink';
import { useLocation } from 'react-router-dom';

  const Sidebar = ({ isOpen, toggleSidebar, activeTab, setActiveTab }) =>  {
    const location = useLocation();
  
    // Update activeTab based on current route
    React.useEffect(() => {
      const path = location.pathname.split('/').pop();
      if (path) {
        setActiveTab(path);
      } else {
        setActiveTab('dashboard');
      }
    }, [location.pathname, setActiveTab]);
  
    return (
      <div className={`bg-gray-800 text-white ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isOpen && <h1 className="text-xl font-bold">Gym Admin</h1>}
          <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-700">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
  
        {/* Navigation Links */}
        <nav className="flex-1 py-4">
          <ul>
            <SidebarLink 
              to="/"
              icon={<Dumbbell size={20} />} 
              label="Dashboard" 
              isActive={activeTab === 'dashboard'} 
              isOpen={isOpen}
            />
            <SidebarLink 
              to="/users"
              icon={<Users size={20} />} 
              label="Users" 
              isActive={activeTab === 'users'} 
              isOpen={isOpen}
            />
            <SidebarLink 
              to="/bookings"
              icon={<Calendar size={20} />} 
              label="Bookings" 
              isActive={activeTab === 'bookings'} 
              isOpen={isOpen}
            />
            <SidebarLink 
              to="/packages"
              icon={<Package size={20} />} 
              label="Packages" 
              isActive={activeTab === 'packages'} 
              isOpen={isOpen}
            />
            <SidebarLink 
              to="/services"
              icon={<Tag size={20} />} 
              label="Services" 
              isActive={activeTab === 'services'} 
              isOpen={isOpen}
            />
            <SidebarLink 
              to="/discounts"
              icon={<Tag size={20} />} 
              label="Discounts" 
              isActive={activeTab === 'discounts'} 
              isOpen={isOpen}
            />
          </ul>
        </nav>
  
        {/* Logout Section */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center justify-center w-full p-2 text-red-400 hover:bg-gray-700 rounded">
            <LogOut size={20} />
            {isOpen && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>
    );
  }

export default Sidebar;