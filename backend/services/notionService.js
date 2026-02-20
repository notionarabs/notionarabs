const axios = require('axios');

const NOTION_API_TOKEN = process.env.NOTION_API_TOKEN;
const NOTION_TEMPLATES_DATABASE_ID = process.env.NOTION_TEMPLATES_DATABASE_ID;
const NOTION_CREATORS_DATABASE_ID = process.env.NOTION_CREATORS_DATABASE_ID;
const NOTION_CONSULTATIONS_DATABASE_ID = process.env.NOTION_CONSULTATIONS_DATABASE_ID;
const NOTION_CAREERS_DATABASE_ID = process.env.NOTION_CAREERS_DATABASE_ID;
const NOTION_CONTACT_DATABASE_ID = process.env.NOTION_CONTACT_DATABASE_ID;
const NOTION_WIDGETS_DATABASE_ID = process.env.NOTION_WIDGETS_DATABASE_ID;


// Helper function to check if Notion is configured
function isNotionConfigured() {
  return NOTION_API_TOKEN && (NOTION_TEMPLATES_DATABASE_ID || NOTION_CREATORS_DATABASE_ID);
}

function findProperty(schema, names, expectedTypes = []) {
  const normalizedNames = names.map((name) => name.toLowerCase());
  const entry = Object.entries(schema).find(([propName, prop]) => {
    const matchesName = normalizedNames.includes(propName.toLowerCase());
    const matchesType = expectedTypes.length === 0 || expectedTypes.includes(prop.type);
    return matchesName && matchesType;
  });

  return entry ? { name: entry[0], ...entry[1] } : null;
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
      const prop = properties[propName];
      const propSchema = {
        type: prop.type,
        id: prop.id
      };

      // Include select options if it's a select property
      if (prop.type === 'select' && prop.select?.options) {
        propSchema.options = prop.select.options.map(opt => ({
          id: opt.id,
          name: opt.name,
          color: opt.color
        }));
      }

      schema[propName] = propSchema;
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

// Cache for Price select options
let priceSelectOptionsCache = null;

/**
 * Get Price select options from Notion database
 * @returns {Promise<Array>} Array of select option names
 */
async function getPriceSelectOptions() {
  try {
    if (!NOTION_API_TOKEN || !NOTION_TEMPLATES_DATABASE_ID) {
      return ['Free', 'Paid']; // Fallback defaults
    }

    // Return cached options if available
    if (priceSelectOptionsCache) {
      return priceSelectOptionsCache;
    }

    const response = await axios.get(
      `https://api.notion.com/v1/databases/${NOTION_TEMPLATES_DATABASE_ID}`,
      {
        headers: getNotionHeaders()
      }
    );

    const properties = response.data.properties || {};
    const priceProperty = properties['Price'];

    if (priceProperty && priceProperty.type === 'select' && priceProperty.select?.options) {
      priceSelectOptionsCache = priceProperty.select.options.map(opt => opt.name);
      console.log('📋 Price select options:', priceSelectOptionsCache);
      return priceSelectOptionsCache;
    }

    return ['Free', 'Paid']; // Fallback defaults
  } catch (error) {
    console.error('Error fetching Price select options:', error.message);
    return ['Free', 'Paid']; // Fallback defaults
  }
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

    // Get available Price select options from Notion
    const priceSelectOptions = await getPriceSelectOptions();

    // Choose the appropriate price option based on available options
    // Handle both English and Arabic option names
    let selectedPriceOption;
    if (template.isPaid || template.price) {
      // Look for 'Paid' or 'مدفوع' (Arabic for Paid), then fallback to any other option
      selectedPriceOption = priceSelectOptions.includes('Paid') ? 'Paid'
        : priceSelectOptions.includes('مدفوع') ? 'مدفوع'
          : priceSelectOptions[0];
    } else {
      // Look for 'Free' or 'مجاني' (Arabic for Free), then fallback to first option
      selectedPriceOption = priceSelectOptions.includes('Free') ? 'Free'
        : priceSelectOptions.includes('مجاني') ? 'مجاني'
          : priceSelectOptions[0] || 'Free';
    }

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
      // Price (select - not rich_text!)
      'Price': {
        select: {
          name: selectedPriceOption
        }
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
      // Template Link (url) - Website link to the template page
      'Template Link': {
        url: `${frontendUrl}/templates/${template.slug || template._id}`
      }
    };

    // Add Creator Profile link if we have creator information
    const creatorId = creatorUsername || creator?.username || template.creator?.username ||
      creator?._id?.toString() || template.creator?._id?.toString();
    if (creatorId) {
      properties['Creator Profile'] = {
        url: `${frontendUrl}/creators/${creatorId}`
      };
    }

    // Add preview image if it exists
    // Priority: previewImage > first item from previewImages array
    let imageUrl = null;
    if (template.previewImage) {
      imageUrl = template.previewImage;
    } else if (template.previewImages && template.previewImages.length > 0) {
      imageUrl = template.previewImages[0];
    }

    if (imageUrl) {
      properties['Image'] = {
        files: [
          {
            type: 'external',
            external: {
              url: imageUrl
            },
            name: template.title || 'preview.png'
          }
        ]
      };
    }

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
    const creatorEmail = user.contactEmail || user.email || '';
    const creatorPhone = user.phone || '';

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
    };

    if (creatorEmail) {
      properties['Email'] = { email: creatorEmail };
    }

    if (creatorPhone) {
      properties['Phone'] = { phone_number: creatorPhone };
    }

    // Add profile picture if it exists
    if (user.profilePicture) {
      properties['Image'] = {
        files: [
          {
            type: 'external',
            external: {
              url: user.profilePicture
            },
            name: user.name || 'profile.png'
          }
        ]
      };
    }

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

/**
 * Add a consultation booking to Notion database
 * @param {Object} payload - Booking payload from contact form
 * @returns {Promise<Object>} Notion response
 */
async function addConsultationToNotion(payload) {
  let errorDetails = null;
  try {
    if (!NOTION_API_TOKEN || !NOTION_CONSULTATIONS_DATABASE_ID) {
      console.warn('❌ Notion API not configured for consultations');
      errorDetails = { message: 'Notion API not configured', missing: [] };
      if (!NOTION_API_TOKEN) errorDetails.missing.push('NOTION_API_TOKEN');
      if (!NOTION_CONSULTATIONS_DATABASE_ID) errorDetails.missing.push('NOTION_CONSULTATIONS_DATABASE_ID');
      return { error: errorDetails };
    }

    const schema = await getNotionDatabaseSchema(NOTION_CONSULTATIONS_DATABASE_ID);
    const titleProp = findProperty(schema, ['Name', 'الاسم', 'Title', 'العنوان'], ['title']);

    if (!titleProp) {
      return { error: { message: 'Notion database is missing a title property' } };
    }

    const properties = {
      [titleProp.name]: {
        title: [
          {
            text: {
              content: payload.name || 'استشارة جديدة'
            }
          }
        ]
      }
    };

    const setSelectOrText = (prop, value) => {
      if (!prop || !value) return false;
      if (prop.type === 'select') {
        properties[prop.name] = { select: { name: value } };
        return true;
      }
      properties[prop.name] = { rich_text: [{ text: { content: value } }] };
      return true;
    };
    const extraDetails = [];
    const pushExtra = (label, value, mapped) => {
      if (!value || mapped) return;
      extraDetails.push(value);
    };

    const emailProp = findProperty(schema, ['Email', 'البريد الإلكتروني', 'الإيميل'], ['email', 'rich_text']);
    let emailMapped = false;
    if (emailProp && payload.email) {
      properties[emailProp.name] = emailProp.type === 'email'
        ? { email: payload.email }
        : { rich_text: [{ text: { content: payload.email } }] };
      emailMapped = true;
    }
    pushExtra('البريد الإلكتروني', payload.email, emailMapped);

    const whatsappProp = findProperty(schema, ['WhatsApp', 'واتساب', 'رقم الواتساب', 'الهاتف', 'رقم الهاتف'], ['phone_number', 'rich_text']);
    let whatsappMapped = false;
    if (whatsappProp && payload.whatsapp) {
      properties[whatsappProp.name] = whatsappProp.type === 'phone_number'
        ? { phone_number: payload.whatsapp }
        : { rich_text: [{ text: { content: payload.whatsapp } }] };
      whatsappMapped = true;
    }
    pushExtra('رقم الواتساب', payload.whatsapp, whatsappMapped);

    const serviceProp = findProperty(schema, ['Service Type', 'نوع الخدمة', 'الخدمة', 'الخدمة المطلوبة', 'Field', 'المجال'], ['select', 'multi_select', 'rich_text']);
    let serviceMapped = false;
    if (serviceProp && payload.serviceType && payload.serviceType.length) {
      if (serviceProp.type === 'multi_select') {
        properties[serviceProp.name] = {
          multi_select: payload.serviceType.map((item) => ({ name: item }))
        };
        serviceMapped = true;
      } else if (serviceProp.type === 'select') {
        properties[serviceProp.name] = { select: { name: payload.serviceType[0] } };
        serviceMapped = true;
      } else {
        properties[serviceProp.name] = {
          rich_text: [{ text: { content: payload.serviceType.join('، ') } }]
        };
        serviceMapped = true;
      }
    }
    pushExtra('نوع الخدمة', payload.serviceType?.join('، '), serviceMapped);

    const companyTypeProp = findProperty(schema, ['Company Type', 'Client Type', 'نوع الشركة', 'نوع العميل', 'نوع النشاط'], ['select', 'rich_text']);
    const companyTypeMapped = setSelectOrText(companyTypeProp, payload.companyType);
    pushExtra('نوع الشركة', payload.companyType, companyTypeMapped);

    const typeProp = findProperty(schema, ['Type', 'النوع'], ['select', 'rich_text']);
    const typeMapped = setSelectOrText(typeProp, payload.companyType);
    pushExtra('النوع', payload.companyType, typeMapped);

    const teamSizeProp = findProperty(schema, ['Team Size', 'عدد الفريق', 'حجم الفريق', 'عدد الموظفين', 'عدد الأفراد'], ['rich_text', 'number']);
    let teamSizeMapped = false;
    if (teamSizeProp && payload.teamSize) {
      if (teamSizeProp.type === 'number') {
        const parsed = Number(payload.teamSize.replace(/[^\d.]/g, ''));
        if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
          properties[teamSizeProp.name] = { number: parsed };
          teamSizeMapped = true;
        }
      } else {
        properties[teamSizeProp.name] = { rich_text: [{ text: { content: payload.teamSize } }] };
        teamSizeMapped = true;
      }
    }
    pushExtra('حجم الفريق', payload.teamSize, teamSizeMapped);

    const roleProp = findProperty(schema, ['Role', 'الدور', 'المنصب', 'المسمى الوظيفي'], ['rich_text', 'select']);
    const roleMapped = setSelectOrText(roleProp, payload.role);
    pushExtra('الدور', payload.role, roleMapped);

    const industryProp = findProperty(schema, ['Industry', 'المجال', 'قطاع العمل', 'مجال العمل'], ['rich_text', 'select']);
    const industryMapped = setSelectOrText(industryProp, payload.industry);
    pushExtra('المجال', payload.industry, industryMapped);

    const goalProp = findProperty(schema, ['Goal', 'الهدف', 'الغاية'], ['rich_text']);
    const goalMapped = setSelectOrText(goalProp, payload.goal);
    pushExtra('الهدف', payload.goal, goalMapped);

    const challengeProp = findProperty(schema, ['Challenge', 'التحدي', 'التحديات'], ['rich_text']);
    const challengeMapped = setSelectOrText(challengeProp, payload.challenge);
    pushExtra('التحدي', payload.challenge, challengeMapped);


    const companyNameProp = findProperty(schema, ['Company', 'Company Name', 'اسم الشركة'], ['rich_text']);
    const companyNameMapped = setSelectOrText(companyNameProp, payload.companyName);
    pushExtra('اسم الشركة', payload.companyName, companyNameMapped);

    const budgetProp = findProperty(schema, ['Budget', 'Estimated Budget', 'الميزانية', 'الميزانية التقديرية'], ['rich_text', 'select']);
    const budgetMapped = setSelectOrText(budgetProp, payload.budget);
    pushExtra('الميزانية', payload.budget, budgetMapped);

    const timelineProp = findProperty(
      schema,
      ['Timeline', 'Timeline (select)', 'Start Date', 'موعد البدء', 'وقت البدء'],
      ['rich_text', 'date', 'select']
    );
    let timelineMapped = false;
    if (timelineProp && payload.timeline) {
      if (timelineProp.type === 'date') {
        properties[timelineProp.name] = { date: { start: payload.timeline } };
        timelineMapped = true;
      } else if (timelineProp.type === 'select') {
        properties[timelineProp.name] = { select: { name: payload.timeline } };
        timelineMapped = true;
      } else {
        properties[timelineProp.name] = { rich_text: [{ text: { content: payload.timeline } }] };
        timelineMapped = true;
      }
    }
    pushExtra('موعد البدء', payload.timeline, timelineMapped);

    const referralProp = findProperty(schema, ['Referral', 'How did you find us', 'المصدر', 'قناة الوصول'], ['rich_text', 'select']);
    const referralMapped = setSelectOrText(referralProp, payload.referral);
    pushExtra('مصدر التعرف', payload.referral, referralMapped);

    const companyWebsiteProp = findProperty(
      schema,
      ['Website', 'Website Link', 'Company Website', 'موقع الشركة', 'الموقع الإلكتروني', 'موقع الشركة الإلكتروني'],
      ['url', 'rich_text']
    );
    let websiteMapped = false;
    if (companyWebsiteProp && payload.companyWebsite) {
      if (companyWebsiteProp.type === 'url') {
        properties[companyWebsiteProp.name] = { url: payload.companyWebsite };
        websiteMapped = true;
      } else {
        properties[companyWebsiteProp.name] = { rich_text: [{ text: { content: payload.companyWebsite } }] };
        websiteMapped = true;
      }
    }
    pushExtra('موقع الشركة', payload.companyWebsite, websiteMapped);

    const detailsProp = findProperty(schema, ['Details', 'التفاصيل', 'تفاصيل', 'نبذة', 'وصف'], ['rich_text']);
    if (detailsProp) {
      const mainDetails = (payload.details || payload.projectHelp || '').substring(0, 2000);
      if (mainDetails) {
        properties[detailsProp.name] = {
          rich_text: [{ text: { content: mainDetails } }]
        };
      }
    }

    const sourceProp = findProperty(schema, ['Source', 'المصدر', 'قناة الوصول'], ['rich_text', 'select']);
    const sourceMapped = setSelectOrText(sourceProp, payload.source);
    pushExtra('المصدر', payload.source, sourceMapped);

    const statusProp = findProperty(schema, ['Status', 'الحالة', 'حالة الطلب'], ['select']);
    if (statusProp && statusProp.options?.length) {
      const preferred = statusProp.options.find((opt) => ['New', 'جديد'].includes(opt.name));
      properties[statusProp.name] = { select: { name: preferred ? preferred.name : statusProp.options[0].name } };
    }

    const createdAtProp = findProperty(schema, ['Created At', 'تاريخ', 'التاريخ', 'تاريخ الإرسال', 'تاريخ الطلب'], ['date']);
    if (createdAtProp) {
      properties[createdAtProp.name] = { date: { start: new Date().toISOString() } };
    }

    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: NOTION_CONSULTATIONS_DATABASE_ID },
        properties
      },
      {
        headers: getNotionHeaders()
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error adding consultation to Notion');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data || {}, null, 2));

    errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || error.message,
      propertyErrors: error.response?.data?.properties || null
    };

    return { error: errorDetails };
  }
}

