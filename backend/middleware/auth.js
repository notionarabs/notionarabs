const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Authorization header:', authHeader);

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير رمز المصادقة'
      });
    }

    console.log('Auth middleware - Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (!decoded.userId) {
      console.log('Auth middleware - Invalid token structure');
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    console.log('Auth middleware - Looking for user:', decoded.userId);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('Auth middleware - User not found:', decoded.userId);
      console.log('Auth middleware - Available users in DB:', await User.find({}, '_id email').limit(5));
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    if (!user.isActive) {
      console.log('Auth middleware - User account inactive:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    console.log('Auth middleware - Authentication successful for user:', user.email);
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
