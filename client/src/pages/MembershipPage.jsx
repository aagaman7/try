import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, Star, TrendingUp } from 'lucide-react';
import apiService from '../services/apiService';

const MembershipPage = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [paymentInterval, setPaymentInterval] = useState('Monthly');
  const [discounts, setDiscounts] = useState([]);
  const navigate = useNavigate();

  // Fetch packages, services, and discounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesResponse = await apiService.get('packages');
        const servicesResponse = await apiService.get('services');
        const discountsResponse = await apiService.get('discounts');

        setPackages(packagesResponse);
        setServices(servicesResponse);
        setDiscounts(discountsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;

    let basePrice = selectedPackage.basePrice;
    
    // Add custom services
    const servicesPrice = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);

    // Apply interval multiplier
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    let totalPrice = (basePrice + servicesPrice) * intervalMultiplier[paymentInterval];

    // Apply discount
    const applicableDiscount = discounts.find(
      d => d.paymentInterval === paymentInterval && d.active
    );
    
    if (applicableDiscount) {
      totalPrice *= (1 - (applicableDiscount.percentage / 100));
    }

    return Math.round(totalPrice);
  };

  // Handle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Proceed to booking
  const handleProceedToBooking = () => {
    if (!selectedPackage) {
      alert('Please select a package');
      return;
    }

    navigate('/booking', {
      state: {
        packageId: selectedPackage._id,
        customServices: selectedServices,
        totalPrice: calculateTotalPrice(),
        paymentInterval
      }
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4 flex justify-center items-center">
            <TrendingUp className="mr-3 text-blue-600" size={36} />
            Choose Your Fitness Journey
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Unlock your potential with personalized membership options designed to transform your fitness goals.
          </p>
        </div>

        {/* Payment Interval Selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-white shadow-md">
            {['Monthly', '3 Months', 'Yearly'].map(interval => (
              <button
                key={interval}
                type="button"
                onClick={() => setPaymentInterval(interval)}
                className={`
                  px-6 py-3 text-sm font-semibold transition-all duration-300
                  ${paymentInterval === interval 
                    ? 'bg-blue-600 text-white rounded-full shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'}
                `}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map(pkg => (
            <div 
              key={pkg._id}
              onClick={() => setSelectedPackage(pkg)}
              className={`
                border-2 rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 
                ${selectedPackage?._id === pkg._id 
                  ? 'border-blue-600 bg-blue-50 shadow-2xl' 
                  : 'border-gray-200 bg-white hover:border-blue-300 shadow-lg'}
              `}
            >
              {selectedPackage?._id === pkg._id && (
                <div className="absolute top-4 right-4">
                  <Star className="text-blue-600 fill-blue-600" size={24} />
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{pkg.name}</h3>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="text-3xl font-extrabold text-blue-600 mb-6">
                ${pkg.basePrice}
                <span className="text-base text-gray-500 ml-1">/month</span>
              </div>
              <div className="space-y-3">
                {pkg.includedServices.map(serviceId => {
                  const service = services.find(s => s._id === serviceId);
                  return service ? (
                    <div key={serviceId} className="flex items-center">
                      <CheckIcon className="w-6 h-6 text-green-500 mr-3" />
                      <span className="text-gray-700">{service.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Services Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">
            Customize Your Experience
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {services.filter(s => s.active).map(service => (
              <div 
                key={service._id}
                className={`
                  border-2 rounded-lg p-5 cursor-pointer flex items-center transition-all 
                  ${selectedServices.includes(service._id) 
                    ? 'bg-blue-50 border-blue-600' 
                    : 'hover:bg-gray-50 border-gray-200'}
                `}
                onClick={() => toggleService(service._id)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedServices.includes(service._id)}
                  readOnly
                  className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900">{service.name}</h4>
                  <p className="text-gray-500 text-sm">${service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="mt-16 bg-white rounded-xl shadow-2xl p-8 text-center">
          <h3 className="text-3xl font-bold mb-6 text-gray-900">
            Your Total Investment
          </h3>
          <div className="text-5xl font-extrabold text-blue-600 mb-4">
            ${calculateTotalPrice()}
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            {paymentInterval} Membership • All-Inclusive
          </p>
          <button
            onClick={handleProceedToBooking}
            className="w-full bg-blue-600 text-white py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Your Fitness Transformation
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;