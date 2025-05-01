import React, { useState, useEffect } from 'react';

const PackagesPanel = () => {
  // Dummy data for packages
  const dummyPackages = [
    {
      _id: "1",
      name: "Basic Fitness",
      description: "Entry level fitness package with basic amenities",
      basePrice: 49.99,
      isCustom: false,
      includedServices: ["1", "2"],
      active: true,
      createdAt: "2025-02-15T10:30:00.000Z"
    },
    {
      _id: "2",
      name: "Premium Wellness",
      description: "Complete wellness package with all premium services",
      basePrice: 99.99,
      isCustom: false,
      includedServices: ["1", "2", "3", "4"],
      active: true,
      createdAt: "2025-03-01T14:45:00.000Z"
    },
    {
      _id: "3",
      name: "Custom Training",
      description: "Personalized training program based on individual needs",
      basePrice: 149.99,
      isCustom: true,
      includedServices: ["2", "5"],
      active: true,
      createdAt: "2025-03-10T09:20:00.000Z"
    },
    {
      _id: "4",
      name: "Family Plan",
      description: "Group package for families with up to 4 members",
      basePrice: 199.99,
      isCustom: false,
      includedServices: ["1", "2", "6"],
      active: false,
      createdAt: "2025-01-20T11:15:00.000Z"
    }
  ];

  // Dummy data for services
  const dummyServices = [
    {
      _id: "1",
      name: "Gym Access",
      price: 29.99,
      description: "24/7 access to gym equipment and facilities",
      category: "Fitness",
      active: true
    },
    {
      _id: "2",
      name: "Group Classes",
      price: 19.99,
      description: "Access to all group fitness classes",
      category: "Fitness",
      active: true
    },
    {
      _id: "3",
      name: "Personal Training",
      price: 49.99,
      description: "One-on-one training sessions with certified trainers",
      category: "Fitness",
      active: true
    },
    {
      _id: "4",
      name: "Nutrition Consultation",
      price: 39.99,
      description: "Professional nutrition advice and meal planning",
      category: "Wellness",
      active: true
    },
    {
      _id: "5",
      name: "Massage Therapy",
      price: 59.99,
      description: "Relaxation and recovery massage sessions",
      category: "Wellness",
      active: true
    },
    {
      _id: "6",
      name: "Swimming Pool",
      price: 24.99,
      description: "Access to swimming facilities",
      category: "Fitness",
      active: true
    }
  ];

  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    isCustom: false,
    includedServices: [],
    active: true
  });

  // Initialize with dummy data
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setPackages(dummyPackages);
      setServices(dummyServices);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      isCustom: false,
      includedServices: [],
      active: true
    });
  };

  // Handle view package details
  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setIsEditMode(false);
    setIsCreateMode(false);
  };

  // Handle edit package
  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      basePrice: pkg.basePrice,
      isCustom: pkg.isCustom,
      includedServices: pkg.includedServices,
      active: pkg.active
    });
    setIsEditMode(true);
    setIsCreateMode(false);
  };

  // Handle create new package
  const handleCreatePackage = () => {
    resetForm();
    setSelectedPackage(null);
    setIsEditMode(false);
    setIsCreateMode(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle service selection
  const handleServiceSelection = (e) => {
    const serviceId = e.target.value;
    let updatedServices;
    
    if (e.target.checked) {
      updatedServices = [...formData.includedServices, serviceId];
    } else {
      updatedServices = formData.includedServices.filter(id => id !== serviceId);
    }
    
    setFormData({
      ...formData,
      includedServices: updatedServices
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (isCreateMode) {
        // Generate a new unique ID and create timestamp
        const newPackage = {
          ...formData,
          _id: `${packages.length + 1}`,
          createdAt: new Date().toISOString()
        };

        setPackages([...packages, newPackage]);
        setIsCreateMode(false);
        setSelectedPackage(newPackage);
      } else if (isEditMode && selectedPackage) {
        const updatedPackage = {
          ...selectedPackage,
          ...formData
        };

        setPackages(packages.map(pkg => pkg._id === selectedPackage._id ? updatedPackage : pkg));
        setSelectedPackage(updatedPackage);
        setIsEditMode(false);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save package');
      console.error('Error saving package:', err);
    }
  };

  // Handle delete package
  const handleDeletePackage = (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg._id !== packageId));
      if (selectedPackage && selectedPackage._id === packageId) {
        setSelectedPackage(null);
      }
    }
  };

  // Render service name from ID
  const getServiceNameById = (serviceId) => {
    const service = services.find(service => service._id === serviceId);
    return service ? service.name : 'Unknown Service';
  };

  // Get service details by ID
  const getServiceById = (serviceId) => {
    return services.find(service => service._id === serviceId);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <button 
          onClick={handleCreatePackage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Package List */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Package List</h2>
          {packages.length === 0 ? (
            <p className="text-gray-500">No packages found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {packages.map(pkg => (
                <li key={pkg._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleViewPackage(pkg)}
                      className="text-left font-medium text-blue-600 hover:text-blue-800"
                    >
                      {pkg.name}
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditPackage(pkg)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    ${pkg.basePrice} | {pkg.active ? 'Active' : 'Inactive'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Package Details or Form */}
        <div className="col-span-2 bg-white p-4 rounded shadow">
          {isCreateMode || isEditMode ? (
            // Form for Create/Edit
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {isCreateMode ? 'Create New Package' : 'Edit Package'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Package Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Base Price ($)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="isCustom"
                    checked={formData.isCustom}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Custom Package</label>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Active</label>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Included Services</label>
                  <div className="max-h-60 overflow-y-auto border rounded p-2">
                    {services.length === 0 ? (
                      <p className="text-gray-500">No services available</p>
                    ) : (
                      services.map(service => (
                        <div key={service._id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            value={service._id}
                            checked={formData.includedServices.includes(service._id)}
                            onChange={handleServiceSelection}
                            className="mr-2"
                          />
                          <label>
                            {service.name} - ${service.price}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateMode(false);
                      setIsEditMode(false);
                      if (selectedPackage) {
                        setSelectedPackage(packages.find(p => p._id === selectedPackage._id));
                      }
                      resetForm();
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    {isCreateMode ? 'Create Package' : 'Update Package'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedPackage ? (
            // View Package Details
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedPackage.name}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditPackage(selectedPackage)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(selectedPackage._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="mb-2">
                  <span className="font-medium">Base Price:</span> ${selectedPackage.basePrice}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Description:</span> {selectedPackage.description || 'No description provided'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Type:</span> {selectedPackage.isCustom ? 'Custom Package' : 'Standard Package'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Status:</span> {selectedPackage.active ? 'Active' : 'Inactive'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Created:</span> {new Date(selectedPackage.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Included Services</h3>
                {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPackage.includedServices.map(serviceId => {
                      const service = getServiceById(serviceId);
                      return service ? (
                        <div key={serviceId} className="bg-gray-50 p-3 rounded border">
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">${service.price}</p>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      ) : (
                        <div key={serviceId} className="bg-gray-50 p-3 rounded border">
                          Unknown Service (ID: {serviceId})
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No services included in this package</p>
                )}
              </div>
            </div>
          ) : (
            // No Package Selected
            <div className="text-center py-12">
              <p className="text-gray-500">Select a package to view details or create a new package</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesPanel;