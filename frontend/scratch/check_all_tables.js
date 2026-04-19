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
  // To get all tables from Supabase REST API securely, we can fetch from the root or introspect?
  // We can just ask for tables via supabase's internal views if rls allows, but we might get PGRST error.
  // Instead, let's try some common names.
  const names = ['follows', 'Follows', 'Follow', 'creator_followers', 'CreatorFollowers', 'notifications', 'Notifications', 'Notification', 'settings', 'Settings', 'upload', 'images'];
  for (const name of names) {
    const {data, error} = await supabase.from(name).select('*').limit(1);
    if (!error) {
      console.log(`✅ Table exists: ${name}`);
    }
  }
})();
