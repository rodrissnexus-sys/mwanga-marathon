"use client";

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Calendar, MapPin, Clock, Users, Check, AlertCircle } from 'lucide-react';

const BannerDetails = ({ banner, onClose }) => {
  const { theme } = useTheme();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to safely get event data or display placeholder
  const getEventData = (eventObject, field, defaultValue = 'N/A') => {
    if (!eventObject) return defaultValue;
    return eventObject[field] || defaultValue;
  };

  const PackageCard = ({ packageType, event, features = [] }) => {
    if (!event && !features.length) return null;
    
    const eventName = getEventData(event, 'name', packageType.replace('_', ' ').toUpperCase());
    const eventPrice = getEventData(event, 'foreign_price', '0');
    const eventDescription = getEventData(event, 'description', '');
    
    // Extract distance from event name if possible
    let distance = '';
    if (event?.name) {
      if (packageType === 'fun_run') {
        distance = '5K';
      } else if (packageType === 'half_marathon') {
        distance = '21K';
      } else if (packageType === 'full_marathon') {
        distance = '42K';
      }
      
      // Try to extract from name if contains km
      const kmMatch = event.name.match(/(\d+)(?:\s*km)/i);
      if (kmMatch) {
        distance = `${kmMatch[1]}K`;
      }
    }
    
    return (
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} shadow`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            {distance && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-primary`}>
                {distance}
              </span>
            )}
            <h3 className="text-lg font-bold mt-1">{eventName}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Registration Fee</p>
            <p className="text-xl font-bold">${eventPrice}</p>
          </div>
        </div>
        
        {eventDescription && (
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            {eventDescription}
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">Features:</h4>
          {features.length > 0 ? (
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-sm">
                  <Check size={14} className="text-secondary mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No features specified</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{banner.title}</h2>
          {banner.subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{banner.subtitle}</p>}
          
          <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm ${
            banner.is_active 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {banner.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Event Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Calendar className="text-secondary" size={16} />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Event Date</p>
                  <p className="text-sm font-medium">{formatDate(banner.event_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="text-secondary" size={16} />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium">{banner.location}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="text-secondary" size={16} />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Starting Time</p>
                  <p className="text-sm font-medium">{banner.start_time}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="text-secondary" size={16} />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Participants</p>
                  <p className="text-sm font-medium">Limited to {banner.max_participants.toLocaleString()} Runners</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Registration Period</h3>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Opens</p>
                  <p className="text-sm font-medium">{formatDate(banner.registration_start_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Closes</p>
                  <p className="text-sm font-medium">{formatDate(banner.registration_end_date)}</p>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-secondary">
                      Registration Period
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300 dark:bg-gray-600">
                  <div 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Marathon Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(!banner.fun_run_event_id && !banner.half_marathon_event_id && !banner.full_marathon_event_id) ? (
            <div className="col-span-3 p-4 rounded-lg bg-primary/10 border-l-4 border-primary text-primary flex items-start">
              <AlertCircle className="mr-2 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-medium">No Event Packages</p>
                <p className="text-sm">This banner doesn't have any event packages configured.</p>
              </div>
            </div>
          ) : (
            <>
              <PackageCard 
                packageType="fun_run"
                event={banner.fun_run_event}
                features={banner.fun_run_features}
              />
              
              <PackageCard 
                packageType="half_marathon"
                event={banner.half_marathon_event}
                features={banner.half_marathon_features}
              />
              
              <PackageCard 
                packageType="full_marathon"
                event={banner.full_marathon_event}
                features={banner.full_marathon_features}
              />
            </>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-primary font-medium rounded hover:bg-secondary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerDetails;
