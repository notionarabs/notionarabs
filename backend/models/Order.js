const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Order {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  async save() {
    const { id, _id, ...updateData } = this;
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
        return (data || []).map(item => new Order(item));
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
    if (query._id) q = q.eq('id', query._id);
    
    return q.maybeSingle().then(({ data, error }) => {
      if (error) throw error;
      return data ? new Order(data) : null;
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
    const { id, _id, user, userId, ...otherData } = data;
    
    const payload = {
        ...otherData,
        id: id || _id || crypto.randomBytes(12).toString('hex'),
        userId: user || userId
    };

    const { data: created, error } = await supabase
      .from('Order')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return new Order(created);
  }
}

module.exports = Order;