/**
 * Add a careers application to Notion database
 * @param {Object} payload - Career application payload
 * @returns {Promise<Object>} Notion response
 */
async function addCareerApplicationToNotion(payload) {
  let errorDetails = null;
  try {
    if (!NOTION_API_TOKEN || !NOTION_CAREERS_DATABASE_ID) {
      console.warn('❌ Notion API not configured for careers');
      errorDetails = { message: 'Notion API not configured', missing: [] };
      if (!NOTION_API_TOKEN) errorDetails.missing.push('NOTION_API_TOKEN');
      if (!NOTION_CAREERS_DATABASE_ID) errorDetails.missing.push('NOTION_CAREERS_DATABASE_ID');
      return { error: errorDetails };
    }

    const schema = await getNotionDatabaseSchema(NOTION_CAREERS_DATABASE_ID);
    const titleProp = findProperty(schema, ['Name', 'الاسم', 'Title', 'العنوان'], ['title']);

    if (!titleProp) {
      return { error: { message: 'Notion database is missing a title property' } };
    }

    const properties = {
      [titleProp.name]: {
        title: [
          {
            text: {
              content: payload.name || 'طلب انضمام جديد'
            }
          }
        ]
      }
    };

    const setSelectOrText = (prop, value) => {
      if (!prop || !value) return false;
      if (prop.type === 'select') {
        properties[prop.name] = { select: { name: value } };
        return true;
      }
      properties[prop.name] = { rich_text: [{ text: { content: value } }] };
      return true;
    };

    const emailProp = findProperty(schema, ['Email', 'البريد الإلكتروني', 'الإيميل'], ['email', 'rich_text']);
    if (emailProp && payload.email) {
      properties[emailProp.name] = emailProp.type === 'email'
        ? { email: payload.email }
        : { rich_text: [{ text: { content: payload.email } }] };
    }

    const phoneProp = findProperty(schema, ['WhatsApp', 'واتساب', 'الهاتف', 'رقم الهاتف'], ['phone_number', 'rich_text']);
    if (phoneProp && payload.whatsapp) {
      properties[phoneProp.name] = phoneProp.type === 'phone_number'
        ? { phone_number: payload.whatsapp }
        : { rich_text: [{ text: { content: payload.whatsapp } }] };
    }

    const basedInProp = findProperty(
      schema,
      [
        'Where Are You Based? (This helps us understand time zone, fiscal, and legal implications)',
        'Where Are You Based?',
        'مكان التواجد',
        'الدولة',
        'المدينة',
        'الموقع'
      ],
      ['rich_text']
    );
    setSelectOrText(basedInProp, payload.basedIn);

    const portfolioProp = findProperty(
      schema,
      ['LinkedIn Profile', 'LinkedIn', 'لينكدإن', 'لينكدان'],
      ['url', 'rich_text']
    );
    if (portfolioProp && payload.linkedin) {
      properties[portfolioProp.name] = portfolioProp.type === 'url'
        ? { url: payload.linkedin }
        : { rich_text: [{ text: { content: payload.linkedin } }] };
    }

    const experienceProp = findProperty(
      schema,
      ['Do you have experience in any of the following?', 'Experience', 'الخبرات', 'الخبرة'],
      ['multi_select', 'rich_text']
    );
    if (experienceProp && payload.experience && payload.experience.length) {
      if (experienceProp.type === 'multi_select') {
        properties[experienceProp.name] = {
          multi_select: payload.experience.map((item) => ({ name: item }))
        };
      } else {
        properties[experienceProp.name] = {
          rich_text: [{ text: { content: payload.experience.join('، ') } }]
        };
      }
    }

    const coverLetterProp = findProperty(
      schema,
      [
        'Cover Letter Tell us briefly why this role feels like a great fit for you and mention any relevant experience.',
        'Cover Letter',
        'الرسالة التعريفية',
        'نبذة'
      ],
      ['rich_text']
    );
    if (coverLetterProp && payload.coverLetter) {
      const trimmed = payload.coverLetter.substring(0, 2000);
      properties[coverLetterProp.name] = { rich_text: [{ text: { content: trimmed } }] };
    }

    const resumeProp = findProperty(schema, ['CV/Resume', 'السيرة الذاتية', 'Resume', 'CV'], ['files']);
    if (resumeProp && payload.resumeUrl) {
      properties[resumeProp.name] = {
        files: [
          {
            type: 'external',
            name: 'resume',
            external: { url: payload.resumeUrl }
          }
        ]
      };
    }

    const startProp = findProperty(
      schema,
      ['How soon would you be able to start?', 'Start Date', 'موعد البدء', 'تاريخ البدء'],
      ['rich_text', 'select']
    );
    setSelectOrText(startProp, payload.startTime);

    const messageProp = findProperty(schema, ['Message', 'Details', 'التفاصيل', 'تفاصيل إضافية'], ['rich_text']);
    if (messageProp && payload.message) {
      const trimmed = payload.message.substring(0, 2000);
      properties[messageProp.name] = { rich_text: [{ text: { content: trimmed } }] };
    }

    const sourceProp = findProperty(schema, ['Source', 'المصدر', 'قناة الوصول'], ['select', 'rich_text']);
    setSelectOrText(sourceProp, payload.source || 'website-careers');

    const statusProp = findProperty(schema, ['Status', 'الحالة', 'حالة الطلب'], ['select']);
    if (statusProp && statusProp.options?.length) {
      const preferred = statusProp.options.find((opt) => ['New', 'جديد'].includes(opt.name));
      properties[statusProp.name] = { select: { name: preferred ? preferred.name : statusProp.options[0].name } };
    }

    const createdAtProp = findProperty(schema, ['Created At', 'تاريخ', 'التاريخ', 'تاريخ الإرسال', 'تاريخ الطلب'], ['date']);
    if (createdAtProp) {
      properties[createdAtProp.name] = { date: { start: new Date().toISOString() } };
    }

    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: NOTION_CAREERS_DATABASE_ID },
        properties
      },
      {
        headers: getNotionHeaders()
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error adding careers application to Notion');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data || {}, null, 2));

    errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || error.message,
      propertyErrors: error.response?.data?.properties || null
    };

    return { error: errorDetails };
  }
}

