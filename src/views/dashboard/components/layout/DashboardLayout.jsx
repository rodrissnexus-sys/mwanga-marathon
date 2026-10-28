"use client";

import React, { useCallback, useState } from 'react';
import { useLocation } from '@/lib/router';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ContentLanguageBar from './ContentLanguageBar';

// pages that edit website text, which exists in English and Swahili
const CONTENT_PAGES = ['/dashboard/events', '/dashboard/marathon-banners'];

const DashboardLayout = ({ children }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-[#f6f5fa] print:bg-tertiary">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="lg:pl-64 print:pl-0 min-w-0">
        <TopBar onMenu={() => setMenuOpen(true)} />
        <main className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">
          {CONTENT_PAGES.some((page) => pathname.startsWith(page)) && <ContentLanguageBar />}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
