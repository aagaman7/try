// server/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/roleMiddleware');
const contactController = require('../controllers/contactController');

// Public route for sending messages
router.post('/send', contactController.sendMessage);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, contactController.getAllMessages);
router.get('/:id', authMiddleware, adminMiddleware, contactController.getMessage);
router.put('/:id/status', authMiddleware, adminMiddleware, contactController.updateMessageStatus);
router.post('/:id/reply', authMiddleware, adminMiddleware, contactController.replyToMessage);

module.exports = router;