const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public route - anyone can send a message
router.post('/messages', contactController.createMessage);

// Admin-only routes - protected with auth and admin middleware
router.get('/messages', authMiddleware, adminMiddleware, contactController.getAllMessages);
router.get('/messages/stats', authMiddleware, adminMiddleware, contactController.getMessageStats);
router.get('/messages/:id', authMiddleware, adminMiddleware, contactController.getMessageById);
router.patch('/messages/:id', authMiddleware, adminMiddleware, contactController.updateMessageStatus);
router.delete('/messages/:id', authMiddleware, adminMiddleware, contactController.deleteMessage);

module.exports = router;