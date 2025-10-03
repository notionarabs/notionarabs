'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';

const FollowButton = ({
  creatorId,
  creatorName,
  onFollowChange,
  className = "",
  size = "default",
  showText = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is following this creator
  useEffect(() => {
    if (creatorId && isAuthenticated && user && user.id !== creatorId) {
      checkFollowStatus();
    }
  }, [creatorId, isAuthenticated, user]);

  const checkFollowStatus = async () => {
    try {
      const response = await api.get(`/creators/${creatorId}/follow-status`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.log('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!creatorId) return;

    setLoading(true);
    try {
      const response = await api.post(`/creators/${creatorId}/follow`);
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        if (onFollowChange) {
          onFollowChange(response.data.isFollowing);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user is viewing their own profile
  if (!isAuthenticated || !creatorId || user?.id === creatorId) {
    return null;
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isFollowing
        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500'
        : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
        } ${sizeClasses[size]} ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={isFollowing ? `إلغاء متابعة ${creatorName}` : `متابعة ${creatorName}`}
    >
      {loading ? (
        <div className={`${iconSizes[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      ) : (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isFollowing ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          )}
        </svg>
      )}
      {showText && (
        <span>{isFollowing ? 'متابع' : 'متابعة'}</span>
      )}
    </button>
  );
};

export default FollowButton;
