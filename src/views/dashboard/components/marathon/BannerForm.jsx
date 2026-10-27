"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PackageEditor from './PackageEditor';
import { X, Info } from 'lucide-react';
import { getAvailableEvents } from '../../../../api/marathon/banner';
import { useAuth } from '../../../../contexts/AuthContext';

/**
 * Helper function to categorize a single event based on its name
 * Uses regex patterns to intelligently detect event type from name
 * @param {Object} event - The event object with name property
 * @returns {string} - The category identifier (e.g., 'fun_run', 'half_marathon', 'cycling')
 */
const categorizeEvent = (event) => {
  const name = event.name.toLowerCase();
  
  // Check for full marathon (42km, marathon) - must check before half marathon
  if ((name.includes('42km') || name.includes('marathon')) && !name.includes('half')) {
    return 'full_marathon';
  }
  
  // Check for half marathon (21km, half)
  if (name.includes('21km') || name.includes('half')) {
    return 'half_marathon';
  }
  
  // Check for 10K run (10km, 10k)
  if (name.includes('10km') || name.includes('10k')) {
    return '10k_run';
  }
  
  // Check for fun run (5km, fun run)
  if (name.includes('5km') || name.includes('fun')) {
    return 'fun_run';
  }
  
  // Check for kids run
  if (name.includes('kids')) {
    return 'kids_run';
  }
  
  // Check for cycling
  if (name.includes('cycling')) {
    return 'cycling';
  }
  
  // Check for trail
  if (name.includes('trail')) {
    return 'trail';
  }
  
  // Check for festival pass or pass-only events
  if (name.includes('festival') || name.includes('pass')) {
    return 'festival_pass';
  }
  
  // Default category for uncategorized events
  return 'other';
};

/**
 * Helper function to get all unique event categories from a list of events
 * @param {Array} events - Array of event objects
 * @returns {Array} - Array of unique category identifiers
 */
const getEventCategories = (events) => {
  if (!events || events.length === 0) return [];
  
  // Use Set to ensure uniqueness, then convert to sorted array
  const categories = new Set(events.map(event => categorizeEvent(event)));
  return Array.from(categories).sort();
};

/**
 * Helper function to format category identifier to display name
 * Converts snake_case to Title Case (e.g., 'fun_run' -> 'Fun Run')
 * @param {string} category - The category identifier
 * @returns {string} - Formatted display name
 */
const formatCategoryName = (category) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Helper function to filter events by category
 * Returns all events that belong to the specified category
 * @param {Array} events - Array of event objects
 * @param {string} category - The category to filter by
 * @returns {Array} - Filtered events matching the category
 */
const getEventsByCategory = (events, category) => {
  if (!events || events.length === 0) return [];
  return events.filter(event => categorizeEvent(event) === category);
};

