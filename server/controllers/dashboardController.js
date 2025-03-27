const Booking = require("../models/BookingModel");
const User = require("../models/UserModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getUserDashboardInfo = async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.user.currentMembership)
      .populate('package')
      .populate('customServices');

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
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
    const { freezeDays } = req.body;
    
    // Validate freeze duration
    if (freezeDays < 7 || freezeDays > 90) {
      return res.status(400).json({ message: "Freeze duration must be between 7 and 90 days" });
    }

    const currentBooking = await Booking.findById(req.user.currentMembership);

    if (!currentBooking) {
      return res.status(404).json({ message: "No active membership found" });
    }

    // Extend membership end date
    const newEndDate = new Date(currentBooking.endDate.getTime() + (freezeDays * 24 * 60 * 60 * 1000));
    
    currentBooking.endDate = newEndDate;
    await currentBooking.save();

    res.json({ 
      message: "Membership frozen successfully", 
      originalEndDate: currentBooking.endDate,
      newEndDate: newEndDate,
      freezeDays 
    });
  } catch (error) {
    res.status(500).json({ message: "Error freezing membership", error: error.message });
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