const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  customServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  timeSlot: { type: String, required: true },
  workoutDaysPerWeek: { type: Number, min: 1, max: 7, required: true },
  goals: [{ type: String }],
  paymentInterval: { 
    type: String, 
    enum: ['Monthly', '3 Months', 'Yearly'], 
    required: true 
  },
  totalPrice: { type: Number, required: true },
  stripePaymentId: { type: String },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Active', 'Expired', 'Cancelled', 'Frozen'	], 
    default: 'Active' 
  },
  freezeStartDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);