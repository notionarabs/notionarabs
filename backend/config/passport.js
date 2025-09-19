const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://notion-arabs.onrender.com/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth strategy called');
      console.log('Profile:', profile);
      console.log('Profile emails:', profile.emails);
      
      if (!profile.emails || !profile.emails[0]) {
        console.error('No email in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      const email = profile.emails[0].value;
      console.log('Looking for user with email:', email);

      // Check database connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.error('Database not connected. State:', mongoose.connection.readyState);
        return done(new Error('Database not connected'), null);
      }

      // Check if user already exists
      let user = await User.findOne({ email: email });
      console.log('User found:', !!user);

      if (user) {
        // User exists, update Google ID if not set
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
          console.log('Updated user with Google ID');
        }
        return done(null, user);
      } else {
        // Create new user
        console.log('Creating new user');
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          password: 'google-oauth-user', // Dummy password for Google users
          isActive: true
        });

        await user.save();
        console.log('New user created successfully');
        return done(null, user);
      }
    } catch (error) {
      console.error('Google OAuth strategy error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth credentials not found. Google login will be disabled.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
