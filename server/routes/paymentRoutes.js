const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create payment intent
router.post('/', authMiddleware, paymentController.processPayment);

// Payment confirmation route
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

module.exports = router;