const axios = require('axios');

async function testSpecificURL() {
  try {
    console.log('🧪 Testing specific Notion URL...');
    console.log('URL: https://field-crystal-5fd.notion.site/100-Days-Challenge-2766a52682378077b7dcdc59158aaebb?source=copy_link');

    const response = await axios.post('http://localhost:5000/api/screenshot/debug', {
      url: 'https://field-crystal-5fd.notion.site/100-Days-Challenge-2766a52682378077b7dcdc59158aaebb?source=copy_link'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testSpecificURL();
