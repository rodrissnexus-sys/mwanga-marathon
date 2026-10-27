"use client";

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSpinner } from '@fortawesome/free-solid-svg-icons';
import MetricsSection from './MetricsSection';
import ChartSection from './ChartSection';
import { useTheme } from '../../contexts/ThemeContext';
import { getRecentRegistrations, getEventStatistics } from '../../../../api/marathon/dashboard';

const DashboardHome = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('last7days');
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [eventStatistics, setEventStatistics] = useState({ events: [], genderDistribution: { male: 0, female: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent registrations
        const registrationsResponse = await getRecentRegistrations(5);
        
        // Fetch event statistics
        const statisticsResponse = await getEventStatistics();
        
        if (registrationsResponse.success && statisticsResponse.success) {
          setRecentRegistrations(registrationsResponse.data || []);
          setEventStatistics(statisticsResponse.data || { events: [], genderDistribution: { male: 0, female: 0 } });
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
          Dashboard Overview
        </h1>
        <div className="flex space-x-2">
          <select 
            className={`px-3 py-1.5 rounded-md text-sm border ${theme === 'dark' ? 'bg-primary/50 border-secondary text-tertiary' : 'bg-tertiary border-gray-200 text-primary'}`}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="thisMonth">This month</option>
            <option value="thisYear">This year</option>
          </select>
          <button className="px-3 py-1.5 bg-secondary text-primary rounded-md text-sm hover:opacity-90 transition-opacity flex items-center">
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      <MetricsSection />
      <ChartSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl p-5 ${theme === 'dark' ? 'bg-primary/50' : 'bg-tertiary shadow-md'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Recent Registrations</h2>
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <FontAwesomeIcon icon={faSpinner} spin className={`text-3xl ${theme === 'dark' ? 'text-secondary' : 'text-primary'}`} />
              <span className={`ml-3 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Loading registrations...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
          ) : recentRegistrations.length === 0 ? (
            <div className="text-center p-8 text-gray-500 italic">No recent registrations found</div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentRegistrations.map((registration, index) => (
                <div 
                  key={index} 
                  className={`flex items-start p-3 rounded-lg ${registration.payment_status === 'completed' || registration.payment_confirmed ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' : 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500'}`}
                >
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                      {registration.first_name} {registration.last_name}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-tertiary opacity-70' : 'text-primary opacity-70'}`}>
                      {registration.event ? registration.event.name : 'Unknown Event'}
                    </p>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${theme === 'dark' ? 'text-tertiary opacity-50' : 'text-primary opacity-50'}`}>
                        {formatDate(registration.created_at)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${registration.payment_status === 'completed' || registration.payment_confirmed ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                        {registration.payment_status === 'completed' || registration.payment_confirmed ? 'Payment Completed' : 'Payment Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={`rounded-xl p-5 ${theme === 'dark' ? 'bg-primary/50' : 'bg-tertiary shadow-md'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Event Statistics</h2>
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <FontAwesomeIcon icon={faSpinner} spin className={`text-3xl ${theme === 'dark' ? 'text-secondary' : 'text-primary'}`} />
              <span className={`ml-3 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Loading statistics...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
          ) : eventStatistics.events.length === 0 ? (
            <div className="text-center p-8 text-gray-500 italic">No event statistics available</div>
          ) : (
            <div className="space-y-4">
              {eventStatistics.events.map((event, index) => {
                const percentage = Math.round((event.registered / event.capacity) * 100);
                const colors = [
                  { bg: 'bg-blue-500', border: 'border-blue-600' },
                  { bg: 'bg-green-500', border: 'border-green-600' },
                  { bg: 'bg-purple-500', border: 'border-purple-600' },
                  { bg: 'bg-orange-500', border: 'border-orange-600' },
                  { bg: 'bg-pink-500', border: 'border-pink-600' }
                ];
                const colorIndex = index % colors.length;
                
                return (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>{event.name}</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                        {event.registered}/{event.capacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-primary">
                      <div 
                        className={`h-full ${colors[colorIndex].bg}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6 mb-15 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>Gender Distribution</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                      Male ({eventStatistics.genderDistribution.male}%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className={`text-xs ${theme === 'dark' ? 'text-tertiary' : 'text-primary'}`}>
                      Female ({eventStatistics.genderDistribution.female}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
