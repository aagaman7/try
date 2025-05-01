import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const PaymentModal = ({ booking, totalPrice, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize payment process when modal opens
    const initiatePayment = async () => {
      try {
        setProcessing(true);
        // Send booking data to create payment intent
        const response = await apiService.bookMembership(booking);
        setClientSecret(response.clientSecret);
        setProcessing(false);
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError(err.message || 'Failed to initialize payment. Please try again.');
        setProcessing(false);
      }
    };

    if (booking) {
      initiatePayment();
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: JSON.parse(localStorage.getItem('user'))?.name || 'Unknown User',
          },
        },
      });

      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Complete Your Payment</h3>
                
                {success ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="mt-3 text-lg font-medium text-gray-900">Payment Successful!</h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Thank you for your payment. Redirecting you to your dashboard...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Membership Plan:</span>
                          <span className="font-medium">{booking?.packageName}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Payment Interval:</span>
                          <span className="font-medium">{booking?.paymentInterval}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total Amount:</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Details
                      </label>
                      <div className="border border-gray-300 rounded-md p-4">
                        <CardElement
                          options={{
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
                          }}
                        />
                      </div>
                      {error && (
                        <div className="mt-2 text-sm text-red-600">{error}</div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={processing || !stripe}
                        className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          processing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {processing ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          `Pay $${totalPrice.toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;