import React from 'react'
import { Link } from 'react-router-dom';

const SidebarLink = ({ to, icon, label, isActive, isOpen }) => {
    return (
        <li className="mb-1">
          <Link 
            to={to}
            className={`flex items-center p-3 ${isActive ? 'bg-blue-700' : 'hover:bg-gray-700'} rounded mx-2`}
          >
            <span className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
              {icon}
            </span>
            {isOpen && <span className="ml-3">{label}</span>}
          </Link>
        </li>
      );
    }

export default SidebarLink
