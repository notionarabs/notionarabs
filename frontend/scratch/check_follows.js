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
  // check follows table
  const { data, error } = await supabase.from('follows').select('*').limit(1);
  console.log('follows:', data ? 'exists' : error);
  // check widget_usage
  const { data: d2, error: e2 } = await supabase.from('widget_usage').select('*').limit(1);
  console.log('widget_usage:', d2 ? 'exists' : e2);
})();
