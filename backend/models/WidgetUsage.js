const supabase = require('../utils/supabase');

const WidgetUsage = {
  create: async (data) => {
    const { data: created, error } = await supabase
      .from('WidgetUsage')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return created;
  },

  countDocuments: async (query = {}) => {
    let chain = supabase.from('WidgetUsage').select('*', { count: 'exact', head: true });
    if (query.widgetId) chain = chain.eq('widgetId', query.widgetId);
    
    const { count, error } = await chain;
    if (error) throw error;
    return count || 0;
  },

  findOneAndUpdate: async (query, update, options) => {
    // Standardize query for matching
    const matchFields = { 
        widgetId: query.widgetId, 
        identifier: query.identifier 
    };

    // Extract values from $set and $setOnInsert
    const payload = {
        ...(update.$set || {}),
        ...(update.$setOnInsert || {})
    };
    
    // Check if exists
    const { data: existing, error: findError } = await supabase
        .from('WidgetUsage')
        .select('id')
        .match(matchFields)
        .maybeSingle();
        
    if (existing) {
        const { data, error } = await supabase
            .from('WidgetUsage')
            .update(payload)
            .eq('id', existing.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('WidgetUsage')
            .insert([{ ...matchFields, ...payload }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
  },

  aggregate: async (pipeline) => {
      // Used for: { $group: { _id: '$widgetId', count: { $sum: 1 } } }
      const groupStage = pipeline.find(p => p.$group);
      if (groupStage) {
          const { data, error } = await supabase.rpc('count_widget_usage_by_id');
          // If RPC is not available, we have to do it manually or via select
          if (error) {
              const { data: allData, error: allErr } = await supabase
                .from('WidgetUsage')
                .select('widgetId');
              if (allErr) throw allErr;
              const counts = allData.reduce((map, item) => {
                  map[item.widgetId] = (map[item.widgetId] || 0) + 1;
                  return map;
              }, {});
              return Object.entries(counts).map(([id, count]) => ({ _id: id, count }));
          }
          return data;
      }
      return [];
  }
};

module.exports = WidgetUsage;
