import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { memo } from 'react';

const ConfirmationModal = memo(({
  showModal,
  setShowModal,
  newStatus,
  adminNotes,
  setAdminNotes,
  confirmStatusChange,
  actionLoading
}) => (
  <AnimatePresence>
    {showModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-dark-secondary rounded-3xl p-8 max-w-md w-full relative z-10 shadow-large"
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
            newStatus === 'published' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {newStatus === 'published' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h3 className="text-2xl font-bold text-center text-accent-500 dark:text-dark-text-primary mb-2">
            {newStatus === 'published' ? 'الموافقة على المقال' : 'رفض المقال'}
          </h3>
          <p className="text-center text-accent-600 dark:text-dark-text-secondary mb-8">
            {newStatus === 'published'
              ? 'هل أنت متأكد من الموافقة على نشر هذا المقال؟ سيظهر لجميع المستخدمين فوراً.'
              : 'هل أنت متأكد من رفض هذا المقال؟ يمكنك كتابة ملاحظات للمبدع.'}
          </p>

          <div className="mb-8">
            <label className="form-label">ملاحظات الإدارة (اختياري)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="اكتب سبب الرفض أو أي ملاحظات إدارية هنا..."
              rows={3}
              className="form-input text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary py-3 px-6"
              disabled={actionLoading}
            >
              إلغاء
            </button>
            <button
              onClick={confirmStatusChange}
              className={`${newStatus === 'published' ? 'btn-primary bg-green-500 hover:bg-green-600' : 'btn-primary bg-red-500 hover:bg-red-600 pulse-glow'} py-3 px-6`}
              disabled={actionLoading}
            >
              {actionLoading ? 'جاري المعالجة...' : 'تأكيد الإجراء'}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
));

ConfirmationModal.displayName = 'ConfirmationModal';

export default ConfirmationModal;
