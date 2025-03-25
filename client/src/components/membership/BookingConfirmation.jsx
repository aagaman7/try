import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { membershipService, bookingService } from '../services/apiService';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        
        // Get booking reference from URL query params or from route params
        const bookingReference = new URLSearchParams(location.search).get('reference') || bookingId;
        
        if (!bookingReference) {
          setError('Booking reference not found');
          setLoading(false);
          return;
        }
        
        const bookingData = await bookingService.getBookingByReference(bookingReference);
        setBooking(bookingData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking information. Please contact customer support.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, location.search]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading booking details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/membership')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Memberships
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Booking Not Found</h2>
          <p className="mt-2 text-gray-600">We couldn't find the booking details you're looking for.</p>
          <button
            onClick={() => navigate('/membership')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Memberships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-green-800">Booking Confirmation</h3>
              <p className="mt-1 max-w-2xl text-sm text-green-600">Your membership has been successfully booked!</p>
            </div>
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-800 text-sm font-medium">
                {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Booking Reference</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.bookingReference}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Package Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{booking.packageType}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Payment Option</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{booking.paymentOption}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">${booking.amount.toFixed(2)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(booking.startDate)}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(booking.endDate)}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.isActive ? 'Active' : 'Inactive'}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;