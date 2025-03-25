const mongoose = require("mongoose");

const gymCapacitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  currentCount: { type: Number, default: 0 },
  maxCapacity: { type: Number, required: true },
});

module.exports = mongoose.model("GymCapacity", gymCapacitySchema);
