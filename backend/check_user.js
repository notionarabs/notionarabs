const supabase = require('./utils/supabase');

async function checkUser() {
  const id = '30663edd6404be4645d20bc9';
  const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return;
  }
  
  console.log('User Data:', JSON.stringify(data, null, 2));
  process.exit(0);
}

checkUser();
