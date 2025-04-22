// const jwt = require("jsonwebtoken");
// const User = require("../models/UserModel"); // Import User model

// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) return res.status(401).json({ message: "Access denied" });

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Fetch full user details including currentMembership
//     const user = await User.findById(verified.id);
    
//     if (!user) return res.status(401).json({ message: "User not found" });

//     // Attach full user object to the request
//     req.user = {
//       ...verified,
//       currentMembership: user.currentMembership
//     };

//     next();
//   } catch (error) {
//     res.status(400).json({ message: "Invalid token" });
//   }
// };

// module.exports = { authMiddleware };
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided or malformed." });
  }

  const token = authHeader.split(" ")[1]; // Extract the actual token

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified.id);

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      ...verified,
      currentMembership: user.currentMembership
    };

    next();
  } catch (error) {
    console.error("❌ JWT Verification failed:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };