// controllers/adminController.js
const User = require("../models/UserModel");
const Booking = require("../models/BookingModel");

console.log("Defining getAllUsers function"); // Add this line
exports.getAllUsers = async (req, res) => {
    console.log("getAllUsers called"); // Add this line
    try {
    const { page = 1, limit = 50, role, search } = req.query;
    
    // Build query conditions
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('currentMembership')
      .populate('membershipHistory');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile", error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId, 
      { role }, 
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Toggle user's membership status (this could be expanded based on specific requirements)
    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`, 
      user: { id: user._id, isActive: user.isActive } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling user status", error: error.message });
  }
};

exports.getUserMembershipHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('package')
      .populate('customServices')
      .sort({ timeSlot: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving membership history", error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings and populate related models
    const bookings = await Booking.find()
      .populate({
        path: 'user',
        select: 'name email' // Only return non-sensitive user info
      })
      .populate('package')
      .populate('customServices')
      .sort({ createdAt: -1 }); // Sort by newest first

    // Return success response with bookings data
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
