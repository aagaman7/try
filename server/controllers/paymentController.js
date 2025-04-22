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

    console.log('Payment request received:', req.body);

    // Handle both data formats: direct fields or nested in booking object
    let packageId, customServices, timeSlot, workoutDaysPerWeek, goals, paymentInterval, amount;
    
    if (req.body.packageId) {
      // Direct fields
      packageId = req.body.packageId;
      customServices = req.body.customServices || [];
      timeSlot = req.body.timeSlot;
      workoutDaysPerWeek = req.body.workoutDaysPerWeek;
      goals = req.body.goals;
      paymentInterval = req.body.paymentInterval;
      amount = req.body.amount;
    } else if (req.body.booking) {
      // Nested in booking object
      const booking = req.body.booking;
      packageId = booking.packageId;
      customServices = booking.customServices || [];
      timeSlot = booking.timeSlot;
      workoutDaysPerWeek = booking.workoutDaysPerWeek;
      goals = booking.goals;
      paymentInterval = booking.paymentInterval;
      amount = booking.amount || req.body.amount;
    } else {
      console.error('Invalid payment request format');
      return res.status(400).json({ message: 'Invalid payment request format' });
    }

    // Validate required fields
    if (!packageId) {
      return res.status(400).json({ message: 'Missing required package ID' });
    }

    // Find package and validate
    const packageData = await Package.findById(packageId).populate('includedServices');
    if (!packageData) {
      return res.status(400).json({ message: 'Invalid package' });
    }

    // Calculate total price to make sure it matches what the frontend sent
    let basePrice = packageData.basePrice;
    
    // Add custom services price if any
    if (customServices && customServices.length > 0) {
      const servicesPrices = await Service.find({ _id: { $in: customServices } });
      basePrice += servicesPrices.reduce((sum, service) => sum + service.price, 0);
    }

    // Apply interval multiplier
    const intervalMultiplier = {
      'Monthly': 1,
      '3 Months': 3,
      'Yearly': 12
    };

    let totalPrice = basePrice * (intervalMultiplier[paymentInterval] || 1);

    // Find applicable discount
    const discount = await Discount.findOne({ 
      paymentInterval, 
      active: true 
    });

    if (discount) {
      totalPrice *= (1 - (discount.percentage / 100));
    }

    // Use calculated amount or provided amount
    const finalAmount = amount || totalPrice;
    console.log(`Creating payment intent for $${finalAmount} (${Math.round(finalAmount * 100)} cents)`);

    // Create payment intent with Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          userId: req.user.id,
          packageId: packageId,
          timeSlot: timeSlot || '',
          paymentInterval: paymentInterval || 'Monthly'
        }
      });

      console.log('Payment intent created:', paymentIntent.id);

      // Return the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      res.status(400).json({ 
        message: 'Error creating payment with Stripe', 
        error: stripeError.message 
      });
    }
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

    console.log('Payment confirmation request:', req.body);
    const { paymentIntentId, bookingId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Payment has not been completed successfully',
        status: paymentIntent.status
      });
    }

    // Find or create booking
    let booking = await Booking.findOne({ stripePaymentId: paymentIntentId });
    
    if (!booking) {
      // Extract packageId from either bookingId parameter or payment intent metadata
      const packageId = bookingId || paymentIntent.metadata.packageId;
      
      if (!packageId) {
        return res.status(400).json({ message: 'Package ID not found in request or payment metadata' });
      }

      // Get package details to create the booking
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Extract information from payment intent metadata
      const paymentInterval = paymentIntent.metadata.paymentInterval || 'Monthly';
      const timeSlot = paymentIntent.metadata.timeSlot || '';

      // Determine interval and end date
      const intervalMultiplier = {
        'Monthly': 1,
        '3 Months': 3,
        'Yearly': 12
      };
      const intervalInDays = (intervalMultiplier[paymentInterval] || 1) * 30;

      // Handle goals format (string or array)
      let goals = [];
      if (req.body.goals) {
        goals = Array.isArray(req.body.goals) ? req.body.goals : [req.body.goals];
      }

      // Create new booking
      booking = new Booking({
        user: req.user.id,
        package: packageId,
        customServices: req.body.customServices || [],
        timeSlot: timeSlot,
        workoutDaysPerWeek: req.body.workoutDaysPerWeek || 3,
        goals: goals,
        paymentInterval: paymentInterval,
        totalPrice: amount || (paymentIntent.amount / 100), // Convert cents back to dollars
        stripePaymentId: paymentIntentId,
        paymentStatus: 'completed',
        endDate: new Date(Date.now() + (intervalInDays * 24 * 60 * 60 * 1000))
      });

      await booking.save();
      console.log('New booking created:', booking._id);

      // Update user's current membership and history
      await User.findByIdAndUpdate(req.user.id, {
        currentMembership: booking._id,
        $push: { membershipHistory: booking._id }
      });
    } else {
      // Update existing booking if found
      booking.paymentStatus = 'completed';
      await booking.save();
      console.log('Existing booking updated:', booking._id);
    }

    res.json({ 
      success: true, 
      booking,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
};