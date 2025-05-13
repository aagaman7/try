import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService'; // Adjust the path as needed

const PackagesPanel = () => {
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

  // Fetch packages and services from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [packagesData, servicesData] = await Promise.all([
          apiService.getPackages(),
          apiService.getServices()
        ]);
        setPackages(packagesData);
        setServices(servicesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  const handleViewPackage = async (pkg) => {
    try {
      // Get detailed package data with populated services
      const detailedPackage = await apiService.getPackageById(pkg._id);
      setSelectedPackage(detailedPackage);
      setIsEditMode(false);
      setIsCreateMode(false);
    } catch (err) {
      console.error('Error fetching package details:', err);
      setError('Failed to load package details');
    }
  };

  // Handle edit package
  const handleEditPackage = async (pkg) => {
    try {
      // Get the most up-to-date package data before editing
      const packageToEdit = await apiService.getPackageById(pkg._id);
      setSelectedPackage(packageToEdit);
      
      // Extract service IDs from the includedServices array of objects
      const serviceIds = packageToEdit.includedServices.map(service => 
        typeof service === 'object' ? service._id : service
      );
      
      setFormData({
        name: packageToEdit.name,
        description: packageToEdit.description || '',
        basePrice: packageToEdit.basePrice,
        isCustom: packageToEdit.isCustom,
        includedServices: serviceIds,
        active: packageToEdit.active !== false // Default to true if not specified
      });
      
      setIsEditMode(true);
      setIsCreateMode(false);
    } catch (err) {
      console.error('Error preparing package for edit:', err);
      setError('Failed to load package for editing');
    }
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
    
    if (name === 'basePrice') {
      // Ensure basePrice is stored as a number
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isCreateMode) {
        const newPackage = await apiService.createPackage(formData);
        setPackages([...packages, newPackage]);
        setSelectedPackage(newPackage);
        setIsCreateMode(false);
      } else if (isEditMode && selectedPackage) {
        const updatedPackage = await apiService.updatePackage(selectedPackage._id, formData);
        setPackages(packages.map(pkg => pkg._id === selectedPackage._id ? updatedPackage : pkg));
        setSelectedPackage(updatedPackage);
        setIsEditMode(false);
      }
      resetForm();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save package';
      setError(errorMessage);
      console.error('Error saving package:', err);
    }
  };

  // Handle delete package
  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await apiService.deletePackage(packageId);
        setPackages(packages.filter(pkg => pkg._id !== packageId));
        if (selectedPackage && selectedPackage._id === packageId) {
          setSelectedPackage(null);
        }
      } catch (err) {
        setError('Failed to delete package');
        console.error('Error deleting package:', err);
      }
    }
  };

  // Check if service is included
  const isServiceIncluded = (serviceId) => {
    return formData.includedServices.some(id => 
      id === serviceId || (typeof id === 'object' && id._id === serviceId)
    );
  };

  // Get service details by ID
  const getServiceById = (serviceId) => {
    if (typeof serviceId === 'object') return serviceId;
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
                    ${pkg.basePrice.toFixed(2)} | {pkg.active !== false ? 'Active' : 'Inactive'}
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
                    step="0.01"
                    min="0"
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
                            checked={isServiceIncluded(service._id)}
                            onChange={handleServiceSelection}
                            className="mr-2"
                          />
                          <label>
                            {service.name} - ${service.price.toFixed(2)}
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
                        handleViewPackage({_id: selectedPackage._id});
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
                  <span className="font-medium">Base Price:</span> ${selectedPackage.basePrice.toFixed(2)}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Description:</span> {selectedPackage.description || 'No description provided'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Type:</span> {selectedPackage.isCustom ? 'Custom Package' : 'Standard Package'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Status:</span> {selectedPackage.active !== false ? 'Active' : 'Inactive'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Created:</span> {new Date(selectedPackage.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Included Services</h3>
                {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedPackage.includedServices.map(service => {
                      // Handle both populated service objects and IDs
                      const serviceData = typeof service === 'object' ? service : getServiceById(service);
                      return serviceData ? (
                        <div key={serviceData._id} className="bg-gray-50 p-3 rounded border">
                          <p className="font-medium">{serviceData.name}</p>
                          <p className="text-sm text-gray-600">${serviceData.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{serviceData.description}</p>
                        </div>
                      ) : (
                        <div key={typeof service === 'object' ? service._id : service} className="bg-gray-50 p-3 rounded border">
                          Unknown Service (ID: {typeof service === 'object' ? service._id : service})
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