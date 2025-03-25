import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CustomPackage = () => {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    // Calculate total price of selected services
    const price = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
    setTotalPrice(price);
  }, [selectedServices, services]);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCreateCustomPackage = async () => {
    try {
      const response = await axios.post('/api/bookings', {
        customServices: selectedServices,
        userId: null, // Replace with actual user ID
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });

      // Handle successful booking
      console.log('Custom package booked:', response.data);
    } catch (err) {
      console.error('Error creating custom package:', err.response?.data || err.message);
    }
  };

  if (loading) return <div>Loading services...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Build Your Custom Package</h3>
      
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service._id} 
            className={`border rounded-lg p-4 cursor-pointer transition duration-300 ${
              selectedServices.includes(service._id) 
                ? 'bg-blue-50 border-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleServiceToggle(service._id)}
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">{service.name}</h4>
              <span className="text-gray-600">${service.price}</span>
            </div>
            <input 
              type="checkbox" 
              checked={selectedServices.includes(service._id)}
              onChange={() => handleServiceToggle(service._id)}
              className="hidden"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <span className="text-xl font-bold">Total Price: </span>
          <span className="text-2xl text-blue-600">${totalPrice.toFixed(2)}</span>
        </div>
        <button 
          onClick={handleCreateCustomPackage}
          disabled={selectedServices.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Create Custom Package
        </button>
      </div>
    </div>
  );
};

export default CustomPackage;