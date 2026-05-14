require('dotenv').config();
const User = require('../models/User');

async function createPaymobTester() {
  try {
    const email = 'paymob@notionarabs.com';
    const passwordPlain = 'PaymobTest2026!';
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating new Paymob test user...');
      user = new User({
        name: 'فريق فحص بيموب',
        username: 'paymob_tester',
        email,
        password: passwordPlain, // will be auto-hashed by bcrypt inside save()
        role: 'USER',
        creatorStatus: 'NONE',
        isActive: true,
        isEmailVerified: true
      });
      await user.save();
      console.log('✅ Paymob test user created successfully!');
    } else {
      console.log('Updating existing Paymob test user...');
      user.password = passwordPlain;
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
      console.log('✅ Paymob test user updated successfully!');
    }
    console.log('-----------------------------------');
    console.log('📧 Email: ' + email);
    console.log('🔑 Password: ' + passwordPlain);
    console.log('-----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tester:', err);
    process.exit(1);
  }
}

createPaymobTester();
