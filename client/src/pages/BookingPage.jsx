import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import apiService from '../services/apiService';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [formData, setFormData] = useState({
    timeSlot: '',
    workoutDaysPerWeek: 3,
    goals: []
  });

  const { 
    packageId, 
    customServices = [], 
    totalPrice, 
    paymentInterval 
  } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const bookingData = {
        packageId,
        customServices,
        timeSlot: formData.timeSlot,
        workoutDaysPerWeek: formData.workoutDaysPerWeek,
        goals: formData.goals,
        paymentInterval
      };

      const response = await apiService.post('bookings', bookingData);

      // Confirm payment
      const paymentResult = await stripe.confirmCardPayment(
        response.clientSecret, 
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      // Navigate to confirmation page
      navigate('/confirmation', { 
        state: { 
          booking: response.booking,
          totalPrice 
        } 
      });

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (!packageId) {
    return <div>Please select a membership first</div>;
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center mb-12">
          Complete Your Membership
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Time Slot
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">Select a time slot</option>
              <option value="morning">Morning (6am - 10am)</option>
              <option value="afternoon">Afternoon (12pm - 4pm)</option>
              <option value="evening">Evening (5pm - 9pm)</option>
            </select>
          </div>

          {/* Workout Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workout Days per Week
            </label>
            <input
              type="range"
              name="workoutDaysPerWeek"
              min="1"
              max="7"
              value={formData.workoutDaysPerWeek}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2">
              {formData.workoutDaysPerWeek} days/week
            </div>
          </div>

          {/* Goal Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Fitness Goals
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'].map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`
                    py-2 px-4 rounded-lg transition 
                    ${formData.goals.includes(goal) 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                  `}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Details
            </label>
            <CardElement className="border p-3 rounded-lg" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : `Pay $${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;