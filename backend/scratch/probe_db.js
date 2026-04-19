const supabase = require('../utils/supabase');

async function probe() {
  console.log('--- Probing templates (lowercase) Table ---');
  // Try to insert into templates
  const { data, error } = await supabase.from('templates').insert([{ 
      title: 'PROBE_TEMP', 
      slug: 'probe-temp-' + Date.now(), 
      creatorId: '00000000-0000-0000-0000-000000000000',
      description: 'Test',
      features: ['Test Feature'],
      categories: ['Test Category'],
      status: 'pending'
  }]).select();
  
  if (error) {
    console.log('templates probe failed:', error.message);
    if (error.hint) console.log('Hint:', error.hint);
    if (error.details) console.log('Details:', error.details);
  } else {
    console.log('templates probe successful! Columns:', Object.keys(data[0]));
    // Clean up
    await supabase.from('templates').delete().eq('id', data[0].id);
  }
}

probe();
