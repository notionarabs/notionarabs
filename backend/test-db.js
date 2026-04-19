const supabase = require('./utils/supabase');

async function testConnection() {
  console.log('--- Supabase Connection Test ---');
  console.log('URL:', process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Found' : '❌ Missing');
  console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing');

  try {
    const { data, error } = await supabase
      .from('User')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection Error:', error.message);
      if (error.code === 'PGRST301') {
        console.error('Tip: This usually means the table "User" does not exist in your Supabase project yet.');
      }
    } else {
      console.log('✅ Connection Successful!');
      console.log('Data returned:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected Error:', err.message);
  }
}

testConnection();
