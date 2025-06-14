require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Existing routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const trainerRoutes = require("./routes/trainerRoutes");

// New routes for membership system
const packageRoutes = require("./routes/packageRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const discountRoutes = require("./routes/discountRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
// const goalRoutes = require("./routes/goalRoutes");

// Added contact routes
// const contactRoutes = require("./routes/contactRoutes");

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Regular middleware
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173'], // Add your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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
app.use("/api/admin", adminRoutes);

// Membership System Routes
app.use("/api/packages", packageRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/contact", contactRoutes);
// app.use("/api/goals", goalRoutes);

// Added contact routes
// app.use("/api/contact", contactRoutes);

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Server error: ", err);
  } else {
    console.log("Server connected to port", PORT);
    console.log("Press Ctrl + C to end the connection ");
  }
});