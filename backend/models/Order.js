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
        const created = await Order.create(this);
        Object.assign(this, created);
        this.id = created.id || created._id;
        this._id = this.id;
        return this;
    }
    const { data, error } = await supabase
      .from('Order')
      .update(updateData)
      .eq('id', dbId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (data) {
        Object.assign(this, data);
        this.id = data.id || data._id;
        this._id = this.id;
    }
    return this;
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
    if (query.status) q = q.eq('status', query.status.toUpperCase());
    if (query.user) q = q.eq('userId', query.user);
    
    // Always get the latest matching order
    q = q.order('createdAt', { ascending: false }).limit(1).maybeSingle();
    
    const execute = async () => {
      const { data, error } = await q;
      if (error) throw error;
      if (!data) return null;
      
      const { data: items } = await supabase.from('OrderItem').select('*').eq('orderId', data.id);
      
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
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => wrap(p);
        p.populate = (path) => wrap(p);
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static async completePending(orderId, { paymentId, paymobOrderId, paymentMethod = 'CARD' } = {}) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('Order')
      .update({
        status: 'COMPLETED',
        paymentId: paymentId ? paymentId.toString() : null,
        paymobOrderId: paymobOrderId ? paymobOrderId.toString() : null,
        paymentMethod: paymentMethod.toUpperCase(),
        updatedAt: now
      })
      .eq('id', orderId)
      .eq('status', 'PENDING')
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: items } = await supabase.from('OrderItem').select('*').eq('orderId', data.id);
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
  }

  static async existsForTemplate(userId, templateId) {
    const { data: orders } = await supabase
      .from('Order')
      .select('id')
      .eq('userId', userId)
      .eq('status', 'COMPLETED');

    if (!orders || orders.length === 0) return false;

    const orderIds = orders.map(o => o.id);
    const { data: items } = await supabase
      .from('OrderItem')
      .select('id')
      .in('orderId', orderIds)
      .eq('templateId', templateId)
      .limit(1);

    return !!(items && items.length > 0);
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
            // Roll back the parent order so we never have an orphaned orderless payment
            await supabase.from('Order').delete().eq('id', dbId);
            throw new Error('Failed to create order items: ' + (itemsError.message || JSON.stringify(itemsError)));
        }
    }

    return new Order({ ...created, items: items || [] });
  }
}

module.exports = Order;
