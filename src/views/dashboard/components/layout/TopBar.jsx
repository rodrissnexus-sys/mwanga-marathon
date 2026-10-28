"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronDown, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';

const initials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

const TopBar = ({ onMenu }) => {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => menuRef.current && !menuRef.current.contains(event.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-20 h-16 px-4 md:px-8 flex items-center justify-between gap-4 bg-tertiary/90 backdrop-blur border-b border-primary/10 print:hidden">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        aria-controls="dashboard-sidebar"
        className="lg:hidden w-10 h-10 rounded-lg text-primary hover:bg-primary/5 cursor-pointer"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div className="flex-1" />

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-primary/5 cursor-pointer"
        >
          <span className="w-9 h-9 rounded-full bg-primary text-secondary font-bold text-sm flex items-center justify-center">
            {initials(currentUser?.name)}
          </span>
          <span className="hidden sm:block text-left leading-tight">
            <span className="block text-sm font-bold text-primary">{currentUser?.name}</span>
            <span className="block text-xs text-primary/70">{isAdmin ? 'Admin' : 'Moderator'}</span>
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="text-xs text-primary/70" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-tertiary border border-primary/10 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-primary/10">
              <p className="text-sm font-bold text-primary">{currentUser?.name}</p>
              <p className="text-xs text-primary/70 break-all">{currentUser?.email}</p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${isAdmin ? 'bg-secondary text-primary' : 'bg-primary/10 text-primary'}`}>
                {isAdmin ? 'Admin' : 'Moderator'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5 cursor-pointer"
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
