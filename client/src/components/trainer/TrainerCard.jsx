import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';

const TrainerCard = ({ trainer }) => {
  if (!trainer) return null;

  const {
    image = '',
    name = 'Unknown',
    averageRating = 0,
    totalRatings = 0,
    specializations = [],
    qualifications = [],
    pricePerSession = 0,
    _id = ''
  } = trainer;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 text-gray-600">{Number(averageRating).toFixed(1)}</span>
            <span className="ml-1 text-gray-500">({totalRatings})</span>
          </div>
        </div>
        
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Specializations:</h4>
          <div className="flex flex-wrap gap-1">
            {(specializations || []).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Qualifications:</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {(qualifications || []).map((qual, index) => (
              <li key={index}>{qual}</li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-blue-600">
            ${pricePerSession}/session
          </span>
          <Link
            to={`/trainers/${_id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard; 