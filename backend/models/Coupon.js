const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Coupon {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
    this.id = this._id;
  }

  async save() {
    const { id, _id, ...updateData } = this;
    const dbId = id || _id;
    const now = new Date().toISOString();
    updateData.updatedAt = now;

    if (!dbId) {
      const created = await Coupon.create(this);
      Object.assign(this, created);
      this.id = created.id || created._id;
      this._id = this.id;
      return this;
    }

    const { data, error } = await supabase
      .from('Coupon')
      .update(updateData)
      .eq('id', dbId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (data) {
      Object.assign(this, data);
      this.id = data.id;
      this._id = data.id;
    }
    return this;
  }

  static async create(data) {
    const dbId = data.id || data._id || crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();

    const payload = {
      id: dbId,
      code: (data.code || '').trim().toUpperCase(),
      creatorId: data.creatorId,
      templateId: data.templateId || null,
      discountType: data.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(data.discountValue),
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      usedCount: 0,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: now,
      updatedAt: now
    };

    const { data: created, error } = await supabase
      .from('Coupon')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[COUPON MODEL ERROR] Coupon Insert failed:', JSON.stringify(error, null, 2));
      throw error;
    }

    return new Coupon(created);
  }

  static find(query = {}) {
    let q = supabase.from('Coupon').select('*');

    if (query.creatorId) q = q.eq('creatorId', query.creatorId);
    if (query.templateId) q = q.eq('templateId', query.templateId);
    if (typeof query.isActive === 'boolean') q = q.eq('isActive', query.isActive);

    const execute = async () => {
      const { data, error } = await q.order('createdAt', { ascending: false });
      if (error) {
        // Return empty array if table not created yet to avoid breaking caller
        if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
          console.warn('[Coupon Model] Coupon table does not exist yet. Please run coupons_migration.sql.');
          return [];
        }
        throw error;
      }
      return (data || []).map(item => new Coupon(item));
    };

    const promise = execute();
    const wrap = (p) => {
      p.sort = () => wrap(p);
      p.limit = () => wrap(p);
      p.populate = () => wrap(p);
      p.lean = () => wrap(p);
      return p;
    };
    return wrap(promise);
  }

  static async findById(id) {
    if (!id) return null;
    const { data, error } = await supabase
      .from('Coupon')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST205') return null;
      throw error;
    }
    return data ? new Coupon(data) : null;
  }

  static async findOne(query = {}) {
    let q = supabase.from('Coupon').select('*');

    if (query.id || query._id) q = q.eq('id', query.id || query._id);
    if (query.code) q = q.ilike('code', query.code.trim());
    if (query.creatorId) q = q.eq('creatorId', query.creatorId);
    if (typeof query.isActive === 'boolean') q = q.eq('isActive', query.isActive);

    const { data, error } = await q.order('createdAt', { ascending: false }).limit(1).maybeSingle();
    if (error) {
      if (error.code === 'PGRST205') return null;
      throw error;
    }
    return data ? new Coupon(data) : null;
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const { data, error } = await supabase
      .from('Coupon')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? new Coupon(data) : null;
  }

  /**
   * Safely increments the coupon usage counter.
   * Uses atomic Postgres function increment_coupon_usage if available.
   */
  static async incrementUsage(id) {
    if (!id) return false;

    // Try atomic RPC
    const { data: success, error: rpcError } = await supabase.rpc('increment_coupon_usage', {
      p_coupon_id: id
    });

    if (!rpcError && success !== undefined) {
      return !!success;
    }

    // Fallback: direct update if RPC is not registered
    const coupon = await Coupon.findById(id);
    if (!coupon || !coupon.isActive) return false;
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return false;

    const { error: updateErr } = await supabase
      .from('Coupon')
      .update({
        usedCount: (coupon.usedCount || 0) + 1,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    return !updateErr;
  }
}

module.exports = Coupon;
