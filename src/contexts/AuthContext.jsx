"use client";
import { getTokenKey } from '@/api/config';

import React, { createContext, useState, useEffect, useContext } from 'react';
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
  const [token, setToken] = useState(localStorage.getItem(getTokenKey()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user data when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        setError('');
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Session expired. Please login again.');
        // Clear token and user data without triggering another useEffect
        localStorage.removeItem(getTokenKey());
        setCurrentUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register a new user
  const register = async (name, email, password, passwordConfirmation) => {
    try {
      setLoading(true);
      const result = await apiRegister({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      if (result.success) {
        setError('');
      }
      
      return result;
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
      return { 
        success: false, 
        errors: err.errors || { general: ['Registration failed'] }
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await apiLogin(email, password);

      if (result.success) {
        setToken(result.token);
        setCurrentUser(result.user);
        setError('');
      } else {
        setError(result.errors?.general?.[0] || 'Invalid credentials');
      }
      
      return result;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Invalid credentials');
      return { 
        success: false, 
        errors: err.errors || { general: ['Invalid credentials'] }
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);
      // First remove token from localStorage to prevent re-authentication attempts
      localStorage.removeItem(getTokenKey());
      
      // Then clear the state
      setToken(null);
      setCurrentUser(null);
      
      // Only call API logout if we had a token
      if (token) {
        await apiLogout();
      }
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: true }; // Still consider logout successful even if API call fails
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role || 
           (role === 'moderator' && currentUser.role === 'admin');
  };

  // Check if user is authenticated
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

export default AuthContext;
