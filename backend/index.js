const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Import optimization middleware
const {
  securityHeaders,
  compressionMiddleware,
  generalRateLimit,
  authRateLimit,
  apiRateLimit
} = require('./middleware/security');
const {
  requestLogger,
  memoryMonitor,
  responseTimeOptimization
} = require('./middleware/performance');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Trust proxy so req.secure and forwarded headers are accurate behind Render/Vercel proxies
app.set('trust proxy', 1);
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://notionarabs.com',
  'https://notionarabs.com',
  'https://www.notionarabs.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, be more permissive for Vercel domains
      if (process.env.NODE_ENV === 'production' && origin && origin.includes('vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply optimization middleware first
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requestLogger);
app.use(memoryMonitor);
app.use(responseTimeOptimization);

// Apply CORS middleware  
app.use(cors(corsOptions));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Only set CORS headers if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});
app.use(express.json());

// Serve static files (screenshots)
app.use('/uploads', express.static('uploads'));

// Passport middleware
app.use(passport.initialize());
require('./config/passport');

// Database connection
// Optimized MongoDB connection with connection pooling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs', {
  // Connection pooling optimizations
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5,  // Minimum number of connections in the pool
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // How long to try to connect
  socketTimeoutMS: 45000, // How long to wait for a response
  // Read preferences for better performance
  readPreference: 'secondaryPreferred'
})
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => console.error('Database connection error:', err));

// Apply rate limiting to routes
// Import settings middleware
const { checkMaintenanceMode, checkRegistrationEnabled, checkCreatorApplicationsEnabled } = require('./middleware/settings');

app.use('/api/auth', authRateLimit);
app.use('/api', apiRateLimit);

// Apply settings middleware
app.use(checkMaintenanceMode);
app.use('/api/auth', checkRegistrationEnabled);
app.use('/api/auth', checkCreatorApplicationsEnabled);
app.use('/', generalRateLimit);

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const templateRoutes = require('./routes/templates');
const screenshotRoutes = require('./routes/screenshot');
const blogRoutes = require('./routes/blogs');
const creatorRoutes = require('./routes/creators');
const uploadRoutes = require('./routes/upload');
const contactRoutes = require('./routes/contact');
const ratingRoutes = require('./routes/ratings');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const healthRoutes = require('./routes/health');
const statsRoutes = require('./routes/stats');
const unsubscribeRoutes = require('./routes/unsubscribe');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', adminRoutes); // Public settings endpoint
app.use('/api/templates', templateRoutes);
app.use('/api/screenshot', screenshotRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/unsubscribe', unsubscribeRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Notion Arabs Backend API',
    version: '1.0.0',
    status: 'running',
    cors: 'configured',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      origin: req.get('Origin'),
      allowedOrigins: allowedOrigins,
      environment: process.env.NODE_ENV || 'development'
    });
  }

  res.status(500).json({
    success: false,
    message: 'خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - catch all routes that don't match any defined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'الصفحة غير موجودة'
  });
});

// Start server
app.listen(PORT, () => { });
