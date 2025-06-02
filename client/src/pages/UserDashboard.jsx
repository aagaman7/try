import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import EditMembershipModal from '../components/EditMembershipModal';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import icons
import { FaDumbbell, FaMoneyBillWave, FaUserClock, FaQrcode, FaRegSnowflake, FaCrown } from 'react-icons/fa';
import { BiDumbbell } from 'react-icons/bi';
import { MdPayment, MdCancel } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';

// Add new styled components at the top level
const DashboardCard = ({ icon: Icon, title, value, subtitle, className }) => (
  <div className={`bg-black/80 backdrop-blur-lg p-6 rounded-2xl border border-rose-500/10 shadow-xl hover:shadow-rose-500/10 transition-all duration-300 ${className}`}>
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-gray-400 font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, variant = 'primary', disabled = false }) => {
  const baseClasses = "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50";
  const variants = {
    primary: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-rose-500/30",
    secondary: "bg-gray-800 hover:bg-gray-700 text-white shadow-lg hover:shadow-gray-800/30",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/30",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-yellow-500/30"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
};

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
  
  // Payment state for extension
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [extensionPaymentIntentId, setExtensionPaymentIntentId] = useState('');
  const [extensionCost, setExtensionCost] = useState(0);
  const [calculatedNewEndDate, setCalculatedNewEndDate] = useState(null);
  
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
  
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  
  const [showFreezeWarningModal, setShowFreezeWarningModal] = useState(false);
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [remainingUnfreezeDays, setRemainingUnfreezeDays] = useState(0);
  const [canUnfreeze, setCanUnfreeze] = useState(false);
  
  const [discounts, setDiscounts] = useState([]); // State for discounts
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
    fetchFreezeStatus();
    fetchTrainerBookings();
    fetchDiscounts(); // Fetch discounts
  }, [currentUser, navigate]);
  
  useEffect(() => {
    if (dashboardData?.membershipDetails) {
      const isActive = dashboardData.membershipDetails.status === 'Active';
      const qrMemberData = {
        name: currentUser.name,
        package: dashboardData.membershipDetails.package.name,
        daysRemaining: dashboardData.membershipDetails.daysRemaining,
        access: isActive ? "granted" : "denied"
      };
      setQrData(JSON.stringify(qrMemberData));
    }
  }, [dashboardData, currentUser]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserDashboard();
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
      // Fetch dashboard info to get the latest membership status
      const dashboard = await apiService.getUserDashboard();
      setFreezeStatus(prev => ({
        ...prev,
        status: dashboard?.membershipDetails?.status || 'Active'
      }));
    } catch (err) {
      setError(err.message || 'Failed to load freeze status');
    }
  };
  
  const fetchTrainerBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await apiService.getTrainerBookingsByUser();
      setTrainerBookings(data);
      setBookingsError(null);
    } catch (err) {
      setBookingsError(err.message || 'Failed to load trainer bookings');
    } finally {
      setLoadingBookings(false);
    }
  };
  
  const fetchDiscounts = async () => {
    try {
      const data = await apiService.getAllDiscounts({ active: true });
      setDiscounts(data);
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
      // Optionally show an error toast or handle the error appropriately
    }
  };
  
  const handleCancelMembership = async () => {
    try {
      setProcessingAction(true);
      console.log('Starting membership cancellation...');
      
      // Check if there's an active membership
      if (!dashboardData?.membershipDetails) {
        throw new Error('No active membership found to cancel');
      }

      const result = await apiService.cancelMembership();
      console.log('Cancellation result:', result);

      if (!result) {
        throw new Error('No response received from cancellation request');
      }

      // Show success toast
      toast.success(
        <div>
          <p className="font-semibold">Membership Cancelled Successfully</p>
          <p className="text-sm mt-1">
            {result.refundAmount ? 
              `Refund amount: Nrs ${result.refundAmount.toFixed(2)}` : 
              'Processing your refund...'}
          </p>
        </div>,
        {
          icon: '✅',
          style: {
            background: '#F0FDF4',
            color: '#166534',
            borderLeft: '4px solid #22C55E'
          },
          autoClose: 5000
        }
      );

      setActionResult({
        success: true,
        message: 'Membership cancelled successfully',
        details: result.refundAmount ? 
          `Refund amount: Nrs ${result.refundAmount.toFixed(2)}` : 
          'Your refund is being processed'
      });

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      console.error('Cancel membership error in component:', err);
      
      const errorMessage = err.message || 'Failed to cancel membership';
      
      // Show error toast
      toast.error(
        <div>
          <p className="font-semibold">Cancellation Failed</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>,
        {
          icon: '❌',
          style: {
            background: '#FEF2F2',
            color: '#991B1B',
            borderLeft: '4px solid #DC2626'
          },
          autoClose: 5000
        }
      );

      setActionResult({
        success: false,
        message: 'Failed to cancel membership',
        details: errorMessage
      });
    } finally {
      setProcessingAction(false);
      setShowCancelModal(false);
    }
  };
  
  const handleFreezeInitiate = () => {
    setShowFreezeWarningModal(true);
  };

  const handleUnfreezeInitiate = () => {
    // Calculate the earliest unfreeze date
    const freezeStart = freezeStatus.freezeStartDate ? new Date(freezeStatus.freezeStartDate) : null;
    const minUnfreezeDate = freezeStart ? new Date(freezeStart.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
    const now = new Date();

    if (minUnfreezeDate && now < minUnfreezeDate) {
      // Calculate remaining days
      const remainingMs = minUnfreezeDate - now;
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      setRemainingUnfreezeDays(remainingDays);
      setCanUnfreeze(false);
    } else if (freezeStatus.currentFreezeDuration >= 90) {
      setRemainingUnfreezeDays(0);
      setCanUnfreeze(false);
    } else {
      setCanUnfreeze(true);
      setRemainingUnfreezeDays(0);
    }
    setShowUnfreezeModal(true);
  };

  const handleFreezeConfirm = async () => {
    try {
      setProcessingAction(true);
      const result = await apiService.freezeMembership();
      toast.success('Membership frozen successfully', {
        icon: '❄️',
        style: {
          background: '#F0F9FF',
          color: '#1E40AF',
          borderLeft: '4px solid #3B82F6'
        }
      });
      setActionResult({
        success: true,
        message: 'Membership frozen successfully',
        details: result.message || 'Your membership is now frozen. You can unfreeze it after at least 7 days.'
      });
      // Refresh data
      await Promise.all([fetchDashboardData(), fetchFreezeStatus()]);
    } catch (err) {
      toast.error(err.message || 'Failed to freeze membership', {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
          setActionResult({
            success: false,
        message: 'Failed to freeze membership',
        details: err.message
          });
    } finally {
          setProcessingAction(false);
      setShowFreezeWarningModal(false);
    }
  };

  const handleUnfreezeConfirm = async () => {
    try {
      setProcessingAction(true);
          const result = await apiService.unfreezeMembership();
      toast.success('Membership unfrozen successfully', {
        icon: '🌞',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          borderLeft: '4px solid #22C55E'
        }
      });
          setActionResult({
            success: true,
            message: 'Membership unfrozen successfully',
            details: result.message || `Your membership was frozen for ${result.freezeDuration} days. Your end date has been extended accordingly.`
          });
      // Refresh data
      await Promise.all([fetchDashboardData(), fetchFreezeStatus()]);
        } catch (err) {
      toast.error(err.message || 'Failed to unfreeze membership', {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
          setActionResult({
            success: false,
            message: 'Failed to unfreeze membership',
        details: err.message
      });
    } finally {
      setProcessingAction(false);
      setShowUnfreezeModal(false);
    }
  };
  
  const handleExtendMembership = async () => {
    try {
      setProcessingAction(true);
      setPaymentError(null); // Clear previous payment errors
      
      // Calculate the potential price on the frontend for display purposes BEFORE calling backend
      const baseMonthlyPrice = dashboardData?.membershipDetails?.package?.basePrice || 0;
      const rawExtensionPrice = baseMonthlyPrice * extensionMonths;

      // Find applicable discount
      let paymentIntervalForDiscount; // Match intervals used in backend/discounts
      if (extensionMonths === 1) { paymentIntervalForDiscount = 'Monthly'; }
      else if (extensionMonths === 3) { paymentIntervalForDiscount = '3 Months'; }
      else if (extensionMonths === 12) { paymentIntervalForDiscount = 'Yearly'; }
      else { /* Handle unsupported */ paymentIntervalForDiscount = null; }

      const applicableDiscount = paymentIntervalForDiscount 
        ? discounts.find(d => d.paymentInterval === paymentIntervalForDiscount)
        : null;

      let calculatedExtensionCost = rawExtensionPrice;
      if (applicableDiscount) {
         calculatedExtensionCost = rawExtensionPrice * (1 - (applicableDiscount.percentage / 100));
      }
      calculatedExtensionCost = Math.max(0, calculatedExtensionCost);
      
      setExtensionCost(calculatedExtensionCost); // Store calculated cost for display

      // Call backend to create PaymentIntent
      const result = await apiService.extendMembership({ extensionMonths });
      
      if (result.clientSecret && result.paymentIntentId && result.extensionCost !== undefined) {
        setClientSecret(result.clientSecret);
        setExtensionPaymentIntentId(result.paymentIntentId);
        setExtensionCost(result.extensionCost); // Use cost from backend as the source of truth
        setCalculatedNewEndDate(result.newEndDate); // Store the new end date
        setShowExtendModal(false); // Close selection modal
        // Payment modal will open because clientSecret state is set
      } else {
        throw new Error('Invalid response from extension initiation');
      }
    } catch (err) {
      console.error('Extend membership initiation error:', err);
      
      const errorMessage = err.message || 'Failed to initiate membership extension';
      
      toast.error(errorMessage, {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        },
        autoClose: 5000
      });

      setActionResult({
        success: false,
        message: 'Initiation Failed',
        details: errorMessage
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  const handleExtensionPayment = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements || !clientSecret || !extensionPaymentIntentId) {
      // Stripe.js has not yet loaded or client secret is missing
      return;
    }
    
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      
      const cardElement = elements.getElement(CardElement);
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          // You might add billing_details here if you collect them
          // billing_details: {
          //   name: currentUser.name, // Example
          // }
        }
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      if (result.paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        // Payment succeeded. At this point, the backend should have already updated the booking end date
        // because we updated the backend controller to do it after creating the PaymentIntent.
        // If you implement a webhook or separate confirmation endpoint later, 
        // you would call that endpoint here instead of just refetching data.
        
        setActionResult({
          success: true,
          message: 'Membership Extended Successfully!',
          details: `Your membership has been extended by ${extensionMonths} month(s).`
        });

        // Show success toast
        toast.success(`Membership successfully extended by ${extensionMonths} month(s)!`, {
          icon: '✅',
          style: {
            background: '#F0FDF4',
            color: '#166534',
            borderLeft: '4px solid #22C55E'
          },
          autoClose: 5000
        });
        
        // Reset states and refetch dashboard data
        setClientSecret('');
        setExtensionPaymentIntentId('');
        setPaymentProcessing(false);
        // No need to reset extensionCost, it will be recalculated next time
        
        await fetchDashboardData(); // Refresh data to show new end date etc.
        // No need to fetch freeze status or trainer bookings unless they are affected

      } else {
         // Handle other potential statuses like 'requires_action'
         throw new Error(`Payment status: ${result.paymentIntent.status}`);
      }

    } catch (err) {
      console.error('Extension payment error:', err);
      
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      
      toast.error(errorMessage, {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        },
        autoClose: 5000
      });

      setActionResult({
        success: false,
        message: 'Payment Failed',
        details: errorMessage
      });

    } finally {
      setPaymentProcessing(false);
      // Keep payment modal open on error to allow user to try again
      // setShowPaymentModal(false); // Only close on success
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
  
  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 p-6">
  //       <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
  //         <div className="text-center text-red-500">
  //           <h2 className="text-2xl font-bold mb-4">Error</h2>
  //           <p>{error}</p>
  //           <button 
  //             onClick={fetchDashboardData}
  //             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //           >
  //             Try Again
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  
  // If no membership found OR failed to load (indicating no membership)
  if (!loading && (!dashboardData || !dashboardData.membershipDetails || (error && error === 'Failed to load dashboard information'))) {
    return (
      <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative elements */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 bg-white/10 rounded-full opacity-50 animate-pulse"></div>
              </div>
              <div className="relative">
                <svg className="mx-auto h-24 w-24 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main content box */}
          <div className="bg-black rounded-xl shadow-2xl p-8 md:p-12 border border-white/10 text-white">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Your Fitness Journey!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              You don't have an active membership yet. Start your transformation today by choosing a membership plan that fits your goals.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-gray-300">
              <div className="p-6 bg-white/5 rounded-xl">
                <div className="text-rose-500 mb-3">
                  <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flexible Plans</h3>
                <p className="text-gray-400">Choose from various membership options that suit your schedule and budget</p>
              </div>

              <div className="p-6 bg-white/5 rounded-xl">
                <div className="text-rose-500 mb-3">
                  <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Expert Trainers</h3>
                <p className="text-gray-400">Access to certified trainers who will guide you through your fitness journey</p>
              </div>

              <div className="p-6 bg-white/5 rounded-xl">
                <div className="text-rose-500 mb-3">
                  <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Premium Equipment</h3>
                <p className="text-gray-400">State-of-the-art facilities and equipment for the best workout experience</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={() => navigate('/membership')}
                className="inline-flex items-center px-8 py-4 bg-rose-600 text-white text-lg font-semibold rounded-xl hover:bg-rose-700 transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                View Membership Plans
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <p className="text-sm text-gray-400">
                Questions? Contact our support team for assistance
              </p>
            </div>
          </div>

          {/* Decorative bottom elements */}
          <div className="mt-12 flex justify-center space-x-6">
            <div className="animate-bounce-slow">
              <div className="h-3 w-3 bg-white/30 rounded-full opacity-75"></div>
            </div>
            <div className="animate-bounce-slow delay-75">
              <div className="h-3 w-3 bg-white/50 rounded-full opacity-75"></div>
            </div>
            <div className="animate-bounce-slow delay-150">
              <div className="h-3 w-3 bg-white/70 rounded-full opacity-75"></div>
            </div>
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
    totalPrice,
    status: membershipStatus
  } = dashboardData.membershipDetails;
  
  const renderFreezeButton = () => {
    if (freezeStatus.status === 'Frozen') {
      return (
        <button
          onClick={handleUnfreezeInitiate}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          disabled={processingAction}
        >
          Unfreeze Membership
        </button>
      );
    } else {
      return (
        <button
          onClick={handleFreezeInitiate}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-2"
          disabled={processingAction}
        >
          Freeze Membership
        </button>
      );
    }
  };
  
  // Calculate price details for the Extend Membership Modal dynamically
  const calculateExtensionPriceDetails = (months) => {
    const baseMonthlyPrice = dashboardData?.membershipDetails?.package?.basePrice || 0;
    const rawExtensionPrice = baseMonthlyPrice * months;

    let paymentIntervalForDiscount; // Match intervals used in backend/discounts
    if (months === 1) { paymentIntervalForDiscount = 'Monthly'; }
    else if (months === 3) { paymentIntervalForDiscount = '3 Months'; }
    else if (months === 6) { paymentIntervalForDiscount = '6 Months'; } // Added 6 months as per frontend UI
    else if (months === 12) { paymentIntervalForDiscount = 'Yearly'; }
    else { paymentIntervalForDiscount = null; }

    const applicableDiscount = paymentIntervalForDiscount 
      ? discounts.find(d => d.paymentInterval === paymentIntervalForDiscount)
      : null;

    const discountPercentage = applicableDiscount?.percentage || 0;
    const discountAmount = rawExtensionPrice * (discountPercentage / 100);
    const totalToPay = rawExtensionPrice - discountAmount;

    return {
      baseMonthlyPrice,
      rawExtensionPrice,
      discountPercentage,
      discountAmount,
      totalToPay: Math.max(0, totalToPay) // Ensure total is not negative
    };
  };

  const extensionPriceDetails = calculateExtensionPriceDetails(extensionMonths);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Notification Section */}
        <AnimatePresence>
          {actionResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl border ${
                actionResult.success 
                  ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{actionResult.message}</h3>
                <button onClick={dismissNotification} className="text-2xl">&times;</button>
              </div>
              <p className="mt-1 text-sm opacity-80">{actionResult.details}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Dashboard Section */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-rose-500/10 overflow-hidden shadow-xl">
          <div className="p-8 bg-gradient-to-r from-rose-500/20 to-transparent">
            <div className="flex items-center gap-4">
              <FaCrown className="w-10 h-10 text-rose-500" />
              <div>
                <h1 className="text-3xl font-bold text-white">Your Membership Dashboard</h1>
                <p className="text-gray-400">
                  Welcome back, {currentUser.name}! Here's your membership overview.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Membership Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <DashboardCard
                icon={FaDumbbell}
                title="Membership Type"
                value={dashboardData?.membershipDetails?.package?.name}
                subtitle={membershipStatus}
              />
              <DashboardCard
                icon={FaMoneyBillWave}
                title="Payment Plan"
                value={`Nrs ${dashboardData?.membershipDetails?.totalPrice.toFixed(2)}`}
                subtitle={`${dashboardData?.membershipDetails?.paymentInterval} payment`}
              />
              <DashboardCard
                icon={FaUserClock}
                title="Days Remaining"
                value={`${daysRemaining} days`}
                subtitle={`Ends: ${format(new Date(endDate), 'MMM dd, yyyy')}`}
              />
            </div>

            {/* QR Code Section */}
            <div className="bg-black/60 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaQrcode className="w-6 h-6 text-rose-500" />
                  <h2 className="text-xl font-bold text-white">Membership QR Code</h2>
                </div>
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors"
                >
                  {showQR ? 'Hide QR' : 'Show QR'}
                </button>
              </div>
              
              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-center"
                  >
                    <div className="bg-white p-4 rounded-xl">
                      <QRCodeSVG
                        value={qrData}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <ActionButton
                icon={MdPayment}
                label="Extend Membership"
                onClick={() => setShowExtendModal(true)}
                disabled={freezeStatus.status === 'Frozen'}
              />
              <ActionButton
                icon={FaRegSnowflake}
                label={freezeStatus.status === 'Frozen' ? 'Unfreeze Membership' : 'Freeze Membership'}
                onClick={freezeStatus.status === 'Frozen' ? handleUnfreezeInitiate : handleFreezeInitiate}
                variant="warning"
              />
              <ActionButton
                icon={MdCancel}
                label="Cancel Membership"
                onClick={() => setShowCancelModal(true)}
                variant="danger"
              />
            </div>

            {/* Trainer Sessions Section */}
            <div className="bg-black/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BiDumbbell className="w-6 h-6 text-rose-500" />
                  <h2 className="text-xl font-bold text-white">Training Sessions</h2>
                </div>
                <Link
                  to="/trainers"
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <BsCalendarCheck className="w-4 h-4" />
                  Book New Session
                </Link>
              </div>

              {loadingBookings ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-800">
                        <th className="py-3 px-4 text-gray-400">Trainer</th>
                        <th className="py-3 px-4 text-gray-400">Date</th>
                        <th className="py-3 px-4 text-gray-400">Time</th>
                        <th className="py-3 px-4 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainerBookings.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-gray-500">
                            No trainer bookings found
                          </td>
                        </tr>
                      ) : (
                        trainerBookings.map(booking => (
                          <tr key={booking._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-white">{booking.trainer?.name || 'Unknown Trainer'}</td>
                            <td className="py-4 px-4 text-white">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-4 px-4 text-white">{booking.startTime} - {booking.endTime}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                'bg-gray-500/20 text-gray-500'
                              }`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Cancel Membership</h2>
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium mb-2">
                  Are you sure you want to cancel your membership?
                </p>
                <p className="text-sm text-amber-700">
                  This action cannot be undone. If you cancel within 7 days of starting, you'll receive a full refund.
              Otherwise, you'll receive a pro-rated refund based on remaining days.
            </p>
              </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowCancelModal(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                disabled={processingAction}
              >
                  Keep Membership
              </button>
              <button 
                onClick={handleCancelMembership}
                  className="px-6 py-2.5 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 flex items-center"
                disabled={false}
              >
                  {processingAction ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : 'Cancel Membership'}
              </button>
            </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Freeze Warning Modal */}
      {showFreezeWarningModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFreezeWarningModal(false)} />
          <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Freeze Membership</h2>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">
                  Important Information About Freezing
                </p>
                <ul className="text-sm text-blue-700 list-disc list-inside space-y-2">
                  <li>Your membership will be frozen for a minimum of 7 days</li>
                  <li>You cannot unfreeze before the 7-day period ends</li>
                  <li>Maximum freeze duration is 90 days per year</li>
                  <li>Your membership end date will be extended by the freeze duration</li>
                </ul>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setShowFreezeWarningModal(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  disabled={processingAction}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFreezeConfirm}
                  className="px-6 py-2.5 rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Confirm Freeze'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Unfreeze Modal */}
      {showUnfreezeModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUnfreezeModal(false)} />
          <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {canUnfreeze ? 'Unfreeze Membership' : 'Cannot Unfreeze Yet'}
              </h2>
              <div className={`mb-6 p-4 rounded-lg border ${
                canUnfreeze ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}>
                {canUnfreeze ? (
                  <>
                    <p className="text-green-800 font-medium mb-2">
                      Membership Information
                    </p>
                    <div className="text-sm text-green-700 space-y-2">
                      <p>Your membership has been frozen for {freezeStatus.currentFreezeDuration} days.</p>
                      <p>After unfreezing:</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        <li>Your membership will be reactivated immediately</li>
                        <li>Your end date will be extended by {freezeStatus.currentFreezeDuration} days</li>
                        <li>You can freeze again if you have remaining freeze days</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-amber-800 font-medium mb-2">
                      {remainingUnfreezeDays > 0 ? 'Minimum Freeze Period Not Completed' : 'Maximum Freeze Duration Exceeded'}
                    </p>
                    <p className="text-sm text-amber-700">
                      {remainingUnfreezeDays > 0 ? (
                        <>
                          You need to wait {remainingUnfreezeDays} more days before you can unfreeze your membership.
                          The minimum freeze period is 7 days.
                        </>
                      ) : (
                        <>
                          Your membership has been frozen for the maximum allowed duration of 90 days.
                          Please contact support if you need assistance.
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  onClick={() => setShowUnfreezeModal(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  disabled={processingAction}
                >
                  {canUnfreeze ? 'Cancel' : 'Close'}
                </button>
                {canUnfreeze && (
                  <button 
                    onClick={handleUnfreezeConfirm}
                    className="px-6 py-2.5 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition-colors duration-200"
                    disabled={processingAction}
                  >
                    {processingAction ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processing...
                      </span>
                    ) : 'Confirm Unfreeze'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowExtendModal(false)} />
          <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Extend Membership</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Extension Duration
              </label>
              <select 
                value={extensionMonths} 
                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
              </select>

                {/* Price Calculation Display */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Base Monthly Price:</span>
                    <span className="font-medium">Nrs {extensionPriceDetails.baseMonthlyPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{extensionMonths} {extensionMonths === 1 ? 'Month' : 'Months'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal (Raw):</span>
                    <span className="font-medium">Nrs {extensionPriceDetails.rawExtensionPrice.toFixed(2)}</span>
                  </div>
                  {extensionPriceDetails.discountPercentage > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Discount ({extensionPriceDetails.discountPercentage}%):</span>
                      <span className="font-medium text-green-600">- Nrs {extensionPriceDetails.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Total to Pay:</span>
                    <span className="text-xl font-bold text-blue-600">
                      Nrs {extensionPriceDetails.totalToPay.toFixed(2)}
                    </span>
                  </div>
                </div>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowExtendModal(false)}
                  className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button 
                onClick={handleExtendMembership}
                  className="px-6 py-2.5 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors duration-200 flex items-center"
                disabled={processingAction}
              >
                  {processingAction ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : 'Continue to Payment'}
              </button>
            </div>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {clientSecret && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setClientSecret('')} />
          <div className="relative z-50 flex items-center justify-center min-h-screen p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Complete Payment</h2>
              {paymentError && <p className="text-red-500 text-sm mb-4">{paymentError}</p>} {/* Display payment errors */}
              <form onSubmit={handleExtensionPayment}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Details\
                </label>\
                  <div className="p-4 rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all duration-200">
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
              {/* Payment Summary in Payment Modal */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-semibold">Amount Due:</span>
                    <span className="text-xl font-bold text-blue-600">
                      Nrs {extensionCost.toFixed(2)}
                    </span>
                  </div>
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    setClientSecret('');
                    setPaymentError(null);
                  }}
                    className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                    className="px-6 py-2.5 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 flex items-center"
                  disabled={paymentProcessing || !stripe || !elements}
                >
                    {paymentProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : `Pay Nrs ${extensionCost.toFixed(2)}`}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        </div>
      )}

      <EditMembershipModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentPackageId={membershipPackage._id}
        currentServices={customServices?.map(s => s._id)}
        onSuccess={() => {
          setShowEditModal(false);
          fetchDashboardData();
        }}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
        toastStyle={{
          background: '#18181b',
          color: '#fff',
          borderLeft: '4px solid #f43f5e',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
};

export default UserDashboard;