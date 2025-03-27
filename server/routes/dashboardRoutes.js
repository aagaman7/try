const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// User dashboard routes
router.get("/", authMiddleware, dashboardController.getUserDashboardInfo);
router.post("/cancel", authMiddleware, dashboardController.cancelMembership);
router.post("/freeze", authMiddleware, dashboardController.freezeMembership);
router.post("/extend", authMiddleware, dashboardController.extendMembership);

module.exports = router;