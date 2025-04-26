// controllers/trainerAdminController.js
const Trainer = require("../models/TrainerModel");

// Add a new trainer (admin only)
exports.addTrainer = async (req, res) => {
  try {
    const { 
      name, 
      specialization, 
      image, 
      experience, 
      price, 
      bio, 
      description, 
      qualifications, 
      availability 
    } = req.body;

    // Validate required fields
    if (!name || !specialization || !experience || !price || !bio || !description) {
      return res.status(400).json({ message: "Please provide all required trainer information" });
    }

    // Create new trainer
    const newTrainer = new Trainer({
      name,
      specialization,
      image: image || "/api/placeholder/300/300",
      experience,
      price,
      bio,
      description,
      qualifications: qualifications || [],
      availability: availability || []
    });

    await newTrainer.save();

    res.status(201).json({
      message: "Trainer added successfully",
      trainer: newTrainer
    });
  } catch (error) {
    console.error("Error adding trainer:", error);
    res.status(500).json({ message: "Error adding trainer", error: error.message });
  }
};

// Update trainer details (admin only)
exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update trainer data
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: updatedTrainer
    });
  } catch (error) {
    console.error("Error updating trainer:", error);
    res.status(500).json({ message: "Error updating trainer", error: error.message });
  }
};

// Delete a trainer (admin only)
exports.deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Soft delete (mark as inactive) instead of removing from database
    trainer.isActive = false;
    await trainer.save();

    res.status(200).json({ message: "Trainer deleted successfully" });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ message: "Error deleting trainer", error: error.message });
  }
};

// Add availability time slots
exports.addAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, times } = req.body;

    if (!date || !times || !Array.isArray(times) || times.length === 0) {
      return res.status(400).json({ message: "Please provide valid date and times" });
    }

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if date already exists in availability
    const existingDateIndex = trainer.availability.findIndex(a => a.date === date);

    if (existingDateIndex >= 0) {
      // Add times to existing date (avoiding duplicates)
      const existingTimes = new Set(trainer.availability[existingDateIndex].times);
      times.forEach(time => existingTimes.add(time));
      trainer.availability[existingDateIndex].times = Array.from(existingTimes);
    } else {
      // Add new date with times
      trainer.availability.push({ date, times });
    }

    await trainer.save();

    res.status(200).json({
      message: "Availability updated successfully",
      availability: trainer.availability
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Error updating availability", error: error.message });
  }
};

// Get all trainers (including inactive) - admin only
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.status(200).json(trainers);
  } catch (error) {
    console.error("Error fetching all trainers:", error);
    res.status(500).json({ message: "Error fetching trainers", error: error.message });
  }
};