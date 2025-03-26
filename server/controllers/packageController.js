const Package = require("../models/PackageModel");
const Service = require("../models/ServiceModel");

exports.createPackage = async (req, res) => {
  try {
    const { name, description, basePrice, includedServices, isCustom } = req.body;
    
    // Validate services exist
    if (includedServices) {
      const validServices = await Service.find({ 
        _id: { $in: includedServices },
        active: true 
      });
      if (validServices.length !== includedServices.length) {
        return res.status(400).json({ message: "One or more services are invalid" });
      }
    }

    const newPackage = new Package({
      name, 
      description, 
      basePrice, 
      includedServices, 
      isCustom
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    res.status(500).json({ message: "Error creating package", error: error.message });
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const { isCustom, active } = req.query;
    const query = {};
    
    if (isCustom !== undefined) query.isCustom = isCustom === 'true';
    if (active !== undefined) query.active = active === 'true';

    const packages = await Package.find(query)
      .populate('includedServices')
      .sort({ createdAt: -1 });
    
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving packages", error: error.message });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { name, description, basePrice, includedServices, active } = req.body;

    // Validate services exist if provided
    if (includedServices) {
      const validServices = await Service.find({ 
        _id: { $in: includedServices },
        active: true 
      });
      if (validServices.length !== includedServices.length) {
        return res.status(400).json({ message: "One or more services are invalid" });
      }
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      packageId, 
      { name, description, basePrice, includedServices, active },
      { new: true }
    ).populate('includedServices');

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ message: "Error updating package", error: error.message });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const deletedPackage = await Package.findByIdAndDelete(packageId);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package deleted successfully", deletedPackage });
  } catch (error) {
    res.status(500).json({ message: "Error deleting package", error: error.message });
  }
};