import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const PaymentModal = ({ booking, totalPrice, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Create payment intent as soon as the modal opens
    const createPaymentIntent = async () => {
      try {
        setDebugInfo('Creating payment intent...');
        
        // Make sure we send all necessary information
        const paymentData = {
          packageId: booking.packageId,
          customServices: booking.customServices || [],
          timeSlot: booking.timeSlot,
          workoutDaysPerWeek: booking.workoutDaysPerWeek,
          goals: booking.goals,
          paymentInterval: booking.paymentInterval,
          amount: totalPrice
        };
        
        console.log('Payment data being sent:', paymentData);
        
        const response = await apiService.processPayment(paymentData);
        console.log('Payment intent response:', response);
        
        if (response && response.clientSecret) {
          setClientSecret(response.clientSecret);
          setDebugInfo('Payment intent created successfully');
        } else {
          setError('Invalid response from payment service');
          setDebugInfo('Response missing client secret');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(`Failed to initialize payment: ${err.message || 'Unknown error'}`);
        setDebugInfo(`Error details: ${JSON.stringify(err)}`);
      }
    };

    if (booking && totalPrice > 0) {
      createPaymentIntent();
    }
  }, [booking, totalPrice]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError("Stripe hasn't loaded yet. Please try again.");
      return;
    }
    
    if (!clientSecret) {
      setError("Payment configuration incomplete. Please wait or try again.");
      return;
    }
    
    setProcessing(true);
    setPaymentInProgress(true);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Member Name', // Ideally get this from user context
          },
        }
      });

      if (result.error) {
        setError(`Payment failed: ${result.error.message}`);
        console.error('Payment error:', result.error);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // Send confirmation to your backend
          try {
            await apiService.confirmPayment({
              paymentIntentId: result.paymentIntent.id,
              bookingId: booking.packageId,
              amount: totalPrice
            });
            
            setSucceeded(true);
            setError(null);
          } catch (err) {
            console.error('Error confirming payment:', err);
            setError('Payment processed but failed to complete booking. Please contact support.');
          }
        }
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(`Error processing payment: ${err.message}`);
    } finally {
      setProcessing(false);
      setPaymentInProgress(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          disabled={processing}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>
        
        {succeeded ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Your membership has been activated. You can now access all the features.</p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-2">Amount to Pay</p>
              <p className="text-2xl font-bold text-gray-800">${totalPrice.toFixed(2)}</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
                Credit or debit card
              </label>
              <div className="border border-gray-300 p-4 rounded-md">
                <CardElement id="card-element" options={cardElementOptions} />
              </div>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {debugInfo && (
              <div className="mb-4 text-xs text-gray-500">
                <p>{debugInfo}</p>
              </div>
            )}
            
            <button
              disabled={processing || paymentInProgress || !stripe || !clientSecret}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                processing || paymentInProgress || !stripe || !clientSecret
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Pay Now'
              )}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>You can use the test card: 4242 4242 4242 4242</p>
              <p>Exp: Any future date, CVC: Any 3 digits</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;