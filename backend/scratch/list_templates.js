const supabase = require('../utils/supabase');

async function listTemplates() {
  try {
    const { data: templates, error } = await supabase
      .from('Template')
      .select('id, title, views, status, creatorId');

    if (error) throw error;

    console.log('Total templates in DB:', templates.length);
    templates.forEach(t => {
      console.log(`- [${t.id}] "${t.title}" | Views: ${t.views} | Status: ${t.status} | Creator: ${t.creatorId}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

listTemplates();
