"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/views/dashboard/contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faSpinner, 
  faExclamationTriangle,
  faCheck,
  faUserShield,
  faUser,
  faUserCog,
  faTrash,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { getUsers, createUser, deleteUser } from '../../../../api/users';

const UserManagement = () => {
  const { theme } = useTheme();
  const { currentUser, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load users on component mount
  useEffect(() => {
    if (hasRole('admin')) {
      fetchUsers();
    }
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        console.error('Failed to fetch users:', response.error);
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormErrors({});

    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      setFormError('All fields are required');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setFormError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await createUser(formData);
      
      if (result.success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'user'
        });
        setFormSuccess('User created successfully');
        setShowAddForm(false);
        
        // Refresh user list
        fetchUsers();
      } else {
        setFormError(result.error || 'Failed to create user');
        setFormErrors(result.errors || {});
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      setFormError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    setActionLoading(true);
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        setFormSuccess('User deleted successfully');
      } else {
        setFormError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setFormError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
      setDeleteConfirmation(null);
    }
  };

  // If not admin, show access denied
  if (!hasRole('admin')) {
    return (
      <div className={`p-6 ${theme === 'dark' ? 'bg-primary/50 text-tertiary' : 'bg-tertiary text-primary'}`}>
        <div className="text-center p-8">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-primary/50 text-tertiary' : 'bg-tertiary text-primary'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-secondary text-primary' : 'bg-secondary text-primary'} flex items-center`}
        >
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          {showAddForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Success message */}
      {formSuccess && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Error message */}
      {formError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <span>{formError}</span>
        </div>
      )}

      {/* Add user form */}
      {showAddForm && (
        <div className={`mb-8 p-6 rounded-lg ${theme === 'dark' ? 'bg-primary/70 border border-secondary/20' : 'bg-white shadow'}`}>
          <h3 className="text-xl font-semibold mb-4">Add New User</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'border-gray-300'}`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'border-gray-300'}`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.email[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'border-gray-300'}`}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'border-gray-300'}`}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.role[0]}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className={`px-4 py-2 rounded-lg mr-2 ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-gray-200 text-primary'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-secondary text-primary rounded-lg flex items-center disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div className={`rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-primary/70 border border-secondary/20' : 'bg-white shadow'}`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FontAwesomeIcon icon={faSpinner} className="text-3xl animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={theme === 'dark' ? 'bg-primary/90' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className={theme === 'dark' ? 'hover:bg-primary/90' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role, theme)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-primary' : 'hover:bg-gray-100'}`}
                          title="View User"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-primary' : 'hover:bg-gray-100'}`}
                          title="Edit User"
                        >
                          <FontAwesomeIcon icon={faUserCog} />
                        </button>
                        <button 
                          className={`p-2 rounded-full text-red-500 ${theme === 'dark' ? 'hover:bg-primary' : 'hover:bg-gray-100'}`}
                          title="Delete User"
                          onClick={() => setDeleteConfirmation(user.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-white text-primary'}`}>
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-primary/70 text-tertiary' : 'bg-gray-200 text-primary'}`}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center disabled:opacity-70"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get role badge
const getRoleBadge = (role, theme) => {
  const isDark = theme === 'dark';
  
  switch(role) {
    case 'admin':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>
          <FontAwesomeIcon icon={faUserShield} className="mr-1" />
          Admin
        </span>
      );
    case 'moderator':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
          <FontAwesomeIcon icon={faUserCog} className="mr-1" />
          Moderator
        </span>
      );
    case 'user':
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
          <FontAwesomeIcon icon={faUser} className="mr-1" />
          User
        </span>
      );
  }
};

export default UserManagement;
