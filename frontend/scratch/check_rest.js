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

// We have to use REST api manually because supabase-js doesn't allow querying information_schema easily
fetch(`${supabaseUrl}/rest/v1/` + '?select=*', {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  }
}).then(async r => {
  if (r.ok) {
    const data = await r.json();
    console.log("REST API root says:", data);
  } else {
    // Try querying a non existent table to see all available tables? No
    console.log("Response:", r.status, await r.text());
  }
});
