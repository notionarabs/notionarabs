'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/dateUtils';
import api from '../lib/api';

const CommentsDisplay = ({
  targetType,
  targetId,
  className = ""
}) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const loadComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/comments/${targetType}/${targetId}?page=${pageNum}&limit=5`);
      
      if (response.data.success) {
        const newComments = response.data.comments || [];
        
        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }
        
        setTotalComments(response.data.totalComments || 0);
        setHasMore(pageNum < (response.data.pagination?.pages || 1));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('فشل في تحميل التعليقات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetType && targetId) {
      loadComments(1, false);
    }
  }, [targetType, targetId]);

  const loadMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage, true);
  };

  const handleLike = async (commentId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      if (response.data.success) {
        // Update the comment's like count in the local state
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: Array(response.data.likesCount).fill({}) }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mr-2 text-accent-600 dark:text-dark-text-secondary">جاري تحميل التعليقات...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-accent-600 dark:text-dark-text-secondary">لا توجد تعليقات بعد</p>
          <p className="text-sm text-accent-500 dark:text-dark-text-quaternary mt-1">كن أول من يعلق على هذا القالب</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-accent-700 dark:text-dark-text-primary">
          التعليقات ({totalComments})
        </h3>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-white dark:bg-dark-primary rounded-xl p-6 border border-gray-200 dark:border-dark-card-border">
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                {comment.user?.profilePicture ? (
                  <Image
                    src={comment.user.profilePicture}
                    alt={comment.user?.name || 'مستخدم'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback avatar with initial letter */}
                <div className={`w-full h-full flex items-center justify-center ${comment.user?.profilePicture ? 'hidden' : 'flex'}`}>
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {comment.user?.name?.charAt(0)?.toUpperCase() || 'م'}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-accent-700 dark:text-dark-text-primary">
                    {comment.user?.name || comment.user?.displayName || 'مستخدم'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-3">
                  {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{comment.likes?.length || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMoreComments}
            disabled={loading}
            className="px-6 py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                جاري التحميل...
              </>
            ) : (
              'عرض المزيد من التعليقات'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsDisplay;
