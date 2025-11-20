'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import RatingCommentSystem to reduce bundle size
const RatingCommentSystem = dynamic(() => import('./RatingCommentSystem'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-dark-card-bg rounded-xl">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  )
});

export default function RatingPopup({
  template,
  userRating,
  userComment,
  onRatingChange,
  onCommentChange,
  onClose,
  isTemplateCreator
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup instantly
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Add a small delay before calling onClose to allow animation to complete
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleCloseAndMarkAsSeen = () => {
    // Mark that user has seen this popup for this template
    if (typeof window !== 'undefined' && template?._id) {
      const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
      if (!dismissedPopups.includes(template._id)) {
        dismissedPopups.push(template._id);
        localStorage.setItem('dismissedRatingPopups', JSON.stringify(dismissedPopups));
      }
    }
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-card-border">
          <div>
            <h3 className="text-xl font-bold text-accent-900 dark:text-dark-text-primary">
              قيم هذا القالب وشاركنا رأيك
            </h3>
            <p className="text-sm text-accent-600 dark:text-dark-text-secondary mt-1">
              ساعد المبدعين الآخرين من خلال تقييم هذا القالب
            </p>
          </div>
          <button
            onClick={handleCloseAndMarkAsSeen}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center hover:bg-gray-200 dark:hover:bg-dark-primary transition-colors"
            aria-label="إغلاق"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template Info */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-card-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
              {template?.previewImage ? (
                <img
                  src={template.previewImage}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary truncate">
                {template?.title}
              </h4>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                بواسطة {template?.creator?.name || 'مبدع غير معروف'}
              </p>
            </div>
          </div>
        </div>

        {/* Rating System */}
        <div className="p-6">
          {!isTemplateCreator && (
            <RatingCommentSystem
              targetType="template"
              targetId={template?._id}
              initialRating={template?.rating || 0}
              initialUserRating={userRating ? { rating: userRating.rating, review: userRating.review } : null}
              initialUserComment={userComment}
              onRatingChange={(data) => {
                onRatingChange(data);
                // Close popup after successful rating submission and mark as seen
                setTimeout(() => {
                  handleCloseAndMarkAsSeen();
                }, 1000);
              }}
              onCommentChange={onCommentChange}
              size="large"
              readOnly={isTemplateCreator}
            />
          )}

          {isTemplateCreator && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لا يمكنك تقييم قالبك الخاص
              </h4>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                لا يمكن للمبدعين تقييم قوالبهم الخاصة
              </p>
            </div>
          )}

          {/* Join Our Community Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-card-border">
            <div className="text-center">
              <h4 className="text-base font-semibold text-accent-900 dark:text-dark-text-primary mb-3">
                انضم إلى مجتمعنا
              </h4>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-4">
                احصل على آخر القوالب والنصائح من مجتمع عرب نوشن
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="https://www.facebook.com/groups/notionarabs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  مجموعة فيسبوك
                </a>
                <a
                  href="https://t.me/Notion_Arabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  تليجرام
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
