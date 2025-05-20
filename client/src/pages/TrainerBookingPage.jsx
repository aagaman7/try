import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

// Components
import TrainerCard from '../components/trainer/TrainerCard';
import TrainerDetailsModal from '../components/trainer/TrainerDetailsModal';
import BookingModal from '../components/trainer/BookingModal';
import LoadingSpinner from '../components/trainer/LoadingSpinner';

const TrainerBookingPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  // Fetch trainers on component mount
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const trainersData = await apiService.getTrainers();
        setTrainers(trainersData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load trainers');
        toast.error(err.message || 'Failed to load trainers');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const handleViewDetails = (trainer) => {
    setSelectedTrainer(trainer);
    setShowDetailsModal(true);
  };

  const handleBookNow = (trainer) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to book a trainer session');
      navigate('/login', { state: { from: '/trainers' } });
      return;
    }

    setSelectedTrainer(trainer);
    setShowBookingModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
  };

  const handleBookingSuccess = () => {
    closeBookingModal();
    toast.success('Session booked successfully!');
    navigate('/my-bookings');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Our Personal Trainers</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Book a session with one of our experienced trainers to achieve your fitness goals faster.
          Our trainers specialize in various areas and can help you with customized workout plans.
        </p>
      </div>
      
      {trainers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-xl">No trainers available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => (
            <TrainerCard 
              key={trainer._id}
              trainer={trainer}
              onViewDetails={() => handleViewDetails(trainer)}
              onBookNow={() => handleBookNow(trainer)}
            />
          ))}
        </div>
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && showDetailsModal && (
        <TrainerDetailsModal 
          trainer={selectedTrainer}
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
          onBookNow={() => {
            closeDetailsModal();
            handleBookNow(selectedTrainer);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedTrainer && showBookingModal && (
        <BookingModal 
          trainer={selectedTrainer}
          isOpen={showBookingModal}
          onClose={closeBookingModal}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default TrainerBookingPage;