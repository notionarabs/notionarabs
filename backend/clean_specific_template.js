const Template = require('./models/Template');

async function cleanTemplate() {
  const slug = 'mrkz-almal-alnskhh-albsyth';
  console.log(`Searching for template with slug: ${slug}`);
  
  const templateDoc = await Template.findOne({ slug });
  
  if (!templateDoc) {
    console.error('Template not found');
    return;
  }
  
  console.log('Original features (first 100 chars):', JSON.stringify(templateDoc.features).substring(0, 100));
  
  const cleanDeep = (val) => {
      if (!val) return val;
      let current = val;
      let previous = null;
      while (current !== previous) {
          previous = current;
          if (typeof current === 'string') {
              current = current.replace(/\\+/g, '');
              if (current.trim().startsWith('[') || current.trim().startsWith('{') || current.trim().startsWith('"')) {
                  try {
                      const parsed = JSON.parse(current);
                      if (parsed !== current) { current = parsed; continue; }
                  } catch (e) {
                      current = current.replace(/^["'\[\s]+|[\]"'\]\s]+$/g, '').trim();
                  }
              }
              current = current.replace(/^["'\[\s]+|[\]"'\]\s]+$/g, '').trim();
          } else if (Array.isArray(current)) {
              current = current.map(item => cleanDeep(item)).filter(i => i);
              break;
          } else { break; }
      }
      return current;
  };

  let cleanedFeatures = cleanDeep(templateDoc.features);
  if (typeof cleanedFeatures === 'string') {
      if (cleanedFeatures.includes('","')) {
          cleanedFeatures = cleanedFeatures.split('","').map(s => s.trim().replace(/^"|"$/g, '')).filter(i => i);
      } else {
          cleanedFeatures = [cleanedFeatures];
      }
  } else if (!Array.isArray(cleanedFeatures)) {
      cleanedFeatures = [];
  }
  
  const aggressiveClean = (str) => {
      if (typeof str !== 'string') return str;
      let s = str.trim();
      // Remove all backslashes, redundant quotes, and trailing/leading junk
      s = s.replace(/\\/g, '');
      s = s.replace(/^["'\[\s]+|[\]"'\]\s,]+$/g, '').trim();
      s = s.replace(/"/g, ''); // Remove all internal quotes too if any left
      return s;
  };

  // Secondary clean for each element
  cleanedFeatures = cleanedFeatures.map(f => aggressiveClean(f)).filter(i => i);
  let cleanedDescription = aggressiveClean(cleanDeep(templateDoc.description));
  
  console.log('Final cleaned features (array):', cleanedFeatures);
  console.log('Final cleaned description:', cleanedDescription);




  
  // Update the template in the database
  // Note: We need to use supabase directly or update the model to support saves
  const supabase = require('./utils/supabase');
  const { data, error } = await supabase
    .from('Template')
    .update({ 
        features: cleanedFeatures,
        description: cleanedDescription
    })
    .eq('id', templateDoc._id);
    
  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Template cleaned successfully!');
  }
}

cleanTemplate();
