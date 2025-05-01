const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes for booking
router.post("/", authMiddleware, bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getUserBookings);


module.exports = router;