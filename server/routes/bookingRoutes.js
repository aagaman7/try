const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authMiddleware } = require("../middleware/authMiddleware"); // Update import to match middleware export

const router = express.Router();

router.post("/", authMiddleware, bookingController.bookMembership);

module.exports = router;