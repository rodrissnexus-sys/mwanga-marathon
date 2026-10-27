"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCheckCircle,
  faTimesCircle,
  faEllipsisV,
  faCreditCard,
  faFileExport,
  faEye,
  faTrash,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getAllRegistrations, confirmPayment } from '../../../../api/marathon/registration';

const RegistrationView = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getAllRegistrations();
      if (response.success) {
        setRegistrations(response.data || []);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch registrations');
        // Use mock data if API fails
        setRegistrations(mockRegistrations);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
      // Use mock data if API fails
      setRegistrations(mockRegistrations);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  const handleConfirmPayment = (registration) => {
    setSelectedRegistration(registration);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedRegistration) return;
    
    setProcessingPayment(true);
    try {
      const response = await confirmPayment(selectedRegistration.id, paymentNotes);
      if (response.success) {
        // Update the registration in the local state
        const updatedRegistrations = registrations.map(reg => 
          reg.id === selectedRegistration.id 
            ? { ...reg, payment_status: 'confirmed', payment_confirmed_at: new Date().toISOString() } 
            : reg
        );
        setRegistrations(updatedRegistrations);
        setShowPaymentModal(false);
        setSelectedRegistration(null);
        setPaymentNotes('');
      } else {
        setError(response.error || 'Failed to confirm payment');
      }
    } catch (err) {
      setError('An unexpected error occurred while processing payment');
      console.error(err);
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-500 bg-primary/10 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-success" />;
      case 'pending':
        return <FontAwesomeIcon icon={faEllipsisV} className="mr-2 text-secondary" />;
      case 'failed':
        return <FontAwesomeIcon icon={faTimesCircle} className="mr-2 text-red" />;
      default:
        return null;
    }
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
  const calculateEventPrice = (registration) => {
    if (!registration || !registration.event) return 'N/A';
    
    const isTanzanian = registration.nationality?.name === 'Tanzania';
    const isKidsEvent = registration.event.name.toLowerCase().includes('kids');
    
    if (isKidsEvent) {
      return `TZS ${registration.event.local_kids_price.toLocaleString()}`;
    } else if (isTanzanian) {
      return `TZS ${registration.event.local_price.toLocaleString()}`;
    } else {
      return `USD ${registration.event.foreign_price.toLocaleString()}`;
    }
  };

  // Mock data for registrations (fallback if API fails)
  const mockRegistrations = [
    {
      id: 0,
      first_name: 'Not found',
      last_name: 'Not found',
      email: 'Not found',
      phone_number: 'Not found',
      event: { name: 'Not found' },
      created_at: new Date().toISOString(),
      status: 'Not found',
      nationality: { name: 'Not found' },
      country: { name: 'Not found' },
      gender: { name: 'Not found' },
      shirtSize: { name: 'Not found' },
      collectionVenue: { name: 'Not found' }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-tertiary' : 'text-primary'}`}>
          Registration Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search registrations..."
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

      {/* Registration Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Shirt Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap">Payment Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/20 dark:divide-primary/20">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-6 py-8 text-center ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  registrations.map((registration) => (
                    <tr 
                      key={registration.id} 
                      className={`${isDark ? 'hover:bg-primary' : 'hover:bg-primary/20'} transition-colors`}
                    >
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {registration.first_name} {registration.last_name}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {registration.email}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {registration.event?.name}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {formatDate(registration.created_at)}
                      </td>
                      <td className={`px-6 py-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                        {registration.shirt_size?.code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getStatusIcon(registration.payment_status)}
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            registration.payment_status === 'confirmed' ? 'text-success bg-success/10' : 
                            registration.payment_status === 'failed' ? 'text-red bg-red/10' : 'text-secondary bg-secondary/10'
                          }`}>
                            {registration.payment_status?.charAt(0).toUpperCase() + registration.payment_status?.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewDetails(registration)}
                            className={`p-1 rounded-full ${isDark ? 'text-secondary hover:bg-primary/20' : 'text-secondary hover:bg-primary/10'}`}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          {registration.payment_status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmPayment(registration)}
                              className={`p-1 rounded-full ${isDark ? 'text-secondary hover:bg-primary/20' : 'text-secondary hover:bg-primary/10'}`}
                              title="Confirm Payment"
                            >
                              <FontAwesomeIcon icon={faCreditCard} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && registrations.length > 0 && (
          <div className={`px-6 py-4 flex justify-between items-center ${isDark ? 'bg-primary' : 'bg-gray-50'}`}>
            <div className={`text-sm ${isDark ? 'text-tertiary' : 'text-primary'}`}>
              Showing <span className="font-medium">1</span> to <span className="font-medium">{registrations.length}</span> of <span className="font-medium">{registrations.length}</span> results
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

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${isDark ? 'bg-primary' : 'bg-tertiary'} shadow-xl`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
              Confirm Payment
            </h3>
            <div className="mb-6">
              <div className={`p-4 rounded-md ${isDark ? 'bg-primary/50' : 'bg-primary/10'}`}>
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                  Payment Details
                </h3>
                <div className="space-y-2">
                  <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    <span className="font-medium">Registration ID:</span> {selectedRegistration.id}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    <span className="font-medium">Member Name:</span> {selectedRegistration.first_name} {selectedRegistration.last_name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    <span className="font-medium">Event:</span> {selectedRegistration.event?.name}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    <span className="font-medium">Amount:</span> {calculateEventPrice(selectedRegistration)}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                    <span className="font-medium">Registration Date:</span> {formatDate(selectedRegistration.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label className={`text-sm font-medium ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                Payment Notes (Optional):
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Enter any additional notes about the payment..."
                className={`w-full p-4 rounded-md mt-2 ${
                  isDark ? 'bg-primary/50 text-tertiary placeholder-tertiary/50' : 
                  'bg-primary/10 text-primary placeholder-primary/50'
                }`}
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentNotes('');
                }}
                className={`px-4 py-2 rounded-md ${
                  isDark ? 'bg-primary/50 text-tertiary hover:bg-primary/40' : 
                  'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button 
                onClick={processPayment}
                className={`px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-opacity flex items-center ${
                  processingPayment ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Details Modal */}
      {selectedRegistration && !showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className={`w-full max-w-2xl p-6 rounded-lg ${isDark ? 'bg-primary' : 'bg-tertiary'} shadow-xl m-4`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                Registration Details
              </h3>
              <button 
                onClick={() => setSelectedRegistration(null)}
                className={`p-1 rounded-full ${isDark ? 'text-tertiary hover:bg-primary/20' : 'text-primary hover:bg-primary/10'}`}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Full Name</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.first_name} {selectedRegistration.last_name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Email</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.email}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Phone</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.phone_number}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Date of Birth</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{formatDate(selectedRegistration.date_of_birth)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Gender</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.gender?.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Nationality</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.nationality?.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Country</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.country?.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Postal Code</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.postal_code || 'N/A'}</p>
                </div>
                {selectedRegistration.id_number && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>ID Number</p>
                    <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.id_number}</p>
                  </div>
                )}
                {selectedRegistration.passport_number && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Passport Number</p>
                    <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.passport_number}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                Event Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Event</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.event?.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Registration Date</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{formatDate(selectedRegistration.created_at)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Shirt Size</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.shirt_size?.name}</p>
                </div>
                {selectedRegistration.kids_shirt_size && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Kids Shirt Size</p>
                    <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.kids_shirt_size?.name}</p>
                  </div>
                )}
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Collection Venue</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.collection_venue?.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Amount</p>
                  <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{calculateEventPrice(selectedRegistration)}</p>
                </div>
                {selectedRegistration.voucher_code && (
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Voucher Code</p>
                    <p className={`${isDark ? 'text-tertiary' : 'text-primary'}`}>{selectedRegistration.voucher_code}</p>
                  </div>
                )}
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full bg-tertiary/10 inline-flex items-center ${getStatusColor(selectedRegistration.status)}`}>
                    {getStatusIcon(selectedRegistration.status)}
                    {selectedRegistration.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-tertiary' : 'text-primary'}`}>
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>Payment Status</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(selectedRegistration.payment_status)}
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      selectedRegistration.payment_status === 'confirmed' ? 'text-success bg-success/10' : 
                      selectedRegistration.payment_status === 'failed' ? 'text-red bg-red/10' : 'text-secondary bg-secondary/10'
                    }`}>
                      {selectedRegistration.payment_status?.charAt(0).toUpperCase() + selectedRegistration.payment_status?.slice(1)}
                    </span>
                  </div>
                  {selectedRegistration.payment_status === 'confirmed' && (
                    <div className="mt-2">
                      <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                        <span className="font-medium">Confirmed by:</span> {selectedRegistration.payment_confirmation_by}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                        <span className="font-medium">Confirmed at:</span> {formatDate(selectedRegistration.payment_confirmed_at)}
                      </p>
                      {selectedRegistration.payment_notes && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-tertiary/70' : 'text-primary/70'}`}>
                          <span className="font-medium">Notes:</span> {selectedRegistration.payment_notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedRegistration(null)}
                className={`px-4 py-2 rounded-md ${isDark ? 'bg-primary/50 text-tertiary hover:bg-primary/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
              >
                Close
              </button>
              {selectedRegistration.payment_status === 'pending' && (
                <button 
                  onClick={() => handleConfirmPayment(selectedRegistration)}
                  className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-opacity flex items-center ml-3"
                >
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Confirm Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationView;
