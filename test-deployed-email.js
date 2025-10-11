// Test deployed backend email configuration
const https = require('https');

const BACKEND_URL = 'https://notion-arabs.onrender.com';
const TEST_EMAIL = 'test@gmail.com'; // Change this to your email

console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║   Testing Deployed Backend Email Configuration       ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Test Email: ${TEST_EMAIL}\n`);
console.log('⏳ Testing...\n');

const url = `${BACKEND_URL}/api/auth/test-email?email=${encodeURIComponent(TEST_EMAIL)}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║                    ✅ SUCCESS!                        ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
        
        console.log('📧 Email Service is Working!');
        console.log(`   Message: ${result.message}`);
        console.log(`   Sent to: ${result.emailSentTo || TEST_EMAIL}\n`);
        
        if (result.config) {
          console.log('⚙️  Configuration:');
          console.log(`   Email User: ${result.config.EMAIL_USER || 'Resend API'}`);
          console.log(`   Frontend URL: ${result.config.FRONTEND_URL}`);
          console.log(`   Environment: ${result.config.NODE_ENV}\n`);
        }
        
        console.log('✉️  Check your email inbox (and spam folder)!');
        
      } else {
        console.log('╔═══════════════════════════════════════════════════════╗');
        console.log('║                    ❌ FAILED!                         ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
        
        console.log('❌ Email Service Not Working');
        console.log(`   Message: ${result.message}\n`);
        
        if (result.details) {
          console.log('🔍 Missing Configuration:');
          if (result.details.EMAIL_USER === 'Missing') {
            console.log('   ❌ EMAIL_USER not set');
          }
          if (result.details.EMAIL_PASS === 'Missing') {
            console.log('   ❌ EMAIL_PASS not set');
          }
          if (result.details.FRONTEND_URL === 'Missing') {
            console.log('   ❌ FRONTEND_URL not set');
          }
          
          console.log('\n💡 Solution:');
          console.log('   Go to Render Dashboard → Your Service → Environment');
          console.log('   Add these variables:');
          console.log('   ');
          console.log('   EMAIL_USER=your-gmail@gmail.com');
          console.log('   EMAIL_PASS=your-16-char-app-password');
          console.log('   EMAIL_FROM="فريق عرب نوشن <your-gmail@gmail.com>"');
          console.log('   FRONTEND_URL=https://www.notionarabs.com');
          console.log('   NODE_ENV=production');
          console.log('   ');
          console.log('   Then redeploy your service.');
        }
        
        if (result.error) {
          console.log(`\n📋 Error Details: ${result.error}`);
        }
      }
      
    } catch (e) {
      console.log('❌ Invalid JSON Response:');
      console.log(data);
    }
  });
  
}).on('error', (err) => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║             ❌ CONNECTION FAILED!                     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  console.log('❌ Cannot connect to backend:');
  console.log(`   ${err.message}\n`);
  
  console.log('💡 Possible Issues:');
  console.log('   1. Backend is down or not deployed');
  console.log('   2. Wrong backend URL');
  console.log('   3. Network connection issue');
  console.log('   4. Render service is starting up (wait 1-2 min)\n');
  
  console.log('🔗 Check backend status:');
  console.log(`   ${BACKEND_URL}/health`);
});

