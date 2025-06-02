import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { FaCrown, FaDumbbell, FaRegClock, FaUsers, FaHeart, FaRunning, FaSwimmer, FaAppleAlt, FaCheck } from 'react-icons/fa';

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

  const handlePackageSelect = (selectedPackage) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { 
        state: { 
          redirectTo: `/booking/${selectedPackage._id}`,
          selectedPackage: selectedPackage
        } 
      });
    } else {
      navigate(`/booking/${selectedPackage._id}`, {
        state: { selectedPackage: selectedPackage }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent"></div>
          <p className="mt-4 text-black font-medium tracking-wide">Loading membership options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
          <div className="text-black mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-black mb-4 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-900 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-yellow-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-gray-800">No membership packages are currently available. Please check back later.</p>
        </div>
      </div>
    );
  }

  const packageIcons = {
    'Basic': <FaDumbbell className="h-10 w-10" />,
    'Premium': <FaCrown className="h-10 w-10" />,
    'Elite': <FaHeart className="h-10 w-10" />,
  };

  const serviceIcons = {
    'Personal Training': <FaUsers className="h-8 w-8" />,
    'Yoga': <FaRunning className="h-8 w-8" />,
    'Swimming': <FaSwimmer className="h-8 w-8" />,
    'Nutrition': <FaAppleAlt className="h-8 w-8" />,
    'default': <FaDumbbell className="h-8 w-8" />
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black pt-32 pb-48">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-none">
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Fitness</span> Journey
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light">
              Transform your life with our premium membership options
            </p>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: '-96px' }}>
        <div className="grid gap-8 md:grid-cols-3">
          {packages.filter(pkg => pkg.active).map((pkg) => (
            <div 
              key={pkg._id} 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col relative z-10"
            >
              <div className={`px-8 pt-12 pb-8 text-center ${
                pkg.name === 'Premium' ? 'bg-gradient-to-br from-purple-600 to-pink-600' :
                pkg.name === 'Elite' ? 'bg-gradient-to-br from-black to-gray-800' :
                'bg-gradient-to-br from-gray-700 to-gray-800'
              }`}>
                <div className="inline-block p-4 rounded-2xl mb-6 text-white">
                  {packageIcons[pkg.name] || <FaDumbbell className="h-10 w-10" />}
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{pkg.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-lg font-normal text-gray-300">NPR</span>
                  <span className="text-5xl font-black text-white mx-2">
                    {pkg.basePrice.toLocaleString()}
                  </span>
                  <span className="text-gray-300 font-light">/mo</span>
                </div>
              </div>
              
              <div className="p-8 flex-grow bg-white">
                <p className="text-gray-600 text-lg mb-8">{pkg.description}</p>
                
                {pkg.includedServices && pkg.includedServices.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-bold text-black text-lg">Features:</p>
                    <ul className="space-y-4">
                      {pkg.includedServices.map(service => (
                        <li key={service._id} className="flex items-center text-gray-700">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                            pkg.name === 'Premium' ? 'bg-purple-100 text-purple-600' :
                            pkg.name === 'Elite' ? 'bg-black text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <FaCheck className="h-3 w-3" />
                          </div>
                          <span className="ml-3 font-medium">{service.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-8 pt-0 bg-white">
                <button
                  onClick={() => handlePackageSelect(pkg)}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    pkg.name === 'Premium' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' :
                    pkg.name === 'Elite' ? 'bg-black text-white hover:bg-gray-900' :
                    'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  Choose {pkg.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      {services.length > 0 && (
        <div className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-black mb-4">
                Premium Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Enhance your fitness journey with our specialized services
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.filter(service => service.active).map((service) => (
                <div 
                  key={service._id} 
                  className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center mb-8">
                    <div className="p-4 bg-black rounded-lg text-white mr-4">
                      {serviceIcons[service.name] || serviceIcons.default}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black">{service.name}</h3>
                      <p className="text-purple-600 font-bold text-lg">
                        NPR {service.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg mb-8">{service.description}</p>
                  <button className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-all duration-300">
                    Learn More
                  </button>
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