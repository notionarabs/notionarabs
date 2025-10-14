const Settings = require('../models/Settings');

// Middleware to check maintenance mode
const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance mode check in development
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }

    const settings = await Settings.getSettings();

    // Allow admin routes, auth routes, and public settings even during maintenance
    const isAdminRoute = req.path.startsWith('/api/admin') || req.path.startsWith('/admin');
    const isAuthRoute = req.path.startsWith('/api/auth/');
    const isPublicSettings = req.path === '/api/settings/public' || req.path === '/settings/public' || req.path.includes('/settings/');
    const isHealthCheck = req.path === '/api/health';

    if (settings.maintenanceMode && !isAdminRoute && !isAuthRoute && !isPublicSettings && !isHealthCheck) {
      return res.status(503).json({
        success: false,
        message: 'الموقع في وضع الصيانة حالياً',
        maintenanceMode: true
      });
    }

    next();
  } catch (error) {
    console.error('Check maintenance mode error:', error);
    next(); // Continue if settings check fails
  }
};

// Middleware to check registration enabled
const checkRegistrationEnabled = async (req, res, next) => {
  try {
    // Skip registration check in development
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }

    const settings = await Settings.getSettings();

    if (!settings.registrationEnabled && req.path.includes('/auth/signup')) {
      return res.status(403).json({
        success: false,
        message: 'التسجيل غير متاح حالياً'
      });
    }

    next();
  } catch (error) {
    console.error('Check registration enabled error:', error);
    next(); // Continue if settings check fails
  }
};

// Middleware to check creator applications enabled
const checkCreatorApplicationsEnabled = async (req, res, next) => {
  try {
    // Skip creator applications check in development
    if (process.env.NODE_ENV === 'development') {
      next();
      return;
    }

    const settings = await Settings.getSettings();

    if (!settings.creatorApplicationsEnabled && req.path.includes('/auth/apply-creator')) {
      return res.status(403).json({
        success: false,
        message: 'طلبات المبدعين غير متاحة حالياً'
      });
    }

    next();
  } catch (error) {
    console.error('Check creator applications enabled error:', error);
    next(); // Continue if settings check fails
  }
};

// Function to check if auto-approve is enabled for templates
const shouldAutoApproveTemplates = async () => {
  try {
    const settings = await Settings.getSettings();
    return settings.autoApproveTemplates;
  } catch (error) {
    console.error('Check auto approve templates error:', error);
    return false; // Default to manual approval
  }
};

// Function to check if auto-approve is enabled for blogs
const shouldAutoApproveBlogs = async () => {
  try {
    const settings = await Settings.getSettings();
    return settings.autoApproveBlogs;
  } catch (error) {
    console.error('Check auto approve blogs error:', error);
    return false; // Default to manual approval
  }
};

module.exports = {
  checkMaintenanceMode,
  checkRegistrationEnabled,
  checkCreatorApplicationsEnabled,
  shouldAutoApproveTemplates,
  shouldAutoApproveBlogs
};
