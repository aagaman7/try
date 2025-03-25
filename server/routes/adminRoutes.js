// routes/adminRoutes.js
const express = require("express");
const { 
  getAllUsers, 
  getUserProfile, 
  updateUserRole, 
  toggleUserStatus, 
  getUserMembershipHistory 
} = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// User Management Routes
router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:userId", authMiddleware, adminMiddleware, getUserProfile);
router.put("/:userId/role", authMiddleware, adminMiddleware, updateUserRole);
router.put("/:userId/status", authMiddleware, adminMiddleware, toggleUserStatus);
router.get("/:userId/membership-history", authMiddleware, adminMiddleware, getUserMembershipHistory);

module.exports = router;