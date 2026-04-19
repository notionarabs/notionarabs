// Query to find enum values - we'll try common values
const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://jtrvgfezbosjhkracbto.supabase.co', 'sb_publishable_3PG-4jcoRq4ZapzPeG4cAg_C457CPmA');

// Try to get a user with role to see its value
// Also probe common enum value casings
async function probe() {
  // Try to get any user with a non-null role
  const r = await sb.from('User').select('id, role, creatorStatus').limit(10);
  console.log('Users:', JSON.stringify(r.data));
  console.log('Error:', r.error?.message);
}
probe();
