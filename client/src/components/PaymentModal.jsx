// src/components/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  clientSecret,
  amount,
  items = [],
  email = '',
  processingPayment = false,
  setProcessingPayment,
  fetchClientSecret,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [rememberMe, setRememberMe] = useState(false);
    
  useEffect(() => {
    // If no client secret is provided, fetch it using the provided function
    if (isOpen && !clientSecret && fetchClientSecret) {
      fetchClientSecret();
    }
  }, [isOpen, clientSecret, fetchClientSecret]);
  
  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setPaymentError(event.error ? event.error.message : null);
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email || JSON.parse(localStorage.getItem('user'))?.email || '',
            name: JSON.parse(localStorage.getItem('user'))?.name || 'Unknown User',
          },
        },
      });

      if (error) {
        setPaymentError(`Payment failed: ${error.message}`);
        setProcessingPayment(false);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        // Use the callback to confirm payment with our backend if needed
        if (onSuccess) {
          await onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentError('An unexpected error occurred. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  const totalAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full flex">
        {/* Left sidebar with items */}
        <div className="bg-blue-500 text-white p-6 w-2/5">
          <div className="mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          
          {items.length > 0 ? (
            <div className="space-y-4 mb-8">
              {items.map((item, index) => (
                <div key={index} className="border-b border-blue-400 pb-4 last:border-b-0">
                  <div className="text-lg font-medium">{item.name}</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-200">by {item.by}</span>
                    <span className="font-bold">${item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xl font-medium mb-8">Complete Payment</div>
          )}
          
          <div className="mt-6">
            <div className="flex justify-between text-sm border-b border-blue-400 pb-2">
              <span>Available</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-sm pt-2">
              <span>Fee</span>
              <span>$0.34</span>
            </div>
          </div>
          
          <div className="mt-auto pt-10 text-xs">
            Powered by <span className="font-bold">stripe</span>
          </div>
        </div>
        
        {/* Right payment form */}
        <div className="p-6 w-3/5">
          {paymentSuccess ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-3 text-lg font-medium text-gray-900">Payment Successful!</h2>
              <p className="mt-2 text-sm text-gray-500">
                Thank you for your payment.
              </p>
              <button
                onClick={onClose}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Payment method selection */}
              <div className="mb-5 flex">
                <button
                  type="button"
                  className={`flex-1 text-center py-2 rounded-l-full ${
                    paymentMethod === 'Balance' 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-white text-gray-400 border'
                  }`}
                  onClick={() => handlePaymentMethodChange('Balance')}
                >
                  Balance
                </button>
                <button
                  type="button"
                  className={`flex-1 text-center py-2 rounded-r-full ${
                    paymentMethod === 'Credit Card' 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-white text-gray-400 border'
                  }`}
                  onClick={() => handlePaymentMethodChange('Credit Card')}
                >
                  Credit Card
                </button>
              </div>
              
              {/* Email input */}
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={email}
                  readOnly={!!email}
                />
              </div>
              
              {/* Card details */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="4916 9492 1224 9810"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YYYY"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="hidden">
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
                    onChange={handleCardChange}
                  />
                </div>
              </div>
              
              {/* Remember me checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2"
                  />
                  <span className="text-blue-500">Remember Me</span>
                </label>
              </div>
              
              {/* Error message */}
              {paymentError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {paymentError}
                </div>
              )}
              
              {/* Payment button */}
              <button
                type="submit"
                disabled={processingPayment || !stripe || !clientSecret || !cardComplete}
                className={`w-full bg-blue-500 text-white py-3 rounded-md ${
                  processingPayment || !stripe || !clientSecret
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-blue-600'
                }`}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  `Pay $${totalAmount}`
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;