const supabase = require('../utils/supabase');

class UserDoc {
  static get VALID_COLUMNS() {
    return [
        'id', 'name', 'username', 'email', 'googleId', 'password', 'role', 'creatorStatus', 
        'isActive', 'emailNotifications', 'unsubscribeDate', 'profilePicture', 'backgroundImage', 
        'bio', 'templatesCount', 'followers', 'rating', 'isEmailVerified', 'emailVerificationToken', 
        'emailVerificationExpiry', 'resetToken', 'resetTokenExpiry', 'displayName', 'portfolio', 
        'experience', 'specialties', 'motivation', 'phone', 'instagram', 'twitter', 'linkedin', 
        'website', 'youtube', 'facebook', 'createdAt', 'updatedAt', 'socialLinks', 'allowMessages', 
        'contactEmail', 'badges', 'following',
        'profileVisibility', 'showEmail', 'showPhone', 'showTemplateCount', 'showJoinDate', 
        'customMessage', 'payoutMethod', 'payoutDetails', 'balance', 'totalEarnings',
        'isPinned', 'pinnedAt', 'pinnedById'
    ];
  }

  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this.id = data.id || data._id;
    this._id = data.id || data._id;
    
    // Normalize case for application consistency (lowercase in memory)
    // Database storage handles UPPERCASE conversion in _applyQuery and save
    if (this.role) this.role = this.role.toString().trim().toLowerCase();
    if (this.creatorStatus) this.creatorStatus = this.creatorStatus.toString().trim().toLowerCase();
    
