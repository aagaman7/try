const Booking = require("../models/BookingModel");
const User = require("../models/UserModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
          totalPrice: mostRecentBooking.totalPrice
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
        totalPrice: currentBooking.totalPrice
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

    // Update booking status and set freeze start date
    currentBooking.status = 'Frozen';
    currentBooking.freezeStartDate = new Date();
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
    const freezeDuration = Math.floor(
      (new Date() - currentBooking.freezeStartDate) / (1000 * 60 * 60 * 24)
    );

    // Check if freeze duration exceeds maximum
    if (freezeDuration > 90) {
      // If exceeded, only extend by 90 days
      currentBooking.endDate = new Date(
        currentBooking.endDate.getTime() + (90 * 24 * 60 * 60 * 1000)
      );
    } else {
      // Extend by actual freeze duration
      currentBooking.endDate = new Date(
        currentBooking.endDate.getTime() + (freezeDuration * 24 * 60 * 60 * 1000)
      );
    }

    // Update booking status and clear freeze start date
    currentBooking.status = 'Active';
    currentBooking.freezeStartDate = null;

    // Optional: Add to freeze history
    if (!currentBooking.freezeHistory) {
      currentBooking.freezeHistory = [];
    }
    currentBooking.freezeHistory.push({
      startDate: currentBooking.freezeStartDate,
      endDate: new Date(),
      duration: freezeDuration
    });

    await currentBooking.save();

    res.json({ 
      message: "Membership unfrozen successfully",
      freezeDuration,
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