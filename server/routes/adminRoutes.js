const express = require("express");
const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();


router.get("/getallbookings", authMiddleware, adminMiddleware, adminController.getAllBookings);

// User Management Routes
router.get("/", authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get("/:userId", authMiddleware, adminMiddleware, adminController.getUserProfile);
router.put("/:userId/role", authMiddleware, adminMiddleware, adminController.updateUserRole);
router.put("/:userId/status", authMiddleware, adminMiddleware, adminController.toggleUserStatus);
router.get("/:userId/membership-history", authMiddleware, adminMiddleware, adminController.getUserMembershipHistory);


module.exports = router;