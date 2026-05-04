const supabase = require('./utils/supabase');

async function checkTemplates() {
  const creatorId = '00763be663e78583a05b9090';
  console.log(`Checking templates for creatorId: ${creatorId}`);
  
  const { data, error } = await supabase.from('Template').select('id, title, status, creatorId').eq('creatorId', creatorId);
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Found ${data.length} templates`);
  data.forEach(t => {
      console.log(`- ${t.title} [${t.status}] (creatorId: ${t.creatorId})`);
  });
}

checkTemplates();
