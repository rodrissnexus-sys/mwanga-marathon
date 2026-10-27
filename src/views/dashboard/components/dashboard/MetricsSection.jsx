"use client";

import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  faChartLine, 
  faUsers, 
  faCreditCard, 
  faHourglassHalf 
} from '@fortawesome/free-solid-svg-icons';
import { getAllRegistrations } from '../../../../api/marathon/registration';

const MetricsSection = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth(); // Get the current authenticated user
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Registrations',
      value: '0',
      change: '0%',
      positive: true,
      icon: faChartLine
    },
    {
      title: 'Active Users',
      value: '0',
      change: '0%',
      positive: true,
      icon: faUsers
    },
    {
      title: 'Completed Payments',
      value: '0',
      change: '0%',
      positive: true,
      icon: faCreditCard
    },
    {
      title: 'Pending Approvals',
      value: '0',
      change: '0%',
      positive: false,
      icon: faHourglassHalf
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch registrations data
        const registrationsResponse = await getAllRegistrations();
        
        // We'll count active users as 1 (the current user)
        // This is more accurate than using the getUsers() function which returns demo data
        const activeUsers = currentUser ? 1 : 0;
        
        if (registrationsResponse.success) {
          const registrations = registrationsResponse.data || [];
          
          // Calculate metrics
          const totalRegistrations = registrations.length;
          
          // Count completed payments (assuming there's a payment_status field)
          const completedPayments = registrations.filter(
            reg => reg.payment_status === 'completed' || reg.payment_confirmed === true
          ).length;
          
          // Count pending approvals
          const pendingApprovals = registrations.filter(
            reg => reg.status === 'pending' || reg.payment_status === 'pending'
          ).length;
          
          // Update metrics
          setMetrics([
            {
              title: 'Total Registrations',
              value: totalRegistrations.toString(),
              change: '+0%', // We don't have historical data yet
              positive: true,
              icon: faChartLine
            },
            {
              title: 'Active Users',
              value: activeUsers.toString(),
              change: 'Current session',
              positive: true,
              icon: faUsers
            },
            {
              title: 'Completed Payments',
              value: completedPayments.toString(),
              change: totalRegistrations > 0 ? 
                `${Math.round((completedPayments / totalRegistrations) * 100)}%` : 
                '0%',
              positive: true,
              icon: faCreditCard
            },
            {
              title: 'Pending Approvals',
              value: pendingApprovals.toString(),
              change: pendingApprovals > 0 ? 'Action needed' : 'All clear',
              positive: pendingApprovals === 0,
              icon: faHourglassHalf
            }
          ]);
        } else {
          setError('Failed to fetch registration data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      {metrics.map((metric, index) => (
        <StatCard key={index} {...metric} loading={loading} />
      ))}
    </div>
  );
};

export default MetricsSection;
