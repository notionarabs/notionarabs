import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Tag, Clock, Calendar, User as UserIcon, Mail, Layout, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { extractFirstImage } from '../../../../lib/seo';
import { memo } from 'react';

const BlogDetailsModal = memo(({
  showDetailsModal,
  setShowDetailsModal,
  selectedBlogDetails,
  handleStatusChange,
  normalizeImageUrl,
  formatDate
}) => (
  <AnimatePresence>
    {showDetailsModal && selectedBlogDetails && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDetailsModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-dark-secondary rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 shadow-large border border-gray-100 dark:border-dark-card-border"
        >
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-gray-100 dark:border-dark-card-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-tertiary/20 backdrop-blur-sm">
            <div>
              <h3 className="text-xl font-bold text-accent-500 dark:text-dark-text-primary">
                تفاصيل المقال
              </h3>
              <p className="text-xs text-accent-400 dark:text-dark-text-tertiary mt-0.5">
                معلومات كاملة عن المقال المقدم للمراجعة
              </p>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6 text-accent-400" />
            </button>
          </div>

          {/* Modal Content Scrollable */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main Article Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header Image or Placeholder */}
                <div className="rounded-3xl overflow-hidden aspect-video relative border border-gray-100 dark:border-dark-card-border shadow-medium">
                  {(() => {
                    const effectiveImage = selectedBlogDetails.featuredImage || extractFirstImage(selectedBlogDetails.content) || '/images/blog-fallback.png';
                    return (
                      <Image
                        src={normalizeImageUrl(effectiveImage)}
                        alt={selectedBlogDetails.title}
                        fill
                        className="object-cover"
                      />
                    );
                  })()}
                </div>

                {/* Title & Meta */}
                <div>
                  <h1 className="text-3xl font-bold text-accent-500 dark:text-dark-text-primary leading-tight mb-4">
                    {selectedBlogDetails.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                      <Tag className="w-3.5 h-3.5" />
                      {selectedBlogDetails.category}
                    </span>
                    <div className="h-4 w-px bg-gray-200 dark:bg-dark-card-border" />
                    <div className="flex items-center gap-1.5 text-xs text-accent-400">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedBlogDetails.readTime || 5} دقائق قراءة
                    </div>
                    <div className="h-4 w-px bg-gray-200 dark:bg-dark-card-border" />
                    <div className="flex items-center gap-1.5 text-xs text-accent-400">
                      <Calendar className="w-3.5 h-3.5" />
                      نشر في {formatDate(selectedBlogDetails.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                {selectedBlogDetails.excerpt && (
                  <div className="p-6 bg-gray-50 dark:bg-dark-tertiary/30 rounded-3xl border-r-4 border-primary-500">
                    <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed font-medium italic">
                      "{selectedBlogDetails.excerpt}"
                    </p>
                  </div>
                )}

                {/* Full Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div
                    className="text-accent-700 dark:text-dark-text-secondary leading-loose"
                    dangerouslySetInnerHTML={{ __html: selectedBlogDetails.content }}
                  />
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Author Box */}
                <div className="bg-white dark:bg-dark-tertiary/20 rounded-3xl p-6 border border-gray-100 dark:border-dark-card-border shadow-soft">
                  <h4 className="text-sm font-bold text-accent-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    المؤلف
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-dark-card-border shadow-medium">
                      {selectedBlogDetails.author?.profilePicture ? (
                        <Image
                          src={normalizeImageUrl(selectedBlogDetails.author.profilePicture)}
                          alt=""
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary-600">
                          {selectedBlogDetails.author?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-accent-500 dark:text-dark-text-primary">
                        {selectedBlogDetails.author?.name}
                      </p>
                      <span className="flex items-center gap-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 mt-1">
                        <Mail className="w-3.5 h-3.5 text-primary-500" />
                        {selectedBlogDetails.author?.email}
                      </span>
                    </div>
                  </div>
                  {selectedBlogDetails.author?.bio && (
                    <p className="mt-4 text-xs text-accent-500 dark:text-dark-text-secondary leading-relaxed line-clamp-3">
                      {selectedBlogDetails.author.bio}
                    </p>
                  )}
                </div>

                {/* Article Details Box */}
                <div className="bg-white dark:bg-dark-tertiary/20 rounded-3xl p-6 border border-gray-100 dark:border-dark-card-border shadow-soft">
                  <h4 className="text-sm font-bold text-accent-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    إحصائيات وبيانات
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                      <span className="text-xs text-accent-400">الحالة الحالية</span>
                      <span className="text-xs font-bold text-primary-500">
                        {selectedBlogDetails.status === 'pending' ? 'قيد المراجعة' :
                          selectedBlogDetails.status === 'published' ? 'منشور' :
                            selectedBlogDetails.status === 'rejected' ? 'مرفوض' : 'مسودة'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                      <span className="text-xs text-accent-400">المشاهدات</span>
                      <span className="text-xs font-bold text-accent-500 dark:text-dark-text-primary">{selectedBlogDetails.views || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-dark-card-border">
                      <span className="text-xs text-accent-400">التعليقات</span>
                      <span className="text-xs font-bold text-accent-500 dark:text-dark-text-primary">{selectedBlogDetails.commentsCount || 0}</span>
                    </div>
                  </div>

                  {selectedBlogDetails.tags && selectedBlogDetails.tags.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[10px] font-bold text-accent-400 uppercase tracking-widest mb-3">الوسوم</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlogDetails.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-lg text-[10px] text-accent-500 dark:text-dark-text-secondary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Notes Box */}
                {selectedBlogDetails.adminNotes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-3xl p-6 border border-yellow-100 dark:border-yellow-900/20 shadow-soft">
                    <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      ملاحظات إدارية
                    </h4>
                    <p className="text-xs text-yellow-800/80 dark:text-yellow-400/80 leading-relaxed italic">
                      "{selectedBlogDetails.adminNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-6 border-t border-gray-100 dark:border-dark-card-border flex justify-end gap-4 bg-gray-50/50 dark:bg-dark-tertiary/20 backdrop-blur-sm">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="btn-secondary py-2.5 px-8"
            >
              إغلاق
            </button>
            {selectedBlogDetails.status === 'pending' && (
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleStatusChange(selectedBlogDetails._id, 'published');
                }}
                className="btn-primary py-2.5 px-8"
              >
                الموافقة الآن
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
));

BlogDetailsModal.displayName = 'BlogDetailsModal';

export default BlogDetailsModal;
