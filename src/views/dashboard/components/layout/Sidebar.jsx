"use client";

import React, { useEffect } from 'react';
import { Link, useLocation } from '@/lib/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faUsers,
  faClipboardList,
  faCalendarAlt,
  faCreditCard,
  faCog,
  faBars,
  faFlagCheckered,
  faUserCog
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: faChartBar, label: 'Dashboard', path: '/dashboard' },
    { icon: faClipboardList, label: 'Registration', path: '/dashboard/registration' },
    { icon: faUsers, label: 'Users', path: '/dashboard/users' },
    { icon: faCalendarAlt, label: 'Events', path: '/dashboard/events' },
    { icon: faCreditCard, label: 'Payments', path: '/dashboard/payments' },
    // Add Marathon Banners to the main menu
    { icon: faFlagCheckered, label: 'Marathon Banners', path: '/dashboard/marathon-banners/' },
    { icon: faCog, label: 'Settings', path: '/dashboard/settings' },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { icon: faUserCog, label: 'User Management', path: '/dashboard/user-management' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/dashboard/';
    }
    return currentPath.startsWith(path);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only apply this behavior on mobile screens
      if (window.innerWidth < 1024 && !collapsed) {
        // Check if the click is outside the sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          toggleSidebar();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [collapsed, toggleSidebar]);

  return (
    <div
      id="sidebar"
      className={`fixed left-0 top-0 h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-tertiary text-primary'} ${collapsed ? 'w-16' : 'w-64'} border-r ${theme === 'dark' ? 'border-secondary/20' : 'border-gray-200'} z-20 shadow-lg`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-secondary' : 'text-primary'}`}>MWAFEM</h1>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-primary/50' : 'hover:bg-gray-100'}`}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-3 rounded-md transition-colors ${isActive(item.path) ? (theme === 'dark' ? 'bg-secondary text-primary' : 'bg-primary/10 text-primary') : (theme === 'dark' ? 'text-tertiary hover:bg-primary/50' : 'hover:bg-gray-100')}`}
              >
                <FontAwesomeIcon icon={item.icon} className={`${collapsed ? 'text-xl' : 'text-lg'}`} />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
          
          {/* Admin-only menu items */}
          {user && user.role === 'admin' && (
            <>
              {!collapsed && (
                <li className="pt-4 pb-2">
                  <div className="px-3">
                    <p className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Admin</p>
                    <div className="mt-1 h-px bg-gray-300 dark:bg-gray-700"></div>
                  </div>
                </li>
              )}
              
              {adminMenuItems.map((item, index) => (
                <li key={`admin-${index}`}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-3 rounded-md transition-colors ${isActive(item.path) ? (theme === 'dark' ? 'bg-secondary text-primary' : 'bg-primary/10 text-primary') : (theme === 'dark' ? 'text-tertiary hover:bg-primary/50' : 'hover:bg-gray-100')}`}
                  >
                    <FontAwesomeIcon icon={item.icon} className={`${collapsed ? 'text-xl' : 'text-lg'}`} />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
