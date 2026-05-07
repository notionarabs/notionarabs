const supabase = require('../utils/supabase');
const crypto = require('crypto');

class DownloadLog {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static async create(data) {
    const id = crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    
    // Normalize IDs
    const doc = {
        id: id,
        templateId: data.template?.toString() || data.templateId,
        creatorId: data.creator?.toString() || data.creatorId,
        userId: data.user?.toString() || data.userId,
        userEmailSnapshot: data.userEmailSnapshot,
        templateTitleSnapshot: data.templateTitleSnapshot,
        userAgent: data.userAgent,
        referrer: data.referrer,
        createdAt: now
    };

    const { data: created, error } = await supabase
      .from('DownloadLog')
      .insert([doc])
      .select()
      .single();
    if (error) throw error;
    return new DownloadLog(created);
  }

  static find(query = {}) {
    let q = supabase.from('DownloadLog').select('*');
    
    if (query.creator) q = q.eq('creatorId', query.creator);
    if (query.template) q = q.eq('templateId', query.template);
    if (query.user) q = q.eq('userId', query.user);

    let populatePaths = [];

    const execute = async () => {
        const { data, error } = await q;
        if (error) throw error;
        
        let results = (data || []).map(item => new DownloadLog(item));

        // Basic populate implementation
        if (populatePaths.length > 0 && results.length > 0) {
            for (const path of populatePaths) {
                if (path === 'user') {
                    const User = require('./User');
                    const userIds = [...new Set(results.map(r => r.userId).filter(id => id))];
                    if (userIds.length > 0) {
                        const users = await User.find({ id: { $in: userIds } });
                        const userMap = users.reduce((map, u) => { map[u.id] = u; return map; }, {});
                        results.forEach(r => { if (r.userId && userMap[r.userId]) r.user = userMap[r.userId]; });
                    }
                } else if (path === 'template') {
                    const Template = require('./Template');
                    const templateIds = [...new Set(results.map(r => r.templateId).filter(id => id))];
                    if (templateIds.length > 0) {
                        const templates = await Template.find({ id: { $in: templateIds } });
                        const templateMap = templates.reduce((map, t) => { map[t.id] = t; return map; }, {});
                        results.forEach(r => { if (r.templateId && templateMap[r.templateId]) r.template = templateMap[r.templateId]; });
                    }
                }
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
                q = q.order(key === 'downloadedAt' || key === 'createdAt' ? 'createdAt' : key, { ascending });
                return wrap(execute());
            }
            return wrap(p);
        };
        p.skip = (n) => {
            const limitValue = 50; 
            q = q.range(n, n + limitValue - 1);
            return wrap(execute());
        };
        p.limit = (num) => {
            q = q.limit(num);
            return wrap(execute());
        };
        p.populate = (path) => {
            const pName = typeof path === 'string' ? path : path.path;
            populatePaths.push(pName);
            return wrap(p);
        };
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('DownloadLog').select('*', { count: 'exact', head: true });
    
    if (query.creator) q = q.eq('creatorId', query.creator);
    if (query.template) q = q.eq('templateId', query.template);
    if (query.user) q = q.eq('userId', query.user);

    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }
}

module.exports = DownloadLog;
