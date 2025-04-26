// middleware/membershipMiddleware.js
const User = require("../models/UserModel");

const membershipMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    // Find the user and check if they have an active membership
    const user = await User.findById(req.user.id).select('currentMembership');
    
    if (!user || !user.currentMembership) {
      return res.status(403).json({ 
        message: "Access denied. Active membership required.",
        details: "You need to purchase a membership package before booking a trainer session."
      });
    }

    // User has active membership, proceed
    next();
  } catch (error) {
    console.error("Membership check error:", error);
    res.status(500).json({ message: "Error checking membership status", error: error.message });
  }
};

module.exports = { membershipMiddleware };