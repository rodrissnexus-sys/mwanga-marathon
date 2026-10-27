"use client";

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS } from 'chart.js/auto';  
import { Bar, Line, Doughnut } from 'react-chartjs-2';

const Chart = ({ data, period, loading }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // If loading, show spinner
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className={`text-3xl ${isDark ? 'text-secondary' : 'text-primary'}`} />
        <span className={`ml-3 ${isDark ? 'text-tertiary' : 'text-primary'}`}>Loading chart data...</span>
      </div>
    );
  }
  
  // Default empty data structure with sample data to ensure visualization
  const chartData = data || { 
    labels: period === 'weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : 
            period === 'monthly' ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] : 
            ['2023', '2024', '2025'],
    registrations: period === 'weekly' ? [2, 5, 3, 7, 4, 6, 8] : 
                   period === 'monthly' ? [12, 19, 15, 22, 30, 25] : 
                   [45, 78, 60],
    payments: period === 'weekly' ? [1, 3, 2, 5, 3, 4, 6] : 
              period === 'monthly' ? [8, 15, 10, 18, 25, 20] : 
              [30, 60, 45]
  };
  
  // Check if we have real data or using sample data
  const isRealData = data !== null && data.registrations.some(val => val > 0);
  
  // Calculate totals for doughnut chart
  const totalRegistrations = chartData.registrations.reduce((sum, val) => sum + val, 0);
  const totalPayments = chartData.payments.reduce((sum, val) => sum + val, 0);
  const pendingPayments = totalRegistrations - totalPayments;
  
  // Mixed chart configuration
  const mixedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#ffffff' : '#221751',
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#ffffff' : '#221751',
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#ffffff' : '#221751',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#221751' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#bffc00' : '#221751',
        bodyColor: isDark ? '#ffffff' : '#221751',
        borderColor: isDark ? '#bffc00' : '#221751',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
      },
      title: {
        display: true,
        text: 'Registrations & Payments Over Time',
        color: isDark ? '#ffffff' : '#221751',
        font: {
          size: 16
        },
        padding: {
          bottom: 20
        }
      }
    }
  };
  
  // Mixed chart data configuration
  const mixedChartData = {
    labels: chartData.labels,
    datasets: [
      {
        type: 'bar',
        label: 'Registrations',
        data: chartData.registrations,
        backgroundColor: '#bffc00',
        borderColor: '#9cc800',
        borderWidth: 1,
        borderRadius: 4,
        order: 2
      },
      {
        type: 'line',
        label: 'Payments',
        data: chartData.payments,
        borderColor: '#372a6a',
        backgroundColor: '#372a6a',
        borderWidth: 2,
        pointBackgroundColor: '#221751',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        order: 1
      }
    ]
  };
  
  // Doughnut chart configuration
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#ffffff' : '#221751',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#221751' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#bffc00' : '#221751',
        bodyColor: isDark ? '#ffffff' : '#221751',
        borderColor: isDark ? '#bffc00' : '#221751',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
      },
      title: {
        display: true,
        text: 'Payment Completion Ratio',
        color: isDark ? '#ffffff' : '#221751',
        font: {
          size: 16
        },
        padding: {
          bottom: 20
        }
      }
    }
  };
  
  // Doughnut chart data
  const doughnutChartData = {
    labels: ['Completed Payments', 'Pending Payments'],
    datasets: [
      {
        data: [totalPayments, pendingPayments],
        backgroundColor: ['#372a6a', '#bffc00'],
        borderColor: ['#221751', '#9cc800'],
        borderWidth: 1,
        hoverOffset: 10
      }
    ]
  };
  
  return (
    <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-full">
        <Bar 
          options={mixedChartOptions} 
          data={mixedChartData} 
          type="bar"
        />
      </div>
      
      <div className="h-full flex flex-col justify-center">
        <Doughnut 
          options={doughnutChartOptions} 
          data={doughnutChartData} 
        />
      </div>
      
      {!isRealData && (
        <div className="col-span-1 md:col-span-2 mt-4 text-center text-sm italic text-gray-500">
          {data === null ? 
            "No registration data available. Showing sample data." : 
            "No registrations found for the selected period. Showing sample data."}
        </div>
      )}
    </div>
  );
};

export default Chart;
