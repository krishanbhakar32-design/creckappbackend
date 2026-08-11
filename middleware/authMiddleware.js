// Yeh file check karti hai ki request bhejne wala user login hai ya nahi, aur admin hai ya nahi
const jwt = require('jsonwebtoken');

// Check karo user logged-in hai (koi bhi valid user)
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Login zaroori hai isko access karne ke liye' });
  }

  try {
    const token = authHeader.split(' ')[1]; // "Bearer <token>" mein se token nikalo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ab aage wale function mein req.user.id aur req.user.role mil jayega
    next();
  } catch (error) {
    res.status(401).json({ message: 'Session expire ho gaya, dubara login karo' });
  }
};

// Check karo user admin hai (sirf tumhare liye - test/PDF generate karne ke liye)
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Sirf admin yeh kaam kar sakta hai' });
  }
  next();
};
