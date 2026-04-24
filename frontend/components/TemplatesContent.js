'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../lib/dateUtils';
import ExportButton from './ExportButton';
import ImportTemplatesModal from './ImportTemplatesModal';
import ExportTemplatesModal from './ExportTemplatesModal';

export default function TemplatesContent() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTemplates();
    }, [selectedStatus]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/templates/my-templates');
            setTemplates(response.data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (templateId) => {
        try {
            await api.delete(`/templates/${templateId}`);
            setTemplates(prev => prev.filter(t => t._id !== templateId));
            showSuccess('تم حذف القالب بنجاح');
            setConfirmingDeleteId(null);
        } catch (error) {
            console.error('Error deleting template:', error);
            const message = error.response?.data?.message || 'تعذر حذف القالب';
            showError(message);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                label: 'قيد المراجعة',
                className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                Icon: Clock
            },
            approved: {
                label: 'موافق عليه',
                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                Icon: CheckCircle
            },
            rejected: {
                label: 'مرفوض',
                className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                Icon: XCircle
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
                {config.Icon && <config.Icon className="w-4 h-4" />}
                <span>{config.label}</span>
            </span>
        );
    };

    const getStatusMessage = (status, adminFeedback) => {
        switch (status) {
            case 'pending':
                return 'قالبك قيد المراجعة حالياً من قبل فريقنا. سنخطرك بمجرد الانتهاء.';
            case 'approved':
                return 'تمت الموافقة على قالبك وهو الآن متاح للجميع في المتجر!';
            case 'rejected':
                return adminFeedback ? `تم رفض القالب: ${adminFeedback}` : 'للأسف تم رفض القالب. يرجى مراجعة معايير النشر لدينا.';
            default:
                return '';
        }
    };

    const filteredTemplates = selectedStatus === 'all'
        ? templates
        : templates.filter(template => template.status === selectedStatus);

    return (
        <>
            {/* Header */}
            <div className="mb-8 border-b border-gray-100 dark:border-dark-card-border pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">قوالبي</h1>
                        <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">
                            تتبع حالة قوالبي ومراجعة تفاصيلها
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsExportModalOpen(true);
                            }}
                            className="btn-secondary text-sm sm:text-base px-4 py-2.5 sm:py-3 w-full sm:w-auto text-center font-bold flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            تصدير قوالبى
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsImportModalOpen(true);
                            }}
                            className="btn-outline text-sm sm:text-base px-4 py-2.5 sm:py-3 w-full sm:w-auto text-center font-bold flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            استيراد (CSV)
                        </button>
                        <button
                            onClick={() => router.push('/templates/create')}
                            className="btn-primary text-sm sm:text-base px-4 py-2.5 sm:py-3 w-full sm:w-auto text-center font-bold"
                        >
                            إنشاء قالب جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">إجمالي القوالب</h3>
                    <p className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-orange-500">{templates.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">قيد المراجعة</h3>
                    <p className="text-2xl sm:text-3xl font-black text-yellow-500">{templates.filter(t => t.status === 'pending').length}</p>
                </div>
                <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">موافق عليها</h3>
                    <p className="text-2xl sm:text-3xl font-black text-green-500">{templates.filter(t => t.status === 'approved').length}</p>
                </div>
                <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-dark-text-secondary mb-1">مرفوضة</h3>
                    <p className="text-2xl sm:text-3xl font-black text-red-500">{templates.filter(t => t.status === 'rejected').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <label className="text-sm font-bold text-gray-700 dark:text-dark-text-primary whitespace-nowrap">
                    تصفية حسب الحالة:
                </label>
                <div className="relative w-full sm:w-64 group">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="appearance-none w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border hover:border-primary-500 dark:hover:border-primary-500 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-700 dark:text-dark-text-primary focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <option value="all">جميع الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="approved">موافق عليها</option>
                        <option value="rejected">مرفوضة</option>
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Templates List */}
            {loading ? (
                <div className="space-y-4 sm:space-y-6">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl p-4 sm:p-6 animate-pulse">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                                {/* Image Skeleton */}
                                <div className="w-full sm:w-32 md:w-48 h-48 sm:h-24 md:h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>

                                {/* Content Skeleton */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                </div>

                                {/* Actions Skeleton */}
                                <div className="w-full sm:w-auto sm:min-w-[200px] flex gap-2">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredTemplates.length > 0 ? (
                <div className="space-y-4">
                    {filteredTemplates.map((template) => (
                        <div key={template._id} className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl p-4 sm:p-5 hover:border-primary-200 dark:hover:border-orange-500/50 transition-colors group">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                {/* Image & Info */}
                                <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 min-w-0">
                                    <div className="relative w-full sm:w-40 md:w-48 aspect-video sm:aspect-auto sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-primary flex-shrink-0 border border-gray-100 dark:border-dark-card-border/50">
                                        {(template.coverImage || template.previewImage) ? (
                                            <Image
                                                src={template.coverImage || template.previewImage}
                                                alt={template.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                                    {template.title}
                                                </h3>
                                                {getStatusBadge(template.status)}
                                            </div>

                                            {/* Short Description */}
                                            {template.description && (
                                                <p className="text-sm text-gray-500 dark:text-dark-text-secondary line-clamp-2 mb-3 leading-relaxed">
                                                    {template.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                                                <span className="font-medium text-primary-600 dark:text-orange-400 bg-primary-50 dark:bg-orange-500/10 px-2.5 py-0.5 rounded-lg">
                                                    {template.price > 0 ? `${template.price} جنيه` : 'مجاني'}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-dark-text-tertiary">
                                                    <span className="text-gray-300 dark:text-gray-700">|</span>
                                                    <span>{template.categories && template.categories.length > 0 ? template.categories.join('، ') : (template.category || 'غير مصنف')}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="font-medium">{template.views || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    <span className="font-medium">{template.downloads || 0}</span>
                                                </div>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-500">{formatDate(template.createdAt)}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                                            {getStatusMessage(template.status, template.adminFeedback)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                    <div
                                        className={`${confirmingDeleteId === template._id ? 'opacity-0 scale-95 pointer-events-none absolute inset-0' : 'opacity-100 scale-100 relative'} transition-all duration-300 ease-in-out flex flex-col gap-2`}
                                    >
                                        <button
                                            onClick={() => router.push(`/templates/create?edit=${template._id}`)}
                                            className="btn-outline text-sm px-4 py-2.5 sm:py-3 w-full"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => setConfirmingDeleteId(template._id)}
                                            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 text-sm px-4 py-2.5 sm:py-3 w-full"
                                        >
                                            حذف القالب
                                        </button>
                                    </div>

                                    <div
                                        className={`${confirmingDeleteId === template._id ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 pointer-events-none absolute inset-0'} transition-all duration-300 ease-in-out flex flex-col sm:flex-row gap-2`}
                                    >
                                        <button
                                            onClick={() => handleDelete(template._id)}
                                            className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 text-sm px-4 py-2.5 sm:py-3 flex-1 w-full sm:w-auto"
                                        >
                                            تأكيد الحذف
                                        </button>
                                        <button
                                            onClick={() => setConfirmingDeleteId(null)}
                                            className="btn-outline text-sm px-4 py-2.5 sm:py-3 flex-1 w-full sm:w-auto"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 sm:py-16">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                        {selectedStatus === 'all' ? 'لم تقم بإرسال أي قوالب بعد' : 'لا توجد قوالب بهذه الحالة'}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mb-6">
                        {selectedStatus === 'all'
                            ? 'ابدأ بإنشاء قالبك الأول وشاركه مع العالم'
                            : 'جرب تغيير فلتر الحالة لعرض قوالب أخرى'
                        }
                    </p>
                    <button
                        onClick={() => router.push('/templates/create')}
                        className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                        إنشاء قالب جديد
                    </button>
                </div>
            )}

            <ImportTemplatesModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchTemplates}
            />

            <ExportTemplatesModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                user={user}
            />
        </>
    );
}
