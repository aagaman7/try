const Booking = require("../models/BookingModel");
const User = require("../models/UserModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Package = require("../models/PackageModel");
const Service = require("../models/ServiceModel");

exports.getUserDashboardInfo = async (req, res) => {
  try {
    console.log("User Object:", req.user);

    // If no current membership, try to find the most recent active booking
    if (!req.user.currentMembership) {
      const mostRecentBooking = await Booking.findOne({ 
        user: req.user.id, 
        status: 'Active' 
      })
        .populate('package')
        .populate('customServices')
        .sort({ createdAt: -1 });

      if (!mostRecentBooking) {
        return res.status(404).json({ 
          message: "No active membership found", 
          details: "No current or recent active bookings" 
        });
      }

      // Update user's currentMembership if a recent booking is found
      await User.findByIdAndUpdate(req.user.id, {
        currentMembership: mostRecentBooking._id
      });

      return res.json({
        membershipDetails: {
          package: mostRecentBooking.package,
          customServices: mostRecentBooking.customServices,
          startDate: mostRecentBooking.startDate,
          endDate: mostRecentBooking.endDate,
          activeDays: Math.max(0, Math.floor((new Date() - mostRecentBooking.startDate) / (1000 * 60 * 60 * 24))),
          daysRemaining: Math.max(0, Math.floor((mostRecentBooking.endDate - new Date()) / (1000 * 60 * 60 * 24))),
          paymentInterval: mostRecentBooking.paymentInterval,
          totalPrice: mostRecentBooking.totalPrice,
          status: mostRecentBooking.status
        }
      });
    }

    const currentBooking = await Booking.findById(req.user.currentMembership)
      .populate('package')
      .populate('customServices');

    if (!currentBooking) {
      return res.status(404).json({ 
        message: "No active membership found", 
        details: "Current membership ID invalid" 
      });
    }
    if (!currentBooking) {
      return res.status(404).json({ 
        message: "No active membership found", 
        membershipId: req.user.currentMembership 
      });
    }
    // Calculate days in membership
    const today = new Date();
    const membershipStartDate = currentBooking.startDate;
    const membershipEndDate = currentBooking.endDate;

    const activeDaysTotal = Math.max(0, Math.floor((today - membershipStartDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.floor((membershipEndDate - today) / (1000 * 60 * 60 * 24)));

    res.json({
      membershipDetails: {
        package: currentBooking.package,
        customServices: currentBooking.customServices,
        startDate: membershipStartDate,
        endDate: membershipEndDate,
        activeDays: activeDaysTotal,
        daysRemaining: daysRemaining,
        paymentInterval: currentBooking.paymentInterval,
        totalPrice: currentBooking.totalPrice,
        status: currentBooking.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving dashboard information", error: error.message });
  }
};

exports.cancelMembership = async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.user.currentMembership);

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    const today = new Date();
    const membershipStartDate = currentBooking.startDate;
    const membershipEndDate = currentBooking.endDate;

    // Calculate days since membership started
    const daysSinceMembershipStart = Math.floor((today - membershipStartDate) / (1000 * 60 * 60 * 24));

    let refundAmount = 0;
    // Full refund if within first 7 days
    if (daysSinceMembershipStart <= 7) {
      refundAmount = currentBooking.totalPrice;
    } else {
      // Pro-rated refund based on remaining days
      const totalMembershipDays = Math.floor((membershipEndDate - membershipStartDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.floor((membershipEndDate - today) / (1000 * 60 * 60 * 24));
      
      refundAmount = (daysRemaining / totalMembershipDays) * currentBooking.totalPrice;
    }

    // Process Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: currentBooking.stripePaymentId,
      amount: Math.round(refundAmount * 100) // Convert to cents
    });

    // Update booking status
    currentBooking.status = 'Cancelled';
    await currentBooking.save();

    // Update user's membership
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { currentMembership: 1 }
    });

    res.json({ 
      message: "Membership cancelled successfully", 
      refundAmount,
      refundDetails: refund 
    });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling membership", error: error.message });
  }
};

exports.freezeMembership = async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.user.currentMembership);

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    // Check if membership is already frozen
    if (currentBooking.status === 'Frozen') {
      return res.status(400).json({ message: "Membership is already frozen" });
    }

    // Record freeze start date and update status
    currentBooking.status = 'Frozen';
    currentBooking.freezeStartDate = new Date();
    if (!currentBooking.freezeHistory) {
      currentBooking.freezeHistory = [];
    }
    await currentBooking.save();

    res.json({ 
      message: "Membership frozen successfully",
      freezeStartDate: currentBooking.freezeStartDate,
      status: currentBooking.status
    });
  } catch (error) {
    res.status(500).json({ message: "Error freezing membership", error: error.message });
  }
};

