const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
});

module.exports = mongoose.model("Package", packageSchema);
