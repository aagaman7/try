import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const TrainerCard = ({ trainer }) => {
  if (!trainer) return null;

  const {
    image = null,
    name = 'Unknown Trainer',
    averageRating = 0,
    totalRatings = 0,
    specializations = [],
    qualifications = [],
    pricePerSession = 0,
    _id = '',
    gender = 'male'
  } = trainer;

  const trainerImage = image || `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`;

  return (
    <div className="bg-black rounded-2xl shadow-xl overflow-hidden border border-white/10 transform transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-64">
        <img
          className="w-full h-full object-cover"
          src={trainerImage}
          alt={name}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-400 text-sm mb-3">{specializations.join(', ')}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={averageRating >= i + 1 ? '' : 'text-gray-600'} />
            ))}
          </div>
          <span className="ml-2 text-gray-300 text-sm">{averageRating.toFixed(1)}</span>
        </div>
        
        <div className="mb-4">
          <span className="text-rose-500 font-bold text-lg">Nrs {pricePerSession.toFixed(2)}</span>
          <span className="text-gray-400 text-sm"> / session</span>
        </div>

        <Link
          to={`/trainers/${_id}`}
          className="block w-full text-center px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all duration-300"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default TrainerCard; 