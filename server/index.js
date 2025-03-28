require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Existing routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

// New routes for membership system
const packageRoutes = require("./routes/packageRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const discountRoutes = require("./routes/discountRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
// const goalRoutes = require("./routes/goalRoutes");

const app = express();

// Regular middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MongoDB connection string is missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminRoutes);

// Membership System Routes
app.use("/api/packages", packageRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/goals", goalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Server error: ", err);
  } else {
    console.log("Server connected to port", PORT);
    console.log("Press Ctrl + C to end the connection ");
  }
});