const express = require("express");
const serviceController = require("../controllers/serviceController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin routes for service management
router.post("/", authMiddleware, adminMiddleware, serviceController.createService);
router.get("/", serviceController.getAllServices);
router.put("/:serviceId", authMiddleware, adminMiddleware, serviceController.updateService);
router.delete("/:serviceId", authMiddleware, adminMiddleware, serviceController.deleteService);

module.exports = router;