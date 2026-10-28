"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faClipboardList,
  faCreditCard,
  faEnvelope,
  faCalendarAlt,
  faFlagCheckered,
  faUserShield,
  faArrowUpRightFromSquare,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { countUnhandledMessages } from '../../../../api/messages';

// Moderators work with registrations, payments and messages. Site content
// and staff accounts can only be changed by admins (enforced by the database
// too), so those pages are only listed for admins.
const SECTIONS = [
  {
    items: [
      { icon: faChartPie, label: 'Overview', path: '/dashboard' },
      { icon: faClipboardList, label: 'Registrations', path: '/dashboard/registration' },
      { icon: faCreditCard, label: 'Payments', path: '/dashboard/payments' },
      { icon: faEnvelope, label: 'Messages', path: '/dashboard/messages', badge: 'messages' },
    ],
  },
  {
    title: 'Website content',
    adminOnly: true,
    items: [
      { icon: faCalendarAlt, label: 'Events & schedule', path: '/dashboard/events' },
      { icon: faFlagCheckered, label: 'Marathon banners', path: '/dashboard/marathon-banners' },
    ],
  },
  {
    title: 'Admin',
    adminOnly: true,
    items: [{ icon: faUserShield, label: 'Staff accounts', path: '/dashboard/users' }],
  },
];

const Sidebar = ({ open, onClose }) => {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = currentUser?.role === 'admin';
  const [unhandled, setUnhandled] = useState(0);

  useEffect(() => {
    countUnhandledMessages().then(setUnhandled).catch(() => {});
  }, [pathname]);

  // close the phone menu after navigating
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (path) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-primary/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-tertiary flex flex-col transition-transform duration-200 print:hidden ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-tertiary/10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src="/assets/logo/logo.png" alt="" className="w-9 h-9 object-contain" />
            <span className="leading-tight">
              <span className="block font-extrabold tracking-wider">MWAFEM</span>
              <span className="block text-xs text-tertiary/75">Staff dashboard</span>
            </span>
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="lg:hidden w-10 h-10 rounded-lg hover:bg-tertiary/10 cursor-pointer">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Dashboard">
          {SECTIONS.filter((section) => !section.adminOnly || isAdmin).map((section, i) => (
            <div key={i}>
              {section.title && (
                <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-tertiary/70">{section.title}</p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        aria-current={active ? 'page' : undefined}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${active ? 'bg-tertiary/10 text-secondary' : 'text-tertiary/85 hover:bg-tertiary/5 hover:text-tertiary'}`}
                      >
                        {active && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-secondary" />}
                        <FontAwesomeIcon icon={item.icon} className="w-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge === 'messages' && unhandled > 0 && (
                          <span className="min-w-6 px-1.5 py-0.5 rounded-full bg-secondary text-primary text-xs font-bold text-center">
                            {unhandled}
                            <span className="sr-only"> new</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-tertiary/10">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-tertiary/85 hover:bg-tertiary/5 hover:text-tertiary"
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-4" />
            View website
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
