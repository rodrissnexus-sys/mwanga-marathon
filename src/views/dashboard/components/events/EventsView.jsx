"use client";

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faPlus, 
  faList,
  faCalendarDay
} from '@fortawesome/free-solid-svg-icons';
import EventTypesList from './EventTypesList';
import ScheduleDaysList from './ScheduleDaysList';

const EventsView = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('eventTypes'); // 'eventTypes' or 'schedule'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          Event Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/15 mb-6">
        <button
          onClick={() => setActiveTab('eventTypes')}
          className={`py-3 px-6 font-medium text-sm flex items-center ${activeTab === 'eventTypes' 
            ? `border-b-2 border-secondary ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}` 
            : `${theme === 'dark' ? 'text-tertiary/70 hover:text-tertiary' : 'text-primary/70 hover:text-primary'}`
          }`}
        >
          <FontAwesomeIcon icon={faList} className="mr-2" />
          Event Types
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`py-3 px-6 font-medium text-sm flex items-center ${activeTab === 'schedule' 
            ? `border-b-2 border-secondary ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}` 
            : `${theme === 'dark' ? 'text-tertiary/70 hover:text-tertiary' : 'text-primary/70 hover:text-primary'}`
          }`}
        >
          <FontAwesomeIcon icon={faCalendarDay} className="mr-2" />
          Schedule Days
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'eventTypes' ? (
        <EventTypesList />
      ) : (
        <ScheduleDaysList />
      )}
    </div>
  );
};

export default EventsView;
