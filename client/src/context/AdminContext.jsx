import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [membershipHistory, setMembershipHistory] = useState([]);

  // Fetch users
  const fetchUsers = async (page = 1, limit = 10, role = '', search = '') => {
    setLoading(true);
    try {
      const response = await apiService.get(`admin/users?page=${page}&limit=${limit}&role=${role}&search=${search}`);
      setUsers(response.users);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch users');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async (userId) => {
    setLoading(true);
    try {
      const response = await apiService.get(`admin/users/${userId}`);
      setUserProfile(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch user profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, role) => {
    try {
      const response = await apiService.put(`admin/users/${userId}/role`, { role });
      setUsers(users.map(user => user._id === userId ? { ...user, role } : user));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update user role');
      throw error;
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const response = await apiService.put(`admin/users/${userId}/status`, {});
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to toggle user status');
      throw error;
    }
  };

  // Get user membership history
  const getUserMembershipHistory = async (userId) => {
    setLoading(true);
    try {
      const response = await apiService.get(`admin/users/${userId}/membership-history`);
      setMembershipHistory(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch membership history');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Packages CRUD operations
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPackages();
      setPackages(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch packages');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (packageData) => {
    try {
      const response = await apiService.post('packages', packageData);
      setPackages([...packages, response]);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create package');
      throw error;
    }
  };

  const updatePackage = async (packageId, packageData) => {
    try {
      const response = await apiService.put(`packages/${packageId}`, packageData);
      setPackages(packages.map(pkg => pkg._id === packageId ? response : pkg));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update package');
      throw error;
    }
  };

  const deletePackage = async (packageId) => {
    try {
      await apiService.delete(`packages/${packageId}`);
      setPackages(packages.filter(pkg => pkg._id !== packageId));
      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to delete package');
      throw error;
    }
  };

  // Services CRUD operations
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await apiService.getServices();
      setServices(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch services');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData) => {
    try {
      const response = await apiService.post('services', serviceData);
      setServices([...services, response]);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create service');
      throw error;
    }
  };

  const updateService = async (serviceId, serviceData) => {
    try {
      const response = await apiService.put(`services/${serviceId}`, serviceData);
      setServices(services.map(svc => svc._id === serviceId ? response : svc));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update service');
      throw error;
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await apiService.delete(`services/${serviceId}`);
      setServices(services.filter(svc => svc._id !== serviceId));
      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to delete service');
      throw error;
    }
  };

  // Discounts CRUD operations
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('discounts');
      setDiscounts(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch discounts');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDiscount = async (discountData) => {
    try {
      const response = await apiService.post('discounts', discountData);
      setDiscounts([...discounts, response]);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create discount');
      throw error;
    }
  };

  const updateDiscount = async (discountId, discountData) => {
    try {
      const response = await apiService.put(`discounts/${discountId}`, discountData);
      setDiscounts(discounts.map(disc => disc._id === discountId ? response : disc));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update discount');
      throw error;
    }
  };

  const deleteDiscount = async (discountId) => {
    try {
      await apiService.delete(`discounts/${discountId}`);
      setDiscounts(discounts.filter(disc => disc._id !== discountId));
      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to delete discount');
      throw error;
    }
  };

  // Trainers CRUD operations
  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('trainers');
      setTrainers(response);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to fetch trainers');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createTrainer = async (trainerData) => {
    try {
      const response = await apiService.post('trainers', trainerData);
      setTrainers([...trainers, response]);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create trainer');
      throw error;
    }
  };

  const updateTrainer = async (trainerId, trainerData) => {
    try {
      const response = await apiService.put(`trainers/${trainerId}`, trainerData);
      setTrainers(trainers.map(trainer => trainer._id === trainerId ? response : trainer));
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update trainer');
      throw error;
    }
  };

  const deleteTrainer = async (trainerId) => {
    try {
      await apiService.delete(`trainers/${trainerId}`);
      setTrainers(trainers.filter(trainer => trainer._id !== trainerId));
      return { success: true };
    } catch (error) {
      setError(error.message || 'Failed to delete trainer');
      throw error;
    }
  };

  // Clear any errors
  const clearError = () => setError(null);

  const value = {
    users,
    packages,
    services,
    discounts,
    trainers,
    loading,
    error,
    userProfile,
    membershipHistory,
    fetchUsers,
    fetchUserProfile,
    updateUserRole,
    toggleUserStatus,
    getUserMembershipHistory,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    fetchTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    clearError
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);