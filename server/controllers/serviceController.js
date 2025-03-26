const Service = require("../models/ServiceModel");

exports.createService = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const newService = new Service({
      name, 
      price, 
      description, 
      category
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: "Error creating service", error: error.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const { active, category } = req.query;
    const query = {};
    
    if (active !== undefined) query.active = active === 'true';
    if (category) query.category = category;

    const services = await Service.find(query)
      .sort({ createdAt: -1 });
    
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving services", error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, price, description, category, active } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId, 
      { name, price, description, category, active },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Error updating service", error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const deletedService = await Service.findByIdAndDelete(serviceId);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully", deletedService });
  } catch (error) {
    res.status(500).json({ message: "Error deleting service", error: error.message });
  }
};