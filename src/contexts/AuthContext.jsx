"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@/lib/supabase/client';
import { login as apiLogin, logout as apiLogout, getCurrentUser, register as apiRegister } from '../api/auth';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the staff profile for the current Supabase session, and follow
  // sign-in / sign-out (including in other tabs).
  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const profile = await getCurrentUser();
        if (active) {
          setCurrentUser(profile);
          setError('');
        }
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadUser();
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setCurrentUser(null);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') loadUser();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Create a staff account (admin only)
  const register = async (name, email, password, passwordConfirmation) => {
    const result = await apiRegister({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation
    });
    if (!result.success) setError(result.errors?.general?.[0] || 'Registration failed');
    return result;
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await apiLogin(email, password);
      if (result.success) {
        setCurrentUser(result.user);
        setError('');
      } else {
        setError(result.errors?.general?.[0] || 'Invalid credentials');
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setCurrentUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role ||
           (role === 'moderator' && currentUser.role === 'admin');
  };

  const isAuthenticated = () => {
    return !!currentUser;
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    hasRole,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
