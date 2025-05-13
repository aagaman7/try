// routes/trainerRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { membershipMiddleware } = require("../middleware/membershipMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");
const trainerController = require("../controllers/trainerController");
const trainerAdminController = require("../controllers/trainerAdminController");

// Public routes
router.get("/", trainerController.getTrainers);
router.get("/:id", trainerController.getTrainerById);

// Protected routes (require authentication and active membership)
router.post(
  "/book", 
  authMiddleware, 
  membershipMiddleware,
  trainerController.bookTrainerSession
);

// Confirm booking payment
router.put(
  "/bookings/:bookingId/confirm-payment",
  authMiddleware,
  trainerController.confirmTrainerBookingPayment
);

// Get user's bookings
router.get(
  "/bookings/user", 
  authMiddleware, 
  trainerController.getUserTrainerBookings
);

// Cancel booking
router.put(
  "/bookings/:bookingId/cancel", 
  authMiddleware, 
  trainerController.cancelTrainerBooking
);

// Admin routes
router.get("/admin/all", authMiddleware, adminMiddleware, trainerAdminController.getAllTrainers);
router.post("/admin", authMiddleware, adminMiddleware, trainerAdminController.addTrainer);
router.put("/admin/:id", authMiddleware, adminMiddleware, trainerAdminController.updateTrainer);
router.delete("/admin/:id", authMiddleware, adminMiddleware, trainerAdminController.deleteTrainer);
router.post("/admin/:id/availability", authMiddleware, adminMiddleware, trainerAdminController.addAvailability);

module.exports = router;