// controllers/packageServiceController.js
const Package = require("../models/Package");
const Service = require("../models/Service");

// Package Management
exports.createPackage = async (req, res) => {
  try {
    const { name, description, price, services } = req.body;
    
    const newPackage = new Package({
      name,
      description,
      price,
      services
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: "Error creating package", error: error.message });
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate('services');
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving packages", error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { name, description, price, services } = req.body;
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.packageId, 
      { name, description, price, services },
      { new: true }
    ).populate('services');

    if (!updatedPackage) return res.status(404).json({ message: "Package not found" });
    
    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: "Error updating package", error: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.packageId);
    
    if (!deletedPackage) return res.status(404).json({ message: "Package not found" });
    
    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting package", error: error.message });
  }
};

// Service Management
exports.createService = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    const newService = new Service({ name, price });
    await newService.save();
    
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving services", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.serviceId, 
      { name, price },
      { new: true }
    );

    if (!updatedService) return res.status(404).json({ message: "Service not found" });
    
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.serviceId);
    
    if (!deletedService) return res.status(404).json({ message: "Service not found" });
    
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};