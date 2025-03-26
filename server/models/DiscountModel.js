const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  percentage: { type: Number, min: 0, max: 100, required: true },
  paymentInterval: { 
    type: String, 
    enum: ['Monthly', '3 Months', 'Yearly'], 
    required: true 
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Discount", DiscountSchema);