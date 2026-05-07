require('dotenv').config();
const supabase = require('./utils/supabase');

async function testQuery() {
  const creatorId = '30663edd6404be4645d20bc9';
  const { data, error } = await supabase
    .from('Template')
    .select('id, title, downloads, views, status')
    .eq('creatorId', creatorId);

  console.log('Template data:', data);
}

testQuery();
