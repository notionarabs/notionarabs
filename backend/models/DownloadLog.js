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
        downloadedAt: now
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

    const execute = async () => {
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(item => new DownloadLog(item));
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => {
            if (s && typeof s === 'object') {
                const key = Object.keys(s)[0];
                const ascending = s[key] === 1;
                q = q.order(key === 'downloadedAt' ? 'downloadedAt' : key, { ascending });
                return wrap(execute());
            }
            return wrap(p);
        };
        p.limit = (num) => {
            q = q.limit(num);
            return wrap(execute());
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
