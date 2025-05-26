import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  CardElement,
} from '@stripe/react-stripe-js';
import apiService from '../services/apiService';
import TrainerReview from '../components/trainer/TrainerReview';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm = ({ trainer, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    } else {
      setAvailableSlots([]);
      setSlot('');
    }
  }, [date, trainer]);

  const fetchAvailableSlots = async (selectedDate) => {
    try {
      setLoading(true);
      const slots = await apiService.getTrainerAvailableSlots(trainer._id, selectedDate);
      setAvailableSlots(slots);
      setSlot('');
      setError(null);
    } catch (err) {
      setAvailableSlots([]);
      setSlot('');
      setError('Failed to fetch available slots.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Create booking and get clientSecret
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!slot) {
      setError('Please select a slot.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [startTime, endTime] = slot.split('-');
      const bookingData = {
        trainerId: trainer._id,
        bookingDate: date,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
      };
      const { clientSecret: secret } = await apiService.createTrainerBooking(bookingData);
      setClientSecret(secret);
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Stripe payment
  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      });
      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }
      setSuccess('Booking and payment successful!');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // UI
  if (!clientSecret) {
    // Step 1: Booking form
    return (
      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Available Slots</label>
          <select
            value={slot}
            onChange={e => setSlot(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading || !date || availableSlots.length === 0}
          >
            <option value="">Select a slot</option>
            {availableSlots.map((s, idx) => (
              <option key={idx} value={`${s.startTime}-${s.endTime}`}>{`${s.startTime} - ${s.endTime}`}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Book Session'}
        </button>
      </form>
    );
  }

  // Step 2: Payment form
  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Payment Details</label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Confirm Payment'}
      </button>
    </form>
  );
};

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchTrainerDetails();
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [id]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const [trainerData, reviewsData] = await Promise.all([
        apiService.getTrainerById(id),
        apiService.getTrainerReviews(id)
      ]);
      setTrainer(trainerData);
      // console.log(trainerData);
      setReviews(reviewsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trainer details. Please try again later.');
      console.error('Error fetching trainer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
  };
  const handleReviewEdited = (updatedReview) => {
    setReviews(prev => prev.map(r => r._id === updatedReview._id ? updatedReview : r));
  };
  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(r => r._id !== reviewId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">{error || 'Trainer not found'}</p>
          <button
            onClick={() => navigate('/trainers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Trainers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trainer Info */}
        <div>
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <img
              src={trainer.image}
              alt={trainer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{trainer.name}</h1>
          <div className="flex items-center mb-4">
            <StarIcon className="h-6 w-6 text-yellow-400" />
            <span className="ml-2 text-gray-600">{trainer.averageRating.toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({trainer.totalRatings} reviews)</span>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
            <p className="text-gray-600">{trainer.bio}</p>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Qualifications</h2>
            <ul className="list-disc list-inside text-gray-600">
              {trainer.qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              {trainer.availability.map((slot, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{slot.day}</p>
                  <p className="text-gray-600">{slot.startTime} - {slot.endTime}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Booking Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Book a Session</h2>
            <p className="text-gray-600 mb-4">
              Price per session: ${trainer.pricePerSession}
            </p>
          </div>
          {showBookingForm ? (
            <Elements stripe={stripePromise}>
              <BookingForm trainer={trainer} onSuccess={fetchTrainerDetails} />
            </Elements>
          ) : (
            <button
              onClick={() => setShowBookingForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
      {/* Reviews Section always visible below details */}
      <div className="mt-12">
        <TrainerReview
          trainerId={trainer._id}
          reviews={reviews}
          user={user}
          onReviewAdded={handleReviewAdded}
          onReviewEdited={handleReviewEdited}
          onReviewDeleted={handleReviewDeleted}
        />
      </div>
    </div>
  );
};

export default TrainerDetail; 