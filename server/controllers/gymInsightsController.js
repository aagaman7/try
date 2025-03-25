// controllers/gymInsightsController.js
const GymCapacity = require("../models/GymCapacity");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");

exports.updateGymCapacity = async (req, res) => {
  try {
    const { timeSlot, maxCapacity } = req.body;
    
    const existingCapacity = await GymCapacity.findOne({ timeSlot });
    
    if (existingCapacity) {
      existingCapacity.maxCapacity = maxCapacity;
      await existingCapacity.save();
      return res.json(existingCapacity);
    }
    
    const newCapacity = new GymCapacity({ 
      date: new Date(), 
      timeSlot, 
      maxCapacity,
      currentCount: 0 
    });
    
    await newCapacity.save();
    res.status(201).json(newCapacity);
  } catch (error) {
    res.status(500).json({ message: "Error updating gym capacity", error: error.message });
  }
};

exports.getGymOccupancy = async (req, res) => {
  try {
    const { date, timeSlot } = req.query;
    
    const query = {};
    if (date) query.date = new Date(date);
    if (timeSlot) query.timeSlot = timeSlot;
    
    const occupancy = await GymCapacity.find(query);
    res.json(occupancy);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving gym occupancy", error: error.message });
  }
};

exports.getBookingInsights = async (req, res) => {
  try {
    // Booking volume by month
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$timeSlot" } },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most popular packages
    const popularPackages = await Booking.aggregate([
      { $group: {
        _id: "$package",
        bookingCount: { $sum: 1 }
      }},
      { $lookup: {
        from: "packages",
        localField: "_id",
        foreignField: "_id",
        as: "packageDetails"
      }},
      { $unwind: "$packageDetails" },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    // Time slot popularity
    const timeSlotPopularity = await Booking.aggregate([
      { $group: {
        _id: "$timeSlot",
        bookingCount: { $sum: 1 }
      }},
      { $sort: { bookingCount: -1 } },
      { $limit: 5 }
    ]);

    // Member retention (simple calculation)
    const memberRetention = await Booking.aggregate([
      { $group: {
        _id: "$user",
        bookingCount: { $sum: 1 }
      }},
      { $bucketAuto: {
        groupBy: "$bookingCount",
        buckets: 3
      }}
    ]);

    res.json({
      monthlyBookings,
      popularPackages,
      timeSlotPopularity,
      memberRetention
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating booking insights", error: error.message });
  }
};