import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await apiService.getTrainers();
        setTrainers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Expert Trainers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div
            key={trainer._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl group border border-gray-100"
          >
            <img 
              src={
                trainer.image && trainer.image !== '/api/placeholder/300/300'
                  ? trainer.image
                  : 'https://via.placeholder.com/300x300?text=No+Image'
              }
              alt={`Photo of ${trainer.name}`} 
              className="w-full h-64 object-cover group-hover:opacity-90 transition duration-200"
            />
            <div className="p-6 flex flex-col min-h-[220px] h-full">
              <h2 className="text-xl font-semibold mb-2 text-blue-700 group-hover:text-blue-900 transition">{trainer.name}</h2>
              <p className="text-gray-600 mb-2">{trainer.specialization || <span className="italic text-gray-400">No specialization</span>}</p>
              <p className="text-gray-500 mb-4">{trainer.experience || <span className="italic text-gray-400">No experience info</span>}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-blue-600">
                  {trainer.price ? `$${trainer.price}/session` : 'Price N/A'}
                </span>
                <Link 
                  to={`/trainer/${trainer._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`View details for ${trainer.name}`}
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerList; 