const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
  const { data, error } = await supabase
    .from('User')
    .select('email, role, name')
    .limit(10);

  if (error) {
    console.error('Error listing users:', error);
  } else {
    console.log('Users in database:');
    console.table(data);
  }
}

listUsers();
