const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Payment confirmation route
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

module.exports = router;