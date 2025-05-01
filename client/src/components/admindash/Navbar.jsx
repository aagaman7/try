import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';

 const Navbar = ({ toggleSidebar }) =>{
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
              <Menu size={20} />
            </button>
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-medium">Gym Management System</h2>
              </div>
              
              <div className="ml-4 flex items-center md:ml-6">
                {/* Profile dropdown */}
                <div className="relative">
                  <button className="flex items-center p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src="/api/placeholder/32/32" 
                      alt="User" 
                    />
                    <span className="hidden md:flex ml-2">Admin User</span>
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }

export default Navbar;