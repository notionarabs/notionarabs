const supabase = require('../utils/supabase');

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('Template')
      .select('*')
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      console.log('Columns in Template table:', Object.keys(data[0]));
    } else {
      console.log('No templates found to inspect columns.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkSchema();
