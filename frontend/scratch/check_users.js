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
  const names = ['User', 'users', 'Profiles', 'profiles', 'creator_profiles', 'Profile'];
  for (const name of names) {
    const {data, error} = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`✅ Table exists: ${name}`);
    } else {
      console.error(`❌ Table ${name} error: ${error.message} - ${error.code}`);
    }
  }
})();
