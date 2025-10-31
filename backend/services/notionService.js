const axios = require('axios');

const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
const NOTION_TEMPLATES_DATABASE_ID = process.env.NOTION_TEMPLATES_DATABASE_ID;
const NOTION_CREATORS_DATABASE_ID = process.env.NOTION_CREATORS_DATABASE_ID;

// Helper function to check if Notion is configured
function isNotionConfigured() {
  return NOTION_API_TOKEN && (NOTION_TEMPLATES_DATABASE_ID || NOTION_CREATORS_DATABASE_ID);
}

/**
 * Get Notion database schema/properties
 * @param {string} databaseId - Notion database ID
 * @returns {Promise<Object>} Database schema with property names and types
 */
async function getNotionDatabaseSchema(databaseId) {
  try {
    if (!NOTION_API_TOKEN || !databaseId) {
      throw new Error('Notion API token or database ID missing');
    }

    const response = await axios.get(
      `https://api.notion.com/v1/databases/${databaseId}`,
      {
        headers: getNotionHeaders()
      }
    );

    const properties = response.data.properties || {};
    const schema = {};
    
    Object.keys(properties).forEach(propName => {
      schema[propName] = {
        type: properties[propName].type,
        id: properties[propName].id
      };
    });

    return schema;
  } catch (error) {
    console.error('Error fetching Notion database schema:', error.response?.data || error.message);
    throw error;
  }
}

