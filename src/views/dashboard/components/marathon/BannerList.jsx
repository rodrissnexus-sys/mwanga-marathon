"use client";

import React, { useState } from 'react';
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

const BannerList = ({ banners, onView, onEdit, onDelete, onToggleActive, isLoading, theme = 'light' }) => {
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBanners = [...banners].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField.includes('date')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${theme === 'dark' ? 'border-primary/15' : 'border-primary/15'}`}>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-primary/15">
          <thead className={`${theme === 'dark' ? 'bg-primary' : 'bg-primary/[0.03]'}`}>
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('event_date')}
              >
                Event Date {sortField === 'event_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('registration_end_date')}
              >
                Registration Ends {sortField === 'registration_end_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('is_active')}
              >
                Status {sortField === 'is_active' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${theme === 'dark' ? 'divide-primary/15' : 'divide-primary/15'}`}>
            {sortedBanners.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  No marathon banners found. Create one to get started.
                </td>
              </tr>
            ) : (
              sortedBanners.map((banner) => (
                <tr 
                  key={banner.id} 
                  className={`${theme === 'dark' ? 'hover:bg-primary' : 'hover:bg-primary/[0.03]'} transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium max-w-xs">
                      <div className="truncate" title={banner.title}>{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-xs text-primary/70 truncate" title={banner.subtitle}>
                          {banner.subtitle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(banner.event_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(banner.registration_end_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        banner.is_active 
                          ? 'bg-positive/10 text-positive' 
                          : 'bg-primary/5 text-primary'
                      }`}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(banner)}
                        className="text-primary hover:text-primary"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(banner)}
                        className="text-primary hover:text-primary"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onToggleActive(banner)}
                        className={`${
                          banner.is_active 
                            ? 'text-positive hover:text-positive' 
                            : 'text-primary/70 hover:text-primary'
                        }`}
                        title={banner.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {banner.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => onDelete(banner)}
                        className="text-negative hover:text-negative"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {sortedBanners.length === 0 ? (
          <div className="p-6 text-center">
            No marathon banners found. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-primary/15">
            {sortedBanners.map((banner) => (
              <div 
                key={banner.id} 
                className={`p-4 ${theme === 'dark' ? 'hover:bg-primary' : 'hover:bg-primary/[0.03]'} transition-colors`}
              >
                {/* Title and Subtitle */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold mb-1 break-words">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm text-primary/70 line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span 
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      banner.is_active 
                        ? 'bg-positive/10 text-positive' 
                        : 'bg-primary/5 text-primary'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary/70">Event Date:</span>
                    <span className="font-medium">{formatDate(banner.event_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/70">Registration Ends:</span>
                    <span className="font-medium">{formatDate(banner.registration_end_date)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-primary/15">
                  <button
                    onClick={() => onView(banner)}
                    className="p-2 text-primary hover:bg-primary rounded-md transition-colors"
                    title="View"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => onEdit(banner)}
                    className="p-2 text-primary hover:bg-primary rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => onToggleActive(banner)}
                    className={`p-2 rounded-md transition-colors ${
                      banner.is_active 
                        ? 'text-positive hover:bg-positive/10' 
                        : 'text-primary/70 hover:bg-primary/5'
                    }`}
                    title={banner.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {banner.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button
                    onClick={() => onDelete(banner)}
                    className="p-2 text-negative hover:bg-negative/10 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerList;