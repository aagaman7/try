// server/controllers/contactController.js
const Contact = require('../models/ContactModel');
const nodemailer = require('nodemailer');

// Create transporter for sending emails
let transporter = null;

// Initialize transporter if email credentials are available
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log('Initializing email configuration...');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Admin Email:', process.env.ADMIN_EMAIL);
  
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify transporter connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('SMTP Connection Error:', error);
      console.error('Email configuration failed. Please check your credentials.');
    } else {
      console.log('SMTP Server is ready to send emails');
    }
  });
} else {
  console.log('Email credentials not found in .env file:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set' : 'Not set');
  console.log('Email notifications will be disabled.');
}

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      preferredContactMethod
    } = req.body;

    console.log('Received contact form submission:', {
      firstName,
      lastName,
      email,
      subject,
      preferredContactMethod
    });

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const newMessage = new Contact({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      preferredContactMethod
    });

    await newMessage.save();
    console.log('Message saved to database with ID:', newMessage._id);

    // Send email notification if transporter is configured
    if (transporter) {
      try {
        console.log('Attempting to send confirmation email to user:', email);
        // Send confirmation to user
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Message Received - RBL Fitness',
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${firstName} ${lastName},</p>
            <p>We have received your message and will get back to you soon.</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
            <br>
            <p>Best regards,</p>
            <p>RBL Fitness Team</p>
          `
        });
        console.log('Confirmation email sent to user successfully');

        // Send notification to admin
        if (process.env.ADMIN_EMAIL) {
          console.log('Attempting to send notification to admin:', process.env.ADMIN_EMAIL);
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Contact Form Submission',
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong> ${message}</p>
              <p><strong>Preferred Contact:</strong> ${preferredContactMethod}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            `
          });
          console.log('Admin notification email sent successfully');
        } else {
          console.log('Admin email not configured, skipping admin notification');
        }
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
        console.error('Email error details:', {
          code: emailError.code,
          command: emailError.command,
          response: emailError.response
        });
        // Continue execution even if email sending fails
      }
    } else {
      console.log('Email transporter not configured, skipping email notifications');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get all messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get a single message (admin only)
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
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
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
};

// Update message status (admin only)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

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
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
};

// Reply to a message (admin only)
exports.replyToMessage = async (req, res) => {
  try {
    const { message: replyMessage } = req.body;
    
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        reply: {
          message: replyMessage,
          date: new Date(),
          repliedBy: req.user._id
        },
        status: 'replied'
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Send email notification of reply if transporter is configured
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: message.email,
          subject: `Re: ${message.subject}`,
          html: `
            <h2>Response to your inquiry</h2>
            <p>Dear ${message.firstName} ${message.lastName},</p>
            <p>${replyMessage}</p>
            <br>
            <p>Original message:</p>
            <p><em>${message.message}</em></p>
            <br>
            <p>Best regards,</p>
            <p>RBL Fitness Team</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending reply email:', emailError);
        // Continue execution even if email sending fails
      }
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};