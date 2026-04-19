const supabase = require('../utils/supabase');
const crypto = require('crypto');

class Comment {
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
      content: this.content,
      createdAt: this.createdAt || now,
      updatedAt: now,
      // Map to specific database columns
      templateId: this.targetType === 'template' ? this.targetId : null,
      blogId: this.targetType === 'blog' ? this.targetId : null
    };

    const { data, error } = await supabase.from('Comment').upsert(payload).select().single();
    if (error) throw error;
    Object.assign(this, data);
    this._id = data.id;
    // Map back for application use
    this.targetId = data.templateId || data.blogId;
    return this;
  }

  async populate(path, fields) {
      if (path === 'user') {
          const User = require('./User');
          const userData = await User.findById(this.userId || this.user);
          if (userData) {
              this.user = userData;
          }
      }
      return this;
  }

  static find(query = {}) {
    let q = supabase.from('Comment').select('*');
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    // Support generic targetId by checking the specific column
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
    }
    
    if (query.user) q = q.eq('userId', query.user);

    const execute = async () => {
        const { data, error } = await q;
        if (error) throw error;
        return (data || []).map(item => {
            const c = new Comment(item);
            c.targetId = item.templateId || item.blogId;
            return c;
        });
    };

    const promise = execute();
    const wrap = (p) => {
        p.sort = (s) => wrap(p);
        p.skip = (n) => wrap(p);
        p.limit = (n) => wrap(p);
        p.populate = (path) => wrap(p);
        p.lean = () => wrap(p);
        return p;
    };
    return wrap(promise);
  }

  static findOne(query = {}) {
    let q = supabase.from('Comment').select('*');
    if (query.user) q = q.eq('userId', query.user);
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
    }
    
    if (query._id) q = q.eq('id', query._id);

    return q.maybeSingle().then(({ data, error }) => {
      if (error) throw error;
      if (!data) return null;
      const c = new Comment(data);
      c.targetId = data.templateId || data.blogId;
      return c;
    });
  }

  static findById(id) {
      return this.findOne({ _id: id });
  }

  static async countDocuments(query = {}) {
    let q = supabase.from('Comment').select('*', { count: 'exact', head: true });
    if (query.targetType) q = q.eq('targetType', query.targetType);
    
    if (query.targetId) {
        if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
        else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
    }
    
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  }

  static async getCommentsForTarget(targetType, targetId, page = 1, limit = 10) {
      let q = supabase.from('Comment')
        .select('*')
        .eq('targetType', targetType);
      
      if (targetType === 'template') q = q.eq('templateId', targetId);
      else if (targetType === 'blog') q = q.eq('blogId', targetId);
        
      const { data, error } = await q;
      if (error) throw error;
      const count = data.length;
      const results = data.map(item => {
          const c = new Comment(item);
          c.targetId = item.templateId || item.blogId;
          return c;
      });

      // Populate user data
      const userIds = [...new Set(results.map(r => r.userId).filter(id => id))];
      if (userIds.length > 0) {
          const User = require('./User');
          const users = await User.find({ id: { $in: userIds } });
          const userMap = users.reduce((map, u) => {
              map[u.id] = u;
              return map;
          }, {});
          results.forEach(r => {
              if (r.userId && userMap[r.userId]) r.user = userMap[r.userId];
          });
      }

      // Populate likesCount
      if (results.length > 0) {
          const commentIds = results.map(r => r.id || r._id);
          const { data: likes, error: likesErr } = await supabase
            .from('CommentLike')
            .select('commentId')
            .in('commentId', commentIds);
          
          if (!likesErr && likes) {
              const likeMap = likes.reduce((map, l) => {
                  map[l.commentId] = (map[l.commentId] || 0) + 1;
                  return map;
              }, {});
              results.forEach(r => {
                  r.likesCount = likeMap[r.id || r._id] || 0;
                  // Compatibility with frontend expecting .likes array length
                  r.likes = new Array(r.likesCount).fill({}); 
              });
          }
      }

      return {
          comments: results,
          totalComments: count,
          pagination: {
              current: page,
              pages: Math.ceil(count / limit),
              total: count,
              limit
          }
      };
  }

  static async getUserComment(userId, targetType, targetId) {
      return this.findOne({ user: userId, targetType, targetId });
  }

  static async findOneAndDelete(query) {
      let q = supabase.from('Comment').delete();
      
      if (query.user) q = q.eq('userId', query.user);
      if (query.targetType) q = q.eq('targetType', query.targetType);
      
      if (query.targetId) {
          if (query.targetType === 'template') q = q.eq('templateId', query.targetId);
          else if (query.targetType === 'blog') q = q.eq('blogId', query.targetId);
      }
      
      const { data, error } = await q.select().maybeSingle();
      
      if (error) throw error;
      return data ? new Comment(data) : null;
  }
}

module.exports = Comment;
