'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function UserNotifications() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  return (
    <div className="relative notifications-dropdown">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
        <svg className="w-6 h-6 text-accent-500 dark:text-dark-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-secondary rounded-xl shadow-xl border border-gray-200 dark:border-dark-card-border z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-card-border">
            <span className="text-sm font-semibold">الإشعارات</span>
            <button onClick={markAllAsRead} className="text-xs text-accent-500 hover:underline">تحديد الكل كمقروء</button>
          </div>
          <div className="max-h-96 overflow-auto">
            {loading ? (
              <div className="p-4 text-sm text-accent-600">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-accent-600">لا توجد إشعارات</div>
            ) : (
              notifications.map((n) => (
                <a key={n._id} href={n.link || '#'} onClick={() => !n.isRead && markAsRead(n._id)} className={`block p-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition ${n.isRead ? 'opacity-70' : ''}`}>
                  <div className="text-sm font-medium mb-0.5">{n.title}</div>
                  <div className="text-xs text-accent-600 dark:text-dark-text-secondary">{n.message}</div>
                  <div className="mt-1 text-[10px] text-accent-400">{new Date(n.createdAt).toLocaleString('ar')}</div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


