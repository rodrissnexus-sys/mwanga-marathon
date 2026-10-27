"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSun, 
  faMoon, 
  faBell, 
  faUser,
  faBars,
  faSignOutAlt,
  faCog,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

const TopBar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Handle clicking outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Use direct window location change instead of navigate to avoid React router issues
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get first name for display
  const getFirstName = () => {
    if (!currentUser || !currentUser.name) return 'User';
    return currentUser.name.split(' ')[0];
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return 'U';
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <header className={`h-16 px-4 flex items-center justify-between border-b ${theme === 'dark' ? 'bg-primary border-secondary' : 'bg-tertiary border-primary/20'} sticky top-0 z-10`}>
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-md md:hidden ${theme === 'dark' ? 'text-tertiary hover:bg-primary/50' : 'text-primary hover:bg-primary/10'}`}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary/20">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            className={`pl-10 pr-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-secondary ${theme === 'dark' ? 'bg-primary/50 text-tertiary' : 'bg-primary/20 text-primary'}`} 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-md cursor-pointer ${theme === 'dark' ? 'hover:bg-primary/50 text-tertiary' : 'hover:bg-primary/20 text-primary'}`}
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </button>
        
        <div className="relative">
          <button className={`p-2 rounded-md cursor-pointer ${theme === 'dark' ? 'hover:bg-primary/50 text-tertiary' : 'hover:bg-primary/20 text-primary'}`}>
            <FontAwesomeIcon icon={faBell} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          </button>
        </div>
        
        <div className={`h-8 w-px ${theme === 'dark' ? 'bg-secondary' : 'bg-primary/20'}`}></div>
        
        <div className="relative" ref={userMenuRef}>
          <button 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${currentUser?.role === 'admin' ? 'bg-secondary' : 'bg-primary'}`}>
              {getUserInitials()}
            </div>
            <span className={`hidden md:block ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              {getFirstName()}
            </span>
          </button>
          
          {/* User dropdown menu */}
          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-20 ${theme === 'dark' ? 'bg-primary border border-secondary' : 'bg-white border border-gray-200'}`}>
              <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-secondary text-tertiary' : 'border-gray-200 text-primary'}`}>
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs opacity-75">{currentUser?.email}</p>
                <p className={`text-xs mt-1 capitalize font-medium ${currentUser?.role === 'admin' ? 'text-secondary' : 'text-primary/70'}`}>
                  {currentUser?.role}
                </p>
              </div>
              
              <a href="#" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-tertiary hover:bg-secondary/20' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                Profile
              </a>
              
              <a href="#" className={`block px-4 py-2 text-sm ${theme === 'dark' ? 'text-tertiary hover:bg-secondary/20' : 'text-gray-700 hover:bg-gray-100'}`}>
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Settings
              </a>
              
              <button
                onClick={handleLogout}
                className={`w-full text-left block px-4 py-2 text-sm ${theme === 'dark' ? 'text-tertiary hover:bg-secondary/20' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
