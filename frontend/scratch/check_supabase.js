
import { createClient } from './utils/supabase/client';

async function checkTables() {
  const supabase = createClient();
  
  // Try to query common tables to see if they exist
  const tables = ['profiles', 'templates', 'orders', 'order_items', 'ratings', 'comments'];
  const status = {};

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      status[table] = error ? `Error: ${error.message}` : 'Exists';
    } catch (e) {
      status[table] = `Exception: ${e.message}`;
    }
  }

  console.log(JSON.stringify(status, null, 2));
}

checkTables();
