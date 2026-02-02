'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, AlertCircle, FileText, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '../lib/dateUtils';
import api from '../lib/api';
import ExportButton from './ExportButton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const statusConfig = {
    draft: {
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        text: 'مسودة',
        icon: '📝'
    },
    pending: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        text: 'قيد المراجعة',
        icon: '⏳'
    },
    published: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        text: 'منشور',
        icon: '✅'
    },
    rejected: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        text: 'مرفوض',
        icon: '❌'
    }
};

export default function BlogsContent() {
    const router = useRouter();
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchMyBlogs();
    }, []);

    const fetchMyBlogs = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/blogs/user/my-blogs');

            if (response.data.success) {
                setBlogs(response.data.blogs);
            } else {
                setError('فشل في تحميل مقالاتك');
                showError('فشل في تحميل مقالاتك');
            }
        } catch (error) {
            console.error('Error fetching my blogs:', error);
            setError('فشل في تحميل مقالاتك');
            showError('فشل في تحميل مقالاتك');
        } finally {
            setLoading(false);
        }
    };

    const submitForReview = async (blogId) => {
        try {
            const response = await api.put(`/blogs/${blogId}`, {
                status: 'pending'
            });

            if (response.data.success) {
                showSuccess('تم إرسال المقال للمراجعة بنجاح!');
                fetchMyBlogs();
            }
        } catch (error) {
            console.error('Error submitting blog for review:', error);
            if (error.response?.data?.message) {
                showError(error.response.data.message);
            } else {
                showError('فشل في إرسال المقال للمراجعة');
            }
        }
    };

    const handleDelete = async (blogId) => {
        try {
            setIsDeleting(true);
            const response = await api.delete(`/blogs/${blogId}`);

            if (response.data.success) {
                showSuccess('تم حذف المقال بنجاح');
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
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
                <span>{config.icon}</span>
                {config.text}
            </span>
        );
    };

    const getStatusMessage = (status, adminNotes) => {
        switch (status) {
            case 'draft':
                return 'المقال محفوظ كمسودة ولم يتم إرساله للمراجعة بعد.';
            case 'pending':
                return 'المقال قيد المراجعة من قبل فريقنا المتخصص. سيتم إشعارك بالنتيجة قريباً.';
            case 'published':
                return 'تم الموافقة على المقال ونشره بنجاح! يمكنك مشاهدته في صفحة المدونة.';
            case 'rejected':
                return adminNotes ? `تم رفض المقال: ${adminNotes}` : 'تم رفض المقال من قبل فريق المراجعة.';
            default:
                return '';
        }
    };

    return (
        <>
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">مقالاتي</h1>
                        <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">
                            تتبع حالة مقالاتك المرسلة والمقبولة
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <ExportButton
                            endpoint={`/blogs/export-public?token=${typeof window !== 'undefined' ? (require('js-cookie').get('authToken') || '') : ''}`}
                            filename={`${(user?.username || (user?.email ? user.email.split('@')[0] : 'blogs'))}-blogs-${new Date().toISOString().split('T')[0]}.csv`}
                            label="تصدير المقالات"
                            direct={true}
                        />
                        <Link
                            href="/blog/create"
                            className="btn-primary flex items-center gap-2 text-sm sm:text-base px-5 py-2.5 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            مقال جديد
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">إجمالي المقالات</h3>
                        <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-dark-text-primary">
                            {blogs.length}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">قيد المراجعة</h3>
                        <p className="text-2xl sm:text-3xl font-black text-yellow-500">
                            {blogs.filter(blog => blog.status === 'pending').length}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">منشور</h3>
                        <p className="text-2xl sm:text-3xl font-black text-green-500">
                            {blogs.filter(blog => blog.status === 'published').length}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">مرفوض</h3>
                        <p className="text-2xl sm:text-3xl font-black text-red-500">
                            {blogs.filter(blog => blog.status === 'rejected').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Blogs List */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="divide-y divide-gray-200 dark:divide-dark-card-border">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="p-4 sm:p-6 animate-pulse">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Status Badge & Date */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>

                                        {/* Title */}
                                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>

                                        {/* Excerpt */}
                                        <div className="space-y-2">
                                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>

                                        {/* Tags & Views */}
                                        <div className="flex gap-4 pt-1">
                                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 lg:ml-4 mt-2 lg:mt-0">
                                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 sm:p-8 text-center">
                        <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 dark:text-red-500 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                            خطأ في تحميل المقالات
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mb-4 px-4">
                            {error}
                        </p>
                        <button
                            onClick={fetchMyBlogs}
                            className="btn-primary text-sm sm:text-base"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                            لا توجد مقالات بعد
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mb-6 px-4">
                            ابدأ بإنشاء أول مقال لك ومشاركته مع مجتمع عرب نوشن
                        </p>
                        <Link href="/blog/create" className="btn-primary text-sm sm:text-base">
                            إنشاء مقال جديد
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-dark-card-border">
                        {blogs.map((blog) => (
                            <div key={blog._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors group">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                            {getStatusBadge(blog.status)}
                                            <span className="text-xs sm:text-sm text-gray-400 dark:text-dark-text-tertiary font-medium">
                                                {formatDate(blog.createdAt)}
                                            </span>
                                        </div>

                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2 break-words group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                            {blog.title}
                                        </h3>

                                        <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mb-4 line-clamp-2 leading-relaxed">
                                            {blog.excerpt}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-gray-500 dark:text-dark-text-tertiary">
                                            <div className="flex flex-wrap gap-2">
                                                {(blog.categories && blog.categories.length > 0) ? (
                                                    blog.categories.slice(0, 2).map((category, index) => (
                                                        <span key={index} className="px-2.5 py-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border text-gray-600 dark:text-dark-text-secondary rounded-lg text-xs font-medium">
                                                            {category}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border text-gray-600 dark:text-dark-text-secondary rounded-lg text-xs font-medium">
                                                        {blog.category || 'غير مصنف'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Eye className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium font-mono">{blog.views || 0}</span>
                                            </div>
                                        </div>

                                        {blog.adminNotes && (blog.status === 'rejected' || blog.status === 'pending') && (
                                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                                                    <span className="font-bold ml-1">ملاحظات:</span>
                                                    {blog.adminNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-2 lg:ml-4 lg:flex-shrink-0 pt-2 lg:pt-0 w-full lg:w-auto">
                                        {/* Action Buttons Container */}
                                        <div className={`${confirmingDeleteId === blog._id ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100 relative'} transition-all duration-300 ease-in-out flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto`}>
                                            {blog.status === 'published' && (
                                                <Link
                                                    href={`/blog/${blog.slug}`}
                                                    className="btn-secondary w-full sm:w-auto text-sm font-bold flex justify-center"
                                                >
                                                    عرض المقال
                                                </Link>
                                            )}
                                            {blog.status === 'draft' && (
                                                <>
                                                    <Link
                                                        href={`/blog/edit/${blog._id}`}
                                                        className="btn-outline text-sm font-bold flex-1 sm:flex-initial flex justify-center"
                                                    >
                                                        تعديل
                                                    </Link>
                                                    <button
                                                        onClick={() => submitForReview(blog._id)}
                                                        className="btn-primary text-sm font-bold flex-1 sm:flex-initial whitespace-nowrap"
                                                    >
                                                        إرسال للمراجعة
                                                    </button>
                                                </>
                                            )}
                                            {(blog.status === 'rejected' || blog.status === 'pending') && (
                                                <Link
                                                    href={`/blog/edit/${blog._id}`}
                                                    className="btn-outline w-full sm:w-auto text-sm font-bold whitespace-nowrap flex justify-center"
                                                >
                                                    تعديل وإعادة الإرسال
                                                </Link>
                                            )}
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => setConfirmingDeleteId(blog._id)}
                                                className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 text-sm font-bold p-2.5 flex items-center justify-center flex-1 sm:flex-initial"
                                                title="حذف المقال"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Confirmation UI Container */}
                                        <div className={`${confirmingDeleteId === blog._id ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'} transition-all duration-300 ease-in-out flex items-center gap-2 w-full lg:w-auto`}>
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                disabled={isDeleting}
                                                className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 text-sm font-bold flex-1 sm:flex-initial whitespace-nowrap"
                                            >
                                                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmingDeleteId(null)}
                                                className="btn-outline text-sm font-bold flex-1 sm:flex-initial"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
