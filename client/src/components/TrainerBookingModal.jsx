// components/TrainerBookingModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const TrainerBookingModal = ({ trainer, isOpen, onClose }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentStep, setCurrentStep] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Set up available dates when trainer is selected
  useEffect(() => {
    if (trainer && trainer.availability && trainer.availability.length > 0) {
      // Sort dates chronologically
      const sortedDates = [...trainer.availability].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      // Filter out past dates
      const today = new Date().toISOString().split('T')[0];
      const futureDates = sortedDates.filter(item => item.date >= today);
      
      setAvailableDates(futureDates);
    } else {
      setAvailableDates([]);
    }
  }, [trainer]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (trainer) {
      const dateAvailability = trainer.availability.find(a => a.date === date);
      if (dateAvailability && dateAvailability.times.length > 0) {
        // Sort times chronologically
        const sortedTimes = [...dateAvailability.times].sort();
        setAvailableTimes(sortedTimes);
      } else {
        setAvailableTimes([]);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle going to next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDate || !selectedTime) {
        toast.error('Please select both date and time');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  // Handle going to previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format card expiry date
  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to book a session');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real application, you would process the payment here
      // This is just a simulation for demonstration purposes
      
      const bookingData = {
        trainerId: trainer._id,
        date: selectedDate,
        time: selectedTime,
        notes,
        paymentMethod
      };
      
      await apiService.bookTrainerSession(bookingData);
      
      toast.success('Session booked successfully!');
      onClose();
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      
      // Special handling for membership required error
      if (err.message && err.message.includes('membership required')) {
        toast.error('You need an active membership to book a trainer. Redirecting to membership page...');
        setTimeout(() => navigate('/membership'), 2000);
      } else {
        toast.error(err.message || 'Failed to book session');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Book Session with {trainer.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                1
              </div>
              <span className="text-sm mt-1">Schedule</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                2
              </div>
              <span className="text-sm mt-1">Details</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                3
              </div>
              <span className="text-sm mt-1">Payment</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Schedule */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Select Date & Time</h3>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Available Dates:</label>
                  {availableDates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableDates.map((dateObj) => (
                        <button
                          type="button"
                          key={dateObj.date}
                          className={`p-3 border rounded-md text-left ${
                            selectedDate === dateObj.date
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                          onClick={() => handleDateSelect(dateObj.date)}
                        >
                          {formatDate(dateObj.date)}
                          <span className="block text-sm mt-1">
                            {selectedDate === dateObj.date 
                              ? 'Selected' 
                              : `${dateObj.times.length} time slots available`}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-yellow-600 p-4 bg-yellow-50 rounded-md">
                      No available dates for this trainer.
                    </div>
                  )}
                </div>
                
                {/* Time Selection */}
                {selectedDate && (
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Available Times:</label>
                    {availableTimes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableTimes.map((time) => (
                          <button
                            type="button"
                            key={time}
                            className={`py-2 px-3 border rounded-md ${
                              selectedTime === time
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-yellow-600 p-4 bg-yellow-50 rounded-md">
                        No available times for selected date.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Session Details */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Session Details</h3>
                
                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Trainer:</span>
                    <span>{trainer.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="font-bold text-blue-600">{trainer.price}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2" htmlFor="notes">
                    Additional Notes (Optional):
                  </label>
                  <textarea
                    id="notes"
                    className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                    rows="4"
                    placeholder="Tell us about your fitness goals, any health concerns, or specific areas you'd like to focus on..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Payment Details</h3>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Payment Method:</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-md flex items-center ${
                        paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      Credit/Debit Card
                    </button>
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-md flex items-center ${
                        paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.978c.162-.772.851-1.33 1.634-1.33h6.015c2.935 0 4.967 1.985 4.567 4.964-.4 2.979-2.405 4.964-5.341 4.964H8.933a.641.641 0 0 0-.633.74l1.015 5.313c.08.384-.229.706-.614.706h-1.63l.005-.008z"></path>
                      </svg>
                      PayPal
                    </button>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="cardNumber">Card Number:</label>
                      <input
                        id="cardNumber"
                        type="text"
                        className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength="19"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="cardName">Cardholder Name:</label>
                      <input
                        id="cardName"
                        type="text"
                        className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                        placeholder="John Smith"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <label className="block text-gray-700 mb-2" htmlFor="cardExpiry">Expiry Date:</label>
                        <input
                          id="cardExpiry"
                          type="text"
                          className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                          maxLength="5"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-gray-700 mb-2" htmlFor="cardCVC">CVC:</label>
                        <input
                          id="cardCVC"
                          type="text"
                          className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                          placeholder="123"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value.replace(/[^0-9]/g, ''))}
                          maxLength="4"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {paymentMethod === 'paypal' && (
                  <div className="bg-blue-50 p-4 rounded-md text-center">
                    <p className="mb-4">You will be redirected to PayPal to complete your payment after confirming your booking.</p>
                    <svg className="w-16 h-16 mx-auto text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.978c.162-.772.851-1.33 1.634-1.33h6.015c2.935 0 4.967 1.985 4.567 4.964-.4 2.979-2.405 4.964-5.341 4.964H8.933a.641.641 0 0 0-.633.74l1.015 5.313c.08.384-.229.706-.614.706h-1.63l.005-.008z"></path>
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Cancel
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Processing...' : 'Complete Booking'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerBookingModal;