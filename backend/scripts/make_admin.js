const path = require('path');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function makeAdmin(email) {
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`✅ Success! User ${user.name} (${user.email}) is now an ADMIN.`);
    } else {
      console.log(`❌ Error: User with email ${email} not found in database.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

makeAdmin('mostafayasser2612@gmail.com');
