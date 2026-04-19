const supabase = require('../utils/supabase');

async function inspect() {
  console.log('--- Inspecting Database ---');
  
  // 1. List all tables
  const { data: tables, error: tableError } = await supabase
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');
  
  if (tableError) {
      console.log('Error listing tables from pg_tables:', tableError.message);
  } else {
      console.log('Tables in public schema:', tables.map(t => t.tablename));
  }

  // 2. Try to get columns for Template via information_schema
  const testTables = ['Template', 'templates'];
  for (const table of testTables) {
      try {
          const { data, error } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', table)
            .eq('table_schema', 'public');
            
          if (error) {
              console.log(`Table '${table}' columns error:`, error.message);
          } else {
              console.log(`Table '${table}' columns:`, data.map(c => c.column_name));
          }
      } catch (e) {
          console.log(`Table '${table}' exception:`, e.message);
      }
  }
}

inspect();
