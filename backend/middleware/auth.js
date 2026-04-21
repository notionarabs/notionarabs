const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير رمز المصادقة'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('[AUTH DEBUG] Decoded token:', JSON.stringify(decoded));

    const userId = decoded.userId || decoded.id;
    if (!userId) {
        console.log('[AUTH DEBUG] No userId/id in token');
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    const user = await User.findById(userId).select('-password');
    
    // Fallback: If not found by ID, try finding by email if available in token
    let authenticatedUser = user;
    if (!authenticatedUser && decoded.email) {
        console.log('[AUTH DEBUG] User not found by ID, trying fallback for email:', decoded.email);
        authenticatedUser = await User.findOne({ email: decoded.email }).select('-password');
    }

    console.log('[AUTH DEBUG] User found:', authenticatedUser ? authenticatedUser.email : 'STILL NOT FOUND');
    if (authenticatedUser) {
        console.log('[AUTH DEBUG] User role:', authenticatedUser.role);
    }
    
    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صحيح'
      });
    }

    if (!authenticatedUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'تم تعطيل الحساب'
      });
    }

    // Normalize case for status and role consistency across the application
    if (authenticatedUser.role) authenticatedUser.role = authenticatedUser.role.toString().toLowerCase();
    if (authenticatedUser.creatorStatus) authenticatedUser.creatorStatus = authenticatedUser.creatorStatus.toString().toLowerCase();

    req.user = authenticatedUser;
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