    // Map database pinning ID to application property
    if (data.pinnedById && !this.pinnedBy) this.pinnedBy = data.pinnedById;
  }

  async save() {
    const { id, _id, ...updateData } = this;
    let dbId = id || _id;

    // Convert back to UPPERCASE for database storage compatibility (Supabase Enums)
    if (updateData.role) updateData.role = updateData.role.toString().toUpperCase();
    if (updateData.creatorStatus) updateData.creatorStatus = updateData.creatorStatus.toString().toUpperCase();

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

    // Handle Pinning mapping
    if (updateData.pinnedBy !== undefined) {
        updateData.pinnedById = updateData.pinnedBy;
        delete updateData.pinnedBy;
    }

    const filteredUpdate = {};
    Object.keys(updateData).forEach(key => {
        if (UserDoc.VALID_COLUMNS.includes(key)) {
            filteredUpdate[key] = updateData[key];
        }
    });

    let result;
    if (this._id && this.createdAt !== now) {
        // Update (It has an ID and existed before)
        const { data, error } = await supabase.from('User').update(filteredUpdate).eq('id', dbId).select();
        if (error) throw error;
        result = data && data[0];
    } else {
        // Create
        // For insert, we must include the ID if we generated one
        if (dbId && !filteredUpdate.id) filteredUpdate.id = dbId;
        
        const { data, error } = await supabase.from('User').insert(filteredUpdate).select();
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
          const [totalRes, adminRes, approvedRes, pendingRes, rejectedRes, recentRes, googleRes, activeRes, verifiedRes] = await Promise.all([
              supabase.from('User').select('id', { count: 'exact', head: true }),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('role', 'ADMIN'),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('creatorStatus', 'APPROVED'),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('creatorStatus', 'PENDING'),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('creatorStatus', 'REJECTED'),
              supabase.from('User').select('id', { count: 'exact', head: true }).gte('createdAt', sevenDaysAgo.toISOString()),
              supabase.from('User').select('id', { count: 'exact', head: true }).not('googleId', 'is', null),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('isActive', true),
              supabase.from('User').select('id', { count: 'exact', head: true }).eq('isEmailVerified', true)
          ]);

          const totalCount = totalRes.count || 0;
          const adminCount = adminRes.count || 0;
          const approvedCount = approvedRes.count || 0;
          const googleCount = googleRes.count || 0;
          const pendingCount = pendingRes.count || 0;
          const rejectedCount = rejectedRes.count || 0;

          return [{
              totalUsers: totalCount,
              googleUsers: googleCount,
              activeUsers: activeRes.count || 0,
              verifiedUsers: verifiedRes.count || 0,
              pendingApplications: pendingCount,
              approvedCreators: approvedCount,
              rejectedApplications: rejectedCount,
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

    const ENUM_FIELDS = ['role', 'creatorStatus'];

    Object.keys(query).forEach(key => {
        if (key.startsWith('$')) {
            if (key === '$or' && Array.isArray(query.$or)) {
                const filters = query.$or.map(cond => {
                    const k = Object.keys(cond)[0];
                    let v = cond[k];
                    const dbK = k === '_id' ? 'id' : k;

                    // Normalize enums for $or
                    if (ENUM_FIELDS.includes(dbK) && typeof v === 'string') {
                        v = v.toUpperCase();
                    }

                    const isArrayCol = ['specialties', 'badges', 'socialLinks'].includes(dbK);
                    
                    if (typeof v === 'object' && v.$regex) {
                        let pattern = v.$regex;
                        if (pattern.startsWith('^')) {
                            pattern = pattern.substring(1) + '%';
                        } else {
                            pattern = '%' + pattern + '%';
                        }
                        return `${dbK}.ilike.${pattern}`;
                    }
                    
                    if (isArrayCol) {
                        const arrayVal = Array.isArray(v) ? v : [v];
                        return `${dbK}.ov.{${arrayVal.join(',')}}`;
                    }
                    return `${dbK}.eq.${v}`;
                });
                q = q.or(filters.join(','));
            }
            return;
        }

        let dbKey = key === '_id' ? 'id' : key;
        let val = query[key];

        if (val && typeof val === 'object') {
            if (val.$in) {
                // Normalize enums for $in
                if (ENUM_FIELDS.includes(dbKey) && Array.isArray(val.$in)) {
                    val.$in = val.$in.map(v => typeof v === 'string' ? v.toUpperCase() : v);
                }
                const isArrayCol = ['specialties', 'badges', 'socialLinks'].includes(dbKey);
                if (isArrayCol) {
                    q = q.overlaps(dbKey, val.$in);
                } else {
                    q = q.in(dbKey, val.$in);
                }
            }
            else if (val.$ne !== undefined) {
                // Normalize enums for $ne
                if (ENUM_FIELDS.includes(dbKey) && typeof val.$ne === 'string') {
                    val.$ne = val.$ne.toUpperCase();
                }
                q = q.neq(dbKey, val.$ne);
            }
            else if (val.$regex) q = q.ilike(dbKey, `%${val.$regex}%`);
        } else {
            // Special mappings for User model
            if (ENUM_FIELDS.includes(dbKey) && typeof val === 'string') {
                q = q.eq(dbKey, val.toUpperCase());
            } else {
                q = q.eq(dbKey, val);
            }
        }
    });

    return q;
  }

  static find(query = {}) {
    let q = supabase.from('User').select('*');
    q = this._applyQuery(q, query);

    let limitVal = null;
    let skipVal = null;
    let sortObj = null;

    const execute = async () => {
        let chain = q;
        if (sortObj) {
            Object.keys(sortObj).forEach(key => {
                const ascending = sortObj[key] === 1 || sortObj[key] === 'asc';
                chain = chain.order(key === '_id' ? 'id' : key, { ascending });
            });
        }
        if (skipVal !== null && limitVal !== null) {
            chain = chain.range(skipVal, skipVal + limitVal - 1);
        } else if (limitVal !== null) {
            chain = chain.limit(limitVal);
        }

        const { data, error } = await chain;
        if (error) throw error;
        return (data || []).map(u => {
            const user = new UserDoc(u);
            user.id = u.id;
            user._id = u.id;
            return user;
        });
    };

    const promise = {
        then: (onFullfilled, onRejected) => execute().then(onFullfilled, onRejected),
        catch: (onRejected) => execute().catch(onRejected),
        sort: (s) => { sortObj = s; return promise; },
        limit: (n) => { limitVal = n; return promise; },
        skip: (n) => { skipVal = n; return promise; },
        select: () => promise,
        lean: () => promise
    };
    return promise;
  }

  static findOne(query = {}) {
    let chain = supabase.from('User').select('*');
    chain = this._applyQuery(chain, query);
    
    const execute = async () => {
        const { data, error } = await chain;
        if (error) throw error;
        const result = data && data[0];
        if (!result) return null;
        const user = new UserDoc(result);
        user.id = result.id;
        user._id = result.id;
        return user;
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
          let dbUpdate = {};
          
          // Filter update object to only include valid columns
          Object.keys(update).forEach(key => {
              if (UserDoc.VALID_COLUMNS.includes(key) || key.startsWith('$')) {
                  dbUpdate[key] = update[key];
              }
          });
          
          // Ensure role and creatorStatus are UPPERCASE for database Enum compatibility
          if (dbUpdate.role) dbUpdate.role = dbUpdate.role.toString().toUpperCase();
          if (dbUpdate.creatorStatus) dbUpdate.creatorStatus = dbUpdate.creatorStatus.toString().toUpperCase();

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

              // Handle pinning mapping
              if (finalData.pinnedBy !== undefined) {
                  finalData.pinnedById = finalData.pinnedBy;
                  delete finalData.pinnedBy;
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

          // Ensure updatedAt is always refreshed
          dbUpdate.updatedAt = new Date().toISOString();

          console.log('[USER MODEL DEBUG] Updating user:', id, 'with:', JSON.stringify(dbUpdate));
          const { data, error } = await supabase.from('User').update(dbUpdate).eq('id', id).select();
          if (error) {
              console.error('[USER MODEL DEBUG] Supabase Update Error:', error);
              throw error;
          }
          const updated = data && data[0];
          console.log('[USER MODEL DEBUG] Updated user resulting data:', updated ? 'FOUND' : 'NOT FOUND');
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
