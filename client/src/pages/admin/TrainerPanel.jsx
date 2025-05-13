import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService'; // Adjust the path as needed

const TrainerPanel = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    active: true,
    availability: []
  });

  // Fetch trainers from API
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoading(true);
        const trainersData = await apiService.adminGetAllTrainers();
        setTrainers(trainersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching trainers:', err);
        setError('Failed to load trainers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      bio: '',
      active: true,
      availability: []
    });
  };

  // Handle view trainer details
  const handleViewTrainer = async (trainer) => {
    try {
      // Get detailed trainer data
      const detailedTrainer = await apiService.getTrainerById(trainer._id);
      setSelectedTrainer(detailedTrainer);
      setIsEditMode(false);
      setIsCreateMode(false);
    } catch (err) {
      console.error('Error fetching trainer details:', err);
      setError('Failed to load trainer details');
    }
  };

  // Handle edit trainer
  const handleEditTrainer = async (trainer) => {
    try {
      // Get the most up-to-date trainer data before editing
      const trainerToEdit = await apiService.getTrainerById(trainer._id);
      setSelectedTrainer(trainerToEdit);
      
      setFormData({
        name: trainerToEdit.name,
        email: trainerToEdit.email,
        phone: trainerToEdit.phone || '',
        specialization: trainerToEdit.specialization || '',
        bio: trainerToEdit.bio || '',
        active: trainerToEdit.active !== false,
        availability: trainerToEdit.availability || []
      });
      
      setIsEditMode(true);
      setIsCreateMode(false);
    } catch (err) {
      console.error('Error preparing trainer for edit:', err);
      setError('Failed to load trainer for editing');
    }
  };

  // Handle create new trainer
  const handleCreateTrainer = () => {
    resetForm();
    setSelectedTrainer(null);
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

  // Handle availability input changes
  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[index] = {
      ...updatedAvailability[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  // Add new availability slot
  const addAvailabilitySlot = () => {
    setFormData({
      ...formData,
      availability: [
        ...formData.availability,
        { day: '', startTime: '', endTime: '' }
      ]
    });
  };

  // Remove availability slot
  const removeAvailabilitySlot = (index) => {
    const updatedAvailability = formData.availability.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      availability: updatedAvailability
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isCreateMode) {
        const newTrainer = await apiService.adminAddTrainer(formData);
        setTrainers([...trainers, newTrainer]);
        setSelectedTrainer(newTrainer);
        setIsCreateMode(false);
      } else if (isEditMode && selectedTrainer) {
        const updatedTrainer = await apiService.adminUpdateTrainer(selectedTrainer._id, formData);
        setTrainers(trainers.map(trainer => 
          trainer._id === selectedTrainer._id ? updatedTrainer : trainer
        ));
        setSelectedTrainer(updatedTrainer);
        setIsEditMode(false);
      }
      resetForm();
    } catch (err) {
      const errorMessage = err.message || 'Failed to save trainer';
      setError(errorMessage);
      console.error('Error saving trainer:', err);
    }
  };

  // Handle delete trainer
  const handleDeleteTrainer = async (trainerId) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await apiService.adminDeleteTrainer(trainerId);
        setTrainers(trainers.filter(trainer => trainer._id !== trainerId));
        if (selectedTrainer && selectedTrainer._id === trainerId) {
          setSelectedTrainer(null);
        }
      } catch (err) {
        setError('Failed to delete trainer');
        console.error('Error deleting trainer:', err);
      }
    }
  };

  // Handle saving trainer availability
  const handleSaveAvailability = async () => {
    if (!selectedTrainer) return;

    try {
      // Filter out empty availability slots
      const validAvailability = formData.availability.filter(
        slot => slot.day && slot.startTime && slot.endTime
      );

      await apiService.adminAddTrainerAvailability(selectedTrainer._id, {
        availability: validAvailability
      });

      // Refresh trainer details to show updated availability
      const updatedTrainer = await apiService.getTrainerById(selectedTrainer._id);
      setSelectedTrainer(updatedTrainer);
      
      // Reset edit mode if needed
      setIsEditMode(false);
    } catch (err) {
      setError('Failed to update trainer availability');
      console.error('Error updating trainer availability:', err);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trainer Management</h1>
        <button 
          onClick={handleCreateTrainer}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trainer List */}
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Trainer List</h2>
          {trainers.length === 0 ? (
            <p className="text-gray-500">No trainers found</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {trainers.map(trainer => (
                <li key={trainer._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleViewTrainer(trainer)}
                      className="text-left font-medium text-blue-600 hover:text-blue-800"
                    >
                      {trainer.name}
                    </button>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditTrainer(trainer)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTrainer(trainer._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {trainer.specialization || 'No specialization'} | {trainer.active !== false ? 'Active' : 'Inactive'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trainer Details or Form */}
        <div className="col-span-2 bg-white p-4 rounded shadow">
          {isCreateMode || isEditMode ? (
            // Form for Create/Edit
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold mb-4">
                {isCreateMode ? 'Add New Trainer' : 'Edit Trainer'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows="4"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              
              {/* Availability Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Availability</h3>
                  <button
                    type="button"
                    onClick={addAvailabilitySlot}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Add Slot
                  </button>
                </div>
                
                {formData.availability.length === 0 ? (
                  <p className="text-gray-500 mb-2">No availability slots added</p>
                ) : (
                  formData.availability.map((slot, index) => (
                    <div key={index} className="flex flex-wrap items-center mb-2 p-2 bg-gray-50 rounded">
                      <div className="mr-2 mb-2">
                        <label className="block text-xs text-gray-500">Day</label>
                        <select
                          value={slot.day}
                          onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                          className="p-1 border rounded"
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      
                      <div className="mr-2 mb-2">
                        <label className="block text-xs text-gray-500">Start Time</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                          className="p-1 border rounded"
                        />
                      </div>
                      
                      <div className="mr-2 mb-2">
                        <label className="block text-xs text-gray-500">End Time</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                          className="p-1 border rounded"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsEditMode(false);
                    setIsCreateMode(false);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          ) : selectedTrainer ? (
            // View Trainer Details
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{selectedTrainer.name}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditTrainer(selectedTrainer)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTrainer(selectedTrainer._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Email:</span> {selectedTrainer.email}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Phone:</span> {selectedTrainer.phone || 'Not provided'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Specialization:</span> {selectedTrainer.specialization || 'Not specified'}
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">Status:</span> {selectedTrainer.active !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2">
                      <span className="font-medium">Created:</span> {new Date(selectedTrainer.createdAt).toLocaleDateString()}
                    </p>
                    {selectedTrainer.lastActive && (
                      <p className="mb-2">
                        <span className="font-medium">Last Active:</span> {new Date(selectedTrainer.lastActive).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trainer Bio */}
              {selectedTrainer.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Trainer Bio</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedTrainer.bio}
                  </p>
                </div>
              )}

              {/* Trainer Availability */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Availability</h3>
                  <button 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        availability: selectedTrainer.availability || []
                      });
                      setIsEditMode(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Manage Availability
                  </button>
                </div>
                
                {selectedTrainer.availability && selectedTrainer.availability.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTrainer.availability.map((slot, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <p>
                          <span className="font-medium">Day:</span> {slot.day}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No availability set</p>
                )}
              </div>
            </div>
          ) : (
            // No Trainer Selected
            <div className="text-center py-12">
              <p className="text-gray-500">Select a trainer to view details or add a new trainer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerPanel;