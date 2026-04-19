const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Won't work if no RPC
  if (error) {
     const { data: d2, error: e2 } = await supabase.from('Profile').select('*').limit(1);
     console.log('Profile:', d2, e2);
     const { data: d3, error: e3 } = await supabase.from('Template').select('*').limit(1);
     console.log('Template:', d3, e3);
  }
}

listTables();