const BannerForm = ({ banner, onSubmit, onCancel }) => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  
  // Initialize form data with general banner fields and dynamic event packages
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    location: '',
    start_time: '',
    max_participants: 5000,
    registration_start_date: '',
    registration_end_date: '',
    event_date: '',
    is_active: false,
    // Dynamic event packages will be populated after events are fetched
    eventPackages: {}
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState({});
  const [availableEvents, setAvailableEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  // State to track available event categories dynamically
  const [eventCategories, setEventCategories] = useState([]);

  // Fetch available events and initialize dynamic event packages based on detected categories
  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAuthenticated()) {
        setEventsError('You must be logged in to access events');
        return;
      }
      
      setIsLoadingEvents(true);
      setEventsError(null);
      try {
        const response = await getAvailableEvents();
        if (response.status === 'success') {
          const events = response.data || [];
          setAvailableEvents(events);
          
          // Detect all unique event categories from the API response
          const categories = getEventCategories(events);
          setEventCategories(categories);
          
          // Initialize eventPackages state with empty structure for each category
          const initialPackages = {};
          categories.forEach(category => {
            initialPackages[category] = {
              event_id: '',
              features: []
            };
          });
          
          // Update formData with initialized event packages
          setFormData(prev => ({
            ...prev,
            eventPackages: initialPackages
          }));
        } else {
          setEventsError('Failed to fetch events');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setEventsError('An error occurred while fetching events. Please try again later.');
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);

  // Initialize form with banner data if editing - handles both old and new data structures
  useEffect(() => {
    if (banner && eventCategories.length > 0) {
      // Format dates for input fields
      const formattedBanner = {
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        location: banner.location || '',
        start_time: banner.start_time || '',
        max_participants: banner.max_participants || 5000,
        registration_start_date: banner.registration_start_date ? new Date(banner.registration_start_date).toISOString().split('T')[0] : '',
        registration_end_date: banner.registration_end_date ? new Date(banner.registration_end_date).toISOString().split('T')[0] : '',
        event_date: banner.event_date ? new Date(banner.event_date).toISOString().split('T')[0] : '',
        is_active: banner.is_active || false,
        eventPackages: {}
      };
      
      // Initialize eventPackages for each category
      eventCategories.forEach(category => {
        formattedBanner.eventPackages[category] = {
          event_id: '',
          features: []
        };
      });
      
      // Handle new dynamic structure (event_packages JSON)
      if (banner.event_packages && Array.isArray(banner.event_packages)) {
        banner.event_packages.forEach(pkg => {
          if (formattedBanner.eventPackages[pkg.category]) {
            formattedBanner.eventPackages[pkg.category] = {
              event_id: pkg.event_id || '',
              features: pkg.features || []
            };
          }
        });
      } else if (typeof banner.event_packages === 'object' && banner.event_packages !== null) {
        // Handle if event_packages is already an object
        Object.assign(formattedBanner.eventPackages, banner.event_packages);
      }
      
      // Handle legacy structure (old hardcoded fields) for backward compatibility
      if (banner.fun_run_event_id || banner.fun_run_features) {
        formattedBanner.eventPackages.fun_run = {
          event_id: banner.fun_run_event_id || '',
          features: banner.fun_run_features || []
        };
      }
      if (banner.half_marathon_event_id || banner.half_marathon_features) {
        formattedBanner.eventPackages.half_marathon = {
          event_id: banner.half_marathon_event_id || '',
          features: banner.half_marathon_features || []
        };
      }
      if (banner.full_marathon_event_id || banner.full_marathon_features) {
        formattedBanner.eventPackages.full_marathon = {
          event_id: banner.full_marathon_event_id || '',
          features: banner.full_marathon_features || []
        };
      }
      
      setFormData(formattedBanner);
    }
  }, [banner, eventCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle changes to event packages (event selection and features)
  const handlePackageChange = (category, packageData) => {
    setFormData({
      ...formData,
      eventPackages: {
        ...formData.eventPackages,
        [category]: {
          ...formData.eventPackages[category],
          ...packageData
        }
      }
    });
  };

  // Validate form data - checks general fields and dynamic event packages
  const validateForm = () => {
    const newErrors = {};
    
    // General tab validations
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.start_time.trim()) newErrors.start_time = 'Start time is required';
    if (!formData.max_participants || formData.max_participants <= 0) {
      newErrors.max_participants = 'Valid maximum participants number is required';
    }
    if (!formData.registration_start_date) newErrors.registration_start_date = 'Registration start date is required';
    if (!formData.registration_end_date) newErrors.registration_end_date = 'Registration end date is required';
    if (!formData.event_date) newErrors.event_date = 'Event date is required';
    
    // Check if registration end date is after start date
    if (formData.registration_start_date && formData.registration_end_date) {
      const startDate = new Date(formData.registration_start_date);
      const endDate = new Date(formData.registration_end_date);
      if (endDate <= startDate) {
        newErrors.registration_end_date = 'Registration end date must be after start date';
      }
    }
    
    // Check if event date is after registration start date
    if (formData.registration_start_date && formData.event_date) {
      const startDate = new Date(formData.registration_start_date);
      const eventDate = new Date(formData.event_date);
      if (eventDate <= startDate) {
        newErrors.event_date = 'Event date must be after registration start date';
      }
    }
    
    // Dynamic package validations - iterate through all event packages
    Object.entries(formData.eventPackages).forEach(([category, packageData]) => {
      // At least one feature is required if an event is selected for this category
      if (packageData.event_id && 
          (!Array.isArray(packageData.features) || packageData.features.length === 0)) {
        newErrors[`${category}_features`] = `At least one feature for ${formatCategoryName(category)} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with validation and error tab navigation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Transform formData to include only selected event packages
      const submissionData = {
        title: formData.title,
        subtitle: formData.subtitle,
        location: formData.location,
        start_time: formData.start_time,
        max_participants: formData.max_participants,
        registration_start_date: formData.registration_start_date,
        registration_end_date: formData.registration_end_date,
        event_date: formData.event_date,
        is_active: formData.is_active,
        // Transform eventPackages object to array format for API
        event_packages: Object.entries(formData.eventPackages)
          .filter(([_, packageData]) => packageData.event_id) // Only include packages with selected events
          .map(([category, packageData]) => ({
            category,
            event_id: packageData.event_id,
            features: packageData.features
          }))
      };
      
      onSubmit(submissionData);
    } else {
      // Find the first tab with errors and switch to it
      const generalFields = ['title', 'location', 'start_time', 'max_participants', 'registration_start_date', 'registration_end_date', 'event_date'];
      
      if (Object.keys(errors).some(key => generalFields.includes(key))) {
        setActiveTab('general');
      } else {
        // Find first category with errors
        const errorCategory = Object.keys(errors).find(key => {
          // Extract category from error key (e.g., 'fun_run_features' -> 'fun_run')
          const category = key.replace('_features', '');
          return formData.eventPackages[category];
        });
        
        if (errorCategory) {
          const category = errorCategory.replace('_features', '');
          setActiveTab(category);
        }
      }
    }
  };

  // Generate dynamic tabs based on detected event categories
  // Always include 'general' as the first tab, then add category tabs
  const tabs = [
    { id: 'general', label: 'General Information' },
    ...eventCategories.map(category => ({
      id: category,
      label: `${formatCategoryName(category)} Package`
    }))
  ];

  // Render event selection for a specific category
  // Gets events filtered by category and handles selection/display
  const renderEventSelection = (category) => {
    const categoryEvents = getEventsByCategory(availableEvents, category);
    const hasError = errors[`${category}_features`];
    const selectedEventId = formData.eventPackages[category]?.event_id;
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Event</label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => {
            handlePackageChange(category, { event_id: e.target.value });
            // Clear features error when changing event
            if (errors[`${category}_features`]) {
              setErrors({
                ...errors,
                [`${category}_features`]: null
              });
            }
          }}
          className={`w-full p-2 border rounded-md ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } ${hasError ? 'border-primary' : ''}`}
          disabled={isLoadingEvents || eventsError}
        >
          <option value="">-- Select an event --</option>
          {categoryEvents.map(event => (
            <option key={event.id} value={event.id}>
              {event.name} (${event.foreign_price})
            </option>
          ))}
        </select>
        {hasError && <p className="text-primary text-xs mt-1">{hasError}</p>}
        
        {selectedEventId && (
          <div className="mt-2 text-sm">
            {categoryEvents.find(e => e.id.toString() === selectedEventId.toString())?.description || 'No description available'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">
          {banner ? 'Edit Marathon Banner' : 'Create New Marathon Banner'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-secondary text-secondary' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {Object.keys(errors).some(key => key.startsWith(tab.id)) && (
                <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
          ))}
        </div>
        
        {eventsError && (
          <div className="mb-4 p-3 bg-primary/10 border-l-4 border-primary text-primary flex items-start">
            <Info className="mr-2 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-medium">Error Loading Events</p>
              <p className="text-sm">{eventsError}</p>
              <p className="text-sm mt-1">You may continue with general information, but event selection will be unavailable.</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.title ? 'border-primary' : ''}`}
                    placeholder="Marathon 2025"
                  />
                  {errors.title && <p className="text-primary text-xs mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                    placeholder="Run for a Cause"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location*</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.location ? 'border-primary' : ''}`}
                    placeholder="City Center, Main Street"
                  />
                  {errors.location && <p className="text-primary text-xs mt-1">{errors.location}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time*</label>
                  <input
                    type="text"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.start_time ? 'border-primary' : ''}`}
                    placeholder="6:00 AM"
                  />
                  {errors.start_time && <p className="text-primary text-xs mt-1">{errors.start_time}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Participants*</label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  min="1"
                  className={`w-full p-2 border rounded-md ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } ${errors.max_participants ? 'border-primary' : ''}`}
                />
                {errors.max_participants && <p className="text-primary text-xs mt-1">{errors.max_participants}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Start Date*</label>
                  <input
                    type="date"
                    name="registration_start_date"
                    value={formData.registration_start_date}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.registration_start_date ? 'border-primary' : ''}`}
                  />
                  {errors.registration_start_date && <p className="text-primary text-xs mt-1">{errors.registration_start_date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Registration End Date*</label>
                  <input
                    type="date"
                    name="registration_end_date"
                    value={formData.registration_end_date}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.registration_end_date ? 'border-primary' : ''}`}
                  />
                  {errors.registration_end_date && <p className="text-primary text-xs mt-1">{errors.registration_end_date}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Event Date*</label>
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } ${errors.event_date ? 'border-primary' : ''}`}
                  />
                  {errors.event_date && <p className="text-primary text-xs mt-1">{errors.event_date}</p>}
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mr-2 h-4 w-4 text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm font-medium">Set as active banner</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Only one banner can be active at a time. Activating this banner will deactivate all others.
                </p>
              </div>
            </div>
          )}
          
          {/* Dynamic Event Package Tabs - rendered based on detected categories */}
          {eventCategories.map(category => (
            activeTab === category && (
              <div key={category} className="space-y-4">
                {renderEventSelection(category)}
                
                <PackageEditor
                  packageType={category}
                  features={formData.eventPackages[category]?.features || []}
                  onChange={(_, packageData) => {
                    // Transform PackageEditor output format to match our structure
                    const featureKey = `${category}_features`;
                    if (packageData[featureKey]) {
                      handlePackageChange(category, { features: packageData[featureKey] });
                    }
                  }}
                  errors={errors}
                />
              </div>
            )
          ))}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md shadow-sm text-sm font-medium bg-secondary text-primary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            >
              {banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BannerForm;
