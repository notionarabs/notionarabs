const supabase = require('./utils/supabase');

async function checkColumns() {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('First user data:', data[0]);
  }
}

checkColumns();
