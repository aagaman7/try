// controllers/trainerAdminController.js
const Trainer = require("../models/TrainerModel");

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

// Add a new trainer (admin only)
exports.addTrainer = async (req, res) => {
  try {
    const { 
      name,
      email,
      phone,
      specialization,
      bio,
      active,
      availability
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Create new trainer
    const newTrainer = new Trainer({
      name,
      email,
      phone: phone || '',
      specialization: specialization || '',
      bio: bio || '',
      isActive: active !== false,
      availability: availability || [],
      // Set default values for required fields in model
      experience: '0 years',
      price: '0',
      description: bio || '',
      image: "/api/placeholder/300/300"
    });

    await newTrainer.save();

    res.status(201).json(newTrainer);
  } catch (error) {
    console.error("Error adding trainer:", error);
    res.status(500).json({ message: "Error adding trainer", error: error.message });
  }
};

// Update trainer details (admin only)
exports.updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      specialization,
      bio,
      active,
      availability
    } = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update trainer data
    trainer.name = name || trainer.name;
    trainer.email = email || trainer.email;
    trainer.phone = phone || trainer.phone;
    trainer.specialization = specialization || trainer.specialization;
    trainer.bio = bio || trainer.bio;
    trainer.isActive = active !== false;
    if (availability) {
      trainer.availability = availability;
    }

    await trainer.save();
    res.status(200).json(trainer);
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

    // Actually delete the trainer instead of soft delete
    await Trainer.findByIdAndDelete(id);

    res.status(200).json({ message: "Trainer deleted successfully" });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ message: "Error deleting trainer", error: error.message });
  }
};

// Add/Update availability time slots
exports.addAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({ message: "Please provide valid availability array" });
    }

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.availability = availability;
    await trainer.save();

    res.status(200).json(trainer);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Error updating availability", error: error.message });
  }
};