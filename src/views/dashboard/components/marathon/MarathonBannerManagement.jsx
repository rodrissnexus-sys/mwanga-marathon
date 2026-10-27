"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Plus, AlertTriangle } from 'lucide-react';
import BannerList from './BannerList';
import BannerForm from './BannerForm';
import BannerDetails from './BannerDetails';
import { 
  getAllBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  toggleBannerActive 
} from '../../../../api/marathon/banner';

const MarathonBannerManagement = () => {
  const { theme } = useTheme();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list'); // list, create, edit, view
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch all banners
  const fetchBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllBanners();
      if (response.status === 'success') {
        setBanners(response.data);
      } else {
        setError('Failed to fetch banners');
      }
    } catch (err) {
      setError('An error occurred while fetching banners');
      console.error('Error fetching banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle banner creation
  const handleCreateBanner = async (bannerData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await createBanner(bannerData);
      if (response.status === 'success') {
        await fetchBanners();
        setView('list');
      } else {
        setError(response.message || 'Failed to create banner');
      }
    } catch (err) {
      setError('An error occurred while creating the banner');
      console.error('Error creating banner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle banner update
  const handleUpdateBanner = async (bannerData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateBanner(selectedBanner.id, bannerData);
      if (response.status === 'success') {
        await fetchBanners();
        setView('list');
        setSelectedBanner(null);
      } else {
        setError(response.message || 'Failed to update banner');
      }
    } catch (err) {
      setError('An error occurred while updating the banner');
      console.error('Error updating banner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle banner deletion
  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await deleteBanner(confirmDelete.id);
      if (response.status === 'success') {
        await fetchBanners();
        setConfirmDelete(null);
      } else {
        setError(response.message || 'Failed to delete banner');
      }
    } catch (err) {
      setError('An error occurred while deleting the banner');
      console.error('Error deleting banner:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (banner) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await toggleBannerActive(banner.id);
      if (response.status === 'success') {
        await fetchBanners();
      } else {
        setError(response.message || 'Failed to toggle banner status');
      }
    } catch (err) {
      setError('An error occurred while toggling banner status');
      console.error('Error toggling banner status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render delete confirmation modal
  const renderDeleteConfirmation = () => {
    if (!confirmDelete) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-md w-full p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center text-red-500 mb-4">
            <AlertTriangle className="mr-2" size={24} />
            <h3 className="text-lg font-bold">Confirm Deletion</h3>
          </div>
          <p className="mb-6">
            Are you sure you want to delete the banner "{confirmDelete.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className={`px-4 py-2 rounded ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmed}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Marathon Banner Management</h1>
        
        {view === 'list' && (
          <button
            onClick={() => setView('create')}
            className="px-4 py-2 bg-secondary text-primary font-medium rounded hover:bg-secondary/90 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Create New Banner
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {view === 'list' && (
        <BannerList 
          banners={banners} 
          isLoading={isLoading}
          onView={(banner) => {
            setSelectedBanner(banner);
            setView('view');
          }}
          onEdit={(banner) => {
            setSelectedBanner(banner);
            setView('edit');
          }}
          onDelete={(banner) => setConfirmDelete(banner)}
          onToggleActive={handleToggleActive}
        />
      )}
      
      {view === 'create' && (
        <BannerForm 
          onSubmit={handleCreateBanner} 
          onCancel={() => setView('list')} 
        />
      )}
      
      {view === 'edit' && selectedBanner && (
        <BannerForm 
          banner={selectedBanner} 
          onSubmit={handleUpdateBanner} 
          onCancel={() => {
            setView('list');
            setSelectedBanner(null);
          }} 
        />
      )}
      
      {view === 'view' && selectedBanner && (
        <BannerDetails 
          banner={selectedBanner} 
          onClose={() => {
            setView('list');
            setSelectedBanner(null);
          }} 
        />
      )}
      
      {renderDeleteConfirmation()}
    </div>
  );
};

export default MarathonBannerManagement;
