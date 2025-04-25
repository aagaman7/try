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

    // Check if user already has an active membership
    const existingMembership = await User.findById(req.user.id).select('currentMembership');
    if (existingMembership && existingMembership.currentMembership) {
      return res.status(400).json({ 
        message: "You already have an active membership", 
        details: "Please upgrade or modify your existing membership instead of creating a new one" 
      });
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

exports.upgradeMembership = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    // Check if user has an active membership
    const user = await User.findById(req.user.id).select('currentMembership');
    if (!user || !user.currentMembership) {
      return res.status(400).json({ message: "No active membership found" });
    }

    const { 
      packageId,
      customServices,
      timeSlot,
      workoutDaysPerWeek,
      goals,
      paymentInterval
    } = req.body;

    // Get current booking details
    const currentBooking = await Booking.findById(user.currentMembership)
      .populate('package')
      .populate('customServices');
    
    if (!currentBooking) {
      return res.status(404).json({ message: "Current membership not found" });
    }

    // Calculate remaining value of current membership
    const today = new Date();
    const totalDays = Math.floor((currentBooking.endDate - currentBooking.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.floor((currentBooking.endDate - today) / (1000 * 60 * 60 * 24)));
    const remainingValue = (daysRemaining / totalDays) * currentBooking.totalPrice;

    // Get new package details
    let newPackage;
    let newBasePrice = 0;

    if (packageId) {
      newPackage = await Package.findById(packageId).populate('includedServices');
      if (!newPackage) {
        return res.status(400).json({ message: "Invalid package" });
      }
      newBasePrice = newPackage.basePrice;
    } else {
      // Keep existing package if not changing
      newPackage = currentBooking.package;
      newBasePrice = newPackage.basePrice;
    }

    // Process custom services
    let newCustomServices = customServices || currentBooking.customServices.map(service => service._id);
    let servicesPrice = 0;
    
    if (newCustomServices.length > 0) {
      const serviceDetails = await Service.find({ _id: { $in: newCustomServices } });
      servicesPrice = serviceDetails.reduce((sum, service) => sum + service.price, 0);
    }

    // Determine payment interval and get applicable discount
    const newInterval = paymentInterval || currentBooking.paymentInterval;
    const discount = await Discount.findOne({ 
      paymentInterval: newInterval, 
      active: true 
    });

    // Calculate new total price
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    const newTotalPrice = (newBasePrice + servicesPrice) * intervalMultiplier[newInterval];
    
    // Apply discount if applicable
    const discountedPrice = discount 
      ? newTotalPrice * (1 - (discount.percentage / 100)) 
      : newTotalPrice;

    // Calculate amount to charge (new price minus remaining value)
    const amountToCharge = Math.max(0, discountedPrice - remainingValue);

    // Create Stripe payment intent if there's an amount to charge
    let paymentIntent = null;
    if (amountToCharge > 0) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amountToCharge * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['card']
      });
    }

    // Update booking with new details
    const updatedBooking = {
      package: packageId || currentBooking.package._id,
      customServices: newCustomServices,
      timeSlot: timeSlot || currentBooking.timeSlot,
      workoutDaysPerWeek: workoutDaysPerWeek || currentBooking.workoutDaysPerWeek,
      goals: goals || currentBooking.goals,
      paymentInterval: newInterval,
      totalPrice: discountedPrice
    };

    // Update end date based on new payment interval
    if (paymentInterval && paymentInterval !== currentBooking.paymentInterval) {
      updatedBooking.endDate = new Date(today.getTime() + 
        (intervalMultiplier[newInterval] * 30 * 24 * 60 * 60 * 1000));
    }

    // If there's a payment change, update payment ID
    if (paymentIntent) {
      updatedBooking.stripePaymentId = paymentIntent.id;
    }

    // Update the booking
    const updatedMembership = await Booking.findByIdAndUpdate(
      user.currentMembership,
      updatedBooking,
      { new: true }
    ).populate('package').populate('customServices');

    // Prepare response
    const response = {
      message: "Membership updated successfully",
      originalPrice: currentBooking.totalPrice,
      newPrice: discountedPrice,
      remainingValue: remainingValue,
      amountCharged: amountToCharge,
      updatedMembership
    };

    // Add client secret if payment is needed
    if (paymentIntent) {
      response.clientSecret = paymentIntent.client_secret;
      response.requiresPayment = true;
    } else {
      response.requiresPayment = false;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Membership upgrade error:", error);
    res.status(500).json({ message: "Error upgrading membership", error: error.message });
  }
};