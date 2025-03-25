const Booking = require("../models/Booking");
const GymCapacity = require("../models/GymCapacity");
const Package = require("../models/Package"); // Import Package model
const Service = require("../models/Service");

exports.bookMembership = async (req, res) => {
  try {
    const { userId, packageId, customServices, timeSlot } = req.body;

    // Check gym capacity
    const capacity = await GymCapacity.findOne({ timeSlot });
    if (capacity && capacity.currentCount >= capacity.maxCapacity) {
      return res.status(400).json({ message: "Selected time slot is full" });
    }

    // Calculate price
    let totalPrice = 0;
    if (packageId) {
      const selectedPackage = await Package.findById(packageId);
      if (!selectedPackage) return res.status(404).json({ message: "Package not found" });
      totalPrice = selectedPackage.price;
    } else if (customServices) {
      const services = await Service.find({ _id: { $in: customServices } });
      totalPrice = services.reduce((sum, service) => sum + service.price, 0);
    }

    // Create booking
    const newBooking = new Booking({ user: userId, package: packageId, customServices, totalPrice, timeSlot });
    await newBooking.save();

    // Update gym capacity
    if (capacity) {
      capacity.currentCount += 1;
      await capacity.save();
    } else {
      await GymCapacity.create({ date: new Date(), timeSlot, currentCount: 1, maxCapacity: 150 });
    }

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Error booking membership", error });
  }
};
