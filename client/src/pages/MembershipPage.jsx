import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from 'lucide-react';
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
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Membership
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Select a package that fits your fitness goals
          </p>
        </div>

        {/* Payment Interval Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['Monthly', '3 Months', 'Yearly'].map(interval => (
              <button
                key={interval}
                type="button"
                onClick={() => setPaymentInterval(interval)}
                className={`
                  px-4 py-2 text-sm font-medium 
                  ${paymentInterval === interval 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'}
                  border border-gray-200 
                  ${interval === 'Monthly' ? 'rounded-l-lg' : ''}
                  ${interval === 'Yearly' ? 'rounded-r-lg' : ''}
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
                border-2 rounded-lg p-6 cursor-pointer transition-all 
                ${selectedPackage?._id === pkg._id 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'}
              `}
            >
              <h3 className="text-xl font-bold mb-4">{pkg.name}</h3>
              <p className="text-gray-600 mb-4">{pkg.description}</p>
              <div className="text-2xl font-extrabold text-blue-600 mb-4">
                ${pkg.basePrice}/month
              </div>
              <div className="space-y-2">
                {pkg.includedServices.map(serviceId => {
                  const service = services.find(s => s._id === serviceId);
                  return service ? (
                    <div key={serviceId} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                      <span>{service.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Services Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Add Custom Services</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {services.filter(s => s.active).map(service => (
              <div 
                key={service._id}
                className={`
                  border rounded-lg p-4 cursor-pointer flex items-center 
                  ${selectedServices.includes(service._id) 
                    ? 'bg-blue-50 border-blue-600' 
                    : 'hover:bg-gray-50'}
                `}
                onClick={() => toggleService(service._id)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedServices.includes(service._id)}
                  readOnly
                  className="mr-3"
                />
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-gray-500 text-sm">${service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="mt-12 bg-gray-100 p-6 rounded-lg text-center">
          <h3 className="text-2xl font-bold mb-4">Total Price</h3>
          <div className="text-3xl font-extrabold text-blue-600">
            ${calculateTotalPrice()}
          </div>
          <p className="text-gray-600 mt-2">
            {paymentInterval} Membership
          </p>
          <button
            onClick={handleProceedToBooking}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Proceed to Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;