const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

(async () => {
    const openapi = await fetch(`${getEnvVar('NEXT_PUBLIC_SUPABASE_URL')}/rest/v1/?apikey=${getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')}`);
    const spec = await openapi.json();
    console.log(Object.keys(spec.definitions || spec.components?.schemas || {}));
})();
