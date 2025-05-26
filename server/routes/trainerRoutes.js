// routes/trainerRoutes.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { membershipMiddleware } = require("../middleware/membershipMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");
const trainerController = require("../controllers/trainerController");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Static routes first
router.get("/bookings", authMiddleware, membershipMiddleware, trainerController.getUserBookings);
router.post("/bookings", authMiddleware, membershipMiddleware, trainerController.createBooking);
router.post("/bookings/:id/cancel", authMiddleware, membershipMiddleware, trainerController.cancelBooking);
router.post("/reviews", authMiddleware, membershipMiddleware, trainerController.createReview);

// Dynamic routes after
router.get("/:trainerId", trainerController.getTrainerById);
router.get("/:trainerId/reviews", trainerController.getTrainerReviews);
router.get("/:trainerId/available-slots", trainerController.getAvailableSlots);

// Admin routes
router.get("/admin/all", authMiddleware, adminMiddleware, trainerController.getAllTrainers);
router.post("/admin/trainers", authMiddleware, adminMiddleware, upload.single('image'), trainerController.createTrainer);
router.put("/admin/trainers/:id", authMiddleware, adminMiddleware, upload.single('image'), trainerController.updateTrainer);
router.delete("/admin/trainers/:id", authMiddleware, adminMiddleware, trainerController.deleteTrainer);
router.get("/admin/bookings", authMiddleware, adminMiddleware, trainerController.getAllBookings);
router.get("/admin/trainers/:trainerId/bookings", authMiddleware, adminMiddleware, trainerController.getTrainerBookings);

// Public routes
router.get("/", trainerController.getAllTrainers);

// Reviews (membership required to write, auth required to edit/delete)
router.put("/reviews/:reviewId", authMiddleware, trainerController.editReview);
router.delete("/reviews/:reviewId", authMiddleware, trainerController.deleteReview);

module.exports = router;