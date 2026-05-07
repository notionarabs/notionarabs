const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Notification {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  async save() {
    // Standardize save for completeness, although create is more common
    const { id, _id, ...updateData } = this;
    const dbId = id || _id;
    if (!dbId) {
       // Should use create for new notifications
       return;
    }
    const { data, error } = await supabase
      .from('Notification')
      .update(updateData)
      .eq('id', dbId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data ? new Notification(data) : null;
  }

  static async create(data) {
    const id = crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    
    // Normalize user ID — null, undefined, or 'system' → system placeholder
    let userId = data.user;
    if (!userId || userId === 'system') {
        userId = '000000000000000000000000';
    } else if (typeof userId === 'object' && userId._id) {
        userId = userId._id.toString();
    } else {
        userId = userId.toString();
    }

    const payload = {
      id: id,
      userId: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || '',
      metadata: data.metadata || {},
      isRead: data.isRead || false,
      createdAt: now,
      updatedAt: now
    };

    const { data: created, error } = await supabase
      .from('Notification')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return new Notification(created);
  }

  static find(query = {}) {
    let q = supabase.from('Notification').select('*');
    
    if (query.user) q = q.eq('userId', query.user.toString());
    if (query.isRead !== undefined) q = q.eq('isRead', query.isRead);
    if (query.type && query.type.$in) q = q.in('type', query.type.$in);
    if (query.type && query.type.$nin) q = q.not('type', 'in', `(${query.type.$nin.map(t => `"${t}"`).join(',')})`);

    const execute = async () => {
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(item => new Notification(item));
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => {
            if (s && typeof s === 'object') {
                const key = Object.keys(s)[0];
                const ascending = s[key] === 1;
                q = q.order(key === '_id' ? 'id' : key, { ascending });
                return wrap(execute());
            }
            return wrap(p);
        };
        p.limit = (n) => {
            q = q.limit(n);
            return wrap(execute());
        };
        p.populate = () => wrap(p);
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('Notification').select('*', { count: 'exact', head: true });
    
    if (query.user) q = q.eq('userId', query.user.toString());
    if (query.isRead !== undefined) q = q.eq('isRead', query.isRead);
    if (query.type && query.type.$in) q = q.in('type', query.type.$in);
    if (query.type && query.type.$nin) q = q.not('type', 'in', `(${query.type.$nin.map(t => `"${t}"`).join(',')})`);

    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  static async updateOne(query, update) {
    let q = supabase.from('Notification').update(update.$set || update);
    if (query._id) q = q.eq('id', query._id);
    if (query.user) q = q.eq('userId', query.user.toString());
    
    const { data, error } = await q.select();
    if (error) throw error;
    return { nModified: data?.length || 0 };
  }

  static findByIdAndUpdate(id, update) {
    const execute = async () => {
        let dbUpdate = { ...update };
        
        // Handle $set if present
        if (dbUpdate.$set) {
            dbUpdate = { ...dbUpdate, ...dbUpdate.$set };
            delete dbUpdate.$set;
        }

        dbUpdate.updatedAt = new Date().toISOString();
        const { data, error } = await supabase
          .from('Notification')
          .update(dbUpdate)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data ? new Notification(data) : null;
    };

    const promise = execute();
    promise.exec = () => promise;
    promise.select = () => promise;
    promise.populate = () => promise;
    return promise;
  }

  static async updateMany(query, update) {
    let q = supabase.from('Notification').update(update.$set || update);
    if (query.user) q = q.eq('userId', query.user);
    if (query.isRead !== undefined) q = q.eq('isRead', query.isRead);
    
    const { data, error } = await q.select();
    if (error) throw error;
    return { nModified: data?.length || 0 };
  }

  static async insertMany(docs) {
    if (!docs || docs.length === 0) return [];
    const now = new Date().toISOString();
    const payloads = docs.map(d => {
        let userId = d.user || d.userId;
        if (!userId) userId = '000000000000000000000000';
        else if (typeof userId === 'object' && userId._id) userId = userId._id.toString();

        return {
            id: d.id || crypto.randomBytes(12).toString('hex'),
            userId: userId,
            type: d.type,
            title: d.title,
            message: d.message,
            link: d.link || '',
            metadata: d.metadata || {},
            isRead: d.isRead || false,
            createdAt: d.createdAt || now,
            updatedAt: now
        };
    });

    const { data, error } = await supabase.from('Notification').insert(payloads).select();
    if (error) throw error;
    return (data || []).map(item => new Notification(item));
  }

  static async deleteMany(query = {}) {
    let q = supabase.from('Notification').delete();
    if (query.recipient) q = q.eq('userId', query.recipient);
    else if (query.user) q = q.eq('userId', query.user);
    if (query.type) q = q.eq('type', query.type);
    
    const { error } = await q;
    if (error) throw error;
    return true;
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const { data, error } = await supabase.from('Notification').delete().eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? new Notification(data) : null;
  }
}

module.exports = Notification;
