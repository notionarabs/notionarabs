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
    // Try to trigger an error to see the columns
    const {data, error} = await supabase.from('User').insert({ id: 'invalid_uuid_or_string' }).select();
    if (error) {
      console.error(error);
    } else {
        console.log('Inserted:', data);
    }
})();
