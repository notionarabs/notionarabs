const supabase = require('./utils/supabase');

async function checkUserSize() {
  const { data: user, error } = await supabase.from('User').select('*').eq('username', 'mostafa').single();
  if (error) {
    console.error('Error:', error);
    return;
  }
  const size = Buffer.byteLength(JSON.stringify(user));
  console.log(`User "mostafa" size: ${size} bytes (${(size / 1024 / 1024).toFixed(2)} MB)`);
  
  // Check templates size
  const { data: templates, error: tError } = await supabase.from('Template').select('*').eq('creatorId', user.id).eq('status', 'APPROVED');
  if (tError) {
    console.error('Template Error:', tError);
  } else {
    const tSize = Buffer.byteLength(JSON.stringify(templates));
    console.log(`Templates size for "mostafa": ${tSize} bytes (${(tSize / 1024 / 1024).toFixed(2)} MB)`);
    
    if (tSize > 1024 * 1024) {
        templates.forEach(t => {
            const singleSize = Buffer.byteLength(JSON.stringify(t));
            if (singleSize > 500 * 1024) {
                console.log(`- Template "${t.title}" size: ${(singleSize / 1024 / 1024).toFixed(2)} MB`);
                // Check fields
                for(const key in t) {
                    const fSize = Buffer.byteLength(JSON.stringify(t[key]));
                    if (fSize > 100 * 1024) {
                        console.log(`  - Field "${key}" size: ${(fSize / 1024).toFixed(2)} KB`);
                    }
                }
            }
        });
    }
  }
}

checkUserSize();
