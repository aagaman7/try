import React from 'react';
import { StarIcon } from 'lucide-react';

const TrainerCard = ({ trainer, onViewDetails, onBookNow }) => {
  // Calculate average rating
  const calculateAverageRating = () => {
    if (!trainer.reviews || trainer.reviews.length === 0) {
      return 0;
    }
    
    const totalRating = trainer.reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / trainer.reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Trainer Image */}
      <div className="relative h-56 bg-gray-200">
        <img 
          src={trainer.image || "/api/placeholder/300/300"} 
          alt={trainer.name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Trainer Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{trainer.name}</h3>
            <p className="text-gray-600">{trainer.specialization}</p>
          </div>
          
          <div className="flex items-center">
            <StarIcon size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="ml-1 text-sm">
              {avgRating > 0 ? avgRating : 'New'}
              {trainer.reviews && trainer.reviews.length > 0 && 
                <span className="text-gray-500 text-xs"> ({trainer.reviews.length})</span>
              }
            </span>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-gray-700 font-medium">Experience: {trainer.experience}</p>
          <p className="text-gray-700 font-medium mt-1">Price: ${trainer.price}/session</p>
        </div>
        
        <div className="mt-3 line-clamp-2 text-sm text-gray-600">
          {trainer.bio}
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={onViewDetails}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition"
          >
            View Details
          </button>
          
          <button
            onClick={onBookNow}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;