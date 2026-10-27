"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faPlus, 
  faTrash,
  faSave,
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
import { createScheduleDay, updateScheduleDay } from '../../../../api/eventData';

const ScheduleDayForm = ({ scheduleDay, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    day: '',
    date: '',
    events: []
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

  // Check authentication status on mount
  useEffect(() => {
    console.log('Current user:', currentUser);
  }, [currentUser]);

  // Initialize form with schedule day data if editing
  useEffect(() => {
    if (scheduleDay) {
      setFormData({
        day: scheduleDay.day || '',
        date: scheduleDay.date || '',
        events: scheduleDay.events || []
      });
    }
  }, [scheduleDay]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle event change
  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formData.events];
    updatedEvents[index] = {
      ...updatedEvents[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };

  // Add new event
  const addEvent = () => {
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, { 
        time: '', 
        title: '', 
        location: '', 
        description: '', 
        icon: 'faRunning' 
      }]
    }));
  };

  // Remove event
  const removeEvent = (index) => {
    const updatedEvents = [...formData.events];
    updatedEvents.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.day || !formData.date) {
        setError('Day and date are required');
        setLoading(false);
        return;
      }
      
      if (formData.events.length === 0) {
        setError('At least one event is required');
        setLoading(false);
        return;
      }
      
      for (const event of formData.events) {
        if (!event.time || !event.title || !event.location) {
          setError('All events must have time, title, and location');
          setLoading(false);
          return;
        }
      }
      
      // Create or update schedule day
      const response = scheduleDay
        ? await updateScheduleDay(scheduleDay.id, formData)
        : await createScheduleDay(formData);
      
      if (response.success) {
        onSubmit();
      } else {
        setError(response.error || 'Failed to save schedule day');
      }
    } catch (err) {
      console.error('Error saving schedule day:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form header */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-secondary/20' : 'border-gray-200'} flex justify-between items-center`}>
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          {scheduleDay ? 'Edit Schedule Day' : 'Add New Schedule Day'}
        </h2>
        <button 
          onClick={onClose}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-primary/50 text-tertiary' : 'hover:bg-gray-100 text-primary'}`}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Day *
            </label>
            <input
              type="text"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
              placeholder="e.g., Day 1"
              required
            />
          </div>
          <div>
            <label className={`block mb-2 text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Date *
            </label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
              placeholder="e.g., June 28, 2025"
              required
            />
          </div>
        </div>

        {/* Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
              Events *
            </label>
            <button
              type="button"
              onClick={addEvent}
              className="text-secondary hover:text-secondary/80 text-sm flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" />
              Add Event
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.events.map((event, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20' : 'bg-tertiary border-gray-200'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                    Event {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-1 text-xs font-medium ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                      Time *
                    </label>
                    <input
                      type="text"
                      value={event.time}
                      onChange={(e) => handleEventChange(index, 'time', e.target.value)}
                      className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
                      placeholder="e.g., 4:00 PM - 8:00 PM"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 text-xs font-medium ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                      className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
                      placeholder="e.g., Pre-Marathon Registration"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className={`block mb-1 text-xs font-medium ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={event.location}
                    onChange={(e) => handleEventChange(index, 'location', e.target.value)}
                    className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
                    placeholder="e.g., CD MSUYA Square"
                    required
                  />
                </div>
                
                <div className="mt-3">
                  <label className={`block mb-1 text-xs font-medium ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                    Description
                  </label>
                  <textarea
                    value={event.description}
                    onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                    rows="2"
                    className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
                    placeholder="Describe this event..."
                  ></textarea>
                </div>
                
                <div className="mt-3">
                  <label className={`block mb-1 text-xs font-medium ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                    Icon
                  </label>
                  <select
                    value={event.icon}
                    onChange={(e) => handleEventChange(index, 'icon', e.target.value)}
                    className={`w-full p-2 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
                  >
                    {availableIcons.map((iconOption) => (
                      <option key={iconOption.name} value={iconOption.name}>
                        {iconOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            
            {formData.events.length === 0 && (
              <div className={`text-center p-4 border border-dashed rounded-lg ${theme === 'dark' ? 'border-secondary/20 text-tertiary/50' : 'border-gray-200 text-gray-400'}`}>
                No events added. Click "Add Event" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-primary/50 text-tertiary hover:bg-primary' : 'bg-gray-100 text-primary hover:bg-gray-200'}`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-opacity-90 flex items-center"
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
                Save Schedule Day
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleDayForm;
