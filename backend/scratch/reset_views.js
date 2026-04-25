const supabase = require('../utils/supabase');
const Template = require('../models/Template');

async function resetViews() {
  try {
    const { data: templates, error: findError } = await supabase
      .from('Template')
      .select('id, title, views')
      .eq('title', 'HAHAHAHHHAAH');

    if (findError) throw findError;

    if (templates && templates.length > 0) {
      console.log('Found templates:', templates);
      for (const t of templates) {
        const { error: updateError } = await supabase
          .from('Template')
          .update({ views: 0 })
          .eq('id', t.id);
        
        if (updateError) {
          console.error(`Failed to update ${t.id}:`, updateError);
        } else {
          console.log(`Successfully reset views for ${t.id}`);
        }
      }
    } else {
      console.log('No template found with title "HAHAHAHHHAAH"');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

resetViews();
