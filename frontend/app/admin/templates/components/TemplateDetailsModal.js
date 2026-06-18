import { motion, AnimatePresence } from 'framer-motion';
import {
  XCircle,
  ExternalLink,
  Tag,
  Award,
  Eye,
  Download,
  Star,
  Heart,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { getCategoryName } from '../../../../lib/categoryMapping';

export default function TemplateDetailsModal({
  isOpen,
  onClose,
  template,
  handleStatusChange,
  formatDate
}) {
  if (!isOpen || !template) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-accent-500/40 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative w-full max-w-5xl bg-white dark:bg-dark-secondary rounded-[3rem] shadow-soft-xl overflow-hidden border border-gray-100 dark:border-dark-card-border max-h-[90vh] flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="p-8 pb-4 border-b border-gray-50 dark:border-dark-card-border flex items-center justify-between shrink-0 text-right">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary leading-none mb-1">تفاصيل القالب</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent-300 uppercase tracking-widest">{template._id}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl text-accent-300 hover:text-rose-500 transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Scrolling Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar text-right">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Preview Image */}
              <div className="lg:col-span-12">
                <div className="relative group rounded-[2rem] overflow-hidden shadow-glow">
                  <img
                    src={template.previewImage}
                    className="w-full h-[400px] object-cover"
                    alt={template.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <a
                      href={template.notionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                    >
                      <ExternalLink className="w-4 h-4" />
                      معاينة في نوشن
                    </a>
                  </div>
                </div>
              </div>

              {/* Template Basics */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-[2.5rem] p-8">
                  <h4 className="text-xl font-black text-accent-500 dark:text-dark-text-primary mb-6 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-orange-500" />
                    المعلومات الأساسية
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-2">اسم القالب</label>
                      <p className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">{template.title}</p>
                    </div>
                    <div>
                      <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">وصف القالب</label>
                      <p className="text-sm font-medium text-accent-400 leading-relaxed">{template.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-dark-card-border">
                      <div>
                        <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">التصنيف</label>
                        <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl font-black text-xs">
                          {getCategoryName(template.category || template.categories?.[0]) || 'عام'}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">السعر</label>
                        <span className="text-lg font-black text-emerald-500">
                          {template.isPaid ? `${template.price} ج.م` : 'مجاني'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-[2.5rem] p-8">
                  <h4 className="text-xl font-black text-accent-500 dark:text-dark-text-primary mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    المميزات & العلامات
                  </h4>
                  <div className="space-y-6">
                    {(() => {
                      const featuresData = template.features;
                      if (!featuresData) return <p className="text-sm italic text-accent-300">لا يوجد مميزات مسجلة.</p>;
                      
                      const ultimateClean = (val) => {
                        if (!val) return [];
                        if (Array.isArray(val)) return val.map(v => ultimateClean(v)).flat().filter(Boolean);
                        if (typeof val !== 'string') return [String(val)];

                        let cleaned = val;
                        cleaned = cleaned.replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, '\n');
                        cleaned = cleaned.replace(/[\\[\]"\/]{2,}/g, ' ');
                        
                        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                          try { cleaned = JSON.parse(cleaned); } catch (e) {}
                        }

                        return (Array.isArray(cleaned) ? cleaned : cleaned.split('\n'))
                          .map(item => item.trim())
                          .map(item => item.replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '').trim())
                          .filter(item => item && item.length > 2 && !/^[\\\/\[\]" \t\n\r,.]+$/.test(item));
                      };

                      const features = ultimateClean(featuresData);
                      if (features.length === 0) return <p className="text-sm italic text-accent-300">لا يوجد مميزات مسجلة.</p>;

                      return (
                        <p className="text-sm font-medium text-accent-500 dark:text-dark-text-primary whitespace-pre-wrap leading-relaxed">
                          {features.join('\n')}
                        </p>
                      );
                    })()}
                    
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-dark-card-border">
                      {(() => {
                        const tagsData = template.tags;
                        if (!tagsData) return null;
                        
                        let tags = [];
                        if (Array.isArray(tagsData)) {
                          tags = tagsData.flatMap(tag => {
                            if (typeof tag === 'string' && tag.startsWith('[')) {
                              try { return JSON.parse(tag); } catch (e) { return tag; }
                            }
                            return tag;
                          });
                        } else if (typeof tagsData === 'string') {
                          if (tagsData.startsWith('[')) {
                            try { tags = JSON.parse(tagsData); } catch (e) { tags = [tagsData]; }
                          } else {
                            tags = tagsData.split(',').map(t => t.trim());
                          }
                        }
                        
                        return tags.filter(Boolean).map((tag, i) => (
                          <span key={i} className="px-4 py-1.5 bg-white dark:bg-dark-secondary rounded-xl font-bold text-xs text-accent-400 border border-gray-100 dark:border-dark-card-border shadow-sm capitalize">
                            #{tag}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                {/* Creator Card */}
                <div className="bg-white dark:bg-dark-tertiary/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-card-border shadow-soft">
                  <h4 className="text-sm font-black text-accent-300 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">صاحب العمل</h4>
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-8 ring-primary-50 dark:ring-primary-500/10 shadow-glow relative">
                      <img
                        src={template.creator?.profilePicture}
                        className="w-full h-full object-cover"
                        alt={template.creator?.name}
                      />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-accent-500 dark:text-dark-text-primary leading-none mb-1">
                        {template.creator?.name}
                      </h5>
                      <p className="text-xs font-bold text-accent-300">{template.creator?.email}</p>
                    </div>
                    <p className="text-xs font-medium text-accent-400 line-clamp-3 italic">
                      "{template.creator?.bio || 'لا يوجد نبذة تعريفية.'}"
                    </p>
                  </div>
                </div>

                {/* Performance */}
                <div className="bg-gradient-to-br from-primary-500 to-orange-500 rounded-[2.5rem] p-8 text-white shadow-glow-orange">
                  <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4 text-center">أداء القالب</h4>
                  <div className="grid grid-cols-2 gap-y-6 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Eye className="w-4 h-4 opacity-70" />
                        <span className="text-sm opacity-80 font-bold">المشاهدات</span>
                      </div>
                      <span className="text-2xl font-black tabular-nums">{template.views || 0}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Download className="w-4 h-4 opacity-70" />
                        <span className="text-sm opacity-80 font-bold">التحميلات</span>
                      </div>
                      <span className="text-2xl font-black tabular-nums">{template.downloads || 0}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Star className="w-4 h-4 opacity-70" />
                        <span className="text-sm opacity-80 font-bold">التقييم</span>
                      </div>
                      <span className="text-2xl font-black tabular-nums">{template.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Heart className="w-4 h-4 opacity-70" />
                        <span className="text-sm opacity-80 font-bold">المراجعات</span>
                      </div>
                      <span className="text-2xl font-black tabular-nums">{template.reviewsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-8 border-t border-gray-50 dark:border-dark-card-border flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-50 dark:bg-dark-tertiary text-accent-400 rounded-2xl font-black hover:bg-gray-100 transition-all"
            >
              إغلاق النافذة
            </button>
            {template.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    handleStatusChange(template, 'approved');
                  }}
                  className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-glow hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 font-almarai"
                >
                  <CheckCircle className="w-5 h-5" />
                  موافقة فورية
                </button>
                <button
                  onClick={() => {
                    onClose();
                    handleStatusChange(template, 'rejected');
                  }}
                  className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-hot hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2 font-almarai"
                >
                  <Trash2 className="w-5 h-5" />
                  رفض القالب
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
