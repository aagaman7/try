// controllers/trainerController.js
const Trainer = require("../models/TrainerModel");
const User = require("../models/UserModel");
const TrainerBooking = require("../models/TrainerBookingModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get all active trainers
exports.getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true });
    res.status(200).json(trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ message: "Error fetching trainers", error: error.message });
  }
};

// Get single trainer details
exports.getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.status(200).json(trainer);
  } catch (error) {
    console.error("Error fetching trainer:", error);
    res.status(500).json({ message: "Error fetching trainer details", error: error.message });
  }
};

// Book a trainer session
exports.bookTrainerSession = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const { trainerId, date, time, notes } = req.body;

    // Validate required fields
    if (!trainerId || !date || !time) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if the time slot is available
    const availabilityDate = trainer.availability.find(a => a.date === date);
    if (!availabilityDate || !availabilityDate.times.includes(time)) {
      return res.status(400).json({ message: "Selected time slot is not available" });
    }

    // Extract the price from the trainer
    // Converting from string to number as the model stores price as string
    const price = parseFloat(trainer.price);
    if (isNaN(price)) {
      return res.status(500).json({ message: "Invalid trainer price" });
    }

    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card']
    });

    // Create a new booking with payment information
    const newBooking = new TrainerBooking({
      user: req.user.id,
      trainer: trainerId,
      date,
      time,
      notes: notes || "",
      status: "pending", // Set to pending until payment is confirmed
      totalPrice: price,
      stripePaymentId: paymentIntent.id,
      paymentStatus: 'pending'
    });

    await newBooking.save();

    // Return booking info and client secret
    res.status(201).json({ 
      message: "Trainer session booking initiated",
      booking: newBooking,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error("Error booking trainer session:", error);
    res.status(500).json({ message: "Error booking trainer session", error: error.message });
  }
};

// Confirm trainer booking payment
exports.confirmTrainerBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking
    const booking = await TrainerBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if this booking belongs to the user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to confirm this booking" });
    }

    // Update booking status
    booking.status = "confirmed";
    booking.paymentStatus = "completed";
    await booking.save();

    // Remove the booked time slot from trainer's availability
    await Trainer.updateOne(
      { _id: booking.trainer, "availability.date": booking.date },
      { $pull: { "availability.$.times": booking.time } }
    );
    
    res.status(200).json({ 
      message: "Booking payment confirmed successfully",
      booking
    });
    
  } catch (error) {
    console.error("Error confirming booking payment:", error);
    res.status(500).json({ message: "Error confirming booking payment", error: error.message });
  }
};

// Get user's trainer bookings
exports.getUserTrainerBookings = async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ user: req.user.id })
      .populate('trainer')
      .sort({ date: 1, time: 1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user's trainer bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// Cancel a trainer booking
exports.cancelTrainerBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking
    const booking = await TrainerBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if this booking belongs to the user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }
    
    // Check if the booking is in the future (can be cancelled)
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const hoursDifference = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDifference < 24) {
      return res.status(400).json({ 
        message: "Cannot cancel booking less than 24 hours before session time" 
      });
    }

    // Process refund via Stripe if payment was completed
    if (booking.paymentStatus === 'completed') {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentId
      });
      
      booking.paymentStatus = 'refunded';
    }
    
    // Add the time slot back to trainer's availability
    await Trainer.updateOne(
      { _id: booking.trainer },
      { $push: { "availability.$[elem].times": booking.time } },
      { arrayFilters: [{ "elem.date": booking.date }] }
    );
    
    // Update booking status to cancelled
    booking.status = "cancelled";
    await booking.save();
    
    res.status(200).json({ 
      message: "Booking cancelled successfully",
      booking 
    });
    
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};