/**
 * Add a contact form submission to Notion database
 * @param {Object} payload - Contact form payload
 * @returns {Promise<Object>} Notion response
 */
async function addContactToNotion(payload) {
  let errorDetails = null;
  try {
    if (!NOTION_API_TOKEN || !NOTION_CONTACT_DATABASE_ID) {
      console.warn('❌ Notion API not configured for contact');
      errorDetails = { message: 'Notion API not configured', missing: [] };
      if (!NOTION_API_TOKEN) errorDetails.missing.push('NOTION_API_TOKEN');
      if (!NOTION_CONTACT_DATABASE_ID) errorDetails.missing.push('NOTION_CONTACT_DATABASE_ID');
      return { error: errorDetails };
    }

    const schema = await getNotionDatabaseSchema(NOTION_CONTACT_DATABASE_ID);
    const titleProp = findProperty(schema, ['Name', 'الاسم', 'Title', 'العنوان', 'id'], ['title']);

    if (!titleProp) {
      return { error: { message: 'Notion database is missing a title property' } };
    }

    const properties = {
      [titleProp.name]: {
        title: [
          {
            text: {
              content: payload.name || 'رسالة جديدة'
            }
          }
        ]
      }
    };

    // Email property
    const emailProp = findProperty(schema, ['Email', 'البريد الإلكتروني', 'الإيميل', 'email'], ['email', 'rich_text']);
    if (emailProp && payload.email) {
      properties[emailProp.name] = emailProp.type === 'email'
        ? { email: payload.email }
        : { rich_text: [{ text: { content: payload.email } }] };
    }

    // WhatsApp/Phone property
    const phoneProp = findProperty(schema, ['WhatsApp', 'واتساب', 'الهاتف', 'رقم الهاتف', 'phone'], ['phone_number', 'rich_text']);
    if (phoneProp && payload.whatsapp) {
      properties[phoneProp.name] = phoneProp.type === 'phone_number'
        ? { phone_number: payload.whatsapp }
        : { rich_text: [{ text: { content: payload.whatsapp } }] };
    }

    // Details/Message property
    const detailsProp = findProperty(schema, ['Details', 'التفاصيل', 'تفاصيل', 'Message', 'الرسالة', 'text'], ['rich_text']);
    if (detailsProp && payload.details) {
      const trimmed = payload.details.substring(0, 2000);
      properties[detailsProp.name] = { rich_text: [{ text: { content: trimmed } }] };
    }

    // Status property (if exists)
    const statusProp = findProperty(schema, ['Status', 'الحالة', 'حالة الطلب'], ['select']);
    if (statusProp && statusProp.options?.length) {
      const preferred = statusProp.options.find((opt) => ['New', 'جديد', 'Unread', 'غير مقروء'].includes(opt.name));
      properties[statusProp.name] = { select: { name: preferred ? preferred.name : statusProp.options[0].name } };
    }

    // Created At property (if exists)
    const createdAtProp = findProperty(schema, ['Created At', 'تاريخ', 'التاريخ', 'تاريخ الإرسال'], ['date']);
    if (createdAtProp) {
      properties[createdAtProp.name] = { date: { start: new Date().toISOString() } };
    }

    const response = await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: NOTION_CONTACT_DATABASE_ID },
        properties
      },
      {
        headers: getNotionHeaders()
      }
    );

    console.log('✅ Contact added to Notion successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error adding contact to Notion');
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Error data:', JSON.stringify(error.response?.data || {}, null, 2));

    errorDetails = {
      status: error.response?.status,
      code: error.response?.data?.code,
      message: error.response?.data?.message || error.message,
      propertyErrors: error.response?.data?.properties || null
    };

    return { error: errorDetails };
  }
}

