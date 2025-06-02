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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-rose-600 text-center p-8 bg-black rounded-xl shadow-xl border border-white/10">
          <div className="text-rose-500 text-5xl mb-4">⚠️</div>
          <p className="text-xl font-bold text-white mb-4">{error}</p>
          <button
            onClick={fetchTrainers}
            className="mt-4 px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all duration-300"
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
    <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-white mb-4">
            Meet Our Expert Trainers
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Find the perfect trainer to help you achieve your fitness goals. Filter by specialization, rating, and price to find your ideal match.
          </p>
        </div>
      
        {/* Filters Section */}
        <div className="bg-white/5 rounded-2xl shadow-xl p-8 mb-16 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-6">Filter Trainers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Specialization</label>
              <select
                className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              >
                <option value="" className="text-gray-900">All Specializations</option>
                {allSpecializations.map(spec => (
                  <option key={spec} value={spec} className="text-gray-900">{spec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Minimum Rating</label>
              <select
                className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
              >
                <option value="0" className="text-gray-900">All Ratings</option>
                <option value="3" className="text-gray-900">3+ Stars</option>
                <option value="4" className="text-gray-900">4+ Stars</option>
                <option value="4.5" className="text-gray-900">4.5+ Stars</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Price Range</label>
              <select
                className="w-full px-4 py-3 bg-white/10 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              >
                <option value="Infinity" className="text-gray-900">Any Price</option>
                <option value="50" className="text-gray-900">Under Nrs 50</option>
                <option value="100" className="text-gray-900">Under Nrs 100</option>
                <option value="150" className="text-gray-900">Under Nrs 150</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500"></div>
              <div className="mt-4 text-center text-gray-600">Loading trainers...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-rose-100">
              <div className="text-rose-500 text-5xl mb-4">⚠️</div>
              <p className="text-xl font-bold text-gray-800 mb-4">{error}</p>
              <button
                onClick={fetchTrainers}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Trainer Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrainers.map((trainer, idx) => (
                <TrainerCard key={trainer._id || idx} trainer={trainer} />
              ))}
            </div>

            {/* No Results State */}
            {filteredTrainers.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-xl font-bold text-white mb-2">No trainers found</p>
                <p className="text-gray-400">
                  Try adjusting your filters to find more trainers
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrainerList; 