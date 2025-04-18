const express = require("express");
const packageController = require("../controllers/packageController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin routes for package management
router.post("/", authMiddleware, adminMiddleware, packageController.createPackage);
router.get("/", packageController.getAllPackages);
router.get("/:packageId", packageController.getPackageById);
router.put("/:packageId", authMiddleware, adminMiddleware, packageController.updatePackage);
router.delete("/:packageId", authMiddleware, adminMiddleware, packageController.deletePackage);

module.exports = router;