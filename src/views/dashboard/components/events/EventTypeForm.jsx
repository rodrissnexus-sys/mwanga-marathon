"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faPlus, 
  faTrash,
  faSave,
  faImage,
  faSpinner,
  faRunning,
  faMusic,
  faMasksTheater,
  faTicket,
  faCalendarCheck,
  faUserGroup,
  faGift,
  faStar,
  faTree,
  faHospital,
  faUtensils,
  faDrumstickBite
} from '@fortawesome/free-solid-svg-icons';
import { createEventType, updateEventType } from '../../../../api/eventData';

const EventTypeForm = ({ eventType, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    title: '',
    subtitle: '',
    icon: 'faRunning',
    color: 'from-primary to-secondary',
    description: '',
    features: [],
    highlight: '',
    image: ''
  });

  // Available icons for selection
  const availableIcons = [
    { name: 'faRunning', icon: faRunning, label: 'Running' },
    { name: 'faMusic', icon: faMusic, label: 'Music' },
    { name: 'faMasksTheater', icon: faMasksTheater, label: 'Theater' },
    { name: 'faTicket', icon: faTicket, label: 'Ticket' },
    { name: 'faCalendarCheck', icon: faCalendarCheck, label: 'Calendar' },
    { name: 'faUserGroup', icon: faUserGroup, label: 'Group' },
    { name: 'faGift', icon: faGift, label: 'Gift' },
    { name: 'faStar', icon: faStar, label: 'Star' },
    { name: 'faTree', icon: faTree, label: 'Tree' },
    { name: 'faHospital', icon: faHospital, label: 'Hospital' },
    { name: 'faUtensils', icon: faUtensils, label: 'Food' },
    { name: 'faDrumstickBite', icon: faDrumstickBite, label: 'Meat' }
  ];

  // Available color gradients
  const availableColors = [
    { value: 'from-primary to-secondary', label: 'Primary to Secondary' },
    { value: 'from-blue-500 to-purple-500', label: 'Blue to Purple' },
    { value: 'from-green-500 to-teal-500', label: 'Green to Teal' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow to Orange' },
    { value: 'from-red-500 to-pink-500', label: 'Red to Pink' },
    { value: 'from-indigo-500 to-blue-500', label: 'Indigo to Blue' }
  ];

  // Initialize form with event type data if editing
  useEffect(() => {
    if (eventType) {
      setFormData({
        event_id: eventType.event_id || '',
        title: eventType.title || '',
        subtitle: eventType.subtitle || '',
        icon: eventType.icon || 'faRunning',
        color: eventType.color || 'from-primary to-secondary',
        description: eventType.description || '',
        features: eventType.features || [],
        highlight: eventType.highlight || '',
        image: eventType.image || ''
      });
    }
  }, [eventType]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle feature change
  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = {
      ...updatedFeatures[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  // Add new feature
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { text: '', icon: 'faRunning' }]
    }));
  };

  // Remove feature
  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      features: updatedFeatures
    }));
  };

  // Generate a unique event_id if not provided
  useEffect(() => {
    if (!formData.event_id && formData.title) {
      // Create a slug from the title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      
      // Add a timestamp to ensure uniqueness
      const uniqueId = `${slug}-${Date.now().toString().slice(-6)}`;
      
      setFormData(prev => ({
        ...prev,
        event_id: uniqueId
      }));
    }
  }, [formData.title, formData.event_id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.title || !formData.subtitle || !formData.description || !formData.event_id) {
        setError('Event ID, title, subtitle, and description are required');
        setLoading(false);
        return;
      }
      
      // Create or update event type
      const response = eventType
        ? await updateEventType(eventType.id, formData)
        : await createEventType(formData);
      
      if (response.success) {
        onSubmit();
      } else {
        setError(response.error || 'Failed to save event type');
      }
    } catch (err) {
      console.error('Error saving event type:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-secondary/20' : 'border-primary/15'} flex justify-between items-center`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          {eventType ? 'Edit Event Type' : 'Add New Event Type'}
        </h2>
        <button 
          onClick={onClose}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-primary/50 text-tertiary' : 'hover:bg-primary/5 text-primary'}`}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-negative/10 text-negative rounded-lg">
            {error}
          </div>
        )}

        {/* Event ID field */}
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
            Event ID *
          </label>
          <input
            type="text"
            name="event_id"
            value={formData.event_id}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
            placeholder="e.g., marathon-day-1"
            required
          />
          <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-tertiary/70' : 'text-primary/70'}`}>
            A unique identifier for this event type. Will be auto-generated if left empty.
          </p>
        </div>

        {/* Basic information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
              placeholder="e.g., Day 1: Marathon & Festival"
              required
            />
          </div>
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Subtitle *
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
              placeholder="e.g., Saturday, June 28, 2025"
              required
            />
          </div>
        </div>

        {/* Icon and Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Icon
            </label>
            <div className={`grid grid-cols-6 gap-2 p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20' : 'bg-tertiary border-primary/15'}`}>
              {availableIcons.map((iconOption) => (
                <button
                  key={iconOption.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.name }))}
                  className={`p-2 rounded-md flex items-center justify-center ${formData.icon === iconOption.name 
                    ? 'bg-secondary text-primary' 
                    : theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-primary/5 text-primary'}`}
                  title={iconOption.label}
                >
                  <FontAwesomeIcon icon={iconOption.icon} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Color Gradient
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
            >
              {availableColors.map((colorOption) => (
                <option key={colorOption.value} value={colorOption.value}>
                  {colorOption.label}
                </option>
              ))}
            </select>
            <div className={`h-2 mt-2 rounded bg-gradient-to-r ${formData.color}`}></div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
            placeholder="Describe this event type..."
            required
          ></textarea>
        </div>

        {/* Highlight */}
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
            Highlight (optional)
          </label>
          <input
            type="text"
            name="highlight"
            value={formData.highlight}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
            placeholder="e.g., Main Event Day"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
            Image URL
          </label>
          <div className="flex">
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className={`flex-1 p-3 rounded-l-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
              placeholder="e.g., /assets/images/2026/runners-group.jpg"
            />
            <div className={`p-3 rounded-r-lg border-t border-r border-b ${theme === 'dark' ? 'bg-primary/70 border-secondary/20 text-tertiary' : 'bg-primary/5 border-primary/15 text-primary'}`}>
              <FontAwesomeIcon icon={faImage} />
            </div>
          </div>
          {formData.image && (
            <div className="mt-2 relative h-32 bg-primary/5 rounded-lg overflow-hidden">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
              />
            </div>
          )}
        </div>

        {/* Features */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Features
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="text-secondary hover:text-secondary/80 text-sm flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              Add Feature
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={feature.icon}
                  onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                  className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
                >
                  {availableIcons.map((iconOption) => (
                    <option key={iconOption.name} value={iconOption.name}>
                      {iconOption.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={feature.text}
                  onChange={(e) => handleFeatureChange(index, 'text', e.target.value)}
                  className={`flex-1 p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 text-negative hover:text-negative"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            
            {formData.features.length === 0 && (
              <div className={`text-center p-4 border border-dashed rounded-lg ${theme === 'dark' ? 'border-secondary/20 text-tertiary/50' : 'border-primary/15 text-primary/70'}`}>
                No features added. Click "Add Feature" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-primary/15">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-primary/50 text-tertiary hover:bg-primary' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-primary rounded-lg hover:opacity-90 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                Save Event Type
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventTypeForm;