/**
 * Upsert a widget to Notion database (update if exists, create if not)
 * @param {Object} widget - Widget object
 * @returns {Promise<Object>} Notion response
 */
async function upsertWidgetToNotion(widget) {
  let errorDetails = null;
  try {
    if (!NOTION_API_TOKEN || !NOTION_WIDGETS_DATABASE_ID) {
      return { error: { message: 'Notion API not configured' } };
    }

    const schema = await getNotionDatabaseSchema(NOTION_WIDGETS_DATABASE_ID);
    const titleProp = findProperty(schema, ['Name', 'Title', 'الاسم', 'العنوان'], ['title']);
    const descriptionProp = findProperty(schema, ['Description', 'الوصف', 'تفاصيل'], ['rich_text']);
    const linkProp = findProperty(schema, ['Link', 'الرابط', 'URL'], ['url']);
    const imageProp = findProperty(schema, ['Image', 'الصورة', 'Cover', 'Preview'], ['files']);

    if (!titleProp) {
      return { error: { message: 'Notion database is missing a title property' } };
    }

    // 1. Search for existing widget by title
    const searchResponse = await axios.post(
      `https://api.notion.com/v1/databases/${NOTION_WIDGETS_DATABASE_ID}/query`,
      {
        filter: {
          property: titleProp.name,
          title: {
            equals: widget.title
          }
        }
      },
      { headers: getNotionHeaders() }
    );

    const existingPage = searchResponse.data.results?.[0];

    // 2. Prepare properties
    const properties = {
      [titleProp.name]: {
        title: [{ text: { content: widget.title || 'Unknown Widget' } }]
      }
    };

    if (descriptionProp && widget.description) {
      properties[descriptionProp.name] = {
        rich_text: [{ text: { content: widget.description.substring(0, 2000) } }]
      };
    }

    if (linkProp && widget.link) {
      properties[linkProp.name] = { url: widget.link };
    }

    if (imageProp && widget.image) {
      properties[imageProp.name] = {
        files: [
          {
            type: 'external',
            name: 'Widget Preview',
            external: {
              url: widget.image
            }
          }
        ]
      };
    }


    if (existingPage) {
      // Update existing page
      console.log('🔵 Notion: Updating existing widget:', widget.title);
      const response = await axios.patch(
        `https://api.notion.com/v1/pages/${existingPage.id}`,
        { properties },
        { headers: getNotionHeaders() }
      );
      return { ...response.data, updated: true };
    } else {
      // Create new page
      console.log('🔵 Notion: Creating new widget:', widget.title);
      const response = await axios.post(
        'https://api.notion.com/v1/pages',
        {
          parent: { database_id: NOTION_WIDGETS_DATABASE_ID },
          properties
        },
        { headers: getNotionHeaders() }
      );
      return { ...response.data, created: true };
    }
  } catch (error) {
    console.error('❌ Error upserting widget to Notion:', error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
}

module.exports = {
  addTemplateToNotion,
  addCreatorToNotion,
  addConsultationToNotion,
  addCareerApplicationToNotion,
  addContactToNotion,
  upsertWidgetToNotion,
  isNotionConfigured,
  getNotionDatabaseSchema,
  getPriceSelectOptions
};
