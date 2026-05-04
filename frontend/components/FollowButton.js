'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
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
        // Trigger notifications refresh for the creator immediately (best effort)
        try {
          window.dispatchEvent(new Event('notifications:refresh'));
        } catch {}
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
  if (!creatorId || (isAuthenticated && user?.id === creatorId)) {
    return null;
  }

  const sizeClasses = {
    small: 'px-4 py-1.5 text-xs font-black',
    default: 'px-6 py-2.5 text-sm font-black',
    large: 'px-8 py-3.5 text-base font-black',
    icon: 'p-2.5'
  };

  const iconSizes = {
    small: 'w-3.5 h-3.5',
    default: 'w-4 h-4',
    large: 'w-5 h-5',
    icon: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-500 uppercase tracking-widest ${isFollowing
        ? 'bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10 shadow-sm'
        : 'bg-primary text-white hover:shadow-glow hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
        } ${sizeClasses[size]} ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={isFollowing ? `إلغاء متابعة ${creatorName}` : `متابعة ${creatorName}`}
    >
      {loading ? (
        <div className={`${iconSizes[size]} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
      ) : (
        isFollowing ? (
          <UserMinus className={iconSizes[size]} />
        ) : (
          <UserPlus className={iconSizes[size]} />
        )
      )}
      {showText && (
        <span>{isFollowing ? 'متابع' : 'متابعة'}</span>
      )}
    </button>
  );
};

export default FollowButton;
