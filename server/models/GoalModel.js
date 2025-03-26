const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Fitness', 'Weight Management', 'Health', 'Performance'],
    required: true
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Goal", GoalSchema);