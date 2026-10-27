import { getTokenKey } from '@/api/config';
import { apiClient } from './client';
import { API_BASE_URL } from './config';

/**
 * Authentication API services
 */

/**
 * Login a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} - Response with user data and token
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient('login', {
      method: 'POST',
      json: { email, password }
    });
    
    // Store the token in localStorage
    if (response.access_token) {
      localStorage.setItem(getTokenKey(), response.access_token);
    }
    
    return { success: true, user: response.user, token: response.access_token };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      errors: error.errors || { general: ['Invalid credentials'] }
    };
  }
};

/**
 * Register a new user (admin only)
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - Response with user data
 */
export const register = async (userData) => {
  try {
    const response = await apiClient('register', {
      method: 'POST',
      json: userData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(getTokenKey())}`
      }
    });
    
    return { success: true, user: response.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      errors: error.errors || { general: ['Registration failed'] }
    };
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} - User data
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem(getTokenKey());
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    return await apiClient('user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 * @returns {Promise<Object>} - Success message
 */
export const logout = async () => {
  const token = localStorage.getItem(getTokenKey());
  if (!token) {
    localStorage.removeItem(getTokenKey());
    return { success: true, message: 'Logged out successfully' };
  }
  
  try {
    const response = await apiClient('logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Remove the token from localStorage
    localStorage.removeItem(getTokenKey());
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove the token even if the API call fails
    localStorage.removeItem(getTokenKey());
    return { success: true, message: 'Logged out successfully' };
  }
};

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} - List of users
 */
export const getUsers = async () => {
  const token = localStorage.getItem(getTokenKey());
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    return await apiClient('admin/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    // Return fallback data for demo mode
    return [
      { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: 2, name: 'Moderator User', email: 'moderator@example.com', role: 'moderator' },
      { id: 3, name: 'Regular User', email: 'user@example.com', role: 'user' }
    ];
  }
};
