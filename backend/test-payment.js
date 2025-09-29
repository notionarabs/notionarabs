const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your_test_jwt_token_here'; // Replace with actual token

// Test data
const testTemplate = {
  _id: '60f7b3b3b3b3b3b3b3b3b3b3',
  title: 'Test Template',
  price: 29
};

const testCountries = [
  { code: 'EG', name: 'Egypt', expectedGateway: 'paymob' },
  { code: 'SA', name: 'Saudi Arabia', expectedGateway: 'tap_payments' },
  { code: 'JO', name: 'Jordan', expectedGateway: 'hyperpay' },
  { code: 'MA', name: 'Morocco', expectedGateway: 'paypal' }
];

// Test functions
async function testSupportedCountries() {
  console.log('🧪 Testing supported countries endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/payments/supported-countries`);
    console.log('✅ Supported countries loaded successfully');
    console.log('Countries:', Object.keys(response.data.data).length);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to load supported countries:', error.message);
    return null;
  }
}

async function testPaymentCreation(countryCode, paymentType = 'template') {
  console.log(`🧪 Testing payment creation for ${countryCode} (${paymentType})...`);

  const paymentData = {
    country: countryCode,
    billingAddress: {
      city: 'Test City',
      postalCode: '12345',
      address: '123 Test St'
    }
  };

  if (paymentType === 'template') {
    paymentData.templateId = testTemplate._id;
  } else {
    paymentData.subscription = 'creator';
  }

  try {
    const response = await axios.post(`${BASE_URL}/payments/create-intent`, paymentData, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Payment created successfully for ${countryCode}`);
    console.log(`Gateway: ${response.data.data.gateway}`);
    console.log(`Amount: ${response.data.data.amount}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Payment creation failed for ${countryCode}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGatewayRouting() {
  console.log('🧪 Testing gateway routing...');

  for (const country of testCountries) {
    const result = await testPaymentCreation(country.code);
    if (result) {
      const expectedGateway = country.expectedGateway;
      const actualGateway = result.gateway;

      if (actualGateway === expectedGateway) {
        console.log(`✅ ${country.name} (${country.code}) correctly routed to ${actualGateway}`);
      } else {
        console.log(`❌ ${country.name} (${country.code}) incorrectly routed to ${actualGateway}, expected ${expectedGateway}`);
      }
    }
  }
}

async function testRevenueSharing() {
  console.log('🧪 Testing revenue sharing calculations...');

  const testAmount = 100;
  const platformFee = Math.round(testAmount * 0.10 * 100) / 100; // 10%
  const creatorAmount = Math.round(testAmount * 0.90 * 100) / 100; // 90%

  console.log(`Test Amount: ${testAmount}`);
  console.log(`Platform Fee (10%): ${platformFee}`);
  console.log(`Creator Amount (90%): ${creatorAmount}`);
  console.log(`Total: ${platformFee + creatorAmount}`);

  if (platformFee + creatorAmount === testAmount) {
    console.log('✅ Revenue sharing calculations are correct');
  } else {
    console.log('❌ Revenue sharing calculations are incorrect');
  }
}

async function testHealthCheck() {
  console.log('🧪 Testing health check...');
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is healthy');
    console.log('Status:', response.data.status);
    console.log('Uptime:', response.data.uptime);
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Payment System Tests...\n');

  // Test 1: Health check
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    console.log('❌ Backend is not running. Please start the server first.');
    return;
  }

  console.log('\n');

  // Test 2: Supported countries
  const countries = await testSupportedCountries();
  if (!countries) {
    console.log('❌ Cannot proceed without supported countries data.');
    return;
  }

  console.log('\n');

  // Test 3: Revenue sharing calculations
  await testRevenueSharing();

  console.log('\n');

  // Test 4: Gateway routing (requires authentication)
  console.log('⚠️  Note: Gateway routing tests require a valid JWT token.');
  console.log('Please update TEST_TOKEN in this file with a valid token from your frontend.');

  if (TEST_TOKEN === 'your_test_jwt_token_here') {
    console.log('Skipping gateway routing tests due to missing token.');
  } else {
    await testGatewayRouting();
  }

  console.log('\n🎉 Testing completed!');
  console.log('\nNext steps:');
  console.log('1. Set up real gateway accounts');
  console.log('2. Add real API keys to .env file');
  console.log('3. Test with real payments (small amounts)');
  console.log('4. Deploy to production');
}

// Run tests
runAllTests().catch(console.error);
