const express = require("express");
const goalController = require("../controllers/goalController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin routes for goal management
router.post("/", authMiddleware, adminMiddleware, goalController.createGoal);
router.get("/", goalController.getAllGoals);
router.put("/:goalId", authMiddleware, adminMiddleware, goalController.updateGoal);
router.delete("/:goalId", authMiddleware, adminMiddleware, goalController.deleteGoal);

module.exports = router;