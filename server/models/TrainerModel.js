// models/TrainerModel.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const AvailabilitySchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialization: { type: String, required: true },
  image: { type: String, default: "/api/placeholder/300/300" },
  experience: { type: String, required: true },
  price: { type: String, required: true },
  bio: { type: String, required: true },
  description: { type: String, required: true },
  qualifications: [{ type: String }],
  reviews: [ReviewSchema],
  availability: [AvailabilitySchema],
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Trainer", TrainerSchema);