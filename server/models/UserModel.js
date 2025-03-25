// models/UserModel.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Member"], default: "Member" },
  // Membership fields
  currentMembership: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  stripeCustomerId: { type: String }, // Reserved for future payment integration
  membershipHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);