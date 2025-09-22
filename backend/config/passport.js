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
      if (!profile.emails || !profile.emails[0]) {
        console.error('No email in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      const email = profile.emails[0].value;

      // Check database connection
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.error('Database not connected. State:', mongoose.connection.readyState);
        return done(new Error('Database not connected'), null);
      }

      // Check if user already exists
      let user = await User.findOne({ email: email });

      if (user) {
        // User exists, update Google ID and profile picture if not set
        let needsUpdate = false;
        if (!user.googleId) {
          user.googleId = profile.id;
          needsUpdate = true;
        }
        if (!user.profilePicture && profile.photos && profile.photos[0]) {
          // Get higher resolution Google profile picture
          let profilePicUrl = profile.photos[0].value;
          if (profilePicUrl.includes('googleusercontent.com')) {
            // Replace size parameter to get higher resolution (s96-c -> s400-c)
            profilePicUrl = profilePicUrl.replace(/s\d+-c/, 's400-c');
          }
          user.profilePicture = profilePicUrl;
          needsUpdate = true;
        }
        // Ensure Google users have verified email
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
          user.isActive = true;
          needsUpdate = true;
        }
        if (needsUpdate) {
          await user.save();
        }
        return done(null, user);
      } else {
        // Create new user
        let profilePicUrl = null;
        if (profile.photos && profile.photos[0]) {
          profilePicUrl = profile.photos[0].value;
          // Get higher resolution Google profile picture
          if (profilePicUrl.includes('googleusercontent.com')) {
            // Replace size parameter to get higher resolution (s96-c -> s400-c)
            profilePicUrl = profilePicUrl.replace(/s\d+-c/, 's400-c');
          }
        }

        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          password: 'google-oauth-user', // Dummy password for Google users
          profilePicture: profilePicUrl,
          isActive: true,
          isEmailVerified: true // Google users are considered verified since they verified with Google
        });

        await user.save();
        return done(null, user);
      }
    } catch (error) {
      console.error('Google OAuth strategy error:', error);
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
