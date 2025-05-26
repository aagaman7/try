import React, { useState, useEffect } from 'react';
import TrainerCard from '../components/trainer/TrainerCard';
import apiService from '../services/apiService';

const TrainerList = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: '',
    minRating: 0,
    maxPrice: Infinity
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTrainers();
      setTrainers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trainers. Please try again later.');
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Defensive filtering for missing/invalid fields
  const filteredTrainers = trainers
    .filter(trainer =>
      trainer &&
      Array.isArray(trainer.specializations) &&
      typeof trainer.averageRating === 'number' &&
      typeof trainer.pricePerSession === 'number'
    )
    .filter(trainer => {
      return (
        (filters.specialization === '' ||
          trainer.specializations.includes(filters.specialization)) &&
        trainer.averageRating >= filters.minRating &&
        trainer.pricePerSession <= filters.maxPrice
      );
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button
            onClick={fetchTrainers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Defensive specializations for filter dropdown
  const allSpecializations = Array.from(
    new Set(
      trainers
        .filter(t => Array.isArray(t.specializations))
        .flatMap(t => t.specializations)
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Trainers</h1>
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="p-2 border rounded-md"
          value={filters.specialization}
          onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
        >
          <option value="">All Specializations</option>
          {allSpecializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded-md"
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
        >
          <option value="0">Minimum Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>

        <select
          className="p-2 border rounded-md"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
        >
          <option value="Infinity">Max Price</option>
          <option value="50">Under $50</option>
          <option value="100">Under $100</option>
          <option value="150">Under $150</option>
        </select>
      </div>

      {/* Trainer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer, idx) => (
          <TrainerCard key={trainer._id || idx} trainer={trainer} />
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No trainers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerList; 