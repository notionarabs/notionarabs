const supabase = require('../utils/supabase');

async function fixTemplate() {
  try {
    const { error } = await supabase
      .from('Template')
      .update({ views: 0 })
      .eq('id', '9ff6a580-b5cb-4183-a1de-73f467de97a5');

    if (error) throw error;
    console.log('Successfully reset views for HAHAHAHHAAH');
  } catch (err) {
    console.error('Error:', err);
  }
}

fixTemplate();
