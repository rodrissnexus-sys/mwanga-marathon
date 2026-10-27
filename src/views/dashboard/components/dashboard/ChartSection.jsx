"use client";

import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import { useTheme } from '../../contexts/ThemeContext';
import { getAllRegistrations } from '../../../../api/marathon/registration';

const ChartSection = () => {
  const { theme } = useTheme();
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Fetch registrations data
        const registrationsResponse = await getAllRegistrations();
        
        if (registrationsResponse.success) {
          const registrations = registrationsResponse.data || [];
          
          // Process data based on selected period
          processChartData(registrations, period);
        } else {
          setError('Failed to fetch registration data');
          // Set empty chart data
          setChartData({
            labels: [],
            registrations: [],
            payments: []
          });
        }
      } catch (err) {
        console.error('Chart data fetch error:', err);
        setError('Error loading chart data');
        // Set empty chart data
        setChartData({
          labels: [],
          registrations: [],
          payments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  // Process registration data based on selected period
  const processChartData = (registrations, selectedPeriod) => {
    const currentDate = new Date();
    let labels = [];
    let registrationCounts = [];
    let paymentCounts = [];
    
    if (selectedPeriod === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayRegistrations = registrations.filter(reg => {
          const regDate = new Date(reg.created_at);
          return regDate.toDateString() === date.toDateString();
        });
        
        registrationCounts.push(dayRegistrations.length);
        paymentCounts.push(dayRegistrations.filter(reg => 
          reg.payment_status === 'completed' || reg.payment_confirmed === true
        ).length);
      }
    } else if (selectedPeriod === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        
        const monthRegistrations = registrations.filter(reg => {
          const regDate = new Date(reg.created_at);
          return regDate.getMonth() === date.getMonth() && 
                 regDate.getFullYear() === date.getFullYear();
        });
        
        registrationCounts.push(monthRegistrations.length);
        paymentCounts.push(monthRegistrations.filter(reg => 
          reg.payment_status === 'completed' || reg.payment_confirmed === true
        ).length);
      }
    } else if (selectedPeriod === 'yearly') {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const year = currentDate.getFullYear() - i;
        labels.push(year.toString());
        
        const yearRegistrations = registrations.filter(reg => {
          const regDate = new Date(reg.created_at);
          return regDate.getFullYear() === year;
        });
        
        registrationCounts.push(yearRegistrations.length);
        paymentCounts.push(yearRegistrations.filter(reg => 
          reg.payment_status === 'completed' || reg.payment_confirmed === true
        ).length);
      }
    }
    
    setChartData({
      labels,
      registrations: registrationCounts,
      payments: paymentCounts
    });
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <div className={`rounded-xl p-5 ${theme === 'dark' ? 'bg-[#372a6a]' : 'bg-white shadow-md'}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-[#bffc00]' : 'text-[#221751]'}`}>Registration Analytics</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handlePeriodChange('weekly')}
            className={`px-3 py-1 text-sm rounded-md ${period === 'weekly' ? 'bg-[#bffc00] text-[#221751]' : theme === 'dark' ? 'bg-[#221751] hover:bg-[#2c1e68] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[#221751]'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => handlePeriodChange('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${period === 'monthly' ? 'bg-[#bffc00] text-[#221751]' : theme === 'dark' ? 'bg-[#221751] hover:bg-[#2c1e68] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[#221751]'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => handlePeriodChange('yearly')}
            className={`px-3 py-1 text-sm rounded-md ${period === 'yearly' ? 'bg-[#bffc00] text-[#221751]' : theme === 'dark' ? 'bg-[#221751] hover:bg-[#2c1e68] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[#221751]'}`}
          >
            Yearly
          </button>
        </div>
      </div>
      
      <div className="h-[500px]">
        <Chart data={chartData} period={period} loading={loading} />
      </div>
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChartSection;
