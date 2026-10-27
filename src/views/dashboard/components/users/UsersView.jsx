"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faUserPlus,
  faEdit,
  faTrash,
  faSpinner,
  faEye,
  faUserShield,
  faUserCog,
  faUserCheck,
  faUserTimes,
  faExclamationTriangle,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { getUsers, updateUserStatus, deleteUser, createUser, updateUser } from '../../../../api/users';
import Modal from '../../../../components/common/Modal';

const UsersView = () => {
  const { theme } = useTheme();
  const { hasRole } = useAuth();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editingUser) {
      setEditFormData({
        name: editingUser.name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'user',
        password: '',
        password_confirmation: ''
      });
    }
  }, [editingUser]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUsers();
      
      if (response.success) {
        setUsers(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'An unexpected error occurred');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) return;
    
    setActionLoading(true);
    
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchUsers(); // Refresh the user list
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    setActionLoading(true);
    try {
      const result = await updateUserStatus(userId, newStatus);
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        setSuccessMessage(`User status updated to ${newStatus}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to update user status');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError(err.message || 'Failed to update user status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === '' || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply role filter
    const matchesFilter = 
      currentFilter === 'all' || 
      user.role?.toLowerCase() === currentFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getUserRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-purple-700 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300">
            <FontAwesomeIcon icon={faUserShield} className="mr-1" />
            Admin
          </span>
        );
      case 'moderator':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-blue-700 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300">
            <FontAwesomeIcon icon={faUserCog} className="mr-1" />
            Moderator
          </span>
        );
      case 'user':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300">
            <FontAwesomeIcon icon={faUserCheck} className="mr-1" />
            User
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
            {role}
          </span>
        );
    }
  };

  const getUserStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300">
            <FontAwesomeIcon icon={faCheck} className="mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300">
            <FontAwesomeIcon icon={faUserTimes} className="mr-1" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-300">
            <FontAwesomeIcon icon={faUserTimes} className="mr-1" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full inline-flex items-center text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    let hasError = false;
    
    if (!formData.name) {
      errors.name = 'Name is required';
      hasError = true;
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      hasError = true;
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
      hasError = true;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      hasError = true;
    }
    
    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match';
      hasError = true;
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    setFormErrors({});
    
    try {
      const result = await createUser(formData);
      
      if (result.success) {
        setSuccessMessage('User created successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowAddUserModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
          role: 'user'
        });
        fetchUsers(); // Refresh the user list
      } else {
        setError(result.error || 'Failed to create user');
        setFormErrors(result.errors || {});
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {};
    let hasError = false;
    
    if (!editFormData.name) {
      errors.name = 'Name is required';
      hasError = true;
    }
    
    if (!editFormData.email) {
      errors.email = 'Email is required';
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Email is invalid';
      hasError = true;
    }
    
    // Only validate password if it's provided (optional for updates)
    if (editFormData.password) {
      if (editFormData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        hasError = true;
      }
      
      if (editFormData.password !== editFormData.password_confirmation) {
        errors.password_confirmation = 'Passwords do not match';
        hasError = true;
      }
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    setActionLoading(true);
    setFormErrors({});
    
    // Prepare the data (only include password if provided)
    const userData = {
      name: editFormData.name,
      email: editFormData.email,
      role: editFormData.role
    };
    
    if (editFormData.password) {
      userData.password = editFormData.password;
      userData.password_confirmation = editFormData.password_confirmation;
    }
    
    try {
      const result = await updateUser(editingUser.id, userData);
      
      if (result.success) {
        setSuccessMessage('User updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers(); // Refresh the user list
      } else {
        setError(result.error || 'Failed to update user');
        setFormErrors(result.errors || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-tertiary' : 'text-primary'}`}>
          User Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search users..."
              className={`pl-10 pr-4 py-2 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-gray-100 text-primary'}`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded-md ${isDark ? 'bg-primary/50 text-tertiary hover:bg-primary/80' : 'bg-white text-primary hover:bg-gray-100'} border border-gray-200 dark:border-gray-700`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filter
            </button>
            <button 
              className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-opacity flex items-center"
              onClick={() => setShowAddUserModal(true)}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="p-4 mb-4 rounded-md bg-green-100 text-green-700 border border-green-200 flex items-center">
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Filter options */}
      {showFilters && (
        <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-primary/50 border border-secondary/20' : 'bg-white shadow-md'}`}>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-tertiary' : 'text-primary'}`}>Filter by role:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentFilter('all')}
              className={`px-3 py-1 rounded-md ${currentFilter === 'all' ? 'bg-secondary text-primary' : isDark ? 'bg-primary/70 text-tertiary' : 'bg-gray-100 text-primary'}`}
            >
              All
            </button>
            <button
              onClick={() => setCurrentFilter('admin')}
              className={`px-3 py-1 rounded-md ${currentFilter === 'admin' ? 'bg-secondary text-primary' : isDark ? 'bg-primary/70 text-tertiary' : 'bg-gray-100 text-primary'}`}
            >
              Admin
            </button>
            <button
              onClick={() => setCurrentFilter('moderator')}
              className={`px-3 py-1 rounded-md ${currentFilter === 'moderator' ? 'bg-secondary text-primary' : isDark ? 'bg-primary/70 text-tertiary' : 'bg-gray-100 text-primary'}`}
            >
              Moderator
            </button>
            <button
              onClick={() => setCurrentFilter('user')}
              className={`px-3 py-1 rounded-md ${currentFilter === 'user' ? 'bg-secondary text-primary' : isDark ? 'bg-primary/70 text-tertiary' : 'bg-gray-100 text-primary'}`}
            >
              User
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-primary/50 border border-primary' : 'bg-tertiary shadow-md'}`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FontAwesomeIcon icon={faSpinner} className={`text-3xl ${isDark ? 'text-tertiary' : 'text-primary'} animate-spin`} />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? 'bg-primary text-tertiary' : 'bg-gray-50 text-primary'}`}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className={`px-6 py-8 text-center ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr 
                      key={user?.id || index} 
                      className={`${isDark ? 'hover:bg-primary' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full" />
                            ) : (
                              user?.name?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${isDark ? 'text-tertiary' : 'text-primary'}`}>{user?.name || 'Unknown User'}</div>
                            <div className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-gray-500'}`}>{user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserRoleBadge(user?.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getUserStatusBadge(user?.status)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {user?.lastLogin}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(user?.created_at))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {hasRole('admin') && user?.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation(user)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </>
                          )}
                          {hasRole('admin') && user?.role === 'admin' && (
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className={`px-6 py-4 flex justify-between items-center ${isDark ? 'bg-primary' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-tertiary' : 'text-primary'}`}>
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex space-x-1">
              <button className={`px-3 py-1 rounded-md ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-white text-primary'} border border-gray-200 dark:border-gray-700`}>
                Previous
              </button>
              <button className={`px-3 py-1 rounded-md ${isDark ? 'bg-secondary text-primary' : 'bg-secondary text-primary'}`}>
                1
              </button>
              <button className={`px-3 py-1 rounded-md ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-white text-primary'} border border-gray-200 dark:border-gray-700`}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User details modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-primary text-2xl">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="h-16 w-16 rounded-full" />
                ) : (
                  selectedUser.name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">{selectedUser.name || 'Unknown User'}</h3>
                <p className="text-sm opacity-70">{selectedUser.email || 'No email'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium opacity-70">Role</h4>
                <p>{getUserRoleBadge(selectedUser.role)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium opacity-70">Status</h4>
                <p>{getUserStatusBadge(selectedUser.status || 'active')}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium opacity-70">Last Login</h4>
                <p>{selectedUser.lastLogin || 'Never'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium opacity-70">Registered Date</h4>
                <p>{selectedUser.created_at ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(selectedUser.created_at)) : 'Unknown'}</p>
              </div>
            </div>
            
            {hasRole('admin') && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setDeleteConfirmation(selectedUser);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete User
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center text-amber-600 dark:text-amber-500">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl mr-3" />
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          </div>
          
          {deleteConfirmation && (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-primary">
                  {deleteConfirmation.avatar ? (
                    <img src={deleteConfirmation.avatar} alt={deleteConfirmation.name} className="h-10 w-10 rounded-full" />
                  ) : (
                    deleteConfirmation.name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{deleteConfirmation.name || 'Unknown User'}</p>
                  <p className="text-sm opacity-70">{deleteConfirmation.email || 'No email'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setDeleteConfirmation(null)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDeleteUser(deleteConfirmation.id)}
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
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add user modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add New User"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input 
                type="password" 
                value={formData.password_confirmation} 
                onChange={(e) => setFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.password_confirmation && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password_confirmation}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select 
                value={formData.role} 
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-primary rounded-lg flex items-center disabled:opacity-70"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit user modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateUser}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input 
                type="text" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input 
                type="email" 
                value={editFormData.email} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password (optional)</label>
              <input 
                type="password" 
                value={editFormData.password} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password (optional)</label>
              <input 
                type="password" 
                value={editFormData.password_confirmation} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              />
              {formErrors.password_confirmation && (
                <p className="text-sm text-red-500 mt-1">{formErrors.password_confirmation}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select 
                value={editFormData.role} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="mt-1 px-4 py-2 rounded-md w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-secondary focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-primary rounded-lg flex items-center disabled:opacity-70"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Update User
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersView;
