"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCheckCircle,
  faFileExport,
  faEye,
  faSpinner,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import { getConfirmedPayments } from '../../../../api/marathon/registration';

const PaymentsView = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfirmedPayments();
  }, []);

  const fetchConfirmedPayments = async () => {
    setLoading(true);
    try {
      const response = await getConfirmedPayments();
      if (response.success) {
        setPayments(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch confirmed payments');
        // Use mock data if API fails
        setPayments(mockPayments);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      // Use mock data if API fails
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Calculate event price based on nationality
  const calculateEventPrice = (payment) => {
    if (!payment || !payment.event) return 'N/A';
    
    const isTanzanian = payment.nationality?.name === 'Tanzania';
    const isKidsEvent = payment.event.name.toLowerCase().includes('kids');
    
    if (isKidsEvent) {
      return `TZS ${payment.event.local_kids_price.toLocaleString()}`;
    } else if (isTanzanian) {
      return `TZS ${payment.event.local_price.toLocaleString()}`;
    } else {
      return `USD ${payment.event.foreign_price.toLocaleString()}`;
    }
  };

  // Mock data for payments (fallback if API fails)
  const mockPayments = [
    {
      id: 0,
      first_name: 'Not found',
      last_name: 'Not found',
      email: 'Not found',
      phone_number: 'Not found',
      event: { name: 'Not found' },
      created_at: new Date().toISOString(),
      payment_status: 'confirmed',
      payment_confirmed_at: new Date().toISOString(),
      payment_confirmation_by: 'System',
      payment_notes: 'Mock data',
      nationality: { name: 'Not found' },
      country: { name: 'Not found' },
      gender: { name: 'Not found' },
      shirt_size: { name: 'Not found' },
      collection_venue: { name: 'Not found' }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-tertiary' : 'text-primary'}`}>
          Confirmed Payments
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search payments..."
              className={`pl-10 pr-4 py-2 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-secondary ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-primary/10 text-primary'}`}
            />
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-md flex items-center justify-center ${isDark ? 'bg-primary/50 text-tertiary hover:bg-primary/20' : 'bg-white text-primary hover:bg-primary/20'} border border-primary/20 dark:border-primary/15`}>
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filter
            </button>
            <button className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-opacity flex items-center">
              <FontAwesomeIcon icon={faFileExport} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-4 rounded-md bg-red/20 text-red border border-red/50">
          <p>{error}</p>
        </div>
      )}

      {/* Payments Table */}
      <div className={`rounded-xl overflow-hidden w-[90vw] mb-[100px] ${isDark ? 'bg-primary/50 border border-primary' : 'bg-tertiary shadow-md'}`}>
        <div className="relative overflow-x-auto w-full scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <FontAwesomeIcon icon={faSpinner} className={`text-3xl ${isDark ? 'text-tertiary' : 'text-primary'} animate-spin`} />
            </div>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead className={`sticky top-0 z-10 ${isDark ? 'bg-primary' : 'bg-gray-50'}`}>
                <tr className={`${isDark ? 'bg-primary text-tertiary' : 'bg-gray-50 text-primary'}`}>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Confirmed By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 dark:divide-primary/20">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-6 py-8 text-center ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                      No confirmed payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      className={`${isDark ? 'hover:bg-primary' : 'hover:bg-primary/20'} transition-colors`}
                    >
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {payment.first_name} {payment.last_name}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {payment.email}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {payment.event?.name}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {calculateEventPrice(payment)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {formatDate(payment.payment_confirmed_at)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {payment.payment_confirmation_by || 'Admin'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewDetails(payment)}
                            className={`p-1 rounded-full ${isDark ? 'text-secondary hover:bg-primary/20' : 'text-secondary hover:bg-primary/10'}`}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button 
                            className={`p-1 rounded-full ${isDark ? 'text-success hover:bg-primary/20' : 'text-success hover:bg-primary/10'}`}
                            title="Generate Receipt"
                          >
                            <FontAwesomeIcon icon={faReceipt} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && payments.length > 0 && (
          <div className={`px-6 py-4 flex justify-between items-center ${isDark ? 'bg-primary' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-tertiary' : 'text-primary'}`}>
              Showing <span className="font-medium">1</span> to <span className="font-medium">{payments.length}</span> of <span className="font-medium">{payments.length}</span> results
            </div>
            <div className="flex space-x-1">
              <button className={`px-3 py-1 rounded-md ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-white text-primary'} border border-primary/20 dark:border-gray-700`}>
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-secondary text-primary">
                1
              </button>
              <button className={`px-3 py-1 rounded-md ${isDark ? 'bg-primary/50 text-tertiary' : 'bg-white text-primary'} border border-primary/20 dark:border-gray-700`}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDark ? 'bg-primary' : 'bg-tertiary'} shadow-xl`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
              Payment Details
            </h3>
            <div className="mb-6">
              <div className={`p-4 rounded-md ${isDark ? 'bg-primary/50' : 'bg-primary/10'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-medium ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                      Payment Information
                    </h3>
                    <span className="px-2 py-1 rounded-full text-sm bg-success/10 text-success">
                      Confirmed
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Registration ID:</span> {selectedPayment.id}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Member Name:</span> {selectedPayment.first_name} {selectedPayment.last_name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Event:</span> {selectedPayment.event?.name}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Amount:</span> {calculateEventPrice(selectedPayment)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Registration Date:</span> {formatDate(selectedPayment.created_at)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Payment Date:</span> {formatDate(selectedPayment.payment_confirmed_at)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                      <span className="font-medium">Confirmed By:</span> {selectedPayment.payment_confirmation_by || 'Admin'}
                    </p>
                    {selectedPayment.payment_notes && (
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-tertiary' : 'text-primary'}`}>Payment Notes:</p>
                        <p className={`text-sm mt-1 p-2 rounded ${isDark ? 'bg-primary/30 text-tertiary/80' : 'bg-primary/5 text-primary/80'}`}>
                          {selectedPayment.payment_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className={`px-4 py-2 rounded-md ${isDark ? 'bg-primary/50 text-tertiary hover:bg-primary/40' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-opacity flex items-center"
              >
                <FontAwesomeIcon icon={faReceipt} className="mr-2" />
                Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsView;
