const Trainer = require('../models/TrainerModel');
const TrainerBooking = require('../models/TrainerBookingModel');
const TrainerReview = require('../models/TrainerReviewModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('../config/cloudinary');

// Admin Operations
exports.createTrainer = async (req, res) => {
  try {
    // Debug log
    console.log('Received body:', req.body);
    console.log('Received file:', req.file);

    let { name, availability, pricePerSession, bio, qualifications, specializations } = req.body;

    // Parse JSON fields if they are strings
    if (typeof availability === 'string') availability = JSON.parse(availability);
    if (typeof qualifications === 'string') qualifications = JSON.parse(qualifications);
    if (typeof specializations === 'string') specializations = JSON.parse(specializations);

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    
    const trainer = new Trainer({
      name,
      image: result.secure_url,
      availability,
      pricePerSession,
      bio,
      qualifications,
      specializations
    });

    await trainer.save();
    res.status(201).json(trainer);
  } catch (error) {
    console.error("Trainer creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTrainer = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updates.image = result.secure_url;
    }

    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    res.json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Booking Operations
exports.createBooking = async (req, res) => {
  try {
    const { trainerId, bookingDate, startTime, endTime } = req.body;

    // Check if trainer exists and is active
    const trainer = await Trainer.findById(trainerId);
    if (!trainer || !trainer.isActive) {
      return res.status(404).json({ message: 'Trainer not found or inactive' });
    }

    // Check if slot is available
    const existingBooking = await TrainerBooking.findOne({
      trainer: trainerId,
      bookingDate,
      startTime,
      endTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: trainer.pricePerSession * 100,
      currency: 'usd',
      payment_method_types: ['card']
    });

    const booking = new TrainerBooking({
      user: req.user.id,
      trainer: trainerId,
      bookingDate,
      startTime,
      endTime,
      price: trainer.pricePerSession,
      stripePaymentId: paymentIntent.id
    });

    await booking.save();

    res.status(201).json({
      booking,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await TrainerBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if cancellation is at least 2 hours before session
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
    const hoursUntilSession = (bookingDateTime - new Date()) / (1000 * 60 * 60);

    if (hoursUntilSession < 2) {
      return res.status(400).json({ message: 'Cannot cancel booking less than 2 hours before session' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    // Process refund if payment was made
    if (booking.paymentStatus === 'completed') {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentId
      });
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ user: req.user.id })
      .populate('trainer')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Booking Management
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await TrainerBooking.find()
      .populate('user', 'name email')
      .populate('trainer', 'name')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainerBookings = async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ trainer: req.params.trainerId })
      .populate('user', 'name email')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Review Operations
exports.createReview = async (req, res) => {
  try {
    const { trainerId, bookingId, rating, review } = req.body;

    const newReview = new TrainerReview({
      user: req.user.id,
      trainer: trainerId,
      booking: bookingId,
      rating,
      review
    });

    await newReview.save();

    // Update trainer's average rating
    const trainer = await Trainer.findById(trainerId);
    const reviews = await TrainerReview.find({ trainer: trainerId });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    trainer.averageRating = totalRating / reviews.length;
    trainer.totalRatings = reviews.length;
    
    await trainer.save();

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrainerReviews = async (req, res) => {
  try {
    const reviews = await TrainerReview.find({ trainer: req.params.trainerId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 