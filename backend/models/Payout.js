const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Payout {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  async save() {
    const { id, _id, ...updateData } = this;
    const dbId = id || _id;

    if (updateData.status) updateData.status = updateData.status.toUpperCase();

    if (!dbId) {
        return Payout.create(this);
    }

    updateData.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('Payout')
      .update(updateData)
      .eq('id', dbId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data ? new Payout(data) : null;
  }

  static find(query = {}) {
    let q = supabase.from('Payout').select('*');
    if (query.creator) q = q.eq('creatorId', query.creator);
    if (query.status) q = q.eq('status', query.status.toUpperCase());
    
    const execute = async () => {
        const { data, error } = await q.order('createdAt', { ascending: false });
        if (error) throw error;
        let payouts = (data || []).map(p => new Payout(p));
        
        // Handle population if requested
        if (promise._populatePath === 'creatorId') {
            const User = require('./User');
            payouts = await Promise.all(payouts.map(async (p) => {
                if (p.creatorId) {
                    const creator = await User.findById(p.creatorId);
                    if (creator) p.creator = creator;
                }
                return p;
            }));
        }
        
        return payouts;
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => wrap(p);
        p.limit = (n) => wrap(p);
        p.populate = (path) => {
            p._populatePath = path;
            return wrap(p);
        };
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let q = supabase.from('Payout').select('*');
    if (query._id || query.id) q = q.eq('id', query._id || query.id);
    
    return q.maybeSingle().then(({ data, error }) => {
      if (error) throw error;
      return data ? new Payout(data) : null;
    });
  }

  static async create(data) {
    const { id, _id, creator, creatorId, ...otherData } = data;
    
    const dbId = id || _id || crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    const payload = {
        ...otherData,
        id: dbId,
        creatorId: creator || creatorId,
        status: (data.status || 'PENDING').toUpperCase(),
        createdAt: now,
        updatedAt: now
    };

    const { data: created, error } = await supabase
      .from('Payout')
      .insert([payload])
      .select()
      .single();
      
    if (error) {
        console.error('[PAYOUT MODEL ERROR] Payout Insert failed:', JSON.stringify(error, null, 2));
        throw error;
    }

    return new Payout(created);
  }
}

module.exports = Payout;
