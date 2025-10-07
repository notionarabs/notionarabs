'use client';

import { useEffect, useState, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function UserNotifications() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        const notifs = res.data.notifications || [];
        setNotifications(notifs);
        // Enrich missing creator avatars on client if needed
        const missing = notifs.filter(n => !n.metadata?.creatorProfilePicture && n.metadata?.creatorId);
        if (missing.length > 0) {
          try {
            const results = await Promise.allSettled(missing.map(n => api.get(`/creators/${n.metadata.creatorId}`)));
            const idToPic = new Map();
            results.forEach((r, idx) => {
              if (r.status === 'fulfilled' && r.value?.data?.creator?.profilePicture) {
                idToPic.set(missing[idx].metadata.creatorId, r.value.data.creator.profilePicture);
              }
            });
            if (idToPic.size > 0) {
              setNotifications(prev => prev.map(n => {
                const pic = n.metadata?.creatorId ? idToPic.get(n.metadata.creatorId) : null;
                return pic ? { ...n, metadata: { ...n.metadata, creatorProfilePicture: pic } } : n;
              }));
            }
          } catch { }
        }
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount/auth change for immediate updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Listen for global refresh events to update immediately
  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener('notifications:refresh', handler);
    return () => window.removeEventListener('notifications:refresh', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lightweight polling and focus/visibility-based refresh for near-real-time badge updates
  useEffect(() => {
    if (!isAuthenticated) return;

    let intervalId;

    const onFocus = () => fetchNotifications();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchNotifications();
    };

    // Poll every 10s when dropdown is closed
    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!isOpen) fetchNotifications();
      }, 10000);
    };

    startPolling();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isOpen) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (e) { }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { }
  };

  return (
    <div className="relative notifications-dropdown" dir="rtl" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-orange-400/60 h-11 w-11 flex items-center justify-center"
        aria-label="الإشعارات"
      >
        <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white text-[10px] leading-none rounded-full px-1.5 py-0.5 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute md:left-0 md:right-auto left-2 right-2 mt-3 md:w-80 bg-white/95 dark:bg-dark-secondary/95 backdrop-blur-sm rounded-2xl shadow-large dark:shadow-dark-large border border-gray-200 dark:border-dark-card-border z-50 overflow-hidden">
          {/* Pointer (desktop only) */}
          <div className="hidden md:block absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-dark-secondary" />

          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-dark-card-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-400 flex items-center justify-center text-white">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 00-2 2v.18A7.002 7.002 0 005 11v3l-2 2v1h18v-1l-2-2v-3a7.002 7.002 0 00-5-6.82V4a2 2 0 00-2-2zM9 21a3 3 0 006 0H9z" /></svg>
              </div>
              <span className="text-sm font-bold text-accent-700 dark:text-dark-text-primary">الإشعارات</span>
            </div>
            <button onClick={markAllAsRead} className="text-xs text-primary-600 dark:text-orange-300 hover:underline">تحديد الكل كمقروء</button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-auto divide-y divide-gray-100 dark:divide-dark-card-border">
            {loading ? (
              <div className="p-4 text-sm text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-accent-600 dark:text-dark-text-secondary">
                لا توجد إشعارات بعد
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n._id}
                  href={n.link || '#'}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`flex items-start gap-3 p-3 sm:p-4 transition-colors ${n.isRead ? 'bg-transparent' : 'bg-orange-50/40 dark:bg-orange-900/10'}`}
                >
                  {/* Creator avatar */}
                  <div className={`mt-0.5 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shadow-sm ring-1 ${n.isRead ? 'ring-gray-200/60 dark:ring-dark-card-border' : 'ring-orange-300/60 dark:ring-orange-500/40'}`}>
                    {n.metadata?.creatorProfilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.metadata.creatorProfilePicture}
                        alt="creator"
                        className="w-full h-full object-cover object-center rounded-full"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                    {!n.metadata?.creatorProfilePicture && (
                      <div className={`w-full h-full flex items-center justify-center ${n.isRead ? 'text-accent-400 dark:text-dark-text-tertiary' : 'text-accent-600 dark:text-orange-300'}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      <div className="text-sm font-semibold text-accent-700 dark:text-dark-text-primary truncate">{n.title}</div>
                    </div>
                    <div className="text-xs text-accent-600 dark:text-dark-text-secondary mt-0.5 leading-5">{n.message}</div>
                    <div className="mt-1 text-[10px] text-accent-400">{new Date(n.createdAt).toLocaleString('ar')}</div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


