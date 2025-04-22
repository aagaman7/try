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
    if (!packageId || !timeSlot || !workoutDaysPerWeek || !goals || !paymentInterval) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    // Find package and validate
    const package = await Package.findById(packageId).populate('includedServices');
    if (!package) {
      return res.status(400).json({ message: "Invalid package" });
    }
  
    // Calculate base price
    let basePrice = package.basePrice;
    
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

    let totalPrice = basePrice * intervalMultiplier[paymentInterval];
    if (discount) {
      totalPrice *= (1 - (discount.percentage / 100));
    }

    // Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card']
    });

    // Create booking
    const newBooking = new Booking({
      user: req.user.id,
      package: packageId,
      customServices,
      timeSlot,
      workoutDaysPerWeek,
      goals,
      paymentInterval,
      totalPrice,
      stripePaymentId: paymentIntent.id,
      endDate: new Date(Date.now() + (intervalMultiplier[paymentInterval] * 30 * 24 * 60 * 60 * 1000))
    });

    await newBooking.save();

    // Update user's current and history membership
    await User.findByIdAndUpdate(req.user.id, {
      currentMembership: newBooking._id,
      $push: { membershipHistory: newBooking._id }
    });

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
    const bookings = await Booking.find({ user: req.user.id })
      .populate('package')
      .populate('customServices')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bookings", error: error.message });
  }
};