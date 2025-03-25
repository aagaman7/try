require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Existing routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Admin Routes
const adminRoutes = require("./routes/adminRoutes");
const packageServiceRoutes = require("./routes/packageServiceRoutes");
const gymInsightsRoutes = require("./routes/gymInsightsRoutes");

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
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);

// Admin Routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/packages", packageServiceRoutes);
app.use("/api/admin/gym", gymInsightsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Server error: ", err);
  } else {
    console.log("Server connected to port", PORT);
    console.log("Press Ctrl + C to end the connection ");
  }
});