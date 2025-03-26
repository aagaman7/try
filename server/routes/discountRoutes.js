const express = require("express");
const discountController = require("../controllers/discountController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin routes for discount management
router.post("/", authMiddleware, adminMiddleware, discountController.createDiscount);
router.get("/", discountController.getAllDiscounts);
router.put("/:discountId", authMiddleware, adminMiddleware, discountController.updateDiscount);
router.delete("/:discountId", authMiddleware, adminMiddleware, discountController.deleteDiscount);

module.exports = router;