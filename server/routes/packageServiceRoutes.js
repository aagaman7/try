// routes/packageServiceRoutes.js
const express = require("express");
const { 
  createPackage, 
  getAllPackages, 
  updatePackage, 
  deletePackage,
  createService,
  getAllServices,
  updateService,
  deleteService
} = require("../controllers/packageServiceController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Package Routes
router.post("/packages", authMiddleware, adminMiddleware, createPackage);
router.get("/packages", authMiddleware, adminMiddleware, getAllPackages);
router.put("/packages/:packageId", authMiddleware, adminMiddleware, updatePackage);
router.delete("/packages/:packageId", authMiddleware, adminMiddleware, deletePackage);

// Service Routes
router.post("/services", authMiddleware, adminMiddleware, createService);
router.get("/services", authMiddleware, adminMiddleware, getAllServices);
router.put("/services/:serviceId", authMiddleware, adminMiddleware, updateService);
router.delete("/services/:serviceId", authMiddleware, adminMiddleware, deleteService);

module.exports = router;