exports.unfreezeMembership = async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.user.currentMembership);

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    // Check if membership is actually frozen
    if (currentBooking.status !== 'Frozen') {
      return res.status(400).json({ message: "Membership is not frozen" });
    }

    // Calculate freeze duration
    const freezeStart = currentBooking.freezeStartDate;
    const now = new Date();
    const freezeDuration = Math.floor((now - freezeStart) / (1000 * 60 * 60 * 24));

    // Minimum freeze period: 7 days
    if (freezeDuration < 7) {
      return res.status(400).json({ message: "You must freeze your membership for at least 7 days before unfreezing." });
    }

    // Maximum freeze period: 50 days
    const maxFreeze = 50;
    let extensionDays = freezeDuration > maxFreeze ? maxFreeze : freezeDuration;

    // Extend membership end date
    currentBooking.endDate = new Date(currentBooking.endDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));

    // Update booking status and clear freeze start date
    currentBooking.status = 'Active';
    // Add freeze record to history
    if (!currentBooking.freezeHistory) {
      currentBooking.freezeHistory = [];
    }
    currentBooking.freezeHistory.push({
      startDate: freezeStart,
      endDate: now,
      duration: freezeDuration
    });
    currentBooking.freezeStartDate = null;

    await currentBooking.save();

    res.json({ 
      message: "Membership unfrozen successfully",
      freezeDuration,
      extensionDays,
      newEndDate: currentBooking.endDate,
      status: currentBooking.status
    });
  } catch (error) {
    res.status(500).json({ message: "Error unfreezing membership", error: error.message });
  }
};

exports.getMembershipFreezeStatus = async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.user.currentMembership);

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    const response = {
      status: currentBooking.status || 'Active',
      freezeStartDate: currentBooking.freezeStartDate,
      freezeHistory: currentBooking.freezeHistory || []
    };

    if (currentBooking.status === 'Frozen') {
      const currentFreezeDuration = Math.floor(
        (new Date() - currentBooking.freezeStartDate) / (1000 * 60 * 60 * 24)
      );
      response.currentFreezeDuration = currentFreezeDuration;
      response.remainingFreezeDays = Math.max(0, 90 - currentFreezeDuration);
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Error getting freeze status", error: error.message });
  }
};

exports.extendMembership = async (req, res) => {
  try {
    const { extensionMonths } = req.body;
    const currentBooking = await Booking.findById(req.user.currentMembership)
      .populate('package');

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    // Calculate extension price based on original package
    const extensionPrice = currentBooking.package.basePrice * extensionMonths;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(extensionPrice * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card']
    });

    // Extend membership end date
    const newEndDate = new Date(currentBooking.endDate.getTime() + 
      (extensionMonths * 30 * 24 * 60 * 60 * 1000));
    
    currentBooking.endDate = newEndDate;
    currentBooking.totalPrice += extensionPrice;
    await currentBooking.save();

    res.json({ 
      message: "Membership extension initiated", 
      extensionPrice,
      originalEndDate: currentBooking.endDate,
      newEndDate,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: "Error extending membership", error: error.message });
  }
};

exports.editMembership = async (req, res) => {
  try {
    const { packageId, customServices } = req.body;
    const userId = req.user.id;
    const currentBooking = await Booking.findById(req.user.currentMembership).populate('package');
    if (!currentBooking) {
      return res.status(404).json({ message: 'No active membership found' });
    }
    // Calculate remaining value of current membership (pro-rated)
    const today = new Date();
    const totalMembershipDays = Math.floor((currentBooking.endDate - currentBooking.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.floor((currentBooking.endDate - today) / (1000 * 60 * 60 * 24)));
    const currentValueRemaining = (daysRemaining / totalMembershipDays) * currentBooking.totalPrice;

    // Get new package and services
    const newPackage = await Package.findById(packageId);
    if (!newPackage) {
      return res.status(400).json({ message: 'Invalid new package' });
    }
    let newTotalPrice = newPackage.basePrice;
    let newServices = [];
    if (customServices && customServices.length > 0) {
      newServices = await Service.find({ _id: { $in: customServices } });
      newTotalPrice += newServices.reduce((sum, s) => sum + s.price, 0);
    }
    // New membership total cost for remaining period (pro-rated)
    const newValueForRemaining = (daysRemaining / totalMembershipDays) * newTotalPrice;
    const priceDifference = newValueForRemaining - currentValueRemaining;

    let paymentIntent = null;
    let refund = null;
    if (priceDifference > 0.01) {
      // User owes money, create Stripe payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(priceDifference * 100),
        currency: 'usd',
        payment_method_types: ['card']
      });
    } else if (priceDifference < -0.01) {
      // User gets credit/refund
      refund = await stripe.refunds.create({
        payment_intent: currentBooking.stripePaymentId,
        amount: Math.round(Math.abs(priceDifference) * 100)
      });
    }

    // Update booking with new package/services, recalculate total price
    currentBooking.package = packageId;
    currentBooking.customServices = customServices;
    currentBooking.totalPrice = newTotalPrice;
    await currentBooking.save();

    res.json({
      message: 'Membership updated successfully',
      booking: currentBooking,
      paymentRequired: !!paymentIntent,
      paymentIntentClientSecret: paymentIntent ? paymentIntent.client_secret : null,
      refundDetails: refund
    });
  } catch (error) {
    res.status(500).json({ message: 'Error editing membership', error: error.message });
  }
};