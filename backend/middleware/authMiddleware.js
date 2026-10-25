const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authRequired = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Malformed token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    req.user = decoded;
    if (decoded.userId) {
      try {
        const user = await User.findById(decoded.userId).select('-password').lean();
        if (user) {
          req.user = {
            ...decoded,
            userId: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          };
        }
      } catch (dbErr) {
        // Fall back to decoded token payload
      }
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    req.user = decoded;
    if (decoded.userId) {
      try {
        const user = await User.findById(decoded.userId).select('-password').lean();
        if (user) {
          req.user = {
            ...decoded,
            userId: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          };
        }
      } catch (dbErr) {
        // Fall back to decoded token payload
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = { authRequired, optionalAuth };

