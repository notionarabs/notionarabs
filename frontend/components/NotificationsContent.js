'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { formatDate } from '../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, CheckCircle, Info, AlertTriangle, MessageSquare, Download, 
    DollarSign, Sparkles, CheckSquare, Loader2, Star, ShieldAlert, Clock, Users
} from 'lucide-react';

export default function NotificationsContent() {
    const { user, ensureTokenInHeaders } = useAuth();
    const router = useRouter();
    const isCreator = user?.role === 'creator' && user?.creatorStatus === 'approved';
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'financial', 'templates', 'system', 'interactions'

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            setError('تعذر تحميل التنبيهات حالياً. يرجى إعادة المحاولة.');
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
            setNotifications(prev => 
                prev.map(n => n._id === id || n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            window.dispatchEvent(new CustomEvent('notificationsMarkedRead'));
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            setIsActionLoading(true);
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            window.dispatchEvent(new CustomEvent('notificationsMarkedRead'));
            window.dispatchEvent(new CustomEvent('notifications:refresh'));
        } catch (err) {
            console.error('Error marking all as read:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const getIcon = (type, isRead) => {
        const bgOpacity = isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-400' : 'bg-primary-100 dark:bg-orange-500/15 text-primary-500';
        
        switch (type) {
            case 'template_published':
            case 'TEMPLATE_APPROVED':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-glow-sm animate-pulse-slow'}`}>
                        <CheckCircle className="w-5 h-5" />
                    </div>
                );
            case 'template_rejected':
            case 'TEMPLATE_REJECTED':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                );
            case 'NEW_SALE':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-glow-sm'}`}>
                        <DollarSign className="w-5 h-5" />
                    </div>
                );
            case 'template_downloaded':
            case 'NEW_DOWNLOAD':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-glow-sm'}`}>
                        <Download className="w-5 h-5" />
                    </div>
                );
            case 'template_commented':
            case 'template_rated':
            case 'comment_replied':
            case 'NEW_COMMENT':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'}`}>
                        <MessageSquare className="w-5 h-5" />
                    </div>
                );
            case 'creator_followed':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                        <Users className="w-5 h-5" />
                    </div>
                );
            case 'SYSTEM':
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                        <Info className="w-5 h-5" />
                    </div>
                );
            default:
                return (
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isRead ? 'bg-gray-100 dark:bg-dark-tertiary text-gray-500' : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'}`}>
                        <Bell className="w-5 h-5" />
                    </div>
                );
        }
    };

    // Filter logic for categorized notification views
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        
        if (isCreator) {
            if (activeTab === 'financial') {
                return n.type === 'NEW_SALE' || n.type === 'NEW_DOWNLOAD' || n.type === 'template_downloaded';
            }
            if (activeTab === 'templates') {
                return n.type === 'TEMPLATE_APPROVED' || n.type === 'TEMPLATE_REJECTED' || n.type === 'template_published' || n.type === 'template_rejected';
            }
            if (activeTab === 'system') {
                return n.type === 'SYSTEM' || n.type === 'NEW_COMMENT' || n.type === 'template_commented' || n.type === 'template_rated' || n.type === 'comment_replied' || n.type === 'creator_followed';
            }
        } else {
            if (activeTab === 'system') {
                return n.type === 'SYSTEM' || n.type === 'TEMPLATE_APPROVED' || n.type === 'TEMPLATE_REJECTED';
            }
            if (activeTab === 'interactions') {
                return n.type === 'NEW_COMMENT' || n.type === 'template_commented' || n.type === 'comment_replied';
            }
        }
        
        return true;
    });

    const getEmptyStateDetails = () => {
        if (isCreator) {
            switch (activeTab) {
                case 'financial':
                    return {
                        title: 'لا توجد عمليات مبيعات أو تحميل',
                        desc: 'عندما يقوم أحد مستخدمي المنصة بتحميل أو شراء قوالبك، ستظهر إشعارات الأرباح والتحميلات هنا مباشرة.',
                        icon: <DollarSign className="w-8 h-8 text-amber-500" />
                    };
                case 'templates':
                    return {
                        title: 'سجل مراجعة القوالب فارغ',
                        desc: 'لم تتلقَ أي تحديثات بشأن مراجعة أو قبول أو رفض قوالبك المعروضة مؤخراً.',
                        icon: <Sparkles className="w-8 h-8 text-emerald-500" />
                    };
                case 'system':
                    return {
                        title: 'لا توجد تعليقات أو إشعارات نظام',
                        desc: 'كل شيء هادئ هنا! لا توجد تنبيهات بخصوص تعليقات المستخدمين أو إعلانات المنصة الإدارية حالياً.',
                        icon: <MessageSquare className="w-8 h-8 text-purple-500" />
                    };
                default:
                    return {
                        title: 'لا توجد تنبيهات حالياً',
                        desc: 'أنت مطلع على كل شيء بالكامل! سنخطرك هنا فور حدوث أي نشاط جديد متعلق بحسابك.',
                        icon: <Bell className="w-8 h-8 text-gray-400" />
                    };
            }
        } else {
            switch (activeTab) {
                case 'system':
                    return {
                        title: 'لا توجد تنبيهات نظام',
                        desc: 'لم تتلقَ أي إشعارات إدارية أو إعلانات عامة من منصة عرب نوشن حالياً.',
                        icon: <Info className="w-8 h-8 text-blue-500" />
                    };
                case 'interactions':
                    return {
                        title: 'لا توجد تفاعلات أو ردود',
                        desc: 'عندما يقوم أحد المبدعين أو الأعضاء بالرد على تعليقاتك في المنتدى أو على القوالب والمقالات، ستظهر الردود هنا.',
                        icon: <MessageSquare className="w-8 h-8 text-purple-500" />
                    };
                default:
                    return {
                        title: 'علبة الوارد فارغة ✨',
                        desc: 'أنت مطلع على جميع التحديثات بالكامل! سنخطرك هنا فور ورود أي ردود على تعليقاتك أو تنبيهات تخص حسابك.',
                        icon: <Bell className="w-8 h-8 text-gray-400" />
                    };
            }
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12" dir="rtl">
                {/* Skeleton Header */}
                <div className="space-y-3 animate-pulse pb-6 border-b border-gray-100 dark:border-white/5">
                    <div className="h-9 bg-gray-200 dark:bg-dark-secondary rounded-xl w-48"></div>
                    <div className="h-4 bg-gray-200 dark:bg-dark-secondary rounded-xl w-80"></div>
                </div>
                {/* Skeleton Tabs */}
                <div className="flex gap-2 animate-pulse overflow-hidden">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-10 bg-gray-200 dark:bg-dark-secondary rounded-xl w-28 flex-shrink-0"></div>
                    ))}
                </div>
                {/* Skeleton Notifications */}
                <div className="space-y-4">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="flex items-start gap-4 p-5 bg-gray-100/50 dark:bg-dark-secondary/30 rounded-2xl border border-gray-100/50 dark:border-white/5 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-secondary rounded-2xl flex-shrink-0"></div>
                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-200 dark:bg-dark-secondary rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-dark-secondary rounded w-16"></div>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-dark-secondary rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const emptyDetails = getEmptyStateDetails();

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12" dir="rtl">
            {/* Header Block with dynamic animations */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight flex items-center gap-2.5">
                        <Bell className="w-7 h-7 text-primary-500 animate-swing" />
                        <span>مركز التنبيهات</span>
                    </h1>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium text-sm">
                        {isCreator 
                            ? 'متابعة حية وشاملة لكل ما يدور بحسابك ومبيعاتك وقوالبك' 
                            : 'متابعة حية وشاملة لجميع تنبيهاتك ونشاطاتك في عرب نوشن ✨'}
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button 
                        onClick={markAllRead}
                        disabled={isActionLoading}
                        className="btn-primary text-xs font-black px-4 py-2.5 rounded-xl border-none shadow-glow flex items-center gap-2 justify-center hover:scale-105 active:scale-95 transition-all self-start sm:self-center"
                    >
                        {isActionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckSquare className="w-4 h-4" />
                        )}
                        <span>تحديد الكل كمقروء</span>
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    <span>{error}</span>
                </div>
            )}

            {/* Dashboard Category Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(isCreator ? [
                    { id: 'all', label: 'الكل', count: notifications.length },
                    { id: 'financial', label: 'المالية والتحميلات', count: notifications.filter(n => ['NEW_SALE', 'NEW_DOWNLOAD', 'template_downloaded'].includes(n.type)).length },
                    { id: 'templates', label: 'حالة القوالب', count: notifications.filter(n => ['TEMPLATE_APPROVED', 'TEMPLATE_REJECTED', 'template_published', 'template_rejected'].includes(n.type)).length },
                    { id: 'system', label: 'التعليقات والنظام', count: notifications.filter(n => ['SYSTEM', 'NEW_COMMENT', 'template_commented', 'template_rated', 'comment_replied', 'creator_followed'].includes(n.type)).length },
                ] : [
                    { id: 'all', label: 'الكل', count: notifications.length },
                    { id: 'system', label: 'تنبيهات النظام', count: notifications.filter(n => ['SYSTEM', 'TEMPLATE_APPROVED', 'TEMPLATE_REJECTED'].includes(n.type)).length },
                    { id: 'interactions', label: 'الردود والتفاعلات', count: notifications.filter(n => ['NEW_COMMENT', 'template_commented', 'comment_replied'].includes(n.type)).length },
                ]).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border-none relative flex items-center gap-2 ${
                            activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-glow'
                                : 'bg-white dark:bg-dark-secondary text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary border border-gray-100 dark:border-white/5'
                        }`}
                    >
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${
                                activeTab === tab.id 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-dark-text-secondary'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications Feed Area */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-16 px-6 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-orange-500/5 dark:to-orange-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-500/10 shadow-glow-sm">
                                {emptyDetails.icon}
                            </div>
                            <h3 className="text-base font-black text-gray-900 dark:text-dark-text-primary mb-2">
                                {emptyDetails.title}
                            </h3>
                            <p className="text-xs text-gray-400 dark:text-dark-text-tertiary max-w-md mx-auto leading-relaxed">
                                {emptyDetails.desc}
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const isUnread = !notification.isRead;
                            const uniqueId = notification._id || notification.id;

                            return (
                                <motion.div 
                                    key={uniqueId}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    onClick={async () => {
                                        if (isUnread) {
                                            await markAsRead(uniqueId);
                                        }
                                        if (notification.link) {
                                            router.push(notification.link);
                                        }
                                    }}
                                    className={`flex items-start gap-5 p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden ${
                                        isUnread 
                                        ? 'bg-gradient-to-l from-primary-500/[0.07] to-transparent dark:from-orange-500/[0.06] border-primary-500/20 dark:border-orange-500/20 shadow-lg shadow-primary-500/[0.02]' 
                                        : 'bg-white/80 dark:bg-dark-secondary/60 hover:bg-white dark:hover:bg-dark-secondary border-gray-100 dark:border-white/5 shadow-sm'
                                    }`}
                                >
                                    {/* Unread Left Border Highlight Indicator */}
                                    {isUnread && (
                                        <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-500 to-accent-500 rounded-l-full"></div>
                                    )}

                                    {/* Action Icon representation */}
                                    <div className="flex-shrink-0 self-center sm:self-start">
                                        {getIcon(notification.type, !isUnread)}
                                    </div>

                                    {/* Notification Description Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                                            <h3 className={`text-sm sm:text-base font-black tracking-tight transition-colors ${
                                                isUnread 
                                                    ? 'text-gray-900 dark:text-white' 
                                                    : 'text-gray-700 dark:text-dark-text-secondary group-hover:text-gray-950 dark:group-hover:text-white'
                                            }`}>
                                                {notification.title}
                                            </h3>
                                        </div>
                                        <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${
                                            isUnread 
                                                ? 'text-gray-600 dark:text-dark-text-secondary' 
                                                : 'text-gray-500 dark:text-dark-text-tertiary'
                                        }`}>
                                            {notification.message}
                                        </p>
                                        
                                        {/* Elegant footer with date & time info */}
                                        <div className="flex items-center gap-1.5 mt-3 text-[10px] font-bold text-gray-400 dark:text-dark-text-tertiary">
                                            <Clock size={12} className="text-gray-400/60 dark:text-dark-text-tertiary/60" />
                                            <span>{formatDate(notification.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Glowing Unread Indicator dot */}
                                    {isUnread && (
                                        <div className="flex-shrink-0 self-center mr-auto">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse"></div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
