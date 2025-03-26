const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  isCustom: { type: Boolean, default: false },
  includedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Package", PackageSchema);