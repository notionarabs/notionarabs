const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function promoteAdmin() {
  const email = 'hazemyasser991@gmail.com';
  console.log(`Promoting ${email} to ADMIN...`);

  const { data, error } = await supabase
    .from('User')
    .update({ role: 'ADMIN' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error promoting admin:', error);
  } else {
    console.log('Success! User promoted:', data);
  }
}

promoteAdmin();
