import React from 'react';
import { Link } from 'react-router-dom';

const TrainerList = ({ trainers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainers.map((trainer) => (
        <div key={trainer._id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={trainer.image} 
            alt={trainer.name} 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{trainer.name}</h3>
            <p className="text-gray-600 mb-2">{trainer.specialization}</p>
            <p className="text-sm text-gray-500 mb-4">{trainer.experience} Experience</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-blue-600">${trainer.price}/session</span>
              <Link 
                to={`/trainers/${trainer._id}`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrainerList; 