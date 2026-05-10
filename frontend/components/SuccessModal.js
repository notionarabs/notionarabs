'use client';

import { useEffect } from 'react';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  onContinue, 
  title, 
  message, 
  continueButtonText,
  showWhatNext = true,
  whatNextTitle = "ما التالي؟",
  whatNextItems = [
    "مراجعة القالب واللقطة المرفقة من قبل فريق الجودة",
    "إشعارك بالنتيجة خلال 24-48 ساعة",
    "نشر القالب بعد الموافقة"
  ]
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Success Animation */}
        <div className="p-8 text-center">
          {/* Success Icon Animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-green-200 dark:bg-green-800/50 rounded-full animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-3">
            {title || 'تم إرسال القالب بنجاح! 🎉'}
          </h3>

          <p className="text-gray-600 dark:text-dark-text-secondary mb-6 leading-relaxed">
            {message || 'شكراً لك على مشاركة قالبك المبتكر مع مجتمع عرب نوشن. سيتم مراجعة القالب واللقطة المرفقة من قبل فريقنا المتخصص وسيتم إشعارك بالنتيجة قريباً.'}
          </p>

          {/* Additional Info */}
          {showWhatNext && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    {whatNextTitle}
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    {whatNextItems.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-dark-text-secondary bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={onContinue}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {continueButtonText || 'الذهاب للملف الشخصي'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
