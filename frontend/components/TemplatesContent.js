'use client';

import { useState, useEffect } from 'react';
import { 
    CheckCircle, Clock, XCircle, Plus, FileDown, FileUp, 
    Trash2, Edit, ExternalLink, Star, Eye, Calendar, 
    Package, Filter, Loader2, RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import ImportTemplatesModal from './ImportTemplatesModal';
import ExportTemplatesModal from './ExportTemplatesModal';

export default function TemplatesContent() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const { user, ensureTokenInHeaders } = useAuth();
    const { showSuccess, showError } = useToast();
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTemplates();
    }, [selectedStatus]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            ensureTokenInHeaders();
            const response = await api.get('/templates/my-templates');
            setTemplates(response.data.templates || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            showError('حدث خطأ أثناء جلب القوالب الخاصة بك.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (templateId) => {
        try {
            setIsActionLoading(true);
            ensureTokenInHeaders();
            await api.delete(`/templates/${templateId}`);
            setTemplates(prev => prev.filter(t => t._id !== templateId && t.id !== templateId));
            showSuccess('تم حذف القالب بنجاح! 🗑️');
            setConfirmingDeleteId(null);
        } catch (error) {
            console.error('Error deleting template:', error);
            const message = error.response?.data?.message || 'تعذر حذف القالب';
            showError(message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const getStatusDetails = (status = '') => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    label: 'قيد المراجعة',
                    className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400 border border-amber-200/20',
                    Icon: Clock,
                    desc: 'قالبك قيد المراجعة حالياً من قبل فريقنا. سنخطرك بمجرد الانتهاء.'
                };
            case 'approved':
                return {
                    label: 'موافق عليه',
                    className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400 border border-emerald-200/20',
                    Icon: CheckCircle,
                    desc: 'تمت الموافقة على قالبك وهو الآن متاح للجميع في المتجر!'
                };
            case 'rejected':
                return {
                    label: 'مرفوض',
                    className: 'bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-400 border border-red-200/20',
                    Icon: XCircle,
                    desc: 'للأسف تم رفض القالب. يرجى مراجعة معايير النشر لدينا.'
                };
            default:
                return {
                    label: 'قيد المراجعة',
                    className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/25 dark:text-amber-400 border border-amber-200/20',
                    Icon: Clock,
                    desc: ''
                };
        }
    };

    const filteredTemplates = selectedStatus === 'all'
        ? templates
        : templates.filter(template => template.status?.toLowerCase() === selectedStatus.toLowerCase());

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">قوالبي الخاصة</h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">إدارة قوالب نوشن المعروضة في المعرض ومتابعة إحصاءاتها وحالات مراجعتها</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="px-4 py-2.5 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary font-bold text-xs rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <FileDown size={15} />
                        <span>تصدير القوالب</span>
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-4 py-2.5 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary font-bold text-xs rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <FileUp size={15} />
                        <span>استيراد CSV</span>
                    </button>
                    <button
                        onClick={() => router.push('/templates/create')}
                        className="btn-primary text-xs font-black px-5 py-3 rounded-xl border-none shadow-glow flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>إنشاء قالب جديد</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards - Upgraded KPI styles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { title: 'إجمالي القوالب', value: templates.length, color: 'blue', icon: <Package size={18} /> },
                    { title: 'قيد المراجعة', value: templates.filter(t => t.status?.toLowerCase() === 'pending').length, color: 'amber', icon: <Clock size={18} /> },
                    { title: 'موافق عليها', value: templates.filter(t => t.status?.toLowerCase() === 'approved').length, color: 'emerald', icon: <CheckCircle size={18} /> },
                    { title: 'مرفوضة', value: templates.filter(t => t.status?.toLowerCase() === 'rejected').length, color: 'red', icon: <XCircle size={18} /> }
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

            {/* Interactive Filters Bar */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-primary-500" />
                    <span className="text-xs font-black text-gray-700 dark:text-dark-text-primary">تصفية القوالب المعروضة:</span>
                </div>
                
                {/* Horizontal Segment Switcher */}
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                    {[
                        { id: 'all', label: 'جميع الحالات' },
                        { id: 'pending', label: 'قيد المراجعة' },
                        { id: 'approved', label: 'موافق عليها' },
                        { id: 'rejected', label: 'مرفوضة' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedStatus(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-none relative flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                                selectedStatus === tab.id
                                    ? 'bg-primary-500 text-white shadow-glow'
                                    : 'bg-gray-50 dark:bg-dark-tertiary text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-tertiary/80'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Templates Feed/List Area */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                        <div key={index} className="bg-gray-100/50 dark:bg-dark-secondary/30 border border-gray-100/40 dark:border-white/5 rounded-3xl p-5 animate-pulse">
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="w-full sm:w-44 h-32 rounded-2xl bg-gray-200 dark:bg-dark-secondary flex-shrink-0"></div>
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-5 bg-gray-200 dark:bg-dark-secondary rounded-lg w-1/3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-dark-secondary rounded-lg w-2/3"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-dark-secondary rounded-lg w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredTemplates.length > 0 ? (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template) => {
                            const statusDetail = getStatusDetails(template.status);
                            const StatusIcon = statusDetail.Icon;
                            const isUnread = false; // standard

                            return (
                                <motion.div 
                                    key={template._id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 hover:border-primary-100 dark:hover:border-orange-500/15 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                                >
                                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                        {/* Product Cover image */}
                                        <div className="relative w-full sm:w-44 aspect-video sm:h-28 rounded-2xl overflow-hidden bg-gray-50 dark:bg-dark-primary flex-shrink-0 border border-gray-100 dark:border-white/5">
                                            {(template.coverImage || template.previewImage) ? (
                                                <Image
                                                    src={template.coverImage || template.previewImage}
                                                    alt={template.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                    <Package className="w-8 h-8 opacity-40 animate-pulse-slow" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details Block */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-1">
                                            <div>
                                                <div className="flex flex-wrap items-center justify-between gap-3 mb-1.5">
                                                    <h3 className="text-base font-black text-gray-900 dark:text-dark-text-primary line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {template.title}
                                                    </h3>
                                                    {/* Status Badge */}
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${statusDetail.className}`}>
                                                        <StatusIcon size={12} />
                                                        <span>{statusDetail.label}</span>
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-dark-text-secondary line-clamp-1 mb-3">
                                                    {template.description || 'لا يوجد وصف مضاف لهذا القالب حالياً'}
                                                </p>

                                                {/* Meta stats tags */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xxs font-black text-gray-400 dark:text-dark-text-tertiary">
                                                    <span className="font-black text-primary-600 dark:text-orange-400 bg-primary-50 dark:bg-orange-500/10 px-2.5 py-0.5 rounded-lg border-none text-xxs">
                                                        {template.price > 0 ? `${template.price.toLocaleString('ar-EG')} ج.م` : 'مجاني'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="bg-gray-50 dark:bg-dark-tertiary/40 px-2 py-0.5 rounded-md border border-gray-100/30 dark:border-white/5">
                                                        {template.categories && template.categories.length > 0 ? template.categories.join('، ') : (template.category || 'غير مصنف')}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        <span>{(template.views || 0).toLocaleString('ar-EG')} زيارة</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <FileDown size={12} />
                                                        <span>{(template.downloads || 0).toLocaleString('ar-EG')} تحميل</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>{formatDate(template.createdAt)}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Admin feedback statement */}
                                            {template.status === 'rejected' && template.adminFeedback && (
                                                <p className="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/15 p-2 rounded-xl mt-3 border border-red-500/10">
                                                    السبب: {template.adminFeedback}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions panel */}
                                        <div className="w-full sm:w-auto sm:min-w-[140px] shrink-0 self-center">
                                            <AnimatePresence mode="wait">
                                                {confirmingDeleteId === template._id ? (
                                                    <motion.div 
                                                        key="confirm"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="flex flex-col gap-1.5"
                                                    >
                                                        <button
                                                            onClick={() => handleDelete(template._id)}
                                                            disabled={isActionLoading}
                                                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl border-none shadow-glow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                                            <span>تأكيد حذف القالب</span>
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
                                                        <button
                                                            onClick={() => router.push(`/templates/create?edit=${template._id}`)}
                                                            className="w-full py-2.5 bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary border border-gray-100 dark:border-white/5 font-bold text-xs rounded-xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            <Edit size={12} />
                                                            <span>تعديل التفاصيل</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingDeleteId(template._id)}
                                                            className="w-full py-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/10 font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
                                                        >
                                                            <Trash2 size={12} />
                                                            <span>حذف القالب</span>
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                /* Beautiful empty state */
                <div className="text-center py-16 px-6 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500/10 to-accent-500/10 dark:from-orange-500/5 dark:to-orange-600/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-primary-500/10 shadow-glow-sm">
                        <Package className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary mb-2">
                        {selectedStatus === 'all' ? 'لم تقم بإرسال أي قوالب بعد' : 'لا توجد قوالب بهذه الحالة'}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-dark-text-tertiary max-w-sm mx-auto leading-relaxed mb-6">
                        {selectedStatus === 'all'
                            ? 'ابدأ برفع وتصميم قالبك الأول، وشاركه مع عائلة عرب نوشن والآلاف من المستخدمين.'
                            : 'جرب تصفح حالة فلترة أخرى لعرض بقية قوالبك المضافة.'
                        }
                    </p>
                    {selectedStatus === 'all' && (
                        <button
                            onClick={() => router.push('/templates/create')}
                            className="btn-primary text-xs font-black px-5 py-3 rounded-xl border-none shadow-glow cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        >
                            إنشاء قالب جديد الآن
                        </button>
                    )}
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
        </div>
    );
}
