import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, PlusCircle } from 'lucide-react';

export default function BadgeModal({
  isOpen,
  onClose,
  creator,
  badgePresets,
  selectedBadgeType,
  setSelectedBadgeType,
  onAddBadge,
  onRemoveBadge,
  actionLoading
}) {
  if (!isOpen || !creator) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-glow overflow-hidden border border-gray-100 dark:border-dark-card-border z-10"
        >
          <div className="p-8 text-right">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">إدارة الشارات والجوائز</h3>
                <p className="text-xs font-bold text-accent-300 dark:text-dark-text-tertiary mt-1">تعديل شارات المبدع: {creator.name}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-accent-300" />
              </button>
            </div>

            {/* Current Badges List */}
            <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-3xl p-6 mb-6">
              <h4 className="text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-4">الشارات الحالية</h4>
              {creator.badges && creator.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {creator.badges.map((badge, idx) => (
                    <span 
                      key={badge._id || idx}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black border border-gray-100 bg-white dark:bg-dark-secondary dark:border-dark-card-border shadow-soft group"
                    >
                      <span className="text-base">{badge.icon || '⭐'}</span>
                      <span className="dark:text-white">{badge.label}</span>
                      <button
                        onClick={() => onRemoveBadge(creator.id, badge._id)}
                        className="p-0.5 text-accent-300 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-all"
                        title="حذف الشارة"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-accent-300 font-bold italic text-center py-4">لا توجد شارات معتمدة لهذا المبدع حالياً</p>
              )}
            </div>

            {/* Add Badge Form */}
            <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-3xl p-6 mb-8">
              <h4 className="text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-4">إضافة شارة جديدة</h4>
              <div className="space-y-4">
                <div>
                  <select
                    value={selectedBadgeType}
                    onChange={(e) => setSelectedBadgeType(e.target.value)}
                    className="w-full bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border px-5 py-3.5 rounded-2xl text-xs font-bold outline-none shadow-soft cursor-pointer text-right"
                  >
                    <option value="">اختر شارة لمنحها...</option>
                    {badgePresets?.userBadges?.map(badge => (
                      <option 
                        key={badge.type} 
                        value={badge.type}
                        disabled={creator.badges?.some(b => b.type === badge.type)}
                      >
                        {badge.icon} {badge.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={onAddBadge}
                  disabled={!selectedBadgeType || actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs transition-all shadow-glow-primary hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" />
                  منح الشارة المحددة
                </button>
              </div>
            </div>

            {/* Closing */}
            <button
              onClick={onClose}
              className="w-full py-4 bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-quaternary text-accent-500 dark:text-dark-text-primary rounded-2xl font-black text-xs transition-all"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
