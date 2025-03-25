import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PricingCard from '../components/membership/PricingCard';
import CustomPackage from '../components/membership/CustomPackage';

const Membership = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomPackage, setShowCustomPackage] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/packages');
        
        // Transform the data to match the component's expected format
        const formattedPackages = response.data.map((membership, index) => ({
          id: membership._id,
          name: membership.name,
          price: membership.price,
          period: 'month',
          features: membership.services.map(service => service.name), // Assuming services have a name
          popular: index === 1, // Set the middle option as popular
          color: getColorForPackage(index),
        }));
        
        setPackages(formattedPackages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError('Failed to load membership options. Please try again later.');
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  // Helper function to assign colors based on package index
  const getColorForPackage = (index) => {
    const colors = ['gray', 'blue', 'indigo'];
    return colors[index % colors.length];
  };

  const handlePackageSelect = (booking) => {
    setBookingSuccess(`Successfully booked ${booking.package.name} package!`);
    // You might want to reset this message after a few seconds
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  return (
    <div>
      {/* ... existing code ... */}
      
      {bookingSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {bookingSuccess}
        </div>
      )}

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ... existing code ... */}

          {loading ? (
            <div className="mt-12 text-center">
              <p className="text-xl text-gray-600">Loading membership options...</p>
            </div>
          ) : error ? (
            <div className="mt-12 text-center">
              <p className="text-xl text-red-600">{error}</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
              {packages.map((pkg) => (
                <PricingCard 
                  key={pkg.id} 
                  pkg={pkg} 
                  onSelect={handlePackageSelect} 
                />
              ))}
            </div>
          )}

          {/* ... rest of the existing code ... */}
        </div>
      </div>
    </div>
  );
};

export default Membership;