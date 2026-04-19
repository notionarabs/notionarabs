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
  const { data: d1, error: e1 } = await supabase.from('notifications').select('*').limit(1);
  console.log('notifications:', e1);
  const { data: d2, error: e2 } = await supabase.from('Notifications').select('*').limit(1);
  console.log('Notifications:', e2);
})();
