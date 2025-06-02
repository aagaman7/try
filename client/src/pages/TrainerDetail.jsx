import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Star } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Star Rating Component
const StarRating = ({ rating, setRating, size = "h-8 w-8" }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`${size} ${
              star <= (hover || rating)
                ? "text-rose-500 fill-rose-500"
                : "text-gray-400"
            } transition-colors duration-200`}
          />
        </button>
      ))}
    </div>
  );
};

const BookingForm = ({ trainer, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableSlots();
  }, [trainer]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      // Get next 7 days slots
      const today = new Date();
      const slots = await Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          return apiService.getTrainerAvailableSlots(trainer._id, date.toISOString().split('T')[0]);
        })
      );
      
      // Flatten and format slots with dates
      const formattedSlots = slots.flat().map((slot, index) => ({
        ...slot,
        date: new Date(new Date().setDate(new Date().getDate() + Math.floor(index / trainer.availability.length))),
      }));
      
      setAvailableSlots(formattedSlots);
      setError(null);
    } catch (err) {
      setError('Failed to fetch available slots.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError('Please select a slot.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bookingData = {
        trainerId: trainer._id,
        bookingDate: selectedSlot.date.toISOString().split('T')[0],
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      };
      const { clientSecret: secret } = await apiService.createTrainerBooking(bookingData);
      setClientSecret(secret);
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Show success toast with dashboard link
      toast.success(
        <div className="flex flex-col">
          <p className="font-medium">Booking Successful! 🎉</p>
          <p className="text-sm mt-1">Your session request has been sent to {trainer.name}.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline text-left"
          >
            View booking status in dashboard →
          </button>
        </div>,
        {
          icon: '✅',
          style: {
            background: '#F0FDF4',
            color: '#166534',
            borderLeft: '4px solid #22C55E'
          },
          autoClose: 7000, // Give more time to read and click
          closeButton: true,
          closeOnClick: false // Don't close on click since we have a button
        }
      );

      setSuccess('Booking confirmed successfully!');
      if (onSuccess) onSuccess();
      
      // Automatically redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Payment failed.');
      toast.error(err.message || 'Payment failed. Please try again.', {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          color: '#991B1B',
          borderLeft: '4px solid #DC2626'
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No available slots for the next 7 days.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSlot(slot)}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    selectedSlot === slot
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                      <span className="text-blue-600 font-semibold">
                        {slot.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {slot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm text-gray-500">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  </div>
                  {selectedSlot === slot && (
                    <span className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <button
          onClick={handleBooking}
          disabled={!selectedSlot || loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </span>
          ) : (
            'Book Selected Slot'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Selected Slot</h3>
        <p className="text-gray-600">
          {selectedSlot.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          <br />
          {selectedSlot.startTime} - {selectedSlot.endTime}
        </p>
      </div>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Payment Details</label>
        <div className="p-4 border border-gray-200 rounded-lg">
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
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing Payment...
          </span>
        ) : (
          'Confirm Payment'
        )}
      </button>
    </div>
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
  const [rating, setRating] = useState(0);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !trainer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-rose-600 text-center">
          <p className="text-xl font-bold">{error || 'Trainer not found'}</p>
          <button
            onClick={() => navigate('/trainers')}
            className="mt-4 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300"
          >
            Back to Trainers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Trainer Info - Left Column */}
              <div className="lg:col-span-2 space-y-8">
            <div className="bg-black rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                {/* Trainer Photo */}
                <div className="md:col-span-1">
                  <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Trainer Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black text-white">{trainer.name}</h1>
                    <div className="flex items-center space-x-2">
                      <Star className="h-6 w-6 text-rose-500" />
                      <span className="text-lg font-bold text-white">
                          {trainer.averageRating.toFixed(1)}
                        </span>
                      <span className="text-gray-400">({trainer.totalRatings})</span>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none text-gray-300">
                    <h2 className="text-xl font-bold text-white mb-3">About</h2>
                    <p className="mb-6">{trainer.bio}</p>
                    
                    <h2 className="text-xl font-bold text-white mb-3">Specializations</h2>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {trainer.specializations.map((spec, index) => (
                          <span
                            key={index}
                          className="px-4 py-2 bg-white/10 text-rose-500 rounded-xl text-sm font-medium border border-rose-500/20"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                      </div>
                      
              {/* Additional Info */}
              <div className="border-t border-white/10 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-3">Qualifications</h2>
                    <ul className="list-disc list-inside text-gray-300">
                        {trainer.qualifications.map((qual, index) => (
                        <li key={index} className="mb-2">{qual}</li>
                        ))}
                      </ul>
                  </div>
                      
                  <div>
                    <h2 className="text-xl font-bold text-white mb-3">Regular Schedule</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {trainer.availability.map((slot, index) => (
                        <div key={index} className="bg-white/10 p-4 rounded-xl border border-white/10">
                          <p className="font-bold text-white">{slot.day}</p>
                          <p className="text-gray-400 text-sm">{slot.startTime} - {slot.endTime}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Reviews Section */}
            <div className="bg-black rounded-2xl shadow-xl p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-4">Client Reviews</h2>
                {user ? (
                  <div className="bg-white/10 rounded-xl p-6 border border-white/10 mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Leave a Review</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const comment = e.target.comment.value;
                      if (rating && comment) {
                        apiService.createTrainerReview({
                          trainerId: trainer._id,
                          rating: Number(rating),
                          comment
                        })
                        .then(newReview => {
                          handleReviewAdded(newReview);
                          e.target.reset();
                          setRating(0);
                          toast.success('Review submitted successfully!');
                        })
                        .catch(err => {
                          toast.error(err.message || 'Failed to submit review');
                        });
                      } else {
                        toast.error('Please provide both rating and comment');
                      }
                    }}>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Rating</label>
                        <div className="flex items-center space-x-2">
                          <StarRating rating={rating} setRating={setRating} />
                          {rating > 0 && (
                            <span className="text-gray-300 ml-2">({rating} star{rating !== 1 ? 's' : ''})</span>
                          )}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Your Review</label>
                        <textarea 
                          name="comment"
                          required
                          rows="4"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500"
                          placeholder="Share your experience with this trainer..."
                        ></textarea>
                      </div>
                      <button 
                        type="submit"
                        disabled={!rating}
                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                          rating 
                            ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                            : 'bg-gray-600 cursor-not-allowed text-gray-300'
                        }`}
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center bg-white/10 rounded-xl p-6 border border-white/10 mb-8">
                    <p className="text-gray-300 mb-4">Please log in to leave a review</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-rose-500 text-white py-2 px-6 rounded-xl font-bold hover:bg-rose-600 transition-all duration-300"
                    >
                      Log In
                    </button>
                  </div>
                )}
                
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-white/10 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-rose-500" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{review.userName || 'Anonymous'}</p>
                            <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-rose-500" />
                          <span className="ml-1 text-white font-bold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                      
                      {user && user._id === review.userId && (
                        <div className="mt-4 flex justify-end space-x-4">
                          <button
                            onClick={() => {
                              apiService.deleteTrainerReview(review._id)
                                .then(() => {
                                  handleReviewDeleted(review._id);
                                  toast.success('Review deleted successfully');
                                })
                                .catch(err => toast.error(err.message));
                            }}
                            className="text-rose-500 hover:text-rose-400 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-2xl shadow-xl p-8 sticky top-8">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-4">Book a Session</h2>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/10 mb-6">
                  <span className="text-gray-300">Price per session</span>
                  <span className="text-2xl font-black text-rose-500">Nrs {trainer.pricePerSession}</span>
                    </div>
                  </div>
                  
                  {showBookingForm ? (
                    <Elements stripe={stripePromise}>
                      <BookingForm trainer={trainer} onSuccess={fetchTrainerDetails} />
                    </Elements>
                  ) : (
                    <button
                      onClick={() => setShowBookingForm(true)}
                  className="w-full bg-rose-500 text-white py-4 px-6 rounded-xl font-bold hover:bg-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      View Available Slots
                    </button>
                  )}
                </div>
              </div>
            </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
          borderRadius: '12px',
          background: '#000',
          color: '#fff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          fontSize: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      />
    </div>
  );
};

export default TrainerDetail; 