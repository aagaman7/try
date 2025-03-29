const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Import User model

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user details including currentMembership
    const user = await User.findById(verified.id);
    
    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach full user object to the request
    req.user = {
      ...verified,
      currentMembership: user.currentMembership
    };

    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };