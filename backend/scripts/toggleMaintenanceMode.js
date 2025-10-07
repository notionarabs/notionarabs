const mongoose = require('mongoose');
const Settings = require('../models/Settings');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs';

async function toggleMaintenanceMode() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to database');

    // Get current settings
    const settings = await Settings.getSettings();
    console.log('Current maintenance mode:', settings.maintenanceMode);

    // Toggle maintenance mode
    const newMaintenanceMode = !settings.maintenanceMode;
    await Settings.updateSettings({ maintenanceMode: newMaintenanceMode });

    console.log(`Maintenance mode ${newMaintenanceMode ? 'ENABLED' : 'DISABLED'}`);
    console.log('✅ Settings updated successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
toggleMaintenanceMode();
