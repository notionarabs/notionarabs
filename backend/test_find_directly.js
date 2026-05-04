const Template = require('./models/Template');

async function testFind() {
  try {
    const creatorId = '00763be663e78583a05b9090';
    console.log(`Testing Template.find for creatorId: ${creatorId}`);
    
    const results = await Template.find({ creator: creatorId, status: 'approved' })
      .select('title price rating downloads category coverImage isPaid purchaseLink')
      .limit(6)
      .lean();
      
    console.log(`Found ${results.length} templates`);
    if (results.length > 0) {
        console.log('First template:', JSON.stringify(results[0], null, 2));
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testFind();
