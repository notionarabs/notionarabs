'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Check } from 'lucide-react';

/**
 * Premium Confirmation Modal
 * A glassmorphism-themed alternative to window.confirm()
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'تأكيد', 
  cancelText = 'إلغاء',
  variant = 'danger', // 'danger', 'primary', 'success', 'warning'
  isLoading = false 
}) {
  const variants = {
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      button: 'bg-rose-500 hover:bg-rose-600 shadow-glow-rose',
    },
    primary: {
      icon: <AlertCircle className="w-6 h-6 text-primary-500" />,
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
      button: 'bg-primary-500 hover:bg-primary-600 shadow-glow-primary',
    },
    success: {
      icon: <Check className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      button: 'bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald',
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-glow-amber',
    }
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentVariant.bg} ${currentVariant.border} border`}>
                  {currentVariant.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">{title}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1.5">تأكيد الإجراء</p>
                </div>
                <button 
                  onClick={onClose}
                  className="mr-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="text-sm font-bold text-gray-600 dark:text-dark-text-secondary leading-relaxed mb-8">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm transition-all active:scale-95 disabled:opacity-50 ${currentVariant.button}`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-2xl font-black text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  {cancelText}
                </button>
              </div>
            </div>

            {/* Bottom Polish */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${variant === 'danger' ? 'from-rose-500 to-rose-700' : 'from-primary-500 to-primary-700'}`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
