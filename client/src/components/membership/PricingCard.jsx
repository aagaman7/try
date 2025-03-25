import React from 'react';
import axios from 'axios';

const PricingCard = ({ pkg, onSelect }) => {
  const handleSelectPackage = async () => {
    try {
      // Implement booking logic 
      const response = await axios.post('/api/bookings', {
        packageId: pkg.id,
        // You might want to pass additional user info from context/state
        userId: null, // Replace with actual user ID
      }, {
        headers: {
          'Authorization': localStorage.getItem('token') // Assuming token is stored in localStorage
        }
      });

      // Handle successful booking 
      onSelect(response.data);
    } catch (error) {
      console.error('Error booking package:', error.response?.data || error.message);
      // Implement error handling (e.g., show error message to user)
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105 border-2 ${
      pkg.popular ? 'border-blue-500' : 'border-transparent'
    }`}>
      <div className={`p-6 bg-${pkg.color}-50`}>
        <h3 className={`text-xl font-bold text-${pkg.color}-800 mb-2`}>{pkg.name}</h3>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900">${pkg.price}</span>
          <span className="ml-1 text-xl font-medium text-gray-500">/{pkg.period}</span>
        </div>
        {pkg.popular && (
          <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium inline-block">
            Most Popular
          </div>
        )}
      </div>
      <div className="p-6 bg-white">
        <ul className="space-y-4">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg 
                className={`h-6 w-6 text-${pkg.color}-500 mr-3`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <button 
          onClick={handleSelectPackage}
          className={`mt-6 w-full px-4 py-3 bg-${pkg.color}-600 text-white rounded-md hover:bg-${pkg.color}-700 transition duration-300`}
        >
          Select Package
        </button>
      </div>
    </div>
  );
};

export default PricingCard;