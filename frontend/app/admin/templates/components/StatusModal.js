import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

export default function StatusModal({
  isOpen,
  onClose,
  template,
  action,
  adminNotes,
  setAdminNotes,
  onConfirm,
  actionLoading
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
          className="absolute inset-0 bg-accent-500/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-glow overflow-hidden border border-gray-100 dark:border-dark-card-border z-10"
        >
          <div className="p-8 text-right">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${action === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {action === 'approved' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <h3 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">
                تأكيد {action === 'approved' ? 'الموافقة' : 'الرفض'}
              </h3>
            </div>

            <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-12 rounded-xl overflow-hidden shadow-soft relative flex-shrink-0">
                  <img src={template.previewImage} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                  <h4 className="font-bold text-accent-500 dark:text-dark-text-primary line-clamp-1">{template.title}</h4>
                  <p className="text-xs font-medium text-accent-300">{template.creator?.name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-black text-accent-500 dark:text-dark-text-primary">ملاحظات الإدارة (اختياري)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="لماذا تم هذا الإجراء؟ سيظهر للمبدع..."
                  className="w-full bg-white dark:bg-dark-secondary border-none rounded-2xl p-4 text-sm font-medium shadow-soft outline-none focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[120px] resize-none text-right"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onConfirm}
                disabled={actionLoading}
                className={`flex-1 py-4 rounded-2xl font-black shadow-glow transition-all active:scale-95 text-white ${
                  action === 'approved'
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {actionLoading ? 'جاري المعالجة...' : 'تأكيد القرار'}
              </button>
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gray-100 dark:bg-dark-tertiary text-accent-400 rounded-2xl font-black hover:bg-gray-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
