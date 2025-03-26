import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
const PackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customServices, setCustomServices] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch packages
    const fetchPackages = async () => {
      try {
        const response = await axios.get('/api/packages?active=true');
        setPackages(response.data);
      } catch (error) {
        console.error('Error fetching packages', error);
      }
    };

    // Fetch services
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services?active=true');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services', error);
      }
    };

    fetchPackages();
    fetchServices();
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const toggleCustomService = (serviceId) => {
    setCustomServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const proceedToBookingForm = () => {
    // Pass selected package and custom services to booking form
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Choose Your Package</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <Card 
            key={pkg._id} 
            className={`${selectedPackage?._id === pkg._id ? 'border-blue-500 border-2' : ''}`}
            onClick={() => handlePackageSelect(pkg)}
          >
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{pkg.description}</p>
              <p className="text-xl font-bold mt-2">${pkg.basePrice}/month</p>
              
              {pkg.includedServices && (
                <div className="mt-4">
                  <h3 className="font-semibold">Included Services:</h3>
                  <ul className="list-disc list-inside">
                    {pkg.includedServices.map(service => (
                      <li key={service._id}>{service.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-6">Add Custom Services</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Additional Services</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {services.map(service => (
                <div 
                  key={service._id} 
                  className="flex items-center justify-between p-4 border rounded"
                >
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-gray-500">${service.price}</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={customServices.includes(service._id)}
                    onChange={() => toggleCustomService(service._id)}
                    className="form-checkbox"
                  />
                </div>
              ))}
            </div>
            <DialogTrigger asChild>
              <Button onClick={proceedToBookingForm}>
                Proceed to Booking
              </Button>
            </DialogTrigger>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PackagesPage;