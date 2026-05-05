const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.FRONTEND_URL || 'https://www.notionarabs.com'}`.replace(/\/$/, '') + '/api/auth/google/callback',
    proxy: true // Trust proxy for Heroku/Render
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('[GOOGLE OAUTH] Strategy triggered for profile:', profile.id);
      if (!profile.emails || !profile.emails[0]) {
        console.error('[GOOGLE OAUTH] No email in Google profile');
        return done(new Error('No email found in Google profile'), null);
      }

      const email = profile.emails[0].value;
      console.log('[GOOGLE OAUTH] Authenticating user:', email);

      // Direct Supabase insert to bypass User model's silent-fail on RLS
      const supabase = require('../utils/supabase');

      // Step 1: Check if user exists directly via Supabase
      const { data: existingUsers, error: findError } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .limit(1);

      console.log('[GOOGLE OAUTH] Find result:', { count: existingUsers?.length, error: findError?.message });

      if (findError) {
        console.error('[GOOGLE OAUTH] Supabase find error:', findError);
        return done(new Error('Database lookup failed: ' + findError.message), null);
      }

      let dbUser = existingUsers && existingUsers[0];

      if (dbUser) {
        console.log('[GOOGLE OAUTH] Existing user found, id:', dbUser.id);
        // Update fields if needed
        const updates = {};
        if (!dbUser.googleId) updates.googleId = profile.id;
        if (!dbUser.profilePicture && profile.photos && profile.photos[0]) {
          let pic = profile.photos[0].value;
          if (pic.includes('googleusercontent.com')) pic = pic.replace(/s\d+-c/, 's400-c');
          updates.profilePicture = pic;
        }
        if (!dbUser.isEmailVerified) { updates.isEmailVerified = true; updates.isActive = true; }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase.from('User').update(updates).eq('id', dbUser.id);
          if (updateError) console.error('[GOOGLE OAUTH] Update error:', updateError);
          else Object.assign(dbUser, updates);
        }
      } else {
        console.log('[GOOGLE OAUTH] User not found, creating new user in Supabase...');
        // Create new user directly via Supabase
        const crypto = require('crypto');
        const newId = crypto.randomBytes(12).toString('hex');
        const now = new Date().toISOString();

        let profilePicUrl = null;
        if (profile.photos && profile.photos[0]) {
          profilePicUrl = profile.photos[0].value;
          if (profilePicUrl.includes('googleusercontent.com')) {
            profilePicUrl = profilePicUrl.replace(/s\d+-c/, 's400-c');
          }
        }

        // Generate a unique username from email
        let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        let finalUsername = baseUsername;
        let attempt = 0;
        while (true) {
          const checkName = attempt === 0 ? finalUsername : `${baseUsername}${attempt}`;
          const { data: existingUsername } = await supabase.from('User').select('id').eq('username', checkName).limit(1);
          if (!existingUsername || existingUsername.length === 0) { finalUsername = checkName; break; }
          attempt++;
        }

        const newUserData = {
          id: newId,
          googleId: profile.id,
          name: profile.displayName,
          username: finalUsername,
          email: email,
          password: 'google-oauth-user',
          profilePicture: profilePicUrl,
          isActive: true,
          isEmailVerified: true,
          role: 'USER',
          creatorStatus: 'NONE',
          createdAt: now,
          updatedAt: now
        };

        console.log('[GOOGLE OAUTH] Inserting user data:', { id: newId, email, username: finalUsername });
        const { data: insertedUsers, error: insertError } = await supabase
          .from('User')
          .insert(newUserData)
          .select();

        console.log('[GOOGLE OAUTH] Insert result:', { data: insertedUsers, error: insertError?.message, details: insertError?.details, code: insertError?.code });

        if (insertError) {
          console.error('[GOOGLE OAUTH] CRITICAL: Failed to insert user:', insertError);
          return done(new Error('Failed to create user: ' + insertError.message), null);
        }

        dbUser = insertedUsers && insertedUsers[0];
        if (!dbUser) {
          // Try to fetch the user we just inserted
          console.warn('[GOOGLE OAUTH] Insert returned no data (possible RLS), fetching by email...');
          const { data: fetched } = await supabase.from('User').select('*').eq('email', email).limit(1);
          dbUser = fetched && fetched[0];
        }

        if (!dbUser) {
          console.error('[GOOGLE OAUTH] CRITICAL: User was inserted but cannot be retrieved. Check Supabase RLS policies.');
          return done(new Error('User created but not retrievable - check Supabase RLS'), null);
        }

        console.log('[GOOGLE OAUTH] New user created successfully, id:', dbUser.id);
        
        // Send welcome email to new Google user
        try {
          await sendWelcomeEmail(dbUser);
        } catch (emailError) {
          console.error('[GOOGLE OAUTH] Failed to send welcome email:', emailError.message);
          // Don't fail the login just because the email failed
        }
      }

      // Return user in UserDoc-compatible shape
      const User = require('../models/User');
      const userDoc = new User(dbUser);
      userDoc.id = dbUser.id;
      userDoc._id = dbUser.id;
      return done(null, userDoc);

    } catch (error) {
      console.error('[GOOGLE OAUTH] Strategy error:', error);
      // Ensure we don't pass an empty object or something that might crash passport
      return done(error instanceof Error ? error : new Error(String(error)), null);
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
