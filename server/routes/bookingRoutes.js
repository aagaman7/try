const express = require("express");
const { bookMembership } = require("../controllers/bookingController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, bookMembership);

module.exports = router;
