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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Package Management
        </h1>
        <button 
          onClick={handleCreatePackage}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Create New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Package List */}
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Package List</h2>
          {packages.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No packages found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {packages.map(pkg => (
                <li key={pkg._id} className="py-4 transition-all duration-200 hover:bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleViewPackage(pkg)}
                      className="text-left font-medium text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {pkg.name}
                    </button>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEditPackage(pkg)}
                        className="text-yellow-600 hover:text-yellow-700 transition-colors px-3 py-1 rounded-md hover:bg-yellow-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="text-red-600 hover:text-red-700 transition-colors px-3 py-1 rounded-md hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      Nrs {pkg.basePrice.toFixed(2)}
                    </span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${pkg.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {pkg.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Package Details or Form */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
          {isCreateMode || isEditMode ? (
            // Form for Create/Edit
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                {isCreateMode ? 'Create New Package' : 'Edit Package'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Package Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Base Price (Nrs)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="flex gap-6">
                  {/* <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isCustom"
                      checked={formData.isCustom}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Custom Package</span>
                  </label> */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Active</span>
                  </label>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Included Services</label>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
                    {services.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No services available</p>
                    ) : (
                      services.map(service => (
                        <label key={service._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            value={service._id}
                            checked={isServiceIncluded(service._id)}
                            onChange={handleServiceSelection}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{service.name}</p>
                            <p className="text-sm text-gray-600">Nrs {service.price.toFixed(2)}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
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
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isCreateMode ? 'Create Package' : 'Update Package'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedPackage ? (
            // View Package Details
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{selectedPackage.name}</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleEditPackage(selectedPackage)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(selectedPackage._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl mb-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Base Price</p>
                    <p className="text-lg font-semibold text-gray-800">Nrs {selectedPackage.basePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-800">{selectedPackage.isCustom ? 'Custom Package' : 'Standard Package'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${selectedPackage.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedPackage.active !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-lg font-semibold text-gray-800">{new Date(selectedPackage.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="pt-3">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700 mt-1">{selectedPackage.description || 'No description provided'}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Included Services</h3>
                {selectedPackage.includedServices && selectedPackage.includedServices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPackage.includedServices.map(service => {
                      const serviceData = typeof service === 'object' ? service : getServiceById(service);
                      return serviceData ? (
                        <div key={serviceData._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <p className="font-semibold text-gray-800">{serviceData.name}</p>
                          <p className="text-blue-600 font-medium mt-1">Nrs {serviceData.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 mt-2">{serviceData.description}</p>
                        </div>
                      ) : (
                        <div key={typeof service === 'object' ? service._id : service} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-500">Unknown Service (ID: {typeof service === 'object' ? service._id : service})</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No services included in this package</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // No Package Selected
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Select a package to view details or create a new package</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesPanel;