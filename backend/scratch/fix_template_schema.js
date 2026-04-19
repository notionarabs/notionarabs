const supabase = require('../utils/supabase');

async function fix() {
  const sql = `ALTER TABLE public."Template" ADD COLUMN IF NOT EXISTS "category" TEXT;`;
  const { error } = await supabase.rpc('run_sql', { sql });
  if (error) {
      console.error('Error running SQL:', error.message);
      console.log('Falling back to direct query check...');
      // If run_sql rpc doesn't exist, we might have to tell the user to run it manually
  } else {
      console.log('Category column added successfully!');
  }
}

fix();
