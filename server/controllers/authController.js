const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasNumber && hasSymbol;
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and contain at least one number and one symbol" 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("🎫 JWT Token generated:", token);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, currentMembership: user.currentMembership } });
  } catch (error) {
    console.log("🔥 Error during login:", error);
    res.status(500).json({ message: "Server error" });
    // res.status(500).json({ `message: {error} ` });
  }
};

module.exports = { register, login };
