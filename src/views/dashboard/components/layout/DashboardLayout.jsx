"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FloatingPanel from '../ui/FloatingPanel';
import ContentLanguageBar from './ContentLanguageBar';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardLayout = ({ children }) => {
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // On mobile, keep sidebar hidden by default
      if (mobile) {
        setSidebarVisible(false);
      } else {
        // On desktop, always show sidebar (collapsed or not)
        setSidebarVisible(true);
      }
    };
    
    // Initialize on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      // On mobile, toggle visibility
      setSidebarVisible(!sidebarVisible);
    } else {
      // On desktop, toggle collapsed state
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-primary/80' : 'bg-gray-50'}`}>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/50 z-10" 
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar - hidden on mobile unless toggled */}
      {(sidebarVisible || !isMobile) && (
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      )}
      
      <div className={`flex-1 transition-all duration-300 ${isMobile ? 'ml-0' : (sidebarCollapsed ? 'ml-16' : 'ml-64')}`}>
        <TopBar toggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-6 w-full overflow-x-hidden">
          <ContentLanguageBar />
          {children}
        </main>
      </div>
      <FloatingPanel />
    </div>
  );
};

export default DashboardLayout;
