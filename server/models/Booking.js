const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
  customServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  totalPrice: { type: Number, required: true },
  timeSlot: { type: Date, required: true },
  status: { type: String, enum: ["Booked", "Cancelled", "Frozen"], default: "Booked" },
});

module.exports = mongoose.model("Booking", bookingSchema);
