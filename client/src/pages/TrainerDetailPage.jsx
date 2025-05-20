import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import TrainerDetails from '../components/TrainerDetails';
import { useAuth } from '../context/AuthContext';

const TrainerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingProcessing, setBookingProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setLoading(true);
        const data = await apiService.get(`trainers/${id}`);
        setTrainer(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load trainer details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [id]);

  const handleBooking = async (bookingData) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setBookingProcessing(true);
      setBookingError(null);

      // Create booking
      const response = await apiService.post('trainers/book', {
        trainerId: id,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes
      });

      // Confirm payment with Stripe
      const { error: stripeError } = await bookingData.stripe.confirmCardPayment(
        response.clientSecret,
        {
          payment_method: {
            card: bookingData.elements.getElement('card')
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Confirm booking with our backend
      await apiService.put(`trainers/bookings/${response.booking._id}/confirm-payment`);

      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setBookingError(err.message || 'Failed to book trainer session');
    } finally {
      setBookingProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-500">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        {bookingSuccess && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex justify-between">
              <h3 className="font-bold text-emerald-800">Booking Successful!</h3>
            </div>
            <p className="mt-1 text-emerald-700">
              Your trainer session has been booked. Redirecting to dashboard...
            </p>
          </div>
        )}

        {bookingError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex justify-between">
              <h3 className="font-bold text-rose-800">Booking Failed</h3>
              <button 
                onClick={() => setBookingError(null)}
                className="text-rose-600 hover:text-rose-800 transition-colors duration-200"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-rose-700">{bookingError}</p>
          </div>
        )}

        <TrainerDetails 
          trainer={trainer} 
          onBook={handleBooking}
          isProcessing={bookingProcessing}
        />
      </div>
    </div>
  );
};

export default TrainerDetailPage; 