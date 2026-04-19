const supabase = require('../utils/supabase');

const fallbackSettings = {
  platformName: 'عرب نوشن',
  platformDescription: 'منصة قوالب Notion العربية',
  maintenanceMode: false,
  registrationEnabled: true,
  creatorApplicationsEnabled: true,
  autoApproveTemplates: false,
  autoApproveBlogs: false,
  contactInfo: {
    email: 'support@notionarabs.com',
    phone: '+201050505673',
    address: 'القاهرة، جمهورية مصر العربية'
  }
};

const Settings = {
  getSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('Settings')
        .select('*')
        .eq('id', 'default');

      if (error) throw error;
      const settings = data && data[0];
      return settings || { ...fallbackSettings, id: 'default' };
    } catch (error) {
      console.error('Settings Shim Error:', error);
      return { ...fallbackSettings, id: 'default' };
    }
  },

  updateSettings: async (updateData) => {
    const { data, error } = await supabase
      .from('Settings')
      .upsert({ ...updateData, id: 'default', updatedAt: new Date().toISOString() })
      .select();

    if (error) throw error;
    return data && data[0];
  }
};

module.exports = Settings;
