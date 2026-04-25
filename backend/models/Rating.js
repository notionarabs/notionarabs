const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Rating {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  async save() {
    const now = new Date().toISOString();
    const payload = {
      id: this.id || this._id || crypto.randomBytes(12).toString('hex'),
      userId: this.user || this.userId,
      targetType: this.targetType,
      rating: this.rating,
      review: this.review || '',
      isPublic: this.isPublic !== undefined ? this.isPublic : true,
      createdAt: this.createdAt || now,
      updatedAt: now,
      // Map to specific database columns
      templateId: this.targetType === 'template' ? this.targetId : null,
      blogId: this.targetType === 'blog' ? this.targetId : null,
      creatorId: this.targetType === 'creator' ? this.targetId : null
    };

    const { data, error } = await supabase.from('Rating').upsert(payload).select().single();
    if (error) throw error;
    Object.assign(this, result);
    this.id = result.id;
    this._id = result.id;
    // Map back for application use
    this.targetId = result.templateId || result.blogId || result.creatorId;
    return this;
  }

  static find(query = {}) {
    let q = supabase.from('Rating').select('*');
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
        else if (query.targetType === 'creator') q = q.eq('creatorId', query.targetId);
    }
    
    if (query.user) q = q.eq('userId', query.user);
    if (query.isPublic !== undefined) q = q.eq('isPublic', query.isPublic);
    
    let populatePath = null;
    let limitVal = null;
    let skipVal = null;
    let sortObj = null;

    const execute = async () => {
        let chain = q;
        if (sortObj) {
            const key = Object.keys(sortObj)[0];
            const ascending = sortObj[key] === 1;
            chain = chain.order(key === '_id' ? 'id' : key, { ascending });
        }
        if (skipVal !== null && limitVal !== null) {
            chain = chain.range(skipVal, skipVal + limitVal - 1);
        } else if (limitVal !== null) {
            chain = chain.limit(limitVal);
        }

        const { data, error } = await chain;
        if (error) throw error;
        
        const results = (data || []).map(item => {
            const r = new Rating(item);
            r.targetId = item.templateId || item.blogId || item.creatorId;
            return r;
        });

        if (populatePath === 'user' && results.length > 0) {
            const User = require('./User');
            const userIds = [...new Set(results.map(r => r.userId).filter(id => id))];
            if (userIds.length > 0) {
                const users = await User.find({ id: { $in: userIds } });
                const userMap = users.reduce((map, u) => {
                    const uid = u.id || u._id;
                    if (uid) map[uid] = u;
                    return map;
                }, {});
                results.forEach(r => {
                    if (r.userId && userMap[r.userId]) r.user = userMap[r.userId];
                });
            }
        }
        return results;
    };

    const promise = {
        then: (onFullfilled, onRejected) => execute().then(onFullfilled, onRejected),
        catch: (onRejected) => execute().catch(onRejected),
        sort: (s) => { sortObj = s; return promise; },
        limit: (n) => { limitVal = n; return promise; },
        skip: (n) => { skipVal = n; return promise; },
        populate: (path) => { populatePath = path; return promise; },
        lean: () => promise
    };
    return promise;
  }

  static findOne(query = {}) {
    let q = supabase.from('Rating').select('*');
    if (query.user) q = q.eq('userId', query.user);
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
        else if (query.targetType === 'creator') q = q.eq('creatorId', query.targetId);
    }
    
    return q.maybeSingle().then(({ data, error }) => {
      if (error) throw error;
      if (!data) return null;
      const r = new Rating(data);
      r.targetId = data.templateId || data.blogId || data.creatorId;
      return r;
    });
  }

  static countDocuments(query = {}) {
    let q = supabase.from('Rating').select('*', { count: 'exact', head: true });
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
        else if (query.targetType === 'creator') q = q.eq('creatorId', query.targetId);
    }
    
    return q.then(({ count, error }) => {
      if (error) throw error;
      return count || 0;
    });
  }

  static async getAverageRating(targetType, targetId) {
    let q = supabase.from('Rating').select('rating').eq('targetType', targetType);
    
    if (targetType === 'template') q = q.eq('templateId', targetId);
    else if (targetType === 'blog') q = q.eq('blogId', targetId);
    else if (targetType === 'creator') q = q.eq('creatorId', targetId);
    
    const { data: ratings, error } = await q;
    
    if (error) throw error;
    if (!ratings || ratings.length === 0) return { averageRating: 0, totalRatings: 0 };
    
    const sum = ratings.reduce((s, r) => s + r.rating, 0);
    return { averageRating: sum / ratings.length, totalRatings: ratings.length };
  }

  static getUserRating(userId, targetType, targetId) {
      return this.findOne({ user: userId, targetType, targetId });
  }

  static async aggregate(pipeline) {
      const matchStage = pipeline.find(p => p.$match);
      if (matchStage) {
          const { targetType, targetId } = matchStage.$match;
          if (targetId && targetId.$in) {
              const idColumn = targetType === 'template' ? 'templateId' : targetType === 'blog' ? 'blogId' : 'creatorId';
              
              const { data, error } = await supabase
                .from('Rating')
                .select(`${idColumn}, rating`)
                .eq('targetType', targetType)
                .in(idColumn, targetId.$in);
              
              if (error) throw error;
              
              const grouped = data.reduce((map, r) => {
                  const tid = r[idColumn].toString();
                  if (!map[tid]) map[tid] = { _id: r[idColumn], totalRating: 0, count: 0 };
                  map[tid].totalRating += r.rating;
                  map[tid].count += 1;
                  return map;
              }, {});

              return Object.values(grouped).map(g => ({
                  _id: g._id,
                  averageRating: g.totalRating / g.count,
                  totalRatings: g.count
              }));
          }
      }
      return [];
  }
}

module.exports = Rating;
