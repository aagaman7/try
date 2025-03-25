// middleware/roleMiddleware.js
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin rights required." });
    }
  };
  
  module.exports = { adminMiddleware };