// server/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/roleMiddleware');

// Public route - anyone can submit a contact message
router.post('/messages', contactController.createMessage);

// Admin only routes - protected with authentication and admin role check
router.get('/messages', authMiddleware, adminMiddleware, contactController.getAllMessages);
router.get('/messages/:id', authMiddleware, adminMiddleware, contactController.getMessageById);
router.post('/messages/:id/reply', authMiddleware, adminMiddleware, contactController.replyToMessage);
router.patch('/messages/:id/status', authMiddleware, adminMiddleware, contactController.updateMessageStatus);
router.delete('/messages/:id', authMiddleware, adminMiddleware, contactController.deleteMessage);

module.exports = router;