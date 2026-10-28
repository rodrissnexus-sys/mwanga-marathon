"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash,
  faCalendarDay,
  faSearch,
  faSpinner,
  faChevronRight,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { fetchSchedule, deleteScheduleDay } from '../../../../api/eventData';
import ScheduleDayForm from './ScheduleDayForm';

// Fallback data for when API is not available
const fallbackScheduleDays = [
  {
    id: "1",
    day: "Day 0",
    date: "June 27, 2025",
    events: [
      {
        time: "4:00 PM - 8:00 PM",
        title: "Pre-Marathon Registration",
        location: "CD MSUYA Square",
        description: "Final registration and bib collection for marathon participants",
        icon: "faRunning"
      }
    ]
  },
  {
    id: "2",
    day: "Day 1",
    date: "June 28, 2025",
    events: [
      {
        time: "6:00 AM - 6:30 AM",
        title: "Marathon Assembly",
        location: "Starting Point",
        description: "Participants gather at the starting point for final instructions",
        icon: "faRunning"
      },
      {
        time: "6:35 AM - 9:30 AM",
        title: "Marathon Event",
        location: "City Route",
        description: "Main marathon event through the scenic routes of the city",
        icon: "faRunning"
      },
      {
        time: "2:30 PM - 3:30 PM",
        title: "Awards Ceremony",
        location: "Main Stage",
        description: "Recognition and awards for marathon winners and participants",
        icon: "faStar"
      },
      {
        time: "4:00 PM - 10:00 PM",
        title: "Festival & Entertainment",
        location: "Festival Grounds",
        description: "Live music, food stalls, and entertainment for all attendees",
        icon: "faMusic"
      }
    ]
  },
  {
    id: "3",
    day: "Day 2",
    date: "June 29, 2025",
    events: [
      {
        time: "10:00 AM - 2:00 PM",
        title: "Cultural Performances",
        location: "Cultural Center",
        description: "Traditional dances and performances showcasing local culture",
        icon: "faMasksTheater"
      },
      {
        time: "12:00 PM - 6:00 PM",
        title: "Food Festival",
        location: "Food Court",
        description: "Culinary delights from various regions of Tanzania",
        icon: "faUtensils"
      }
    ]
  }
];

const ScheduleDaysList = () => {
  const { theme } = useTheme();
  const [scheduleDays, setScheduleDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentScheduleDay, setCurrentScheduleDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  // Fetch schedule days
  const loadScheduleDays = async () => {
    try {
      setLoading(true);
      const response = await fetchSchedule();
      if (response.success) {
        setScheduleDays(response.data);
      } else {
        console.warn('API error, using fallback data:', response.error);
        setScheduleDays(fallbackScheduleDays);
        setError('Using demo data. API connection failed: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.warn('API error, using fallback data:', err);
      setScheduleDays(fallbackScheduleDays);
      setError('Using demo data. API connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleDays();
  }, []);

  // Handle edit schedule day
  const handleEdit = (scheduleDay) => {
    setCurrentScheduleDay(scheduleDay);
    setShowForm(true);
  };

  // Handle delete schedule day
  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        setLoading(true);
        const response = await deleteScheduleDay(id);
        if (response.success) {
          // Refresh the list
          loadScheduleDays();
          setConfirmDelete(null);
        } else {
          setError(response.error || 'Failed to delete schedule day');
        }
      } catch (err) {
        setError('An error occurred while deleting schedule day');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setConfirmDelete(id);
    }
  };

  // Toggle expanded day
  const toggleExpandDay = (id) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  // Filter schedule days based on search term
  const filteredScheduleDays = scheduleDays.filter(day => 
    day.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.events.some(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle form submission (create/update)
  const handleFormSubmit = () => {
    setShowForm(false);
    setCurrentScheduleDay(null);
    loadScheduleDays();
  };

  return (
    <div>
      {/* Header with search and add button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className={`relative flex-1 max-w-md ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          <input
            type="text"
            placeholder="Search schedule days..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 pl-10 pr-4 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/50 text-tertiary' : 'bg-tertiary border-primary/15 text-primary'}`}
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" 
          />
        </div>
        <button
          onClick={() => {
            setCurrentScheduleDay(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:opacity-90 transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Schedule Day
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-negative/10 text-negative rounded-lg">
          {error}
        </div>
      )}

      {/* Schedule days list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-secondary" />
        </div>
      ) : filteredScheduleDays.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-tertiary' : 'text-primary/70'}`}>
          {searchTerm ? 'No schedule days match your search' : 'No schedule days found. Add your first one!'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScheduleDays.map((scheduleDay) => (
            <div 
              key={scheduleDay.id} 
              className={`rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20' : 'bg-tertiary border-primary/15'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
            >
              <div 
                className={`p-4 flex justify-between items-center cursor-pointer ${expandedDay === scheduleDay.id ? (theme === 'dark' ? 'bg-primary/70' : 'bg-primary/[0.03]') : ''}`}
                onClick={() => toggleExpandDay(scheduleDay.id)}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-secondary/20 text-secondary' : 'bg-secondary/10 text-secondary'} mr-3`}>
                    <FontAwesomeIcon icon={faCalendarDay} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                      {scheduleDay.day}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      {scheduleDay.date}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className={`mr-4 text-sm ${theme === 'dark' ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    {scheduleDay.events.length} {scheduleDay.events.length === 1 ? 'Event' : 'Events'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(scheduleDay);
                      }}
                      className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-primary/5 text-primary'}`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scheduleDay.id);
                      }}
                      className={`p-2 rounded-md ${confirmDelete === scheduleDay.id ? 'bg-negative text-tertiary' : theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-primary/5 text-primary'}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <div className={`p-2 transition-transform duration-200 ${expandedDay === scheduleDay.id ? 'rotate-90' : ''}`}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded content with events */}
              {expandedDay === scheduleDay.id && (
                <div className={`p-4 border-t ${theme === 'dark' ? 'border-secondary/20' : 'border-primary/15'}`}>
                  <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-tertiary/80' : 'text-primary/70'}`}>
                    Events
                  </h4>
                  <div className="space-y-3">
                    {scheduleDay.events.map((event, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-primary/70' : 'bg-primary/[0.03]'}`}
                      >
                        <div className="flex items-start">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-primary/5 text-primary'} mt-1 mr-3`}>
                            <FontAwesomeIcon icon={faClock} className="text-xs" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h5 className={`font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                                {event.title}
                              </h5>
                              <span className={`text-xs ${theme === 'dark' ? 'text-tertiary/70' : 'text-primary/70'}`}>
                                {event.time}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-tertiary/70' : 'text-primary/70'}`}>
                              {event.location}
                            </p>
                            {event.description && (
                              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-tertiary/80' : 'text-primary/70'}`}>
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Day Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50">
          <div 
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg ${theme === 'dark' ? 'bg-primary' : 'bg-tertiary'}`}
          >
            <ScheduleDayForm 
              scheduleDay={currentScheduleDay} 
              onClose={() => {
                setShowForm(false);
                setCurrentScheduleDay(null);
              }} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDaysList;
