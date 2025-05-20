import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import TrainerBookings from '../components/TrainerBookings';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [freezeDays, setFreezeDays] = useState(7);
  const [extensionMonths, setExtensionMonths] = useState(1);
  const [processingAction, setProcessingAction] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  
  // Payment state
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  
  const [freezeStatus, setFreezeStatus] = useState({
    status: 'Active',
    freezeStartDate: null,
    currentFreezeDuration: 0,
    remainingFreezeDays: 90,
    freezeHistory: []
  });
  
  const [trainerBookings, setTrainerBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
    fetchFreezeStatus();
    fetchTrainerBookings();
  }, [currentUser, navigate]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('dashboard');
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard information');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFreezeStatus = async () => {
    try {
      const data = await apiService.get('dashboard/freeze-status');
      setFreezeStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to load freeze status');
    }
  };
  
  const fetchTrainerBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await apiService.get('trainers/bookings/user');
      setTrainerBookings(data);
      setBookingsError(null);
    } catch (err) {
      setBookingsError(err.message || 'Failed to load trainer bookings');
    } finally {
      setLoadingBookings(false);
    }
  };
  
  const handleCancelMembership = async () => {
    try {
      setProcessingAction(true);
      const result = await apiService.post('dashboard/cancel');
      setActionResult({
        success: true,
        message: 'Membership cancelled successfully',
        details: `Refund amount: $${result.refundAmount.toFixed(2)}`
      });
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      setActionResult({
        success: false,
        message: 'Failed to cancel membership',
        details: err.message
      });
    } finally {
      setProcessingAction(false);
      setShowCancelModal(false);
    }
  };
  
  const handleFreezeToggle = async () => {
    try {
      setProcessingAction(true);
      
      if (freezeStatus.status === 'Active') {
        const result = await apiService.post('dashboard/freeze');
        setActionResult({
          success: true,
          message: 'Membership frozen successfully',
          details: 'Your membership is now frozen. You can unfreeze it at any time.'
        });
      } else {
        const result = await apiService.post('dashboard/unfreeze');
        setActionResult({
          success: true,
          message: 'Membership unfrozen successfully',
          details: `Your membership was frozen for ${result.freezeDuration} days. Your end date has been extended accordingly.`
        });
      }
      
      // Refresh both dashboard and freeze status data
      await Promise.all([fetchDashboardData(), fetchFreezeStatus()]);
    } catch (err) {
      setActionResult({
        success: false,
        message: 'Failed to toggle membership freeze status',
        details: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleExtendMembership = async () => {
    try {
      setProcessingAction(true);
      const result = await apiService.post('dashboard/extend', { extensionMonths });
      setClientSecret(result.clientSecret);
      setShowExtendModal(false);
      // Don't reset processing yet - we need to complete payment
    } catch (err) {
      setActionResult({
        success: false,
        message: 'Failed to initiate membership extension',
        details: err.message
      });
      setProcessingAction(false);
      setShowExtendModal(false);
    }
  };
  
  const handleExtensionPayment = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    try {
      setPaymentProcessing(true);
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });
      
      if (result.error) {
        setPaymentError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        // Confirm payment with our backend
        await apiService.post('payments/confirm', {
          paymentIntentId: result.paymentIntent.id
        });
        
        setActionResult({
          success: true,
          message: 'Membership extended successfully',
          details: `Membership extended by ${extensionMonths} month(s)`
        });
        
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setPaymentProcessing(false);
      setProcessingAction(false);
    }
  };
  
  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessingAction(true);
      await apiService.put(`trainers/bookings/${bookingId}/cancel`);
      
      setActionResult({
        success: true,
        message: 'Booking cancelled successfully',
        details: 'Your refund will be processed within 5-7 business days.'
      });

      // Refresh bookings
      fetchTrainerBookings();
    } catch (err) {
      setActionResult({
        success: false,
        message: 'Failed to cancel booking',
        details: err.message
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const dismissNotification = () => {
    setActionResult(null);
    setPaymentSuccess(false);
    setPaymentError(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no membership found
  if (!dashboardData || !dashboardData.membershipDetails) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Active Membership</h2>
            <p className="mb-4">You don't have an active membership at the moment.</p>
            <button 
              onClick={() => navigate('/membership')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              View Membership Options
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const { 
    package: membershipPackage,
    customServices,
    startDate,
    endDate,
    activeDays,
    daysRemaining,
    paymentInterval,
    totalPrice
  } = dashboardData.membershipDetails;
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Notification Section */}
        {actionResult && (
          <div className={`p-4 rounded-lg ${actionResult.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
            <div className="flex justify-between">
              <h3 className={`font-bold ${actionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {actionResult.message}
              </h3>
              <button onClick={dismissNotification} className="text-gray-600 hover:text-gray-800">×</button>
            </div>
            <p className="mt-1">{actionResult.details}</p>
          </div>
        )}

        {/* Membership Details Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h1 className="text-3xl font-bold">Your Membership Dashboard</h1>
            <p className="text-blue-100">
              Hello, {currentUser.name}! Here's your membership overview.
            </p>
          </div>
          
          {/* Membership Stats */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Membership Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Membership Type</h3>
                <p className="text-2xl font-bold text-blue-600">{membershipPackage.name}</p>
                <p className="text-sm text-gray-500 mt-1">{membershipPackage.description}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                <p className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{paymentInterval} payment plan</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold mb-2">Start Date</h3>
                <p className="text-xl font-bold">{format(new Date(startDate), 'MMM dd, yyyy')}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold mb-2">Days Active</h3>
                <p className="text-xl font-bold">{activeDays} days</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold mb-2">Days Remaining</h3>
                <p className="text-xl font-bold">{daysRemaining} days</p>
                <p className="text-sm text-gray-500 mt-1">Ends: {format(new Date(endDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            {/* Custom Services */}
            {customServices && customServices.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Custom Services</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {customServices.map(service => (
                      <li key={service._id} className="py-2">
                        <div className="flex justify-between">
                          <span>{service.name}</span>
                          <span className="font-semibold">${service.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button 
                onClick={() => setShowExtendModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={freezeStatus.status === 'Frozen'}
              >
                Extend Membership
              </button>
              
              <button 
                onClick={handleFreezeToggle}
                className={`px-4 py-2 ${
                  freezeStatus.status === 'Active' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                } text-white rounded flex items-center gap-2`}
                disabled={processingAction}
              >
                <span>
                  {freezeStatus.status === 'Active' ? 'Freeze Membership' : 'Unfreeze Membership'}
                </span>
                {processingAction && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
              </button>
              
              <button 
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Membership
              </button>
            </div>
          </div>
        </div>

        {/* Trainer Bookings Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <h2 className="text-2xl font-bold">Your Trainer Sessions</h2>
            <p className="text-blue-100">
              Manage your personal training sessions and bookings.
            </p>
          </div>

          <div className="p-6">
            {loadingBookings ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : bookingsError ? (
              <div className="text-center text-red-500">
                <p>{bookingsError}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Upcoming Sessions</h3>
                  <Link
                    to="/trainers"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Book New Session
                  </Link>
                </div>
                <TrainerBookings 
                  bookings={trainerBookings} 
                  onCancel={handleCancelBooking}
                />
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Cancel Membership</h2>
            <p className="mb-4">
              Are you sure you want to cancel your membership? This action cannot be undone.
            </p>
            <p className="mb-4 text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
              <strong>Note:</strong> If you cancel within 7 days of starting, you'll receive a full refund. 
              Otherwise, you'll receive a pro-rated refund based on remaining days.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                disabled={processingAction}
              >
                No, Keep Membership
              </button>
              <button 
                onClick={handleCancelMembership}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={processingAction}
              >
                {processingAction ? 'Processing...' : 'Yes, Cancel Membership'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Freeze Status Section */}
      {freezeStatus.status === 'Frozen' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">
            Membership Status: Frozen
          </h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Freeze Start Date:</span>{' '}
              {format(new Date(freezeStatus.freezeStartDate), 'MMM dd, yyyy')}
            </p>
            <p>
              <span className="font-medium">Current Freeze Duration:</span>{' '}
              {freezeStatus.currentFreezeDuration} days
            </p>
            <p>
              <span className="font-medium">Remaining Freeze Days:</span>{' '}
              {freezeStatus.remainingFreezeDays} days
            </p>
            {freezeStatus.remainingFreezeDays <= 14 && (
              <p className="text-red-600">
                Warning: You are approaching the maximum freeze duration of 90 days.
                Please unfreeze your membership to avoid any issues.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Extend Membership</h2>
            <p className="mb-4">
              Extend your membership by selecting the number of months below:
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extension Duration
              </label>
              <select 
                value={extensionMonths} 
                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button 
                onClick={handleExtendMembership}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={processingAction}
              >
                {processingAction ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            <form onSubmit={handleExtensionPayment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Details
                </label>
                <div className="p-3 border border-gray-300 rounded">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }} />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setClientSecret('')}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  disabled={paymentProcessing || !stripe}
                >
                  {paymentProcessing ? 'Processing...' : 'Pay & Extend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;