// pages/TrainerBookingPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const TrainerBookingPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch all trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const data = await apiService.get('trainers');
        setTrainers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load trainers. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Handle trainer selection
  const handleTrainerSelect = (trainer) => {
    setSelectedTrainer(trainer);
    setSelectedDate('');
    setSelectedTime('');
    
    if (trainer.availability && trainer.availability.length > 0) {
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
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (selectedTrainer) {
      const dateAvailability = selectedTrainer.availability.find(a => a.date === date);
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

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to book a session');
      navigate('/login');
      return;
    }
    
    if (!selectedTrainer || !selectedDate || !selectedTime) {
      toast.error('Please select a trainer, date, and time');
      return;
    }
    
    try {
      setLoading(true);
      
      const bookingData = {
        trainerId: selectedTrainer._id,
        date: selectedDate,
        time: selectedTime,
        notes
      };
      
      await apiService.post('trainers/book', bookingData);
      
      toast.success('Session booked successfully!');
      navigate('/dashboard');
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

  if (loading && trainers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book a Trainer</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book a Trainer</h1>
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book a Trainer</h1>
      
      {/* Trainer Selection Section */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Select a Trainer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <div 
              key={trainer._id}
              className={`border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                selectedTrainer && selectedTrainer._id === trainer._id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleTrainerSelect(trainer)}
            >
              <div className="h-48 bg-gray-200">
                <img 
                  src={trainer.image || "/api/placeholder/300/300"} 
                  alt={trainer.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{trainer.name}</h3>
                <p className="text-gray-600">{trainer.specialization}</p>
                <p className="text-gray-700 mt-2">{trainer.experience} Experience</p>
                <p className="font-semibold text-blue-600 mt-1">{trainer.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {selectedTrainer && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">About {selectedTrainer.name}</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <p className="mb-4">{selectedTrainer.bio}</p>
            <h3 className="font-semibold mb-2">Qualifications:</h3>
            <ul className="list-disc pl-5 mb-4">
              {selectedTrainer.qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
            <p>{selectedTrainer.description}</p>
          </div>
        </section>
      )}
      
      {/* Booking Form */}
      {selectedTrainer && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Book Your Session</h2>
          
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Date:</label>
            {availableDates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableDates.map((dateObj) => (
                  <button
                    type="button"
                    key={dateObj.date}
                    className={`p-3 border rounded-md text-left ${
                      selectedDate === dateObj.date
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-100'
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
              <div className="text-yellow-600 p-3 bg-yellow-50 rounded-md">
                No available dates for this trainer.
              </div>
            )}
          </div>
          
          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Select Time:</label>
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      type="button"
                      key={time}
                      className={`py-2 px-3 border rounded-md ${
                        selectedTime === time
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-yellow-600 p-3 bg-yellow-50 rounded-md">
                  No available times for selected date.
                </div>
              )}
            </div>
          )}
          
          {/* Notes Section */}
          {selectedTime && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="notes">
                Additional Notes (Optional):
              </label>
              <textarea
                id="notes"
                className="w-full p-3 border rounded-md focus:ring focus:ring-blue-200"
                rows="4"
                placeholder="Add any specific requirements, goals, or health concerns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedTrainer || !selectedDate || !selectedTime || loading}
              className={`px-6 py-2 rounded-md ${
                !selectedTrainer || !selectedDate || !selectedTime || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TrainerBookingPage;