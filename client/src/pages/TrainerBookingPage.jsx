import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Main Trainer Booking Page Component
const TrainerBookingPage = () => {
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [expandedTrainerId, setExpandedTrainerId] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Sample trainer data (would come from your backend)
  const trainers = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialization: "Weight Loss, Nutrition",
      image: "/api/placeholder/300/300",
      experience: "8 years",
      price: "$60 / session",
      bio: "Fitness enthusiast who believes in sustainable lifestyle changes rather than quick fixes.",
      description: "Sarah is a certified personal trainer specializing in weight loss and nutrition. With 8 years of experience, she has helped hundreds of clients achieve their fitness goals through personalized training programs and nutrition plans. Sarah holds certifications in Personal Training (NASM), Nutrition Coaching, and Weight Management.",
      qualifications: ["NASM Certified", "Nutrition Coach", "Weight Management Specialist"],
      reviews: [
        { id: 1, rating: 5, comment: "Sarah helped me lose 30 pounds in 6 months!" },
        { id: 2, rating: 4, comment: "Great trainer, very knowledgeable about nutrition." }
      ],
      availableTimes: {
        "2025-03-12": ["08:00 AM", "10:00 AM", "02:00 PM", "04:00 PM"],
        "2025-03-13": ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM"],
        "2025-03-14": ["08:00 AM", "12:00 PM", "05:00 PM"]
      }
    },
    {
      id: 2,
      name: "Mike Torres",
      specialization: "Strength Training, Bodybuilding",
      image: "/api/placeholder/300/300",
      experience: "10 years",
      price: "$75 / session",
      bio: "Former competitive bodybuilder passionate about helping others build strength and confidence.",
      description: "Mike is a former competitive bodybuilder with 10 years of coaching experience. He specializes in strength training and muscle building, with custom programs designed for each client's body type and goals. Mike's approach combines traditional and modern techniques to help clients build strength and muscle efficiently.",
      qualifications: ["ISSA Certified", "Powerlifting Coach", "Sports Nutrition"],
      reviews: [
        { id: 1, rating: 5, comment: "Mike helped me add 20lbs of muscle in a year!" },
        { id: 2, rating: 5, comment: "Amazing coach, worth every penny." }
      ],
      availableTimes: {
        "2025-03-12": ["09:00 AM", "11:00 AM", "03:00 PM"],
        "2025-03-13": ["10:00 AM", "02:00 PM", "04:00 PM"],
        "2025-03-14": ["08:00 AM", "01:00 PM", "05:00 PM"]
      }
    },
    {
      id: 3,
      name: "Lisa Chen",
      specialization: "Yoga, Flexibility, Mobility",
      image: "/api/placeholder/300/300",
      experience: "7 years",
      price: "$55 / session",
      bio: "Yoga practitioner who believes that flexibility is the foundation of all movement.",
      description: "Lisa is a 500-hour certified yoga instructor with additional training in mobility and flexibility work. She specializes in helping clients improve their range of motion, reduce pain from sitting, and develop better movement patterns. Lisa's sessions combine elements of yoga, mobility drills, and corrective exercises.",
      qualifications: ["RYT-500 Certified", "Mobility Specialist", "Corrective Exercise"],
      reviews: [
        { id: 1, rating: 4, comment: "Lisa helped me touch my toes for the first time in 20 years!" },
        { id: 2, rating: 5, comment: "My posture has improved significantly after just 5 sessions." }
      ],
      availableTimes: {
        "2025-03-12": ["08:00 AM", "10:00 AM", "04:00 PM"],
        "2025-03-13": ["09:00 AM", "01:00 PM", "03:00 PM"],
        "2025-03-14": ["11:00 AM", "02:00 PM", "05:00 PM"]
      }
    }
  ];

  useEffect(() => {
    setAvailableDates(getNextDays());
  }, []);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get next 14 days for date selection
  const getNextDays = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i <= 14; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      
      const formattedDate = nextDay.toISOString().split('T')[0];
      const displayDate = nextDay.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      dates.push({ value: formattedDate, display: displayDate });
    }
    
    return dates;
  };

  const handleBookSession = (trainer, time) => {
    setSelectedTrainer({...trainer, selectedTime: time, selectedDate: selectedDate});
    setShowBookingModal(true);
  };

  const toggleExpandTrainer = (trainerId) => {
    if (expandedTrainerId === trainerId) {
      setExpandedTrainerId(null);
    } else {
      setExpandedTrainerId(trainerId);
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
  };

  const changeDate = (date) => {
    setSelectedDate(date);
  };

  const slideLeft = () => {
    if (sliderPosition > 0) {
      setSliderPosition(sliderPosition - 1);
    }
  };

  const slideRight = () => {
    if (sliderPosition < availableDates.length - 5) {
      setSliderPosition(sliderPosition + 1);
    }
  };

  const visibleDates = availableDates.slice(sliderPosition, sliderPosition + 5);

  return (
    <div className="flex justify-center bg-gray-50 min-h-screen pt-20"> {/* Added pt-20 to account for navbar */}
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8"> {/* Matches navbar max-width */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Book a Specialist Training Session</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Choose a trainer and book your personalized fitness session with our expert team</p>
        </div>
        
        {/* Date Selector with Slider */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Select a Date</h2>
          <div className="relative">
            <div className="flex items-center justify-between">
              <button 
                onClick={slideLeft}
                className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                disabled={sliderPosition === 0}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex justify-between items-center mx-2 overflow-hidden w-full">
                {visibleDates.map(date => (
                  <button
                    key={date.value}
                    onClick={() => changeDate(date.value)}
                    className={`px-4 py-3 mx-1 rounded-lg whitespace-nowrap flex-1 font-medium transition-all duration-200 ${
                      selectedDate === date.value 
                        ? 'bg-blue-600 text-white transform scale-105 shadow-md' 
                        : 'bg-white border hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs opacity-80">{date.display.split(',')[0]}</span>
                      <span className="text-lg">{date.display.split(' ')[1]} {date.display.split(' ')[2]}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={slideRight}
                className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                disabled={sliderPosition >= availableDates.length - 5}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Trainers List */}
        <div className="space-y-6">
          {trainers.map((trainer) => (
            <div 
              key={trainer.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              {/* Trainer Basic Info */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="md:w-1/4 mb-4 md:mb-0">
                    <div className="relative w-32 h-32 mx-auto">
                      <img 
                        src={trainer.image} 
                        alt={`${trainer.name} - Specialist Trainer`} 
                        className="w-32 h-32 object-cover rounded-full mx-auto transition-all duration-300 hover:scale-105 shadow-md"
                      />
                      <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-75"></div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/4">
                    <h2 className="text-2xl font-bold text-gray-800">{trainer.name}</h2>
                    <p className="text-blue-600 font-medium">{trainer.specialization}</p>
                    <p className="text-gray-600 mb-2">{trainer.experience} experience</p>
                    <p className="mb-2 text-gray-700">{trainer.bio}</p>
                    
                    <button 
                      onClick={() => toggleExpandTrainer(trainer.id)}
                      className="flex items-center text-blue-600 font-medium mt-2 hover:text-blue-800 transition-colors"
                    >
                      {expandedTrainerId === trainer.id ? (
                        <>Hide Details <ChevronUp size={16} className="ml-1" /></>
                      ) : (
                        <>Show Details <ChevronDown size={16} className="ml-1" /></>
                      )}
                    </button>
                  </div>
                  
                  <div className="md:w-1/4 mt-4 md:mt-0 text-center">
                    <p className="text-2xl font-bold text-gray-800">{trainer.price}</p>
                    <p className="text-gray-600 mb-2">60 minutes session</p>
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedTrainerId === trainer.id && (
                <div className="px-6 pb-4 border-t border-gray-100 pt-4 bg-gray-50 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">About {trainer.name}</h3>
                      <p className="text-gray-700 mb-4">{trainer.description}</p>
                      
                      <h3 className="font-bold text-lg mb-2 text-gray-800">Qualifications</h3>
                      <ul className="space-y-1 mb-4">
                        {trainer.qualifications.map((qual, index) => (
                          <li key={index} className="text-gray-700 flex items-center">
                            <span className="mr-2 text-blue-500">•</span>
                            {qual}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">Client Reviews</h3>
                      <div className="space-y-3">
                        {trainer.reviews.map((review) => (
                          <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm transition-transform hover:transform hover:scale-102">
                            <div className="flex mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Available Time Slots */}
              <div className="px-6 pb-6 border-t border-gray-100 pt-4 bg-blue-50">
                <h3 className="font-bold text-lg mb-3 text-gray-800">
                  Available Sessions on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                
                {trainer.availableTimes[selectedDate] && trainer.availableTimes[selectedDate].length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {trainer.availableTimes[selectedDate].map((time) => (
                      <button
                        key={time}
                        onClick={() => handleBookSession(trainer, time)}
                        className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-500 hover:text-white rounded-lg py-3 px-4 flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <Clock size={16} className="mr-2" />
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-gray-500 italic">No available sessions on this date.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showBookingModal && selectedTrainer && (
          <BookingModal 
            trainer={selectedTrainer} 
            onClose={closeModal} 
          />
        )}
      </div>
    </div>
  );
};

// Session Booking Modal Component
const BookingModal = ({ trainer, onClose }) => {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to book session
    setTimeout(() => {
      // Here you would send booking data to your backend
      alert(`Session booked with ${trainer.name} on ${new Date(trainer.selectedDate).toLocaleDateString()} at ${trainer.selectedTime}`);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform transition-all animate-slideIn">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Complete Your Booking</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
            <div className="flex items-start">
              <div className="relative">
                <img 
                  src={trainer.image} 
                  alt={`${trainer.name}`}
                  className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-white shadow-md"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{trainer.name}</h3>
                <p className="text-blue-600">{trainer.specialization}</p>
                <div className="flex items-center mt-2 text-gray-600">
                  <Calendar size={16} className="mr-1" />
                  <span className="mr-3">{new Date(trainer.selectedDate).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</span>
                  <Clock size={16} className="mr-1" />
                  <span>{trainer.selectedTime}</span>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="3"
                placeholder="Any specific concerns or goals you'd like the trainer to know about?"
              ></textarea>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-bold text-lg text-gray-800">{trainer.price}</p>
                  <p className="text-sm text-gray-600">60 minutes session</p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p>Cancellation available up to 24 hours before session</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={onClose}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add these styles to your global CSS
const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.hover:transform {
  transition: transform 0.2s ease-out;
}

.hover:scale-102:hover {
  transform: scale(1.02);
}
`;

export default TrainerBookingPage;