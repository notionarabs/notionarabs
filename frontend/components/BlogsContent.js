'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Trash2, Plus, AlertCircle, FileText, Eye, Clock, 
    CheckCircle, XCircle, Edit3, Send, ArrowLeftRight, Calendar, BookOpen, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '../lib/dateUtils';
import api from '../lib/api';
import ExportButton from './ExportButton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
    draft: {
        className: 'bg-gray-50 text-gray-500 dark:bg-dark-tertiary dark:text-dark-text-secondary border border-gray-100 dark:border-white/5',
        text: 'مسودة كمسودة',
        Icon: FileText
    },
    pending: {
        className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400 border border-amber-200/10',
        text: 'قيد المراجعة',
        Icon: Clock
    },
    published: {
        className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400 border border-emerald-200/10',
        text: 'منشور بنجاح',
        Icon: CheckCircle
    },
    rejected: {
        className: 'bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-400 border border-red-200/10',
        text: 'مرفوض',
        Icon: XCircle
    }
};

export default function BlogsContent() {
    const router = useRouter();
    const { user, ensureTokenInHeaders } = useAuth();
    const { showSuccess, showError } = useToast();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMyBlogs();
    }, []);

    const fetchMyBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            ensureTokenInHeaders();
            const response = await api.get('/blogs/user/my-blogs');

            if (response.data.success) {
                setBlogs(response.data.blogs || []);
            } else {
                setError('تعذر تحميل مقالاتك الخاصة');
            }
        } catch (error) {
            console.error('Error fetching my blogs:', error);
            setError('تعذر الاتصال بالخادم لجلب المقالات');
        } finally {
            setLoading(false);
        }
    };

    const submitForReview = async (blogId) => {
        try {
            setIsSubmitting(true);
            const response = await api.put(`/blogs/${blogId}`, {
                status: 'pending'
            });

            if (response.data.success) {
                showSuccess('تم إرسال المقال للمراجعة بنجاح! 🎉');
                fetchMyBlogs();
            }
        } catch (error) {
            console.error('Error submitting blog for review:', error);
            const msg = error.response?.data?.message || 'فشل في إرسال المقال للمراجعة';
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (blogId) => {
        try {
            setIsDeleting(true);
            const response = await api.delete(`/blogs/${blogId}`);

            if (response.data.success) {
                showSuccess('تم حذف المقال بنجاح 🗑️');
                setBlogs(prev => prev.filter(b => b._id !== blogId));
                setConfirmingDeleteId(null);
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            const message = error.response?.data?.message || 'فشل في حذف المقال';
            showError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.draft;
        const Icon = config.Icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${config.className}`}>
                <Icon size={12} />
                <span>{config.text}</span>
            </span>
        );
    };

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">مقالاتي التدوينية</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">شارك خبرتك البرمجية وشروحاتك عبر نشر مقالات مفصلة في مدونة عرب نوشن</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <ExportButton
                        endpoint={`/blogs/export-public?token=${typeof window !== 'undefined' ? (require('js-cookie').get('authToken') || '') : ''}`}
                        filename={`${(user?.username || 'blogs')}-blogs-${new Date().toISOString().split('T')[0]}.csv`}
                        label="تصدير المقالات"
                        direct={true}
                        className="px-4 py-2.5 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary font-bold text-xs rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer h-10"
                    />
                    <Link
                        href="/blog/create"
                        className="btn-primary text-xs font-black px-5 py-3 rounded-xl border-none shadow-glow flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer h-10"
                    >
                        <Plus size={16} />
                        <span>كتابة مقال جديد</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards - Upgraded style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: 'إجمالي المقالات المكتوبة', value: blogs.length, color: 'blue', icon: <BookOpen size={18} /> },
                    { title: 'قيد المراجعة الفنية', value: blogs.filter(b => b.status === 'pending').length, color: 'amber', icon: <Clock size={18} /> },
                    { title: 'منشورة بالمنصة', value: blogs.filter(b => b.status === 'published').length, color: 'emerald', icon: <CheckCircle size={18} /> },
                    { title: 'مرفوضة حالياً', value: blogs.filter(b => b.status === 'rejected').length, color: 'red', icon: <XCircle size={18} /> }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm transition-all relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">{stat.title}</span>
                            <div className={`p-2 rounded-xl flex items-center justify-center ${
                                stat.color === 'blue' ? 'bg-blue-50 text-blue-500 dark:bg-blue-950/20' :
                                stat.color === 'amber' ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/20' :
                                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20' :
                                'bg-red-50 text-red-500 dark:bg-red-950/20'
                            }`}>
                                {stat.icon}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Articles List / Empty States */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="p-6 animate-pulse space-y-4">
                                <div className="flex gap-4 w-1/4">
                                    <div className="h-4 bg-gray-200 dark:bg-dark-tertiary rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-dark-tertiary rounded w-16"></div>
                                </div>
                                <div className="h-6 bg-gray-200 dark:bg-dark-tertiary rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-dark-tertiary rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-base font-black text-gray-900 dark:text-dark-text-primary mb-2">تعذر جلب قائمة التدوينات</h3>
                        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mb-6">{error}</p>
                        <button
                            onClick={fetchMyBlogs}
                            className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-dark-tertiary dark:hover:bg-dark-tertiary/80 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-black transition-all cursor-pointer"
                        >
                            <RefreshCw size={12} className="inline ml-1" />
                            إعادة المحاولة
                        </button>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-orange-500/5 dark:to-orange-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-500/10 shadow-glow-sm">
                            <BookOpen className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary mb-2">لا توجد مقالات مضافة بعد</h3>
                        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary max-w-xs mx-auto leading-relaxed mb-6">
                            ابدأ بمشاركة شروحاتك وخبراتك البرمجية والعملية بكتابة أول تدوينة لك في مجتمع عرب نوشن!
                        </p>
                        <Link 
                            href="/blog/create" 
                            className="btn-primary text-xs font-black px-5 py-3 rounded-xl border-none shadow-glow transition-all hover:scale-105 active:scale-95 inline-block"
                        >
                            كتابة مقال جديد الآن
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {blogs.map((blog) => (
                                <motion.div 
                                    key={blog._id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    className="p-6 hover:bg-gray-50/40 dark:hover:bg-dark-tertiary/10 transition-colors group relative overflow-hidden"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                        <div className="flex-1 min-w-0">
                                            {/* Top badges */}
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                {getStatusBadge(blog.status)}
                                                <span className="text-xxs font-black text-gray-400 dark:text-dark-text-tertiary flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span>{formatDate(blog.createdAt)}</span>
                                                </span>
                                            </div>

                                            {/* Article Header title */}
                                            <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary mb-2 break-all group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                                {blog.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-4 line-clamp-1 leading-relaxed">
                                                {blog.excerpt || 'لا يوجد مقتطف مضاف لهذه التدوينة'}
                                            </p>

                                            {/* Categories & Views */}
                                            <div className="flex flex-wrap items-center gap-4 text-xxs font-black text-gray-400 dark:text-dark-text-tertiary">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(blog.categories && blog.categories.length > 0) ? (
                                                        blog.categories.slice(0, 2).map((cat, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-dark-text-secondary rounded-md text-xxs">
                                                                {cat}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-dark-text-secondary rounded-md text-xxs">
                                                            {blog.category || 'غير مصنف'}
                                                        </span>
                                                    )}
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Eye size={12} />
                                                    <span>{(blog.views || 0).toLocaleString('ar-EG')} مشاهدة</span>
                                                </div>
                                            </div>

                                            {/* Admin response log feedback */}
                                            {blog.adminNotes && (blog.status === 'rejected' || blog.status === 'pending') && (
                                                <div className="mt-4 p-2 bg-red-50 dark:bg-red-950/15 border border-red-500/10 rounded-xl max-w-xl">
                                                    <p className="text-xxs font-black text-red-500 dark:text-red-400">
                                                        <span className="font-black ml-1">ملاحظات فريق المراجعة:</span>
                                                        {blog.adminNotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action triggers container */}
                                        <div className="relative w-full lg:w-auto lg:min-w-[180px] shrink-0 self-center">
                                            <AnimatePresence mode="wait">
                                                {confirmingDeleteId === blog._id ? (
                                                    <motion.div 
                                                        key="confirm"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="flex flex-col gap-1.5"
                                                    >
                                                        <button
                                                            onClick={() => handleDelete(blog._id)}
                                                            disabled={isDeleting}
                                                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl border-none shadow-glow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                                            <span>تأكيد حذف المقال</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingDeleteId(null)}
                                                            className="w-full py-2.5 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-tertiary/80 text-gray-500 dark:text-dark-text-secondary font-bold text-xs rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer transition-all active:scale-95"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div 
                                                        key="actions"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="flex flex-col gap-1.5"
                                                    >
                                                        {blog.status === 'published' && (
                                                            <div className="flex gap-1.5">
                                                                <Link
                                                                    href={`/blog/${blog.slug}`}
                                                                    className="flex-1 py-2 bg-gray-50 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 text-center font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                                >
                                                                    <span>عرض المقال</span>
                                                                </Link>
                                                                <Link
                                                                    href={`/blog/edit/${blog._id}`}
                                                                    className="flex-1 py-2 bg-white dark:bg-dark-secondary text-gray-700 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 text-center font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                                >
                                                                    <span>تعديل</span>
                                                                </Link>
                                                            </div>
                                                        )}

                                                        {blog.status === 'draft' && (
                                                            <div className="flex gap-1.5">
                                                                <Link
                                                                    href={`/blog/edit/${blog._id}`}
                                                                    className="flex-1 py-2.5 bg-white dark:bg-dark-secondary text-gray-700 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 text-center font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                                                                >
                                                                    <span>تعديل مسودة</span>
                                                                </Link>
                                                                <button
                                                                    onClick={() => submitForReview(blog._id)}
                                                                    disabled={isSubmitting}
                                                                    className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white border-none font-black text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 shadow-glow-sm"
                                                                >
                                                                    {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                                                    <span>نشر الآن</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {(blog.status === 'rejected' || blog.status === 'pending') && (
                                                            <Link
                                                                href={`/blog/edit/${blog._id}`}
                                                                className="w-full py-2.5 bg-white dark:bg-dark-secondary text-gray-700 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 text-center font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Edit3 size={12} />
                                                                <span>تعديل المقال</span>
                                                            </Link>
                                                        )}

                                                        {/* General Delete */}
                                                        <button
                                                            onClick={() => setConfirmingDeleteId(blog._id)}
                                                            className="w-full py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            <Trash2 size={12} />
                                                            <span>إرسال لسلة المهملات</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
