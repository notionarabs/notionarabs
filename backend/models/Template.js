const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Template {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
    
    // Safety Truncation: Prevent extreme data bloat from affecting performance
    if (Array.isArray(this.features) && this.features.length > 500) {
        this.features = this.features.slice(0, 500);
        this.features.push('...');
    } else if (typeof this.features === 'string' && this.features.length > 50000) {
        this.features = this.features.substring(0, 50000) + '...';
    }

    // Map database IDs to application properties
    if (data.creatorId && !this.creator) this.creator = data.creatorId;
    if (data.pinnedById && !this.pinnedBy) this.pinnedBy = data.pinnedById;
    if (data.approvedById && !this.approvedBy) this.approvedBy = data.approvedById;
    if (data.rejectedById && !this.rejectedBy) this.rejectedBy = data.rejectedById;

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
      language: this.language,
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
      pinnedById: this.pinnedBy || this.pinnedById,
      approvedAt: this.approvedAt,
      approvedById: this.approvedBy || this.approvedById,
      rejectedAt: this.rejectedAt,
      rejectedById: this.rejectedBy || this.rejectedById,
      adminNotes: this.adminNotes,
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
          if (dbKey === 'category') dbKey = 'categories';
          
          let val = q[key];
          const isArrayCol = ['categories', 'tags', 'features'].includes(dbKey);

          // Normalize status for $or
          if (dbKey === 'status' && typeof val === 'string') {
              val = val.toUpperCase();
          }

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
                  let normalizedIn = val.$in;
                  if (dbKey === 'status') {
                      normalizedIn = normalizedIn.map(v => typeof v === 'string' ? v.toUpperCase() : v);
                  }
                  if (isArrayCol) {
                      return `${dbKey}.cs.{${normalizedIn.join(',')}}`;
                  }
                  const arrayVal = `(${normalizedIn.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')})`;
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
        if (dbKey === 'category') dbKey = 'categories';
        
        let val = query[key];
        const isArrayCol = ['categories', 'tags', 'features'].includes(dbKey);

        if (dbKey === 'status' && typeof val === 'string') {
            chain = chain.eq('status', val.toUpperCase());
            return;
        }
        
        if (val && typeof val === 'object') {
            if (val.$ne !== undefined) {
                let normalizedNe = val.$ne;
                if (dbKey === 'status' && typeof normalizedNe === 'string') {
                    chain = chain.neq('status', normalizedNe.toUpperCase());
                    return;
                }
                chain = chain.neq(dbKey, normalizedNe);
            }
            else if (val.$gte !== undefined) {
                chain = chain.gte(dbKey, val.$gte);
            }
            else if (val.$in) {
                let normalizedIn = val.$in;
                if (dbKey === 'status' && Array.isArray(normalizedIn)) {
                    normalizedIn = normalizedIn.map(v => typeof v === 'string' ? v.toUpperCase() : v);
                }
                if (isArrayCol) chain = chain.contains(dbKey, normalizedIn);
                else chain = chain.in(dbKey, normalizedIn);
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
    let populatePath = null;
    let limitVal = null;
    let skipVal = null;
    let sortObj = null;
    let selectFields = '*';

    const execute = async () => {
        let q = supabase.from('Template').select(selectFields);
        q = this._applyQuery(q, query);
        
        let chain = q;


        if (sortObj) {
            Object.keys(sortObj).forEach(key => {
                const ascending = sortObj[key] === 1;
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
        let results = (data || []).map(item => new Template(item));
        
        if (populatePath === 'creator' && results.length > 0) {
            const User = require('./User');
            const creatorIds = [...new Set(results.map(r => r.creatorId || r.creator).filter(id => id && typeof id === 'string'))];
            
            if (creatorIds.length > 0) {
                const creators = await User.find({ id: { $in: creatorIds } });
                const creatorMap = creators.reduce((map, c) => {
                    const cid = c.id || c._id;
                    if (cid) map[cid] = c;
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

    const promise = {
        then: (onFullfilled, onRejected) => execute().then(onFullfilled, onRejected),
        catch: (onRejected) => execute().catch(onRejected),
        sort: (s) => { sortObj = s; return promise; },
        limit: (n) => { limitVal = n; return promise; },
        skip: (n) => { skipVal = n; return promise; },
        populate: (path) => { populatePath = path; return promise; },
        select: (fields) => { 
            if (typeof fields === 'string') {
                // Convert Mongoose-style 'field1 field2 -excluded' to Supabase-style 'field1,field2'
                const parts = fields.split(/\s+/).filter(f => f && !f.startsWith('-'));
                if (parts.length > 0) {
                    // Always include id if selecting specific fields
                    if (!parts.includes('id') && !parts.includes('_id')) parts.push('id');
                    
                    selectFields = parts.map(f => {
                        if (f === '_id') return 'id';
                        if (f === 'category') return 'categories';
                        if (f === 'coverImage') return 'previewImage';
                        if (f === 'creator') return 'creatorId';
                        if (f === 'approvedBy') return 'approvedById';
                        if (f === 'rejectedBy') return 'rejectedById';
                        return f;
                    }).join(',');
                }
            }
            return promise; 
        },
        lean: () => promise
    };
    return promise;
  }

  static findOne(query = {}) {
    let populatePath = null;
    let selectFields = '*';

    const execute = async () => {
        let q = supabase.from('Template').select(selectFields);
        q = this._applyQuery(q, query);
        
        const { data, error } = await q.maybeSingle();
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

    const promise = {
        then: (onFullfilled, onRejected) => execute().then(onFullfilled, onRejected),
        catch: (onRejected) => execute().catch(onRejected),
        select: (fields) => { 
            if (typeof fields === 'string') {
                const parts = fields.split(/\s+/).filter(f => f && !f.startsWith('-'));
                if (parts.length > 0) {
                    if (!parts.includes('id') && !parts.includes('_id')) parts.push('id');
                    
                    selectFields = parts.map(f => {
                        if (f === '_id') return 'id';
                        if (f === 'category') return 'categories';
                        if (f === 'coverImage') return 'previewImage';
                        if (f === 'creator') return 'creatorId';
                        if (f === 'approvedBy') return 'approvedById';
                        if (f === 'rejectedBy') return 'rejectedById';
                        return f;
                    }).join(',');
                }
            }
            return promise; 
        },
        populate: (path) => { populatePath = path; return promise; },
        lean: () => promise
    };
    return promise;
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
    let populatePath = null;
    const execute = async () => {
        let dbUpdate = { ...update };
        
        // Handle $set if present (standard Mongoose pattern used in some routes)
        if (dbUpdate.$set) {
            dbUpdate = { ...dbUpdate, ...dbUpdate.$set };
            delete dbUpdate.$set;
        }

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

        if (dbUpdate.pinnedBy !== undefined) {
            dbUpdate.pinnedById = dbUpdate.pinnedBy;
            delete dbUpdate.pinnedBy;
        }

        if (dbUpdate.approvedBy !== undefined) {
            dbUpdate.approvedById = dbUpdate.approvedBy;
            delete dbUpdate.approvedBy;
        }

        if (dbUpdate.rejectedBy !== undefined) {
            dbUpdate.rejectedById = dbUpdate.rejectedBy;
            delete dbUpdate.rejectedBy;
        }
        
        // Ensure status is UPPERCASE if present
        if (dbUpdate.status) dbUpdate.status = dbUpdate.status.toString().toUpperCase();

        // Ensure updatedAt is refreshed
        dbUpdate.updatedAt = new Date().toISOString();

        const { data, error } = await supabase.from('Template').update(dbUpdate).eq('id', id).select().maybeSingle();
        if (error) throw error;
        if (!data) return null;

        const doc = new Template(data);
        if (populatePath) {
            await doc.populate(populatePath);
        }
        return doc;
    };
    
    const promise = execute();
    const wrap = (p) => {
        p.exec = () => p;
        p.select = () => wrap(p);
        p.populate = (path) => {
            populatePath = typeof path === 'string' ? path : path.path;
            return wrap(execute());
        };
        return p;
    };
    return wrap(promise);
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
    let q = supabase.from('Template').select('id', { count: 'exact', head: true });
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
          let q = supabase.from('Template').select('creatorId, downloads, rating').eq('status', 'APPROVED');
          
          // CRITICAL FIX: Apply match filter if present to avoid fetching ALL templates
          if (matchStage && matchStage.$match) {
              const creatorFilter = matchStage.$match.creator || matchStage.$match.creatorId;
              if (creatorFilter) {
                  if (creatorFilter.$in) q = q.in('creatorId', creatorFilter.$in);
                  else q = q.eq('creatorId', creatorFilter);
              }
          }

          const { data, error } = await q;
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

      // Special Case 4: Individual Creator Ratings and Downloads ($group: { _id: null, ratings: { $push: ... } })
      if (groupStage && groupStage.$group?._id === null && (groupStage.$group?.ratings?.$push || groupStage.$group?.totalDownloads)) {
          const cid = matchStage?.$match?.creator || matchStage?.$match?.creatorId;
          if (cid) {
              const { data, error } = await supabase.from('Template').select('rating, downloads, price, reviewsCount').eq('creatorId', cid).eq('status', 'APPROVED');
              if (error) throw error;
              
              const ratings = (data || []).map(item => item.rating || 0);
              const totalRatings = (data || []).reduce((sum, item) => sum + (item.reviewsCount || 0), 0);
              const totalDownloads = (data || []).reduce((sum, item) => sum + (item.downloads || 0), 0);
              const totalRevenue = (data || []).reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.downloads || 0)), 0);
              
              return [{ 
                  _id: null, 
                  ratings, 
                  templateRatings: ratings,
                  totalRatings,
                  totalDownloads,
                  totalRevenue,
                  totalTemplates: data?.length || 0
              }];
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
          
          const [totalRes, pendingRes, approvedRes, rejectedRes, recentRes] = await Promise.all([
              supabase.from('Template').select('id', { count: 'exact', head: true }),
              supabase.from('Template').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
              supabase.from('Template').select('id', { count: 'exact', head: true }).eq('status', 'APPROVED'),
              supabase.from('Template').select('id', { count: 'exact', head: true }).eq('status', 'REJECTED'),
              supabase.from('Template').select('id', { count: 'exact', head: true }).gte('createdAt', sevenDaysAgo)
          ]);

          const stats = {
              totalTemplates: totalRes.count || 0,
              pendingTemplates: pendingRes.count || 0,
              approvedTemplates: approvedRes.count || 0,
              rejectedTemplates: rejectedRes.count || 0,
              recentTemplates: recentRes.count || 0,
              total: totalRes.count || 0,
              pending: pendingRes.count || 0,
              approved: approvedRes.count || 0,
              rejected: rejectedRes.count || 0
          };

          return [stats];
      }

      // Fallback for admin templates query
      const skipStage = pipeline.find(p => p.$skip);
      const limitStage = pipeline.find(p => p.$limit);

      let q = supabase.from('Template').select('id, title, slug, status, creatorId, downloads, rating, createdAt, updatedAt');
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
