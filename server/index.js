// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const customPackageRoutes = require("./routes/customPackageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

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

//Route connection
// const routes = require("./routes/indexRoute");
// app.use("/",routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Server error: ", err);
  } else {
    console.log("Server connected to port", PORT);
    console.log("Press Ctrl + C to end the connection ");
  }
});
