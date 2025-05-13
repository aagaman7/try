// models/TrainerBookingModel.js
const mongoose = require("mongoose");

const TrainerBookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  trainer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trainer', 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String, 
    default: "" 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  totalPrice: {
    type: Number,
    required: true
  },
  stripePaymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model("TrainerBooking", TrainerBookingSchema);