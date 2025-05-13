import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import apiService from '../services/apiService';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from './common/LoadingSpinner';

// Load Stripe outside the component to avoid recreating on each render
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Payment Form Component
const PaymentForm = ({ bookingData, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const initiateBooking = async () => {
      try {
        setProcessing(true);
        // Create booking and get client secret
        const response = await apiService.bookTrainerSession(bookingData);
        setBookingId(response.booking._id);
        setClientSecret(response.clientSecret);
      } catch (error) {
        setPaymentError(error.message || 'Failed to initiate booking');
      } finally {
        setProcessing(false);
      }
    };

    initiateBooking();
  }, [bookingData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm the booking with our backend
        await apiService.post(`trainers/bookings/${bookingId}/confirm-payment`);
        onSuccess();
      }
    } catch (error) {
      setPaymentError(error.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!clientSecret && !paymentError) {
    return <LoadingSpinner text="Preparing your booking..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentError && (
        <div className="bg-red-50 p-3 rounded text-red-600 text-sm">
          {paymentError}
        </div>
      )}
      
      <div className="border rounded-md p-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
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
      
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white 
            ${!stripe || processing ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {processing ? 'Processing...' : `Pay $${bookingData.trainer.price}`}
        </button>
      </div>
    </form>
  );
};

// Main Booking Modal Component
const BookingModal = ({ trainer, isOpen, onClose, onBookingSuccess }) => {
  const [step, setStep] = useState(1); // 1: Select Date/Time, 2: Payment
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    // Reset available times when date changes
    if (selectedDate) {
      const dateAvailability = trainer.availability.find(a => a.date === selectedDate);
      if (dateAvailability) {
        setAvailableTimes(dateAvailability.times);
        setDateError('');
      } else {
        setAvailableTimes([]);
        setDateError('No availability for selected date');
      }
    } else {
      setAvailableTimes([]);
    }
    
    // Reset selected time when date changes
    setSelectedTime('');
  }, [selectedDate, trainer.availability]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (!selectedDate || !selectedTime) {
      setDateError('Please select both date and time');
      return;
    }
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const getBookingData = () => {
    return {
      trainerId: trainer._id,
      date: selectedDate,
      time: selectedTime,
      notes: notes,
      trainer: trainer // Include trainer data for UI
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            {step === 1 ? 'Book a Session' : 'Payment Details'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Date/Time */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    1
                  </div>
                  <h3 className="ml-3 text-lg font-medium">Select Date and Time</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={16} className="inline mr-1" />
                      Available Dates
                    </label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a date</option>
                      {trainer.availability && trainer.availability.map((avail, index) => (
                        <option key={index} value={avail.date}>
                          {avail.date} ({avail.times.length} slots)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock size={16} className="inline mr-1" />
                      Available Times
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      disabled={availableTimes.length === 0}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a time</option>
                      {availableTimes.map((time, index) => (
                        <option key={index} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {dateError && (
                  <p className="mt-2 text-sm text-red-600">{dateError}</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    2
                  </div>
                  <h3 className="ml-3 text-lg font-medium">Session Notes (Optional)</h3>
                </div>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific focuses or concerns you'd like the trainer to know about..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">Session Summary</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      {trainer.name} - {trainer.specialization}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Session Price</p>
                    <p className="text-xl font-bold">${trainer.price}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium 
                    ${!selectedDate || !selectedTime ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <h4 className="font-medium mb-2">Booking Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">Trainer:</div>
                    <div>{trainer.name}</div>
                    
                    <div className="text-gray-600">Date:</div>
                    <div>{selectedDate}</div>
                    
                    <div className="text-gray-600">Time:</div>
                    <div>{selectedTime}</div>
                    
                    <div className="text-gray-600">Total:</div>
                    <div className="font-bold">${trainer.price}</div>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <CreditCard size={16} />
                  </div>
                  <h3 className="ml-3 text-lg font-medium">Payment Details</h3>
                </div>
                
                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    bookingData={getBookingData()}
                    onSuccess={onBookingSuccess}
                    onClose={onClose}
                  />
                </Elements>
              </div>
              
              <button
                onClick={handleBackStep}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                ← Back to date selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;