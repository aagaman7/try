// server/controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

// Configure email transporter
// Note: In production, use environment variables for these credentials
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create a new contact message
exports.createMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message, preferredContact } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    // Create new message
    const newMessage = new ContactMessage({
      firstName,
      lastName,
      email,
      phone: phone || '',
      subject,
      message,
      preferredContact: preferredContact || 'email'
    });
    
    await newMessage.save();
    
    // Send notification to admin (optional feature)
    const adminNotification = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      text: `You have received a new message from ${firstName} ${lastName}. Subject: ${subject}`
    };
    
    try {
      await transporter.sendMail(adminNotification);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Continue processing even if email notification fails
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Your message has been sent successfully',
      data: { id: newMessage._id }
    });
  } catch (err) {
    console.error('Contact message creation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while submitting your message'
    });
  }
};

// Get all messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 }) // Newest first
      .select('-replies.sentBy'); // Exclude sensitive data
    
    res.status(200).json({ 
      success: true, 
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching messages'
    });
  }
};

// Get a single message by ID (admin only)
exports.getMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('replies.sentBy', 'name email');
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'No message found with this ID'
      });
    }
    
    // Update status to 'read' if it was 'new'
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }
    
    res.status(200).json({ 
      success: true, 
      data: message
    });
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while fetching the message'
    });
  }
};

// Reply to a message (admin only)
exports.replyToMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply content is required'
      });
    }
    
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'No message found with this ID'
      });
    }
    
    // Add reply to message
    message.replies.push({
      content,
      sentBy: req.user._id // Assumes user is authenticated and added to req by auth middleware
    });
    
    // Update status
    message.status = 'replied';
    await message.save();
    
    // Send email reply to the original sender
    const emailReply = {
      from: process.env.EMAIL_USER,
      to: message.email,
      subject: `Re: ${message.subject}`,
      text: content
    };
    
    try {
      await transporter.sendMail(emailReply);
    } catch (emailError) {
      console.error('Failed to send email reply:', emailError);
      return res.status(500).json({ 
        success: false, 
        message: 'Reply saved but failed to send email'
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Reply sent successfully',
      data: message
    });
  } catch (err) {
    console.error('Error replying to message:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while sending your reply'
    });
  }
};

// Update message status (admin only)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value'
      });
    }
    
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'No message found with this ID'
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: message
    });
  } catch (err) {
    console.error('Error updating message status:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while updating the message status'
    });
  }
};

// Delete a message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'No message found with this ID'
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred while deleting the message'
    });
  }
};