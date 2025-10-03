'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const RatingCommentSystem = ({
  targetType,
  targetId,
  initialRating = 0,
  initialUserRating = null,
  initialUserComment = null,
  onRatingChange,
  onCommentChange,
  className = "",
  size = "default",
  readOnly = false
}) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(initialUserRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState(initialUserComment?.content || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialUserRating) {
      setUserRating(initialUserRating.rating);
    }
  }, [initialUserRating]);

  useEffect(() => {
    if (initialUserComment) {
      setUserComment(initialUserComment.content);
    }
  }, [initialUserComment]);

  const handleStarClick = (rating) => {
    if (readOnly || !isAuthenticated) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
      return;
    }

    setUserRating(rating);
  };

  const handleCommentChange = (e) => {
    if (readOnly || !isAuthenticated) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
      return;
    }

    setUserComment(e.target.value);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!userRating) {
      // Create a friendly validation notification
      const validationNotification = document.createElement('div');
      validationNotification.className = 'fixed top-4 right-4 z-50 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in';
      validationNotification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">يرجى اختيار تقييم قبل الإرسال</span>
        </div>
      `;

      // Add to page
      document.body.appendChild(validationNotification);

      // Auto remove after 3 seconds
      setTimeout(() => {
        validationNotification.classList.add('animate-slide-out');
        setTimeout(() => {
          if (validationNotification.parentNode) {
            validationNotification.parentNode.removeChild(validationNotification);
          }
        }, 300);
      }, 3000);
      return;
    }

    setIsLoading(true);
    try {
      // Submit both rating and comment in parallel
      const promises = [];

      // Submit rating
      promises.push(
        api.post('/ratings', {
          targetType,
          targetId,
          rating: userRating,
          review: ''
        })
      );

      // Submit comment if there's content
      if (userComment.trim()) {
        promises.push(
          api.post('/comments', {
            targetType,
            targetId,
            content: userComment.trim()
          })
        );
      }

      const results = await Promise.all(promises);

      // Handle rating result
      if (results[0]?.data?.success && onRatingChange) {
        onRatingChange(results[0].data);
      }

      // Handle comment result
      if (results[1]?.data?.success && onCommentChange) {
        onCommentChange(results[1].data);
      }

      // Show success message with a friendly notification
      const successMessage = userComment.trim()
        ? 'تم إرسال التقييم والتعليق بنجاح! شكراً لك على مشاركة رأيك.'
        : 'تم إرسال التقييم بنجاح! شكراً لك على تقييمك.';

      // Create a friendly success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in';
      notification.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="font-medium">${successMessage}</span>
        </div>
      `;

      // Add to page
      document.body.appendChild(notification);

      // Auto remove after 4 seconds
      setTimeout(() => {
        notification.classList.add('animate-slide-out');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);

    } catch (error) {
      console.error('Error submitting rating/comment:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        // Create a friendly error notification
        const errorNotification = document.createElement('div');
        errorNotification.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in';
        errorNotification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.</span>
          </div>
        `;

        // Add to page
        document.body.appendChild(errorNotification);

        // Auto remove after 5 seconds
        setTimeout(() => {
          errorNotification.classList.add('animate-slide-out');
          setTimeout(() => {
            if (errorNotification.parentNode) {
              errorNotification.parentNode.removeChild(errorNotification);
            }
          }, 300);
        }, 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const starClasses = `${sizeClasses[size]} transition-colors duration-200`;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Rating Section */}
      <div>
        <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
          التقييم
        </label>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => {
            const rating = index + 1;
            const isActive = rating <= (hoverRating || userRating);

            return (
              <button
                key={index}
                onClick={() => handleStarClick(rating)}
                disabled={readOnly || isLoading}
                className={`${starClasses} ${isActive
                  ? 'text-yellow-400'
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
        {userRating > 0 && (
          <p className="text-sm text-accent-600 dark:text-dark-text-secondary mt-1">
            تقييمك: {userRating} من 5
          </p>
        )}
      </div>

      {/* Comment Section */}
      <div>
        <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
          التعليق (اختياري)
        </label>
        <textarea
          value={userComment}
          onChange={handleCommentChange}
          disabled={readOnly || isLoading}
          placeholder="شاركنا رأيك حول هذا القالب..."
          className={`w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-secondary text-accent-700 dark:text-dark-text-primary placeholder-accent-400 dark:placeholder-dark-text-quaternary resize-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-accent-500 dark:text-dark-text-quaternary">
            {userComment.length}/1000 حرف
          </span>
          {userComment.trim() && (
            <span className="text-xs text-green-600 dark:text-green-400">
              سيتم إرسال التعليق مع التقييم
            </span>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {userRating > 0 && !readOnly && isAuthenticated && (
        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإرسال...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                إرسال التقييم {userComment.trim() ? 'والتعليق' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              سجل الدخول
            </a>
            {' '}لتتمكن من تقييم والتعليق على القوالب
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingCommentSystem;
