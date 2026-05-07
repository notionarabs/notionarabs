require('dotenv').config();
const supabase = require('./utils/supabase');

async function checkDownloads() {
  const creatorId = '30663edd6404be4645d20bc9';
  const { data, error } = await supabase
    .from('DownloadLog')
    .select('*')
    .eq('creatorId', creatorId);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  console.log('Total Download Logs count:', data.length);
  console.log('All logs:', data);
}

checkDownloads();
