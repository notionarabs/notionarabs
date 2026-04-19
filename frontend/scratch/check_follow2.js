const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const supabase = createClient(getEnvVar('NEXT_PUBLIC_SUPABASE_URL'), getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'));

(async () => {
  const { data: d1, error: e1 } = await supabase.from('Follow').select('*').limit(1);
  console.log('Follow:', e1);
  const { data: d2, error: e2 } = await supabase.from('Follows').select('*').limit(1);
  console.log('Follows:', e2);
})();
