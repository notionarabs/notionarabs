const mongoose = require('mongoose');
const User = require('../models/User');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs');

async function generateUsernamesForCreators() {
  try {
    console.log('Starting username generation for approved creators...');

    // Find all approved creators without usernames
    const creatorsWithoutUsernames = await User.find({
      creatorStatus: 'approved',
      username: { $exists: false },
      email: { $exists: true }
    });

    console.log(`Found ${creatorsWithoutUsernames.length} creators without usernames`);

    for (const creator of creatorsWithoutUsernames) {
      if (!creator.email) continue;

      const emailPrefix = creator.email.split('@')[0];
      // Clean the email prefix to make it a valid username
      const cleanUsername = emailPrefix
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, '') // Remove invalid characters
        .substring(0, 20); // Limit length

      // Check if this username is already taken
      let finalUsername = cleanUsername;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${cleanUsername}${counter}`;
        counter++;
      }

      // Update the creator with the new username
      await User.findByIdAndUpdate(creator._id, { username: finalUsername });
      console.log(`Updated ${creator.name} (${creator.email}) with username: ${finalUsername}`);
    }

    console.log('Username generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating usernames:', error);
    process.exit(1);
  }
}

// Run the script
generateUsernamesForCreators();
