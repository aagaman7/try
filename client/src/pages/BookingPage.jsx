import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import PaymentModal from '../components/PaymentModal';

const BookingPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    packageId: packageId,
    customServices: [],
    timeSlot: '',
    workoutDaysPerWeek: 3,
    goals: '',
    paymentInterval: 'Monthly'
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { redirectTo: `/booking/${packageId}` } });
      return;
    }
  
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch package details
        const packageResult = await apiService.getPackageById(packageId);
        console.log('Package Result:', packageResult);
        
        // Check if packageResult has the expected structure
        const packageData = packageResult.package || packageResult.data || packageResult;
        if (!packageData) {
          throw new Error('Package not found');
        }
        setSelectedPackage(packageData);

        // Fetch all services
        const servicesResult = await apiService.getServices();
        const servicesData = servicesResult.services || servicesResult.data || servicesResult;
        if (Array.isArray(servicesData)) {
          setAllServices(servicesData);
        } else {
          console.warn('Services data is not in expected format:', servicesResult);
          setAllServices([]);
        }

        // Fetch discounts
        const discountResult = await apiService.getAllDiscounts({ active: true });
        const discountsData = discountResult.discounts || discountResult.data || discountResult;
        if (Array.isArray(discountsData)) {
          setDiscounts(discountsData);
        } else {
          console.warn('Discounts data is not in expected format:', discountResult);
          setDiscounts([]);
        }

        // Initialize form
        setFormData(prev => ({
          ...prev,
          packageId: packageId
        }));
        
        // Initial price calculation if package data is available
        if (packageData && packageData.basePrice) {
          setTotalPrice(packageData.basePrice);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load booking details. Please try again.');
        setLoading(false);
        console.error('Error fetching booking data:', err);
      }
    };
  
    fetchData();
  }, [packageId, navigate]);

  useEffect(() => {
    if (selectedPackage) {
      calculateTotalPrice();
    }
  }, [formData.customServices, formData.paymentInterval, selectedPackage, allServices]);

  const calculateTotalPrice = () => {
    if (!selectedPackage) return;

    // Base package price
    let price = selectedPackage.basePrice || 0;
    
    // Add prices for custom services if services exist
    if (formData.customServices.length > 0 && allServices && allServices.length > 0) {
      const selectedServices = allServices.filter(service => 
        formData.customServices.includes(service._id)
      );
      
      price += selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
    }
    
    // Apply payment interval multiplier
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };
    
    let finalPrice = price * (intervalMultiplier[formData.paymentInterval] || 1);
    
    // Apply discount if applicable and discounts exist
    if (discounts && discounts.length > 0) {
      const relevantDiscount = discounts.find(d => d.paymentInterval === formData.paymentInterval);
      if (relevantDiscount) {
        setAppliedDiscount(relevantDiscount);
        finalPrice *= (1 - (relevantDiscount.percentage / 100));
      } else {
        setAppliedDiscount(null);
      }
    }
    
    setTotalPrice(finalPrice);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prevState => {
      const customServices = [...prevState.customServices];
      
      if (customServices.includes(serviceId)) {
        return {
          ...prevState,
          customServices: customServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prevState,
          customServices: [...customServices, serviceId]
        };
      }
    });
  };

  const handleGoalChange = (e) => {
    const goals = e.target.value;
    setFormData({
      ...formData,
      goals: goals
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.timeSlot) {
      alert('Please select a time slot');
      return;
    }
    
    if (!formData.goals) {
      alert('Please enter your fitness goals');
      return;
    }
    
    // Transform goals string to array
    const preparedData = {
      ...formData,
      goals: formData.goals.split(',').map(goal => goal.trim())
    };
    
    // Open payment modal with validated data
    setFormData(preparedData);
    setShowPaymentModal(true);
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
            onClick={() => navigate('/membership')} 
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Return to Membership Page
          </button>
        </div>
      </div>
    );
  }

  // Only proceed with service rendering if selectedPackage and allServices are loaded
  let availableServices = [];
  if (selectedPackage && allServices && allServices.length > 0) {
    // Ensure includedServices is an array before filtering
    const includedServices = selectedPackage.includedServices || [];
    
    // Only show services that aren't already included in the package
    availableServices = allServices.filter(service => 
      !includedServices.some(includedId => {
        // Compare service IDs, handling both string IDs and object IDs
        const includedServiceId = typeof includedId === 'object' ? 
          (includedId._id || includedId.id) : includedId;
        return includedServiceId === service._id;
      })
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white py-6 px-6">
            <button 
              onClick={() => navigate('/membership')}
              className="text-white hover:text-blue-200 mb-4 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Packages
            </button>
            <h1 className="text-2xl font-bold">
              Complete Your {selectedPackage?.name} Booking
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Package Details</h2>
              <div className="bg-blue-50 p-4 rounded">
                <h3 className="font-bold text-blue-800">{selectedPackage?.name}</h3>
                <p className="text-gray-700 mt-2">{selectedPackage?.description}</p>
                
                {selectedPackage?.includedServices?.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700">Included Services:</p>
                    <ul className="mt-2 grid grid-cols-1 gap-2">
                      {selectedPackage.includedServices.map(service => {
                        // Find the full service details from allServices
                        const serviceDetails = typeof service === 'object' && service.name ? 
                          service : 
                          allServices.find(s => s._id === service);
                        
                        if (!serviceDetails) return null;
                        
                        return (
                          <li key={typeof service === 'object' ? service._id : service} className="flex items-start">
                            <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{serviceDetails.name} (${serviceDetails.price})</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {/* Custom Services Selection */}
            {availableServices.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableServices.map(service => (
                    <div 
                      key={service._id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.customServices.includes(service._id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleServiceToggle(service._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            checked={formData.customServices.includes(service._id)}
                            onChange={() => {}}
                          />
                          <label className="ml-2 block text-sm font-medium text-gray-700">
                            {service.name} - ${service.price}
                          </label>
                        </div>
                      </div>
                      {service.description && (
                        <p className="mt-1 text-sm text-gray-500 ml-6">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Time Slot Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferred Time</h2>
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a time slot</option>
                <option value="Morning (6AM-12PM)">Morning (6AM-12PM)</option>
                <option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</option>
                <option value="Evening (5PM-10PM)">Evening (5PM-10PM)</option>
              </select>
            </div>
            
            {/* Workout Days */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Workout Days Per Week</h2>
              <input
                type="range"
                name="workoutDaysPerWeek"
                min="1"
                max="7"
                value={formData.workoutDaysPerWeek}
                onChange={handleInputChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 px-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
              </div>
              <p className="text-center mt-2 font-medium">
                {formData.workoutDaysPerWeek} {formData.workoutDaysPerWeek === 1 ? 'day' : 'days'} per week
              </p>
            </div>
            
            {/* Fitness Goals */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Fitness Goals</h2>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleGoalChange}
                placeholder="Enter your fitness goals (e.g., Lose weight, Build muscle, Improve endurance)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="3"
                required
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">Separate multiple goals with commas</p>
            </div>
            
            {/* Payment Interval */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Interval</h2>
              <div className="grid grid-cols-3 gap-4">
                {['Monthly', '3 Months', 'Yearly'].map(interval => {
                  const discount = discounts.find(d => d.paymentInterval === interval);
                  
                  return (
                    <div
                      key={interval}
                      className={`border rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        formData.paymentInterval === interval 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setFormData({...formData, paymentInterval: interval})}
                    >
                      <div className="font-medium">{interval}</div>
                      {discount && (
                        <div className="mt-1 text-sm text-green-600">Save {discount.percentage}%</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Price Summary */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Price Summary</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Package:</span>
                  <span>${selectedPackage?.basePrice}</span>
                </div>
                
                {formData.customServices.length > 0 && allServices && allServices.length > 0 && (
                  <div className="flex justify-between">
                    <span>Additional Services:</span>
                    <span>
                      ${allServices
                        .filter(service => formData.customServices.includes(service._id))
                        .reduce((sum, service) => sum + (service.price || 0), 0)
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Payment Interval:</span>
                  <span>{formData.paymentInterval}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{appliedDiscount.percentage}%</span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Proceed to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          booking={formData}
          totalPrice={totalPrice}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default BookingPage;