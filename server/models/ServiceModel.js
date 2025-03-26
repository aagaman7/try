const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String }, // e.g., 'Fitness', 'Wellness'
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Service", ServiceSchema);