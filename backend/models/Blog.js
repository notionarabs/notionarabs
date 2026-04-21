const supabase = require('../utils/supabase');

class Blog {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
    // Map database authorId to application author
    if (data.authorId && !this.author) {
        this.author = data.authorId;
    }
    // Normalize status for application usage
    if (this.status) this.status = this.status.toLowerCase();
  }

  async save() {
    const now = new Date().toISOString();
    const crypto = require('crypto');
    const payload = {
      id: this.id || this._id || crypto.randomBytes(12).toString('hex'),
      title: this.title,
      slug: this.slug || this.generateSlug(),
      excerpt: this.excerpt,
      content: this.content,
      authorId: typeof this.author === 'object' ? this.author._id : this.author,
      category: this.category,
      categories: this.categories || [],
      tags: this.tags || [],
      featuredImage: this.featuredImage,
      status: (this.status || 'DRAFT').toUpperCase(),
      featured: this.featured || false,
      views: this.views || 0,
      likes: this.likes || 0,
      publishedAt: this.publishedAt,
      createdAt: this.createdAt || now,
      updatedAt: now,
    };

    const { data, error } = await supabase.from('Blog').upsert(payload).select();
    if (error) throw error;
    
    let result = data && data[0];
    if (!result) {
        result = payload;
    }

    Object.assign(this, result);
    this._id = result.id;
    return this;
  }

  async incrementViews() {
      const { data, error } = await supabase
        .from('Blog')
        .update({ views: (this.views || 0) + 1 })
        .eq('id', this.id || this._id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
          this.views = data.views;
      }
      return this;
  }

  async populate(path, fields) {
      if (path === 'author') {
          const User = require('./User');
          const authorData = await User.findById(this.authorId || this.author);
          if (authorData) {
              this.author = authorData;
          }
      }
      return this;
  }

  generateSlug() {
      if (!this.title) return 'blog-post';
      return this.title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
  }

  static _applyQuery(q, query) {
    if (!query) return q;

    Object.keys(query).forEach(key => {
        if (key.startsWith('$')) {
            if (key === '$or' && Array.isArray(query.$or)) {
                const filters = query.$or.map(cond => {
                    const k = Object.keys(cond)[0];
                    let v = cond[k];
                    let dbK = k === '_id' ? 'id' : k;
                    if (dbK === 'author') dbK = 'authorId';
                    
                    const isArrayCol = ['categories', 'tags'].includes(dbK);
                    
                    if (v && typeof v === 'object') {
                        if (v.$regex) {
                            let pattern = v.$regex;
                            if (pattern.startsWith('^')) {
                                pattern = pattern.substring(1) + '%';
                            } else {
                                pattern = '%' + pattern + '%';
                            }
                            return `${dbK}.ilike.${pattern}`;
                        }
                        if (v.$in && Array.isArray(v.$in)) {
                            if (isArrayCol) {
                                // For array columns, $in means "contains any of these"
                                // Supabase .or() with .cs. (contains)
                                return `${dbK}.cs.{${v.$in.join(',')}}`;
                            }
                            const arrayVal = `(${v.$in.map(val => typeof val === 'string' ? `"${val}"` : val).join(',')})`;
                            return `${dbK}.in.${arrayVal}`;
                        }
                    }
                    
                    if (isArrayCol) return `${dbK}.cs.{${v}}`;
                    // Quote strings for equality check in .or()
                    const finalVal = typeof v === 'string' ? `"${v}"` : v;
                    return `${dbK}.eq.${finalVal}`;
                });
                q = q.or(filters.join(','));
            }
            return;
        }

        let dbKey = key === '_id' ? 'id' : key;
        const val = query[key];

        if (val && typeof val === 'object') {
            if (val.$in) {
                if (['categories', 'tags'].includes(dbKey)) {
                    q = q.contains(dbKey, val.$in);
                } else {
                    q = q.in(dbKey, val.$in);
                }
            }
            else if (val.$ne !== undefined) q = q.neq(dbKey, val.$ne);
            else if (val.$regex) {
                let pattern = val.$regex;
                if (pattern.startsWith('^')) {
                    pattern = pattern.substring(1) + '%';
                } else {
                    pattern = '%' + pattern + '%';
                }
                q = q.ilike(dbKey, pattern);
            }
        } else {
            if (dbKey === 'author') q = q.eq('authorId', val);
            else if (dbKey === 'status' && typeof val === 'string') q = q.eq(dbKey, val.toUpperCase());
            else {
                if (['categories', 'tags'].includes(dbKey)) {
                    q = q.contains(dbKey, [val]);
                } else {
                    q = q.eq(dbKey, val);
                }
            }
        }
    });

    return q;
  }

  static find(query = {}) {
    let chain = supabase.from('Blog').select('*');
    chain = this._applyQuery(chain, query);

    let populatePath = null;
    const execute = async () => {
        const { data, error } = await chain;
        if (error) throw error;
        let results = (data || []).map(item => new Blog(item));
        
        if (populatePath === 'author' && results.length > 0) {
            const User = require('./User');
            const authorIds = [...new Set(results.map(r => r.authorId || r.author).filter(id => id && typeof id === 'string'))];
            if (authorIds.length > 0) {
              const authors = await User.find({ id: { $in: authorIds } });
              const authorMap = authors.reduce((map, a) => {
                map[a.id] = a;
                return map;
              }, {});
              results.forEach(r => {
                const aid = r.authorId || r.author;
                if (aid && authorMap[aid]) r.author = authorMap[aid];
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
                if (key === 'score') return wrap(promise); // Ignore MongoDB textScore sorting
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
        p.populate = (path) => { populatePath = path; return wrap(p); };
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let chain = supabase.from('Blog').select('*');
    chain = this._applyQuery(chain, query);
    
    let populatePath = null;
    const execute = async () => {
        const { data, error } = await chain.maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        const doc = new Blog(data);
        if (populatePath === 'author' && (doc.authorId || doc.author)) {
            const User = require('./User');
            const authorId = doc.authorId || doc.author;
            if (typeof authorId === 'string') {
              const authors = await User.find({ id: { $in: [authorId] } });
              if (authors.length > 0) doc.author = authors[0];
            }
        }
        return doc;
    };

    const promise = execute();
    const wrap = (p) => {
      p.populate = (path) => { populatePath = path; return wrap(execute()); };
      return p;
    };
    return wrap(promise);
  }

  static findById(id) {
    if (!id) return null;
    return this.findOne({ _id: id });
  }

  static async exists(query) {
    let q = supabase.from('Blog').select('id', { count: 'exact', head: true });
    q = this._applyQuery(q, query);
    const { count, error } = await q;
    if (error) {
        console.error('Blog.exists error:', error);
        return false;
    }
    return (count || 0) > 0;
  }

  static findByIdAndUpdate(id, update, options = {}) {
    let populatePath = null;
    const execute = async () => {
        let dbUpdate = { ...update };
        
        // Handle $inc for views/likes if needed
        if (dbUpdate.$inc) {
            const { data: current } = await supabase.from('Blog').select('views, likes').eq('id', id).maybeSingle();
            if (current) {
                Object.keys(dbUpdate.$inc).forEach(key => {
                    dbUpdate[key] = (current[key] || 0) + dbUpdate.$inc[key];
                });
            }
            delete dbUpdate.$inc;
        }

        // Ensure status is UPPERCASE if present
        if (dbUpdate.status) dbUpdate.status = dbUpdate.status.toString().toUpperCase();

        // Ensure updatedAt is refreshed
        dbUpdate.updatedAt = new Date().toISOString();

        const { data, error } = await supabase.from('Blog').update(dbUpdate).eq('id', id).select().maybeSingle();
        if (error) throw error;
        if (!data) return null;
        
        const doc = new Blog(data);
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

  static async countDocuments(query = {}) {
    let q = supabase.from('Blog').select('*', { count: 'exact', head: true });
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
          if (path === 'author') {
            const User = require('./User');
            const authorIds = [...new Set(items.map(r => r.authorId || r.author).filter(id => id && typeof id === 'string'))];
            if (authorIds.length > 0) {
              const authors = await User.find({ id: { $in: authorIds } });
              const authorMap = authors.reduce((map, a) => {
                map[a.id] = a;
                return map;
              }, {});
              items.forEach(r => {
                const aid = r.authorId || r.author;
                if (aid && authorMap[aid]) r.author = authorMap[aid];
              });
            }
          }
      }
      return docs;
  }

  static async aggregate(pipeline) {
      const groupStage = pipeline.find(p => p.$group);
      if (groupStage) {
          // Handle specific sum stages from admin stats
          if (groupStage.$group.total?.$sum) {
              const field = groupStage.$group.total.$sum.replace('$', '');
              const { data, error } = await supabase.from('Blog').select(field);
              if (error) throw error;
              const total = (data || []).reduce((sum, item) => sum + (item[field] || 0), 0);
              return [{ _id: null, total }];
          }

          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          
          const [totalRes, pendingRes, publishedRes, rejectedRes, draftRes, recentRes] = await Promise.all([
              supabase.from('Blog').select('id', { count: 'exact', head: true }),
              supabase.from('Blog').select('id', { count: 'exact', head: true }).or('status.ilike.PENDING,status.eq.pending'),
              supabase.from('Blog').select('id', { count: 'exact', head: true }).or('status.ilike.PUBLISHED,status.eq.published'),
              supabase.from('Blog').select('id', { count: 'exact', head: true }).or('status.ilike.REJECTED,status.eq.rejected'),
              supabase.from('Blog').select('id', { count: 'exact', head: true }).or('status.ilike.DRAFT,status.eq.draft'),
              supabase.from('Blog').select('id', { count: 'exact', head: true }).gte('createdAt', sevenDaysAgo)
          ]);

          const stats = {
              totalBlogs: totalRes.count || 0,
              pendingBlogs: pendingRes.count || 0,
              publishedBlogs: publishedRes.count || 0,
              rejectedBlogs: rejectedRes.count || 0,
              draftBlogs: draftRes.count || 0,
              recentBlogs: recentRes.count || 0,
              total: totalRes.count || 0,
              pending: pendingRes.count || 0,
              published: publishedRes.count || 0,
              rejected: rejectedRes.count || 0,
              draft: draftRes.count || 0
          };

          return [stats];
      }

      // Fallback for general queries
      const matchStage = pipeline.find(p => p.$match);
      const skipStage = pipeline.find(p => p.$skip);
      const limitStage = pipeline.find(p => p.$limit);

      let q = supabase.from('Blog').select('*');
      if (matchStage) {
          if (matchStage.$match.status) q = q.eq('status', matchStage.$match.status.toUpperCase());
          if (matchStage.$match.author) q = q.eq('authorId', matchStage.$match.author);
      }
      
      q = q.order('status', { ascending: false });

      if (skipStage) q = q.range(skipStage.$skip, skipStage.$skip + (limitStage?.$limit || 50) - 1);
      else if (limitStage) q = q.limit(limitStage.$limit);
      
      const { data, error } = await q;
      if (error) throw error;
      
      let items = (data || []).map(item => new Blog(item));
      
      // Post-fetch sort to mimic StatusPriority
      items.sort((a, b) => {
          const priority = { 'PENDING': 0, 'PUBLISHED': 1, 'REJECTED': 2, 'DRAFT': 3 };
          const pA = priority[a.status] !== undefined ? priority[a.status] : 4;
          const pB = priority[b.status] !== undefined ? priority[b.status] : 4;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return items;
  }

  static async deleteMany(query = {}) {
    let q = supabase.from('Blog').delete();
    q = this._applyQuery(q, query);
    const { error } = await q;
    if (error) throw error;
    return true;
  }

  static async findByIdAndDelete(id) {
    if (!id) return null;
    const { data, error } = await supabase.from('Blog').delete().eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data ? new Blog(data) : null;
  }
}

module.exports = Blog;
