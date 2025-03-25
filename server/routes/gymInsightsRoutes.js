// routes/gymInsightsRoutes.js
const express = require("express");
const { 
  updateGymCapacity,
  getGymOccupancy,
  getBookingInsights
} = require("../controllers/gymInsightsController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Gym Capacity Routes
router.post("/capacity", authMiddleware, adminMiddleware, updateGymCapacity);
router.get("/occupancy", authMiddleware, adminMiddleware, getGymOccupancy);

// Booking Insights Routes
router.get("/insights", authMiddleware, adminMiddleware, getBookingInsights);

module.exports = router;