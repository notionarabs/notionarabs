const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Order {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  async save() {
    const { id, _id, items, ...updateData } = this;
    const dbId = id || _id;
    if (!dbId) {
        return Order.create(this);
    }
    const { data, error } = await supabase
      .from('Order')
      .update(updateData)
      .eq('id', dbId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data ? new Order(data) : null;
  }

  static find(query = {}) {
    let q = supabase.from('Order').select('*');
    if (query.user) q = q.eq('userId', query.user);
    if (query.status) q = q.eq('status', query.status.toUpperCase());
    
    const execute = async () => {
        const { data, error } = await q;
        if (error) throw error;
        
        const Template = require('./Template');
        const orders = data || [];
        const results = await Promise.all(orders.map(async (o) => {
            const { data: items } = await supabase.from('OrderItem').select('*').eq('orderId', o.id);
            
            // Populate each item's templateId
            if (items && items.length > 0) {
                const populatedItems = await Promise.all(items.map(async (item) => {
                    const template = await Template.findById(item.templateId);
                    return {
                        ...item,
                        templateId: template || item.templateId // Replace with object if found
                    };
                }));
                return new Order({ ...o, items: populatedItems });
            }
            
            return new Order({ ...o, items: items || [] });
        }));
        return results;
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => wrap(p);
        p.limit = (n) => wrap(p);
        p.populate = (path) => wrap(p);
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let q = supabase.from('Order').select('*');
    if (query.paymobOrderId) q = q.eq('paymobOrderId', query.paymobOrderId);
    if (query._id || query.id) q = q.eq('id', query._id || query.id);
    
    return q.maybeSingle().then(async ({ data, error }) => {
      if (error) throw error;
      if (!data) return null;
      
      const { data: items } = await supabase.from('OrderItem').select('*').eq('orderId', data.id);
      
      // Populate items
      let populatedItems = items || [];
      if (items && items.length > 0) {
          const Template = require('./Template');
          populatedItems = await Promise.all(items.map(async (item) => {
              const template = await Template.findById(item.templateId);
              return {
                  ...item,
                  templateId: template || item.templateId
              };
          }));
      }
      
      return new Order({ ...data, items: populatedItems });
    });
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('Order').select('*', { count: 'exact', head: true });
    if (query.status) q = q.eq('status', query.status.toUpperCase());
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  static async create(data) {
    const { id, _id, user, userId, items, ...otherData } = data;
    
    const dbId = id || _id || crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    const payload = {
        ...otherData,
        id: dbId,
        userId: user || userId,
        createdAt: now,
        updatedAt: now
    };

    if (payload.status) payload.status = payload.status.toUpperCase();
    if (payload.paymentMethod) payload.paymentMethod = payload.paymentMethod.toUpperCase();

    // 1. Create the Order
    const { data: created, error } = await supabase
      .from('Order')
      .insert([payload])
      .select()
      .single();
      
    if (error) {
        console.error('[ORDER MODEL ERROR] Order Insert failed:', JSON.stringify(error, null, 2));
        throw error;
    }

    // 2. Create OrderItems if present
    if (items && Array.isArray(items)) {
        const itemPayloads = items.map(item => ({
            id: crypto.randomBytes(12).toString('hex'),
            orderId: dbId,
            templateId: item.templateId,
            name: item.name,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('OrderItem')
            .insert(itemPayloads);
        
        if (itemsError) {
            console.error('[ORDER MODEL ERROR] OrderItems Insert failed:', JSON.stringify(itemsError, null, 2));
            // We don't throw here to avoid failing the whole order creation if just items fail, 
            // but in a production app you might want to roll back the order.
        }
    }

    return new Order({ ...created, items: items || [] });
  }
}

module.exports = Order;
