"use client";

import React from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ClientOnly from '../../components/common/ClientOnly';

// Replaces the old <Dashboard> router: providers, login guard and layout
// shared by every /dashboard page.
const DashboardShell = ({ children }) => {
  return (
    <ClientOnly>
      <AuthProvider>
        <ThemeProvider>
          <ProtectedRoute>
            <DashboardLayout>{children}</DashboardLayout>
          </ProtectedRoute>
        </ThemeProvider>
      </AuthProvider>
    </ClientOnly>
  );
};

export default DashboardShell;
