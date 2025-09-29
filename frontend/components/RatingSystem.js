'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const RatingSystem = ({
  targetType,
  targetId,
  initialRating = 0,
  initialUserRating = null,
  onRatingChange,
  className = "",
  size = "default",
  showReviews = false,
  readOnly = false
}) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(initialUserRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [review, setReview] = useState(initialUserRating?.review || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (initialUserRating) {
      setUserRating(initialUserRating.rating);
      setReview(initialUserRating.review || '');
    }
  }, [initialUserRating]);

  const handleStarClick = async (rating) => {
    if (readOnly || !isAuthenticated) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/ratings', {
        targetType,
        targetId,
        rating,
        review: review || ''
      });

      if (response.data.success) {
        setUserRating(rating);
        if (onRatingChange) {
          onRatingChange(response.data);
        }

        // Show review modal if this is a new rating or rating changed
        if (!initialUserRating || initialUserRating.rating !== rating) {
          setShowReviewModal(true);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) return;

    setIsSubmittingReview(true);
    try {
      const response = await api.post('/ratings', {
        targetType,
        targetId,
        rating: userRating,
        review
      });

      if (response.data.success) {
        setShowReviewModal(false);
        if (onRatingChange) {
          onRatingChange(response.data);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const starClasses = `${sizeClasses[size]} transition-colors duration-200`;

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        {[...Array(5)].map((_, index) => {
          const rating = index + 1;
          const isActive = rating <= (hoverRating || userRating);
          const isUserRating = userRating > 0;

          return (
            <button
              key={index}
              onClick={() => handleStarClick(rating)}
              disabled={readOnly || isLoading}
              className={`${starClasses} ${isActive
                  ? 'text-yellow-400'
                  : isUserRating
                    ? 'text-gray-300 dark:text-gray-600'
                    : 'text-gray-300 dark:text-gray-600'
                } ${!readOnly && isAuthenticated ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onMouseEnter={() => !readOnly && setHoverRating(rating)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              title={readOnly ? '' : `تقييم ${rating} من 5`}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
        {isLoading && (
          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin ml-2"></div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                      أضف تقييمك
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                      شارك رأيك مع الآخرين
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Rating Display */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">تقييمك:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-5 h-5 ${index < userRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary mr-1">{userRating}/5</span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                  التعليق (اختياري)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-yellow-500 dark:focus:border-yellow-400 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200 resize-none"
                  placeholder="شارك تفاصيل أكثر عن تجربتك..."
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                  {review.length}/500 حرف
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-primary transition-colors duration-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview}
                  className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmittingReview ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </div>
                  ) : (
                    'إرسال التقييم'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RatingSystem;
