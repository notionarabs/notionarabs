const axios = require('axios');

// Test the debug endpoint (no auth required)
async function testDebugEndpoint() {
  try {
    console.log('🧪 Testing Screenshot Debug Endpoint...');

    const response = await axios.post('http://localhost:5000/api/screenshot/debug', {
      url: 'https://notion.so/your-page-url' // Replace with actual Notion URL
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Debug endpoint success:', response.data);
  } catch (error) {
    console.log('❌ Debug endpoint error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Test the main endpoint (with auth)
async function testMainEndpoint() {
  try {
    console.log('🧪 Testing Main Screenshot Endpoint...');

    // You'll need to replace this with a valid JWT token
    const token = 'YOUR_JWT_TOKEN_HERE';

    const response = await axios.post('http://localhost:5000/api/screenshot', {
      url: 'https://notion.so/your-page-url' // Replace with actual Notion URL
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Main endpoint success:', response.data);
  } catch (error) {
    console.log('❌ Main endpoint error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  try {
    console.log('🧪 Testing Health Endpoint...');

    const response = await axios.get('http://localhost:5000/api/screenshot/health');

    console.log('✅ Health endpoint success:', response.data);
  } catch (error) {
    console.log('❌ Health endpoint error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Screenshot API Tests...\n');

  await testHealthEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');

  await testDebugEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');

  await testMainEndpoint();

  console.log('\n🏁 Tests completed!');
}

runTests();
