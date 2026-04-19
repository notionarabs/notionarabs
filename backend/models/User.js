const supabase = require('../utils/supabase');

class UserDoc {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
    
    // Normalize case and trim for database consistency (Supabase Enums are usually UPPERCASE)
    if (this.role) this.role = this.role.toString().trim().toUpperCase();
    if (this.creatorStatus) this.creatorStatus = this.creatorStatus.toString().trim().toUpperCase();
  }

  async save() {
    const { id, _id, ...updateData } = this;
    let dbId = id || _id;

    // Generate a new ID for new users if not present
    if (!dbId) {
        dbId = require('crypto').randomBytes(12).toString('hex'); // 24-char hex (MongoDB style)
        this.id = dbId;
        this._id = dbId;
        updateData.id = dbId; // Crucial: put it in the data being inserted
    }

    // Auto-generate username if missing
    if (!this.username) {
        let baseUsername = '';
        if (this.email) baseUsername = this.email.split('@')[0];
        else if (this.name) baseUsername = this.name.toLowerCase().replace(/\s+/g, '');
        else baseUsername = 'user_' + require('crypto').randomBytes(3).toString('hex');

        // Clean and ensure uniqueness
        baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');
        
        let finalUsername = baseUsername;
        let attempt = 0;
        let isUnique = false;

        while (!isUnique) {
            const checkUsername = attempt === 0 ? finalUsername : `${finalUsername}${attempt}`;
            const { data } = await supabase.from('User').select('id').eq('username', checkUsername);
            const existing = data && data[0];
            if (!existing) {
                this.username = checkUsername;
                updateData.username = checkUsername;
                isUnique = true;
            } else {
                attempt++;
            }
        }
    }

    // Handle Timestamps
    const now = new Date().toISOString();
    if (!this.createdAt) {
        this.createdAt = now;
        updateData.createdAt = now;
    }
    this.updatedAt = now;
    updateData.updatedAt = now;

    let result;
    if (this._id && this.createdAt !== now) {
        // Update (It has an ID and existed before)
        const { data, error } = await supabase.from('User').update(updateData).eq('id', dbId).select();
        if (error) throw error;
        result = data && data[0];
    } else {
        // Create
        const { data, error } = await supabase.from('User').insert(updateData).select();
        if (error) throw error;
        result = data && data[0];
    }

    // If result is null (e.g. due to RLS), use what we have in memory
    if (!result) {
        result = { ...updateData, id: dbId };
    }

    Object.assign(this, result);
    this._id = result.id;
    return this;
  }

  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    // For Google users who don't have a real password set
    if (this.password === 'google-oauth-user') return false; 
    
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(candidatePassword, this.password);
  }

  static async aggregate(pipeline) {
      const matchStage = pipeline.find(p => p.$match);
      const groupStage = pipeline.find(p => p.$group);
      const addFieldsStage = pipeline.find(p => p.$addFields);
      const limitStage = pipeline.find(p => p.$limit);

      // Special Case 1: Dashboard Stats ($group: { _id: null, totalUsers: { $sum: 1 } ... })
      if (groupStage && groupStage.$group?.totalUsers) {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          
          // Use counts directly from Supabase for large scale performance
          // We can't easily do 'filter in count' in Supabase JS without RPC, 
          // but we can parallelize them effectively.
          const [totalRes, adminRes, approvedRes, recentRes, googleRes] = await Promise.all([
              supabase.from('User').select('id', { count: 'exact', head: true }),
              supabase.from('User').select('id', { count: 'exact', head: true }).or('role.ilike.ADMIN,role.eq.admin'),
              supabase.from('User').select('id', { count: 'exact', head: true }).or('creatorStatus.ilike.APPROVED,creatorStatus.eq.approved'),
              supabase.from('User').select('id', { count: 'exact', head: true }).gte('createdAt', sevenDaysAgo.toISOString()),
              supabase.from('User').select('id', { count: 'exact', head: true }).not('googleId', 'is', null)
          ]);

          const totalCount = totalRes.count || 0;
          const adminCount = adminRes.count || 0;
          const approvedCount = approvedRes.count || 0;
          const googleCount = googleRes.count || 0;

          return [{
              totalUsers: totalCount,
              googleUsers: googleCount,
              activeUsers: totalCount,
              verifiedUsers: totalCount,
              pendingApplications: 0,
              approvedCreators: approvedCount,
              rejectedApplications: 0,
              adminUsers: adminCount,
              regularUsers: totalCount - adminCount - approvedCount,
              recentUsers: recentRes.count || 0
          }];
      }

      // Special Case 2: Top Creators ($addFields: { fameScore: ... })
      if (addFieldsStage && addFieldsStage.$addFields?.fameScore) {
          // Fetch base creators
          let q = supabase.from('User').select('*');
          if (matchStage) q = this._applyQuery(q, matchStage.$match);
          
          const { data: users, error } = await q;
          if (error) throw error;

          if (!users || users.length === 0) return [];

          // For each user, fetch template stats manually
          const Template = require('./Template');
          const results = await Promise.all(users.map(async (u) => {
              const templates = await Template.find({ creator: u.id, status: 'approved' });
              
              const stats = {
                  count: templates.length,
                  totalDownloads: templates.reduce((sum, t) => sum + (t.downloads || 0), 0),
                  avgRating: templates.length > 0 
                      ? templates.reduce((sum, t) => sum + (t.rating || 0), 0) / templates.length 
                      : 0
              };

              // Calculate fame score (matches stats.js logic)
              const followersCount = u.followers || 0;
              const fameScore = (followersCount * 0.5) + (stats.avgRating * 10 * 0.3) + (Math.min(stats.count, 20) * 0.2);

              return {
                  ...u,
                  id: u.id,
                  templateStats: stats,
                  templatesCount: stats.count,
                  templateCount: stats.count,
                  totalDownloads: stats.totalDownloads,
                  averageRating: stats.avgRating,
                  followersCount: followersCount,
                  fameScore: fameScore,
                  isPinned: u.isPinned || false,
                  pinnedAt: u.pinnedAt || new Date(0).toISOString()
              };
          }));

          // Filter out those with no templates (matches stats.js $match templatesCount: { $gt: 0 })
          let filtered = results.filter(r => r.templatesCount > 0);

          // Sort (pinned first, then fameScore)
          filtered.sort((a, b) => {
              if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
              if (a.isPinned && a.pinnedAt !== b.pinnedAt) return new Date(b.pinnedAt) - new Date(a.pinnedAt);
              return b.fameScore - a.fameScore;
          });

          return limitStage ? filtered.slice(0, limitStage.$limit) : filtered;
      }
      
      // Special Case 3: Count for Homepage Stats ($count: 'total')
      if (pipeline.some(p => p.$count === 'total')) {
          let q = supabase.from('User').select('*', { count: 'exact', head: true });
          if (matchStage) q = this._applyQuery(q, matchStage.$match);
          const { count } = await q;
          return [{ total: count || 0 }];
      }

      return [];
  }

  static _applyQuery(q, query) {
    if (!query) return q;

    Object.keys(query).forEach(key => {
        if (key.startsWith('$')) {
            if (key === '$or' && Array.isArray(query.$or)) {
                const filters = query.$or.map(cond => {
                    const k = Object.keys(cond)[0];
                    const v = cond[k];
                    const dbK = k === '_id' ? 'id' : k;
                    if (typeof v === 'object' && v.$regex) {
                        let pattern = v.$regex;
                        if (pattern.startsWith('^')) {
                            pattern = pattern.substring(1) + '%';
                        } else {
                            pattern = '%' + pattern + '%';
                        }
                        return `${dbK}.ilike.${pattern}`;
                    }
                    return `${dbK}.eq.${v}`;
                });
                q = q.or(filters.join(','));
            }
            return;
        }

        let dbKey = key === '_id' ? 'id' : key;
        const val = query[key];

        if (val && typeof val === 'object') {
            if (val.$in) q = q.in(dbKey, val.$in);
            else if (val.$ne !== undefined) q = q.neq(dbKey, val.$ne);
            else if (val.$regex) q = q.ilike(dbKey, `%${val.$regex}%`);
        } else {
            // Special mappings for User model
            if (dbKey === 'role' && typeof val === 'string') {
                q = q.eq(dbKey, val.toUpperCase());
            } else if (dbKey === 'creatorStatus' && typeof val === 'string') {
                q = q.eq(dbKey, val.toUpperCase());
            } else {
                q = q.eq(dbKey, val);
            }
        }
    });

    return q;
  }

  static find(query = {}) {
    let chain = supabase.from('User').select('*');
    chain = this._applyQuery(chain, query);

    const execute = async () => {
      const { data, error } = await chain;
      if (error) throw error;
      return (data || []).map(u => new UserDoc(u));
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => {
            if (s && typeof s === 'object') {
                const key = Object.keys(s)[0];
                const ascending = s[key] === 1;
                chain = chain.order(key === '_id' ? 'id' : key, { ascending });
            }
            return wrap(execute());
        };
        p.skip = (n) => { 
            const limit = 50; 
            chain = chain.range(n, n + limit - 1); 
            return wrap(execute()); 
        };
        p.limit = (n) => { 
            chain = chain.limit(n); 
            return wrap(execute()); 
        };
        p.select = () => wrap(p);
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let chain = supabase.from('User').select('*');
    chain = this._applyQuery(chain, query);
    
    const execute = async () => {
        const { data, error } = await chain;
        if (error) throw error;
        const result = data && data[0];
        return result ? new UserDoc(result) : null;
    };

    const promise = execute();
    const wrap = (p) => {
      p.select = () => wrap(p);
      p.lean = () => wrap(p);
      return p;
    };
    return wrap(promise);
  }

  static findById(id) {
    if (!id) return null;
    return this.findOne({ _id: id });
  }

  static findByIdAndUpdate(id, update, options = {}) {
      const execute = async () => {
          let dbUpdate = { ...update };
          
          // Handle MongoDB-style operators if present
          const hasOperators = Object.keys(dbUpdate).some(k => k.startsWith('$'));
          
          if (hasOperators) {
              // Fetch current document to apply changes
              const { data } = await supabase.from('User').select('*').eq('id', id);
              const current = data && data[0];
              
              if (!current) return null;

              let finalData = { ...current };

              // Handle $set
              if (dbUpdate.$set) {
                  Object.assign(finalData, dbUpdate.$set);
              }

              // Handle $inc
              if (dbUpdate.$inc) {
                  Object.keys(dbUpdate.$inc).forEach(key => {
                      finalData[key] = (current[key] || 0) + dbUpdate.$inc[key];
                  });
              }

              // Handle $addToSet
              if (dbUpdate.$addToSet) {
                  Object.keys(dbUpdate.$addToSet).forEach(key => {
                      const currentArr = Array.isArray(current[key]) ? current[key] : [];
                      const valToAdd = dbUpdate.$addToSet[key];
                      if (!currentArr.includes(valToAdd)) {
                          finalData[key] = [...currentArr, valToAdd];
                      }
                  });
              }

              // Handle $pull
              if (dbUpdate.$pull) {
                  Object.keys(dbUpdate.$pull).forEach(key => {
                      const currentArr = Array.isArray(current[key]) ? current[key] : [];
                      const valToRemove = dbUpdate.$pull[key];
                      finalData[key] = currentArr.filter(item => item !== valToRemove);
                  });
              }

              // Clean up Postgres-specific id from finalData to avoid updating it
              const { id: _, ...updateFields } = finalData;
              dbUpdate = updateFields;
          }

          const { data } = await supabase.from('User').update(dbUpdate).eq('id', id).select();
          const updated = data && data[0];
          return updated ? new UserDoc(updated) : null;
      };
      
      const promise = execute();
      const wrap = (p) => {
          p.exec = () => p;
          p.select = () => p;
          p.lean = () => p;
          return p;
      };
      return wrap(promise);
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('User').select('*', { count: 'exact', head: true });
    q = this._applyQuery(q, query);
    
    return q.then(({ count, error }) => {
        if (error) throw error;
        return count || 0;
    });
  }

  static async deleteMany(query = {}) {
    let q = supabase.from('User').delete();
    q = this._applyQuery(q, query);
    const { error } = await q;
    if (error) throw error;
    return true;
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const { data, error } = await supabase.from('User').delete().eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? new UserDoc(data) : null;
  }
}

module.exports = UserDoc;
