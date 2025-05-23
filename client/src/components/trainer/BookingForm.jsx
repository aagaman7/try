import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import apiService from '../../services/apiService';


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm = ({ trainer, onClose, onSuccess }) => {

  const stripe = useStripe();
  const elements = useElements();
  const [selectedDay, setSelectedDay] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Days of the week for availability
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  // Generate time slots based on trainer's availability
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    let currentHour = startHour;
    let currentMinute = startMinute;
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    return slots;
  };

  // Get available time slots for the selected day
  const getAvailableTimeSlots = () => {
    if (!selectedDay) return [];
    const dayAvailability = trainer.availability.find(a => a.day === selectedDay);
    if (!dayAvailability) return [];
    return generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime);
  };

  useEffect(() => {
    if (selectedDay) {
      // Fetch booked slots for this trainer and day
      apiService.getTrainerBookedSlots(trainer._id, selectedDay)
        .then(res => setBookedSlots(res.bookedSlots || []))
        .catch(() => setBookedSlots([]));
      const slots = getAvailableTimeSlots();
      setAvailableSlots(slots);
      setTime('');
    }
  }, [selectedDay, trainer._id]);

  const handleBookingInfoSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const bookingData = {
        trainerId: trainer._id,
        day: selectedDay,
        time,
        notes
      };
      const { booking, clientSecret } = await apiService.bookTrainerSession(bookingData);
      setClientSecret(clientSecret);
      setBookingId(booking._id);
      setShowPaymentModal(true);
    } catch (err) {
      // Show a user-friendly error if the slot is already booked
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message && err.message.includes('duplicate key')) {
        setError('This slot is already booked. Please choose another time.');
      } else {
        setError(err.message || 'An error occurred while booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement
        }
      });
      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }
      // Confirm booking payment on backend
      await apiService.confirmTrainerBookingPayment(bookingId);
      setSuccess('Booking and payment successful!');
      setShowPaymentModal(false);
      setSelectedDay('');
      setTime('');
      setNotes('');
      setBookingId(null);
      setClientSecret(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeToast = () => setError(null);

  return (
    <Elements stripe={stripePromise}>
    <div>
      {success && (
        <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded shadow flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-800 rounded shadow flex items-center justify-between">
          <span>{error}</span>
          <button onClick={closeToast} className="ml-4 text-red-500 text-xl font-bold">&times;</button>
        </div>
      )}
      <form onSubmit={handleBookingInfoSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Book a Session with {trainer.name}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a day</option>
            {daysOfWeek.map(day => {
              const isAvailable = trainer.availability.some(a => a.day === day);
              return (
                <option 
                  key={day} 
                  value={day}
                  disabled={!isAvailable}
                >
                  {day} {!isAvailable && '(Not Available)'}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available Time Slots</label>
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  disabled={bookedSlots.includes(slot)}
                  title={bookedSlots.includes(slot) ? 'This slot is already booked' : 'Book this slot'}
                  className={`p-2 border rounded text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    time === slot 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : bookedSlots.includes(slot)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : 'hover:bg-blue-50 hover:border-blue-400'
                  }`}
                >
                  {slot} {bookedSlots.includes(slot) && <span className="text-xs">(Booked)</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {selectedDay ? 'No available slots for this day' : 'Please select a day first'}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Any special requests or info for the trainer?"
          />
        </div>
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedDay || !time}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 shadow"
          >
            {loading ? (
              <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</span>
            ) : `Proceed to Payment ($${trainer.price})`}
          </button>
        </div>
      </form>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full z-10 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Payment Details</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">Complete your trainer booking with a secure payment</p>
              <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50">
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
            </div>
            <button
              onClick={handlePayment}
              disabled={!stripe || loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center"><svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</span>
              ) : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
    </Elements>
  );
};

export default BookingForm; 