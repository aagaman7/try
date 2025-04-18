const Booking = require("../models/BookingModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.confirmPayment = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    const { bookingId, paymentMethodId } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Verify that this booking belongs to the current user
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to this booking" });
    }

    // In a real application, you would use Stripe.js to confirm the payment
    // with the client secret and paymentMethodId
    // For this example, we'll simulate a successful payment confirmation

    // Update booking status
    booking.status = 'active';
    booking.paymentStatus = 'paid';
    await booking.save();

    res.status(200).json({ 
      success: true,
      message: "Payment confirmed successfully",
      booking
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error confirming payment", 
      error: error.message 
    });
  }
};