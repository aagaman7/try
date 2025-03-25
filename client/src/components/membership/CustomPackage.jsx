import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomPackage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  
  useEffect(() => {
    // Fetch services from backend
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/services');
        setServices(response.data.filter(service => service.isActive));
        // Default to gym access selected if available
        const gymService = response.data.find(s => s.category === 'Equipment' && s.name.includes('Gym'));
        if (gymService) {
          setSelectedServices({
            [gymService._id]: { selected: true, quantity: 1, serviceData: gymService }
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
        // Use fallback data if API fails
        const fallbackServices = [
          { _id: 'gym_access', name: 'Gym Access', price: 19.99, category: 'Equipment', description: 'Full access to gym equipment' },
          { _id: 'group_classes', name: 'Group Classes', price: 15.00, category: 'Class', description: 'Access to all group fitness classes' },
          { _id: 'personal_training', name: 'Personal Training Sessions', price: 30.00, category: 'Training', description: 'One-on-one training sessions', options: [1, 2, 4, 8] },
          { _id: 'pool_access', name: 'Swimming Pool Access', price: 10.00, category: 'Equipment', description: 'Access to swimming facilities' },
          { _id: 'sauna', name: 'Sauna & Steam Room', price: 8.00, category: 'Equipment', description: 'Access to sauna and steam rooms' },
          { _id: 'nutrition', name: 'Nutrition Consultation', price: 25.00, category: 'Consultation', description: 'Professional nutrition guidance', options: [1, 2, 4] },
          { _id: 'extended_hours', name: 'Extended Hours Access', price: 5.00, category: 'Access', description: 'Access outside regular hours' },
          { _id: 'locker', name: 'Personal Locker', price: 7.00, category: 'Equipment', description: 'Private locker for your belongings' },
          { _id: 'towel', name: 'Towel Service', price: 4.00, category: 'Service', description: 'Fresh towels provided daily' },
        ];
        setServices(fallbackServices);
        setSelectedServices({
          gym_access: { selected: true, quantity: 1, serviceData: fallbackServices[0] }
        });
      }
    };

    fetchServices();
  }, []);
  
  useEffect(() => {
    calculateTotal();
  }, [selectedServices]);

  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      const newState = { ...prev };
      
      if (newState[serviceId]) {
        delete newState[serviceId];
      } else {
        const service = services.find(s => s._id === serviceId);
        newState[serviceId] = { 
          selected: true, 
          quantity: service.options ? service.options[0] : 1,
          serviceData: service
        };
      }
      
      return newState;
    });
  };

  const updateQuantity = (serviceId, quantity) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], quantity }
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    
    Object.keys(selectedServices).forEach(serviceId => {
      const service = services.find(s => s._id === serviceId);
      const { quantity } = selectedServices[serviceId];
      total += service.price * quantity;
    });
    
    setTotalPrice(total);
  };

  const handleContinueWithCustom = async () => {
    if (Object.keys(selectedServices).length === 0) {
      alert('Please select at least one service');
      return;
    }
    
    // Create a list of selected services with quantities for the package details page
    const selectedFeatures = Object.keys(selectedServices).map(serviceId => {
      const service = services.find(s => s._id === serviceId);
      const { quantity } = selectedServices[serviceId];
      
      return service.options 
        ? `${service.name} (${quantity} ${quantity === 1 ? 'session' : 'sessions'})`
        : service.name;
    });
    
    // Create the services array that matches the backend CustomPackageModel
    const servicesArray = Object.keys(selectedServices).map(serviceId => {
      const service = services.find(s => s._id === serviceId);
      const { quantity } = selectedServices[serviceId];
      
      return {
        serviceId: service._id,
        name: service.name,
        quantity: quantity,
        price: service.price * quantity
      };
    });
    
    // Create custom package data to match backend model
    const customPackageData = {
      services: servicesArray,
      totalPrice: totalPrice,
      // Note: userId would be added on the backend from the authenticated user
    };
    
    // In a real implementation, we would save this to the backend
    // For now, we'll just pass it to the next page
    
    // Navigate to package details page with custom package info
    navigate('/package/custom', {
      state: {
        customPackage: {
          name: 'Custom Membership',
          price: totalPrice,
          features: selectedFeatures,
          selectedServices: selectedServices,
          // Include the data structured for backend
          customPackageData: customPackageData
        }
      }
    });
  };

  if (loading) {
    return <div className="mt-8 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Loading services...</h3>
    </div>;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Build Your Custom Package</h3>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Select Your Services</h4>
          <div className="space-y-4">
            {services.map(service => (
              <div key={service._id} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id={service._id}
                    type="checkbox"
                    checked={!!selectedServices[service._id]}
                    onChange={() => toggleService(service._id)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor={service._id} className="font-medium text-gray-700">{service.name}</label>
                  <p className="text-gray-500">${service.price.toFixed(2)} {service.category !== 'Equipment' && 'per month'}</p>
                  <p className="text-gray-500 text-xs">{service.description}</p>
                  
                  {service.options && selectedServices[service._id] && (
                    <div className="mt-2">
                      <select
                        value={selectedServices[service._id].quantity}
                        onChange={(e) => updateQuantity(service._id, parseInt(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {service.options.map(option => (
                          <option key={option} value={option}>
                            {option} {option === 1 ? 'session' : 'sessions'} per month
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Your Custom Package Summary</h4>
          
          {Object.keys(selectedServices).length === 0 ? (
            <p className="text-gray-500">Please select at least one service.</p>
          ) : (
            <>
              <ul className="space-y-3 mb-6">
                {Object.keys(selectedServices).map(serviceId => {
                  const service = services.find(s => s._id === serviceId);
                  const { quantity } = selectedServices[serviceId];
                  return (
                    <li key={serviceId} className="flex justify-between">
                      <span className="text-gray-700">
                        {service.name} 
                        {service.options && ` (${quantity} ${quantity === 1 ? 'session' : 'sessions'})`}
                      </span>
                      <span className="font-medium text-gray-900">${(service.price * quantity).toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
              
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total Monthly Cost:</span>
                <span className="text-lg font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleContinueWithCustom}
                  className="block w-full px-4 py-3 text-center rounded-md shadow bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Continue with Custom Package
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomPackage;