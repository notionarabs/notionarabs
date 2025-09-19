const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notion-arabs')
  .then(() => console.log('تم الاتصال بقاعدة البيانات بنجاح'))
  .catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

async function makeAdmin(email) {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('المستخدم غير موجود');
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`تم تعيين ${user.name} كمدير بنجاح`);
    console.log('بيانات المدير:');
    console.log('- الاسم:', user.name);
    console.log('- البريد الإلكتروني:', user.email);
    console.log('- نوع التسجيل:', user.googleId ? 'Google' : 'البريد الإلكتروني');
    console.log('- الدور:', user.role);

  } catch (error) {
    console.error('خطأ في تعيين المدير:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('الاستخدام: node makeAdmin.js <email>');
  console.log('مثال: node makeAdmin.js user@gmail.com');
  process.exit(1);
}

makeAdmin(email);