// Helper function to create Notion API headers
function getNotionHeaders() {
  return {
    'Authorization': `Bearer ${NOTION_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };
}

/**
 * Add a template to Notion database
 * @param {Object} template - Template object from MongoDB
 * @param {Object} creator - Creator/User object (optional, will be populated if not provided)
 * @returns {Promise<Object>} Notion response
 */
async function addTemplateToNotion(template, creator = null) {
  let errorDetails = null;
  try {
    console.log('🔵 Notion: Attempting to add template:', template.title);
    
    if (!NOTION_API_TOKEN || !NOTION_TEMPLATES_DATABASE_ID) {
      console.warn('❌ Notion API not configured for templates');
      console.warn('Token:', !!NOTION_API_TOKEN, 'Database ID:', !!NOTION_TEMPLATES_DATABASE_ID);
      errorDetails = { message: 'Notion API not configured', missing: [] };
      if (!NOTION_API_TOKEN) errorDetails.missing.push('NOTION_API_TOKEN');
      if (!NOTION_TEMPLATES_DATABASE_ID) errorDetails.missing.push('NOTION_TEMPLATES_DATABASE_ID');
      return { error: errorDetails };
    }

    // If creator not provided, template.creator should be populated
    const creatorName = creator?.name || template.creator?.name || 'Unknown';
    const creatorEmail = creator?.email || template.creator?.email || '';
    const creatorUsername = creator?.username || template.creator?.username || '';
    const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';

    // Prepare Notion page properties - matching your actual Notion database schema
    const properties = {
      // Name (Title property - must be first property in Notion database)
      'Name': {
        title: [
          {
            text: {
              content: template.title || 'Untitled Template'
            }
          }
        ]
      },
      // Creator (rich_text)
      'Creator': {
        rich_text: [
          {
            text: {
              content: creatorName
            }
          }
        ]
      },
      // Price (rich_text - NOT number!)
      'Price': {
        rich_text: [
          {
            text: {
              content: template.isPaid ? (template.price ? `$${template.price}` : 'Paid') : 'Free'
            }
          }
        ]
      },
      // Description (rich_text)
      'Description': {
        rich_text: [
          {
            text: {
              content: template.description ? template.description.substring(0, 2000) : ''
            }
          }
        ]
      },
      // Template Link (url)
      'Template Link': {
        url: template.notionLink || ''
      }
      // Note: Image property is files type - would need to upload file first, so skipping for now
      // If you want to add images later, you'd need to download the previewImage and upload to Notion
    };

    console.log('🔵 Notion: Sending request to Notion API...');
    console.log('🔵 Notion: Database ID:', NOTION_TEMPLATES_DATABASE_ID);
    console.log('🔵 Notion: Properties keys:', Object.keys(properties));
    
    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: {
          database_id: NOTION_TEMPLATES_DATABASE_ID
        },
        properties: properties
      },
      {
        headers: getNotionHeaders()
      }
    );

    console.log('✅ Template added to Notion successfully:', template.title);
    console.log('✅ Notion page ID:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding template to Notion');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data || {}, null, 2));
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', error);
    
    // Capture detailed error information
    errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || error.message,
      propertyErrors: null
    };
    
    // Log more details about the request
    if (error.response?.data) {
      console.error('❌ Notion API Error Details:');
      console.error('   Code:', error.response.data.code);
      console.error('   Message:', error.response.data.message);
      
      // Check for property-specific errors
      if (error.response.data.properties) {
        errorDetails.propertyErrors = error.response.data.properties;
        console.error('   Property errors:', Object.keys(error.response.data.properties));
        Object.keys(error.response.data.properties).forEach(prop => {
          console.error(`   - ${prop}:`, error.response.data.properties[prop]);
        });
      }
    }
    
    // Don't throw - we don't want to break the approval flow if Notion fails
    return { error: errorDetails };
  }
}

/**
 * Add a creator to Notion database
 * @param {Object} user - User object from MongoDB
 * @returns {Promise<Object>} Notion response
 */
async function addCreatorToNotion(user) {
  let errorDetails = null;
  try {
    console.log('🔵 Notion: Attempting to add creator:', user.name);
    
    if (!NOTION_API_TOKEN || !NOTION_CREATORS_DATABASE_ID) {
      console.warn('❌ Notion API not configured for creators');
      console.warn('Token:', !!NOTION_API_TOKEN, 'Database ID:', !!NOTION_CREATORS_DATABASE_ID);
      errorDetails = { message: 'Notion API not configured', missing: [] };
      if (!NOTION_API_TOKEN) errorDetails.missing.push('NOTION_API_TOKEN');
      if (!NOTION_CREATORS_DATABASE_ID) errorDetails.missing.push('NOTION_CREATORS_DATABASE_ID');
      return { error: errorDetails };
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://notionarabs.com';

    // Prepare Notion page properties - matching your actual Notion database schema
    const properties = {
      // Name (Title property - must be first property in Notion database)
      'Name': {
        title: [
          {
            text: {
              content: user.name || 'Unknown Creator'
            }
          }
        ]
      },
      // Profile (url)
      'Profile': {
        url: `${frontendUrl}/creators/${user.username || user._id}`
      },
      // Creator Bio (rich_text)
      'Creator Bio': {
        rich_text: [
          {
            text: {
              content: user.bio ? user.bio.substring(0, 2000) : ''
            }
          }
        ]
      },
      // Field (rich_text) - using this for additional info like experience, specialties, etc.
      'Field': {
        rich_text: [
          {
            text: {
              content: [
                user.experience ? `Experience: ${user.experience}` : '',
                user.specialties && user.specialties.length > 0 ? `Specialties: ${user.specialties.join(', ')}` : '',
                user.followers ? `Followers: ${user.followers}` : '',
                user.templatesCount ? `Templates: ${user.templatesCount}` : ''
              ].filter(Boolean).join(' | ')
            }
          }
        ]
      }
      // Note: Image property is files type - would need to upload file first, so skipping for now
      // If you want to add images later, you'd need to download the profilePicture and upload to Notion
    };

    console.log('🔵 Notion: Sending request to Notion API...');
    console.log('🔵 Notion: Database ID:', NOTION_CREATORS_DATABASE_ID);
    console.log('🔵 Notion: Properties keys:', Object.keys(properties));
    
    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: {
          database_id: NOTION_CREATORS_DATABASE_ID
        },
        properties: properties
      },
      {
        headers: getNotionHeaders()
      }
    );

    console.log('✅ Creator added to Notion successfully:', user.name);
    console.log('✅ Notion page ID:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('❌ Error adding creator to Notion');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data || {}, null, 2));
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', error);
    
    // Capture detailed error information
    errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || error.message,
      propertyErrors: null
    };
    
    // Log more details about the request
    if (error.response?.data) {
      console.error('❌ Notion API Error Details:');
      console.error('   Code:', error.response.data.code);
      console.error('   Message:', error.response.data.message);
      
      // Check for property-specific errors
      if (error.response.data.properties) {
        errorDetails.propertyErrors = error.response.data.properties;
        console.error('   Property errors:', Object.keys(error.response.data.properties));
        Object.keys(error.response.data.properties).forEach(prop => {
          console.error(`   - ${prop}:`, error.response.data.properties[prop]);
        });
      }
    }
    
    // Don't throw - we don't want to break the approval flow if Notion fails
    return { error: errorDetails };
  }
}

module.exports = {
  addTemplateToNotion,
  addCreatorToNotion,
  isNotionConfigured,
  getNotionDatabaseSchema
};

