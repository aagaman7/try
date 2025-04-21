const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/BookingModel');
const User = require('../models/UserModel');
const Package = require('../models/PackageModel');
const Service = require('../models/ServiceModel');
const Discount = require('../models/DiscountModel');

exports.processPayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { 
      packageId, 
      customServices = [], 
      timeSlot, 
      workoutDaysPerWeek, 
      goals,
      paymentInterval,
      amount 
    } = req.body;

    // Find package and validate
    const packageData = await Package.findById(packageId).populate('includedServices');
    if (!packageData) {
      return res.status(400).json({ message: 'Invalid package' });
    }

    // Calculate total price to make sure it matches what the frontend sent
    let basePrice = packageData.basePrice;
    
    // Add custom services price if any
    if (customServices.length > 0) {
      const servicesPrices = await Service.find({ _id: { $in: customServices } });
      basePrice += servicesPrices.reduce((sum, service) => sum + service.price, 0);
    }

    // Apply interval multiplier
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    let totalPrice = basePrice * intervalMultiplier[paymentInterval];

    // Find applicable discount
    const discount = await Discount.findOne({ 
      paymentInterval, 
      active: true 
    });

    if (discount) {
      totalPrice *= (1 - (discount.percentage / 100));
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        packageId: packageId
      }
    });

    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { paymentIntentId, bookingId, amount } = req.body;

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment has not been completed successfully' });
    }

    // Find or create booking
    let booking = await Booking.findOne({ stripePaymentId: paymentIntentId });
    
    if (!booking) {
      // Get package details to create the booking
      const packageData = await Package.findById(bookingId);
      if (!packageData) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Determine payment interval and end date
      const paymentDetails = req.body;
      const intervalMultiplier = {
        'Monthly': 1,
        '3 Months': 3,
        'Yearly': 12
      };
      const intervalInDays = (intervalMultiplier[paymentDetails.paymentInterval] || 1) * 30;

      // Create new booking
      booking = new Booking({
        user: req.user.id,
        package: bookingId,
        customServices: paymentDetails.customServices || [],
        timeSlot: paymentDetails.timeSlot,
        workoutDaysPerWeek: paymentDetails.workoutDaysPerWeek || 3,
        goals: paymentDetails.goals,
        paymentInterval: paymentDetails.paymentInterval || 'Monthly',
        totalPrice: amount,
        stripePaymentId: paymentIntentId,
        paymentStatus: 'completed',
        endDate: new Date(Date.now() + (intervalInDays * 24 * 60 * 60 * 1000))
      });

      await booking.save();

      // Update user's current membership and history
      await User.findByIdAndUpdate(req.user.id, {
        currentMembership: booking._id,
        $push: { membershipHistory: booking._id }
      });
    } else {
      // Update existing booking if found
      booking.paymentStatus = 'completed';
      await booking.save();
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};