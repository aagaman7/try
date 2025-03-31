import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const MembershipPage = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch packages and services
        const [packagesResponse, servicesResponse] = await Promise.all([
          apiService.getPackages(),
          apiService.getServices()
        ]);
        
        // Check if responses are arrays (direct data) or objects with data property
        if (Array.isArray(packagesResponse)) {
          setPackages(packagesResponse);
        } else if (packagesResponse?.data) {
          setPackages(packagesResponse.data);
        } else {
          console.warn('Packages data is not in expected format:', packagesResponse);
          setPackages([]);
        }
        
        if (Array.isArray(servicesResponse)) {
          setServices(servicesResponse);
        } else if (servicesResponse?.data) {
          setServices(servicesResponse.data);
        } else {
          console.warn('Services data is not in expected format:', servicesResponse);
          setServices([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load packages and services. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePackageSelect = (packageId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { redirectTo: `/booking/${packageId}` } });
    } else {
      navigate(`/booking/${packageId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if no packages or services are available
  if (packages.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-700">No membership packages are currently available. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="relative bg-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Choose Your Membership Plan
          </h1>
          <p className="mt-2 text-center text-blue-100">
            Select the perfect package that fits your fitness goals
          </p>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {packages.filter(pkg => pkg.active).map((pkg) => (
            <div 
              key={pkg._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="bg-blue-600 text-white py-4 px-6">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
              </div>
              <div className="p-6">
                <p className="text-3xl font-bold text-gray-800">${pkg.basePrice}<span className="text-sm text-gray-500">/month</span></p>
                <p className="mt-4 text-gray-600 mb-6">{pkg.description}</p>
                
                {pkg.includedServices && pkg.includedServices.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold text-gray-700 mb-2">Included Services:</p>
                    <ul className="text-gray-600">
                      {pkg.includedServices.map(service => (
                        <li key={service._id} className="flex items-center mb-1">
                          <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {service.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={() => handlePackageSelect(pkg._id)}
                  className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Additional Services
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.filter(service => service.active).map((service) => (
                <div key={service._id} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                  <p className="mt-2 text-gray-600">{service.description}</p>
                  <p className="mt-4 text-blue-600 font-bold">${service.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;