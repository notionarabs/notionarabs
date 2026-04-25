'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatDate } from '../lib/dateUtils';
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare, Download, DollarSign, Package } from 'lucide-react';

export default function NotificationsContent() {
    const { ensureTokenInHeaders } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (err) {
            setError('تعذر تحميل التنبيهات');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TEMPLATE_APPROVED': return <CheckCircle className="text-emerald-500" />;
            case 'TEMPLATE_REJECTED': return <AlertTriangle className="text-red-500" />;
            case 'NEW_SALE': return <DollarSign className="text-amber-500" />;
            case 'NEW_DOWNLOAD': return <Download className="text-blue-500" />;
            case 'NEW_COMMENT': return <MessageSquare className="text-purple-500" />;
            case 'SYSTEM': return <Info className="text-primary-500" />;
            default: return <Bell className="text-gray-500" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-48 mb-8"></div>
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-dark-secondary rounded-2xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-card-border pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2">التنبيهات</h1>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">ابقَ على اطلاع بكل ما هو جديد في حسابك</p>
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllRead}
                        className="text-sm font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-orange-500/10 px-4 py-2 rounded-xl transition-colors"
                    >
                        تحديد الكل كمقروء
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>
            )}

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-100 dark:border-dark-card-border">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-gray-300 w-8 h-8" />
                        </div>
                        <p className="text-gray-500 dark:text-dark-text-secondary font-bold">لا توجد تنبيهات حالياً</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification._id}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${
                                notification.isRead 
                                ? 'bg-white dark:bg-dark-secondary border-gray-100 dark:border-dark-card-border opacity-75' 
                                : 'bg-primary-50/30 dark:bg-orange-500/5 border-primary-100 dark:border-orange-500/20 shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${notification.isRead ? 'bg-gray-50 dark:bg-dark-tertiary' : 'bg-white dark:bg-dark-secondary shadow-sm'}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className={`text-sm font-black transition-colors ${notification.isRead ? 'text-gray-700 dark:text-dark-text-secondary' : 'text-gray-900 dark:text-dark-text-primary'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>
                                <p className={`text-xs font-medium leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-600 dark:text-dark-text-secondary'}`}>
                                    {notification.message}
                                </p>
                            </div>
                            {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
