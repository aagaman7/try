const Booking = require("../models/BookingModel");
const Package = require("../models/PackageModel");
const Service = require("../models/ServiceModel");
const User = require("../models/UserModel");
const Discount = require("../models/DiscountModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createBooking = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const { 
      packageId, 
      customServices, 
      timeSlot, 
      workoutDaysPerWeek, 
      goals, 
      paymentInterval 
    } = req.body;

    // Validate required fields
    if (!packageId) {
      return res.status(400).json({ message: "Missing required package ID" });
    }

    if (!timeSlot) {
      return res.status(400).json({ message: "Time slot is required" });
    }

    // Find package and validate
    const packageData = await Package.findById(packageId).populate('includedServices');
    if (!packageData) {
      return res.status(400).json({ message: "Invalid package" });
    }
  
    // Calculate base price
    let basePrice = packageData.basePrice;
    
    // Add custom services price if any
    if (customServices && customServices.length > 0) {
      const servicesPrices = await Service.find({ _id: { $in: customServices } });
      basePrice += servicesPrices.reduce((sum, service) => sum + service.price, 0);
    }

    // Find applicable discount
    const discount = await Discount.findOne({ 
      paymentInterval, 
      active: true 
    });

    // Calculate total price
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    let totalPrice = basePrice * (intervalMultiplier[paymentInterval] || 1);
    if (discount) {
      totalPrice *= (1 - (discount.percentage / 100));
    }

    // Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        userId: req.user.id,
        packageId: packageId,
        timeSlot: timeSlot || '',
        paymentInterval: paymentInterval || 'Monthly'
      }
    });

    // Format goals correctly
    let formattedGoals = goals;
    if (typeof goals === 'string') {
      formattedGoals = goals.split(',').map(goal => goal.trim());
    } else if (!Array.isArray(goals)) {
      formattedGoals = [];
    }

    // Create booking
    const newBooking = new Booking({
      user: req.user.id,
      package: packageId,
      customServices: customServices || [],
      timeSlot,
      workoutDaysPerWeek: workoutDaysPerWeek || 3,
      goals: formattedGoals,
      paymentInterval: paymentInterval || 'Monthly',
      totalPrice,
      stripePaymentId: paymentIntent.id,
      paymentStatus: 'pending',
      endDate: new Date(Date.now() + ((intervalMultiplier[paymentInterval] || 1) * 30 * 24 * 60 * 60 * 1000))
    });

    await newBooking.save();

    res.status(201).json({ 
      booking: newBooking, 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }
    
    const bookings = await Booking.find({ user: req.user.id })
      .populate('package')
      .populate('customServices')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    res.status(500).json({ message: "Error retrieving bookings", error: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { timeSlot } = req.query;
    
    if (!timeSlot) {
      return res.status(400).json({ message: "Time slot is required" });
    }
    
    // Simple availability check - could be expanded based on business logic
    const existingBookings = await Booking.countDocuments({ 
      timeSlot, 
      paymentStatus: { $ne: 'cancelled' },
      endDate: { $gt: new Date() }
    });
    
    // Assuming there's a maximum capacity per time slot
    const maxCapacity = 20; // This could be dynamically determined
    const isAvailable = existingBookings < maxCapacity;
    
    res.json({ 
      isAvailable, 
      remainingSlots: Math.max(0, maxCapacity - existingBookings)
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Error checking availability", error: error.message });
  }
};