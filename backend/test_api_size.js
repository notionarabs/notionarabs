const axios = require('axios');

async function testApiResponse() {
  try {
    const url = 'http://localhost:5000/api/creators/mostafa';
    console.log(`Fetching ${url}...`);
    const start = Date.now();
    const res = await axios.get(url);
    const end = Date.now();
    
    const size = Buffer.byteLength(JSON.stringify(res.data));
    console.log(`Response size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Response time: ${end - start}ms`);
    
    if (res.data.creator) {
        console.log(`Creator ID: ${res.data.creator.id}`);
        if (res.data.creator.templates) {
            console.log(`Template count: ${res.data.creator.templates.length}`);
            res.data.creator.templates.forEach((t, i) => {
                console.log(`Template ${i} "${t.title}" size: ${(Buffer.byteLength(JSON.stringify(t)) / 1024).toFixed(2)} KB`);
            });
        } else {
            console.log("No templates array found in creator object");
        }
    } else {
        console.log("No creator object found in response");
        console.log("Full response data:", JSON.stringify(res.data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApiResponse();
