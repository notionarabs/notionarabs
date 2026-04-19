const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Template {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
    // Map database creatorId to application creator
    if (data.creatorId && !this.creator) {
        this.creator = data.creatorId;
    }
    // Normalize status for application usage
    if (this.status) this.status = this.status.toLowerCase();
  }

  async save() {
    const now = new Date().toISOString();
    
    // Process features: convert string with newlines to array if necessary
    let featuresArray = this.features;
    if (typeof featuresArray === 'string') {
        featuresArray = featuresArray.split('\n').map(f => f.trim()).filter(f => f !== '');
    } else if (!Array.isArray(featuresArray)) {
        featuresArray = [];
    }

    const payload = {
      id: this.id || this._id || crypto.randomBytes(12).toString('hex'), // Explicitly generate ID to avoid DB null violations
      title: this.title,
      slug: this.slug,
      description: this.description,
      features: featuresArray, 
      categories: this.categories || [],
      tags: this.tags || [],
      creatorId: typeof this.creator === 'object' ? this.creator._id : this.creator, 
      previewImage: this.previewImage,
      previewImages: this.previewImages || [],
      explanationVideo: this.explanationVideo,
      notionLink: this.notionLink,
      purchaseLink: this.purchaseLink,
      isPaid: this.isPaid || false,
      price: this.price || 0,
      status: (this.status || 'PENDING').toUpperCase(),
      rating: this.rating || 0,
      reviewsCount: this.reviewsCount || 0,
      downloads: this.downloads || 0,
      views: this.views || 0,
      isPinned: this.isPinned || false,
      pinnedAt: this.pinnedAt,
      pinnedBy: this.pinnedBy,
      createdAt: this.createdAt || now,
      updatedAt: now,
    };

    const { data, error } = await supabase.from('Template').upsert(payload).select();
    if (error) {
        console.error('Template save error detailed:', error);
        throw error;
    }
    
    let result = data && data[0];
    if (!result) {
        result = payload;
    }
    
    Object.assign(this, result);
    this._id = result.id;
    this.creator = result.creatorId; 
    return this;
  }

  async approve(adminId, adminNotes = '') {
    this.status = 'approved';
    this.approvedBy = adminId;
    this.approvedAt = new Date().toISOString();
    this.adminNotes = adminNotes;
    return this.save();
  }

  async reject(adminId, adminNotes = '') {
    this.status = 'rejected';
    this.rejectedBy = adminId;
    this.rejectedAt = new Date().toISOString();
    this.adminNotes = adminNotes;
    return this.save();
  }

  async populate(path, fields) {
      if (path === 'creator') {
          const User = require('./User');
          const creatorData = await User.findById(this.creator);
          if (creatorData) {
              this.creator = creatorData;
          }
      }
      return this;
  }

  static _applyQuery(chain, query) {
    if (query.$or && Array.isArray(query.$or)) {
      const orStrings = query.$or.map(q => {
          const key = Object.keys(q)[0];
          let dbKey = key === '_id' ? 'id' : key;
          if (dbKey === 'creator') dbKey = 'creatorId';
          
          let val = q[key];
          const isArrayCol = ['categories', 'tags', 'features'].includes(dbKey);

          if (val && typeof val === 'object') {
              if (val.$regex) {
                  let pattern = val.$regex;
                  if (pattern.startsWith('^')) {
                      pattern = pattern.substring(1) + '%';
                  } else {
                      pattern = '%' + pattern + '%';
                  }
                  return `${dbKey}.ilike.${pattern}`;
              }
              if (val.$in && Array.isArray(val.$in)) {
                  if (isArrayCol) {
                      return `${dbKey}.cs.{${val.$in.join(',')}}`;
                  }
                  const arrayVal = `(${val.$in.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')})`;
                  return `${dbKey}.in.${arrayVal}`;
              }
          }

          if (isArrayCol) return `${dbKey}.cs.{${val}}`;
          const finalVal = typeof val === 'string' ? `"${val}"` : val;
          return `${dbKey}.eq.${finalVal}`;
      });
      chain = chain.or(orStrings.join(','));
    }

    // Apply other filters
    Object.keys(query).forEach(key => {
        if (key.startsWith('$')) return;
        let dbKey = key === '_id' ? 'id' : key;
        if (dbKey === 'creator') dbKey = 'creatorId';
        
        let val = query[key];
        const isArrayCol = ['categories', 'tags', 'features'].includes(dbKey);

        if (dbKey === 'status' && typeof val === 'string') {
            val = val.toUpperCase();
        }
        
        if (val && typeof val === 'object') {
            if (val.$ne) chain = chain.neq(dbKey, val.$ne);
            else if (val.$in) {
                if (isArrayCol) chain = chain.contains(dbKey, val.$in);
                else chain = chain.in(dbKey, val.$in);
            }
            else if (val.$regex) {
                let pattern = val.$regex;
                if (pattern.startsWith('^')) {
                    pattern = pattern.substring(1) + '%';
                } else {
                    pattern = '%' + pattern + '%';
                }
                chain = chain.ilike(dbKey, pattern);
            }
        } else {
            if (isArrayCol) {
                chain = chain.contains(dbKey, [val]);
            } else {
                chain = chain.eq(dbKey, val);
            }
        }
    });

    return chain;
  }

  static find(query = {}) {
    let chain = supabase.from('Template').select('*');
    chain = this._applyQuery(chain, query);

    let populatePath = null;
    const execute = async () => {
        const { data, error } = await chain;
        if (error) throw error;
        let results = (data || []).map(item => new Template(item));
        
        if (populatePath === 'creator' && results.length > 0) {
            const User = require('./User');
            const creatorIds = [...new Set(results.map(r => r.creatorId || r.creator).filter(id => id && typeof id === 'string'))];
            
            if (creatorIds.length > 0) {
                const creators = await User.find({ id: { $in: creatorIds } });
                const creatorMap = creators.reduce((map, c) => {
                    map[c.id] = c;
                    return map;
                }, {});
                results.forEach(r => {
                    const cid = r.creatorId || r.creator;
                    if (cid && creatorMap[cid]) {
                        r.creator = creatorMap[cid];
                    }
                });
            }
        }
        return results;
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
            chain = chain.range(n, (n + limit - 1)); 
            return wrap(execute()); 
        };
        p.limit = (n) => { 
            chain = chain.limit(n); 
            return wrap(execute()); 
        };
        p.select = (f) => wrap(p);
        p.populate = (path) => { populatePath = path; return wrap(p); };
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let chain = supabase.from('Template').select('*');
    chain = this._applyQuery(chain, query);
    
    let populatePath = null;
    const execute = async () => {
        const { data, error } = await chain.maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        const doc = new Template(data);
        if (populatePath === 'creator' && doc.creator) {
            const User = require('./User');
            const creator = await User.findById(doc.creator);
            if (creator) doc.creator = creator;
        }
        return doc;
    };

    const promise = execute();
    const wrap = (p) => {
        p.select = (f) => wrap(p);
        p.populate = (path) => { populatePath = path; return wrap(p); };
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findById(id) {
      return this.findOne({ _id: id });
  }

  static async exists(query) {
    let q = supabase.from('Template').select('id', { count: 'exact', head: true });
    q = this._applyQuery(q, query);
    const { count, error } = await q;
    if (error) {
        console.error('Template.exists error:', error);
        return false;
    }
    return (count || 0) > 0;
  }

  static findByIdAndUpdate(id, update, options = {}) {
    const execute = async () => {
        let dbUpdate = { ...update };
        
        // Handle $inc for views/downloads
        if (dbUpdate.$inc) {
            const { data: current } = await supabase.from('Template').select('views, downloads').eq('id', id).maybeSingle();
            if (current) {
                Object.keys(dbUpdate.$inc).forEach(key => {
                    dbUpdate[key] = (current[key] || 0) + dbUpdate.$inc[key];
                });
            }
            delete dbUpdate.$inc;
        }

        if (dbUpdate.creator) {
            dbUpdate.creatorId = dbUpdate.creator;
            delete dbUpdate.creator;
        }

        const { data, error } = await supabase.from('Template').update(dbUpdate).eq('id', id).select().maybeSingle();
        if (error) throw error;
        return data ? new Template(data) : null;
    };
    
    const promise = execute();
    promise.exec = () => promise;
    promise.select = () => promise;
    return promise;
  }

  static async distinct(field, query = {}) {
    let dbField = field === 'creator' ? 'creatorId' : field;
    let q = supabase.from('Template').select(dbField);
    q = this._applyQuery(q, query);
    
    const { data, error } = await q;
    if (error) throw error;
    
    // Return unique values
    return [...new Set((data || []).map(item => item[dbField]).filter(val => val))];
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('Template').select('*', { count: 'exact', head: true });
    q = this._applyQuery(q, query);
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  static async populate(docs, paths) {
      if (!docs || docs.length === 0) return docs;
      const isArray = Array.isArray(docs);
      const items = isArray ? docs : [docs];
      
      for (const pathObj of paths) {
          const path = typeof pathObj === 'string' ? pathObj : pathObj.path;
          if (path === 'creator') {
            const User = require('./User');
            const creatorIds = [...new Set(items.map(r => r.creatorId || r.creator).filter(id => id && typeof id === 'string'))];
            if (creatorIds.length > 0) {
              const creators = await User.find({ id: { $in: creatorIds } });
              const creatorMap = creators.reduce((map, c) => {
                map[c.id] = c;
                return map;
              }, {});
              items.forEach(r => {
                const cid = r.creatorId || r.creator;
                if (cid && creatorMap[cid]) r.creator = creatorMap[cid];
              });
            }
          }
      }
      return docs;
  }

  static async aggregate(pipeline) {
      const matchStage = pipeline.find(p => p.$match);
      const groupStage = pipeline.find(p => p.$group);
      const unwindStage = pipeline.find(p => p.$unwind);
      const projectStage = pipeline.find(p => p.$project);

      // Special Case 1: Total Downloads Sum ($group: { _id: null, totalDownloads: { $sum: '$downloads' } })
      if (groupStage && groupStage.$group?.totalDownloads?.$sum === '$downloads') {
          const { data, error } = await supabase.from('Template').select('downloads').eq('status', 'APPROVED');
          if (error) throw error;
          const totalDownloads = (data || []).reduce((sum, item) => sum + (item.downloads || 0), 0);
          return [{ _id: null, totalDownloads }];
      }

      // Special Case 2: Category Counts ($unwind: '$allCategories', $group: { _id: '$allCategories', count: { $sum: 1 } })
      if (unwindStage && unwindStage.$unwind === '$allCategories' && groupStage && groupStage.$group?._id === '$allCategories') {
          const { data, error } = await supabase.from('Template').select('categories').eq('status', 'APPROVED');
          if (error) throw error;
          
          const counts = {};
          (data || []).forEach(item => {
              const all = new Set([...(item.categories || [])].filter(c => c));
              all.forEach(cat => {
                  counts[cat] = (counts[cat] || 0) + 1;
              });
          });
          
          return Object.keys(counts).map(cat => ({
              category: cat,
              count: counts[cat],
              _id: cat
          }));
      }

      // Special Case 3: Creator-wise Template Stats ($group: { _id: '$creator', ... })
      if (groupStage && groupStage.$group?._id === '$creator' && groupStage.$group?.totalTemplates) {
          const { data, error } = await supabase.from('Template').select('creatorId, downloads, rating').eq('status', 'APPROVED');
          if (error) throw error;
          
          const creatorStats = {};
          (data || []).forEach(item => {
              const cid = item.creatorId;
              if (!cid) return;
              if (!creatorStats[cid]) {
                  creatorStats[cid] = { _id: cid, totalTemplates: 0, totalDownloads: 0, templateRatings: [] };
              }
              creatorStats[cid].totalTemplates += 1;
              creatorStats[cid].totalDownloads += (item.downloads || 0);
              creatorStats[cid].templateRatings.push(item.rating || 0);
          });
          
          return Object.values(creatorStats);
      }

      // Special Case 4: Individual Creator Ratings ($push: { $ifNull: ['$rating', 0] })
      if (groupStage && groupStage.$group?._id === null && groupStage.$group?.ratings?.$push) {
          const cid = matchStage?.$match?.creator;
          if (cid) {
              const { data, error } = await supabase.from('Template').select('rating').eq('creatorId', cid).eq('status', 'APPROVED');
              if (error) throw error;
              return [{ _id: null, ratings: (data || []).map(item => item.rating || 0) }];
          }
      }

      if (groupStage) {
          // Handle specific sum stages from admin stats
          if (groupStage.$group.total?.$sum) {
              const field = groupStage.$group.total.$sum.replace('$', '');
              const { data, error } = await supabase.from('Template').select(field);
              if (error) throw error;
              const total = (data || []).reduce((sum, item) => sum + (item[field] || 0), 0);
              return [{ _id: null, total }];
          }

          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          
          // Optimization: Fetch only 'status' and 'createdAt' for all templates
          // For marketplaces, template count is usually small enough (~few thousands) 
          // that fetching the status column is 10x faster than 5 separate count network requests.
          const { data, error } = await supabase.from('Template').select('status, createdAt');
          if (error) throw error;

          const stats = {
              totalTemplates: data.length,
              pendingTemplates: 0,
              approvedTemplates: 0,
              rejectedTemplates: 0,
              recentTemplates: 0,
              total: data.length,
              pending: 0,
              approved: 0,
              rejected: 0
          };

          data.forEach(item => {
              const status = (item.status || '').toUpperCase();
              if (status === 'PENDING') { stats.pendingTemplates++; stats.pending++; }
              else if (status === 'APPROVED') { stats.approvedTemplates++; stats.approved++; }
              else if (status === 'REJECTED') { stats.rejectedTemplates++; stats.rejected++; }
              
              if (item.createdAt >= sevenDaysAgo) {
                  stats.recentTemplates++;
              }
          });

          return [stats];
      }

      // Fallback for admin templates query
      const skipStage = pipeline.find(p => p.$skip);
      const limitStage = pipeline.find(p => p.$limit);

      let q = supabase.from('Template').select('*');
      if (matchStage) q = this._applyQuery(q, matchStage.$match);
      
      q = q.order('status', { ascending: false }); 
      
      if (skipStage) q = q.range(skipStage.$skip, skipStage.$skip + (limitStage?.$limit || 50) - 1);
      else if (limitStage) q = q.limit(limitStage.$limit);
      
      const { data, error } = await q;
      if (error) throw error;
      
      let items = (data || []).map(item => new Template(item));
      
      items.sort((a, b) => {
          const priority = { 'PENDING': 0, 'APPROVED': 1, 'REJECTED': 2 };
          const pA = priority[a.status] !== undefined ? priority[a.status] : 3;
          const pB = priority[b.status] !== undefined ? priority[b.status] : 3;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return items;
  }

  static async deleteMany(query = {}) {
    let q = supabase.from('Template').delete();
    q = this._applyQuery(q, query);
    const { error } = await q;
    if (error) throw error;
    return true;
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const { data, error } = await supabase.from('Template').delete().eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? new Template(data) : null;
  }
}

module.exports = Template;
