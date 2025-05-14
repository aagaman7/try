const ContactMessage = require('../models/ContactMessage');

// Controller for contact message operations
const contactController = {
  // Create a new contact message (public access)
  createMessage: async (req, res) => {
    try {
      const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        subject, 
        message, 
        preferredContact 
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide all required fields' 
        });
      }

      // Create new message
      const newMessage = await ContactMessage.create({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        preferredContact: preferredContact || 'email'
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
        data: { id: newMessage._id }
      });
    } catch (error) {
      console.error('Error in createMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }
  },

  // Get all messages (admin only)
  getAllMessages: async (req, res) => {
    try {
      // Add pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Add sorting
      const sortField = req.query.sortField || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortField]: sortOrder };

      // Add filtering
      const filter = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        filter.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { subject: searchRegex },
          { message: searchRegex }
        ];
      }

      // Get messages with pagination, sorting, and filtering
      const messages = await ContactMessage.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination info
      const total = await ContactMessage.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllMessages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve messages. Please try again.'
      });
    }
  },

  // Get a single message by ID (admin only)
  getMessageById: async (req, res) => {
    try {
      const message = await ContactMessage.findById(req.params.id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.status(200).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Error in getMessageById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve message. Please try again.'
      });
    }
  },

  // Update message status (admin only)
  updateMessageStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['unread', 'read', 'replied'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Status must be unread, read, or replied.'
        });
      }

      const updatedMessage = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedMessage
      });
    } catch (error) {
      console.error('Error in updateMessageStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update message status. Please try again.'
      });
    }
  },

  // Delete a message (admin only)
  deleteMessage: async (req, res) => {
    try {
      const message = await ContactMessage.findByIdAndDelete(req.params.id);
      
      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete message. Please try again.'
      });
    }
  },

  // Get message statistics (admin only)
  getMessageStats: async (req, res) => {
    try {
      const stats = await ContactMessage.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Format stats into an object
      const formattedStats = stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Add total count
      const total = await ContactMessage.countDocuments();
      formattedStats.total = total;

      res.status(200).json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Error in getMessageStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve message statistics. Please try again.'
      });
    }
  }
};

module.exports = contactController;