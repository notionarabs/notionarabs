const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    console.log('Authorization header:', req.header('Authorization'));

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير رمز المصادقة'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.userId).select('-password');
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    if (!user.isActive) {
      console.log('User not active');
      return res.status(401).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    console.log('User authenticated successfully:', user.name, 'Creator status:', user.creatorStatus);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'رمز المصادقة غير صحيح'
    });
  }
};

module.exports = auth;
