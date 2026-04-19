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

async function checkSettings() {
  const { data, error } = await supabase.from('settings').select('*').limit(1);
  if (error) {
    const { data: d2, error: e2 } = await supabase.from('Settings').select('*').limit(1);
    console.log('Settings:', d2, e2);
  } else {
    console.log('settings table exists! Data:', data);
  }
}

checkSettings();
