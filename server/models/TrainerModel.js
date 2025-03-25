// models/TrainerModel.js
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const AvailabilitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  times: [{ type: String }]
});

const TrainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  image: { type: String, default: "/api/placeholder/300/300" },
  experience: { type: String, required: true },
  price: { type: String, required: true },
  bio: { type: String, required: true },
  description: { type: String, required: true },
  qualifications: [{ type: String }],
  reviews: [ReviewSchema],
  availability: [AvailabilitySchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Trainer", TrainerSchema);