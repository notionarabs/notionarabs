'use client';

import { useState } from 'react';
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

  useEffect(() => {
    if (initialUserRating) {
      setUserRating(initialUserRating.rating);
    }
  }, [initialUserRating]);


  const handleStarClick = (rating) => {
    if (readOnly || !isAuthenticated) {
      if (!isAuthenticated) {
        window.location.href = '/login';
      }
      return;
    }

    // Just set the rating locally, don't submit yet
    setUserRating(rating);
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated || !userRating) return;

    setIsLoading(true);
    try {
      const response = await api.post('/ratings', {
        targetType,
        targetId,
        rating: userRating,
        review: ''
      });

      if (response.data.success) {
        if (onRatingChange) {
          onRatingChange(response.data);
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

      {/* Submit Button */}
      {userRating > 0 && !readOnly && isAuthenticated && (
        <div className="mt-4">
          <button
            onClick={handleSubmitRating}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
        </div>
      )}

    </>
  );
};

export default RatingSystem;
