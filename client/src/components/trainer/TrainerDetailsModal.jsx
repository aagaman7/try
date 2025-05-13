import React from 'react';
import { X, Star, Award, Calendar } from 'lucide-react';

const TrainerDetailsModal = ({ trainer, isOpen, onClose, onBookNow }) => {
  if (!isOpen) return null;

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!trainer.reviews || trainer.reviews.length === 0) {
      return 0;
    }
    
    const totalRating = trainer.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / trainer.reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating();

  // Format date for better display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold">Trainer Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Image */}
            <div className="md:w-1/3">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={trainer.image || "/api/placeholder/300/300"} 
                  alt={trainer.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="mt-4 flex items-center">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="ml-2 font-medium">
                  {avgRating > 0 ? `${avgRating}/5` : 'New Trainer'} 
                  {trainer.reviews && trainer.reviews.length > 0 && 
                    <span className="text-gray-500 text-sm"> ({trainer.reviews.length} reviews)</span>
                  }
                </span>
              </div>
              
              <div className="mt-4">
                <div className="text-lg font-semibold">Session Price</div>
                <div className="text-xl text-blue-600 font-bold">${trainer.price}</div>
              </div>
              
              <button
                onClick={onBookNow}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition"
              >
                Book a Session
              </button>
            </div>
            
            {/* Right column - Info */}
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold">{trainer.name}</h3>
              <p className="text-blue-600 font-medium">{trainer.specialization}</p>
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold">Experience</h4>
                <p className="mt-1">{trainer.experience}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-lg font-semibold">About</h4>
                <p className="mt-1 text-gray-700">{trainer.description}</p>
              </div>
              
              {trainer.qualifications && trainer.qualifications.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold flex items-center">
                    <Award size={18} className="mr-2" />
                    Qualifications
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {trainer.qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mt-2 mr-2"></span>
                        <span>{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {trainer.availability && trainer.availability.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold flex items-center">
                    <Calendar size={18} className="mr-2" />
                    Upcoming Availability
                  </h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {trainer.availability.slice(0, 4).map((avail, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="font-medium">{avail.date}</div>
                        <div className="text-sm text-gray-600">
                          {avail.times.length} time slots available
                        </div>
                      </div>
                    ))}
                  </div>
                  {trainer.availability.length > 4 && (
                    <p className="text-sm text-gray-500 mt-2">
                      + {trainer.availability.length - 4} more days available
                    </p>
                  )}
                </div>
              )}
              
              {trainer.reviews && trainer.reviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold">Reviews</h4>
                  <div className="mt-2 space-y-4">
                    {trainer.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="border-b pb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                    {trainer.reviews.length > 3 && (
                      <p className="text-sm text-blue-600 cursor-pointer">
                        View all {trainer.reviews.length} reviews
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailsModal;