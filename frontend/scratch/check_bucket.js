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
  const { data, error } = await supabase.storage.from('public-images').createSignedUrl('test.jpg', 60);
  if (error) {
    if (error.message.includes('Bucket not found')) {
       console.error('Bucket error:', error);
    } else {
       console.log('Bucket exists, but file not found. OK!');
    }
  } else {
    console.log('Bucket exists and URL created. OK!');
  }
})();
