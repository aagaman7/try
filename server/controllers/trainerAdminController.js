// controllers/trainerAdminController.js
const Trainer = require("../models/TrainerModel");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
      availability,
      price,
      image
    } = req.body;

    // Validate required fields
    if (!name || !email || !price) {
      return res.status(400).json({ message: "Name, email and price are required" });
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
      price: price.toString(),
      image: image || "/api/placeholder/300/300",
      // Set default values for required fields in model
      experience: '0 years',
      description: bio || ''
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
      availability,
      price,
      image
    } = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // If there's a new image and it's different from the current one
    if (image && image !== trainer.image) {
      // Delete old image from Cloudinary if it exists and is not the default placeholder
      if (trainer.image && !trainer.image.includes('/api/placeholder/')) {
        const publicId = trainer.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Update trainer data
    trainer.name = name || trainer.name;
    trainer.email = email || trainer.email;
    trainer.phone = phone || trainer.phone;
    trainer.specialization = specialization || trainer.specialization;
    trainer.bio = bio || trainer.bio;
    trainer.isActive = active !== false;
    trainer.price = price ? price.toString() : trainer.price;
    trainer.image = image || trainer.image;
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

    // Delete trainer's image from Cloudinary if it's not the default placeholder
    if (trainer.image && !trainer.image.includes('/api/placeholder/')) {
      const publicId = trainer.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
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

// Upload trainer image
exports.uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ message: "No image provided" });
    }

    console.log('Starting Cloudinary upload...');

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${image}`,
      {
        folder: 'trainers',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        resource_type: 'auto'
      }
    );

    console.log('Cloudinary upload successful:', result.secure_url);

    res.status(200).json({ 
      message: "Image uploaded successfully",
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    res.status(500).json({ 
      message: "Error uploading image", 
      error: error.message,
      details: error.response?.body || error
    });
  }
};