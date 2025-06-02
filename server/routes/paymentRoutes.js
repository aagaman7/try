const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-intent', authMiddleware, paymentController.createPaymentIntent);

module.exports = router; 