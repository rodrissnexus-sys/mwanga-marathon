"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash,
  faEye,
  faSearch,
  faSpinner,
  faRunning, 
  faMusic, 
  faMasksTheater, 
  faTicket,
  faChevronRight,
  faCalendarCheck,
  faUserGroup,
  faGift,
  faStar,
  faTree,
  faHospital,
  faUtensils,
  faDrumstickBite
} from '@fortawesome/free-solid-svg-icons';
import { fetchEventTypes, deleteEventType } from '../../../../api/eventData';
import EventTypeForm from './EventTypeForm';

// Fallback data for when API is not available
const fallbackEventTypes = [
  {
    id: "1",
    title: "Day 1: Marathon & Festival",
    subtitle: "Saturday, June 28, 2025",
    icon: "faRunning",
    color: "from-primary to-secondary",
    description: "A full day of marathon events followed by celebrations with music, food, and entertainment for the whole family.",
    features: [
      { text: "Marathon Event (6:35am - 9:30am)", icon: "faRunning" },
      { text: "Awards Ceremony (2:30pm)", icon: "faStar" },
      { text: "Live Music & Entertainment (4:00pm)", icon: "faMusic" }
    ],
    highlight: "Main Event Day",
    image: "/assets/images/2026/runners-group.jpg"
  },
  {
    id: "2",
    title: "Day 2: Cultural Showcase",
    subtitle: "Sunday, June 29, 2025",
    icon: "faMasksTheater",
    color: "from-blue-500 to-purple-500",
    description: "Immerse yourself in the rich cultural heritage of Tanzania with traditional performances, art exhibitions, and culinary experiences.",
    features: [
      { text: "Cultural Performances (10:00am - 2:00pm)", icon: "faMasksTheater" },
      { text: "Art Exhibition (All Day)", icon: "faTicket" },
      { text: "Culinary Showcase (12:00pm - 6:00pm)", icon: "faUtensils" }
    ],
    highlight: "Cultural Day",
    image: "/assets/images/2026/maasai-culture.jpg"
  }
];

const EventTypesList = () => {
  const { theme } = useTheme();
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentEventType, setCurrentEventType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch event types
  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const response = await fetchEventTypes();
      if (response.success) {
        setEventTypes(response.data);
      } else {
        console.warn('API error, using fallback data:', response.error);
        setEventTypes(fallbackEventTypes);
        setError('Using demo data. API connection failed: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.warn('API error, using fallback data:', err);
      setEventTypes(fallbackEventTypes);
      setError('Using demo data. API connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  // Handle edit event type
  const handleEdit = (eventType) => {
    setCurrentEventType(eventType);
    setShowForm(true);
  };

  // Handle delete event type
  const handleDelete = async (id) => {
    if (confirmDelete === id) {
      try {
        setLoading(true);
        const response = await deleteEventType(id);
        if (response.success) {
          // Refresh the list
          loadEventTypes();
          setConfirmDelete(null);
        } else {
          setError(response.error || 'Failed to delete event type');
        }
      } catch (err) {
        setError('An error occurred while deleting event type');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setConfirmDelete(id);
    }
  };

  // Filter event types based on search term
  const filteredEventTypes = eventTypes.filter(eventType => 
    eventType.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eventType.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission (create/update)
  const handleFormSubmit = () => {
    setShowForm(false);
    setCurrentEventType(null);
    loadEventTypes();
  };

  return (
    <div>
      {/* Header with search and add button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className={`relative flex-1 max-w-md ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          <input
            type="text"
            placeholder="Search event types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 pl-10 pr-4 rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/50 text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" 
          />
        </div>
        <button
          onClick={() => {
            setCurrentEventType(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Event Type
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Event types list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-secondary" />
        </div>
      ) : filteredEventTypes.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-tertiary' : 'text-gray-500'}`}>
          {searchTerm ? 'No event types match your search' : 'No event types found. Add your first one!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventTypes.map((eventType) => (
            <div 
              key={eventType.id} 
              className={`rounded-lg border ${theme === 'dark' ? 'bg-primary/50 border-secondary/20' : 'bg-tertiary border-gray-200'} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Card header with color from event type */}
              <div className={`h-3 bg-gradient-to-r ${eventType.color}`}></div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-semibold text-lg ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                      {eventType.title}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-tertiary/70' : 'text-gray-500'}`}>
                      {eventType.subtitle}
                    </p>
                  </div>
                  {eventType.highlight && (
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                      {eventType.highlight}
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mb-4 line-clamp-2 ${theme === 'dark' ? 'text-tertiary/80' : 'text-gray-600'}`}>
                  {eventType.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {eventType.features.slice(0, 3).map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-gray-100 text-primary'} border ${theme === 'dark' ? 'border-secondary/20' : 'border-tertiary'}`}
                        title={feature.text}
                      >
                        <FontAwesomeIcon icon={iconMap[feature.icon] || faEye} className="text-xs" />
                      </div>
                    ))}
                    {eventType.features.length > 3 && (
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-primary text-tertiary' : 'bg-gray-100 text-primary'} border ${theme === 'dark' ? 'border-secondary/20' : 'border-tertiary'}`}
                      >
                        <span className="text-xs font-medium">+{eventType.features.length - 3}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(eventType)}
                      className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-gray-100 text-primary'}`}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      onClick={() => handleDelete(eventType.id)}
                      className={`p-2 rounded-md ${confirmDelete === eventType.id ? 'bg-red text-tertiary' : theme === 'dark' ? 'hover:bg-primary text-tertiary' : 'hover:bg-primary/20 text-primary'}`}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Type Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg ${theme === 'dark' ? 'bg-primary' : 'bg-tertiary'}`}
          >
            <EventTypeForm 
              eventType={currentEventType} 
              onClose={() => {
                setShowForm(false);
                setCurrentEventType(null);
              }} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Map string icon names to FontAwesome icons
const iconMap = {
  "faRunning": faRunning,
  "faMusic": faMusic,
  "faMasksTheater": faMasksTheater,
  "faTicket": faTicket,
  "faChevronRight": faChevronRight,
  "faCalendarCheck": faCalendarCheck,
  "faUserGroup": faUserGroup,
  "faGift": faGift,
  "faStar": faStar,
  "faTree": faTree,
  "faHospital": faHospital,
  "faUtensils": faUtensils,
  "faDrumstickBite": faDrumstickBite
};

export default EventTypesList;
