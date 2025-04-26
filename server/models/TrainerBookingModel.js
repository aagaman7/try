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
    enum: ['confirmed', 'completed', 'cancelled'], 
    default: 'confirmed' 
  }
}, { timestamps: true });

module.exports = mongoose.model("TrainerBooking", TrainerBookingSchema);