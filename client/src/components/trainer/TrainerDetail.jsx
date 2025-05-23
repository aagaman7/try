import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import BookingForm from './BookingForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-publishable-key');

const TrainerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const data = await apiService.getTrainerById(id);
        setTrainer(data);
        console.log(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTrainer();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!trainer) return <div className="text-center">Trainer not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={trainer.image} 
              alt={trainer.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-8">
            <h1 className="text-3xl font-bold mb-4">{trainer.name}</h1>
            <p className="text-gray-600 mb-4">{trainer.specialization}</p>
            <p className="text-gray-500 mb-4">{trainer.experience} years of experience</p>
            <p className="text-lg font-bold mb-4">${trainer.price}/session</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-700">{trainer.bio}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Qualifications</h2>
              <ul className="list-disc list-inside text-gray-700">
                {trainer.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Reviews</h2>
              {trainer.reviews.length > 0 ? (
                <div className="space-y-4">
                  {trainer.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1">{review.rating}/5</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>

            <button
              onClick={() => setShowBookingForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
            >
              Book a Session
            </button>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setShowBookingForm(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              aria-label="Close booking form"
            >
              &times;
            </button>
            <Elements stripe={stripePromise}>
              <BookingForm 
                trainer={trainer} 
                onClose={() => setShowBookingForm(false)}
                onSuccess={() => {
                  setShowBookingForm(false);
                  navigate('/trainer/bookings');
                }}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDetail; 