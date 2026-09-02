'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Tag, Plus, Trash2, Copy, Check, Calendar, 
    Users, Percent, DollarSign, Search, Loader2, 
    AlertCircle, Sparkles, CheckCircle2, XCircle, 
    Layers, RefreshCw, X, ShieldCheck, ChevronLeft,
    Clock, Award, HelpCircle, Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { formatDate } from '../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';

function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'اختر...',
    icon: TriggerIcon
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const selectedOption = options.find(o => String(o.value) === String(value)) || options[0];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary/40 border ${
                    isOpen 
                        ? 'border-primary-500 ring-2 ring-primary-500/10' 
                        : 'border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10'
                } rounded-2xl text-xs font-black text-gray-900 dark:text-dark-text-primary flex items-center justify-between transition-all outline-none cursor-pointer`}
            >
                <div className="flex items-center gap-2.5 truncate">
                    {TriggerIcon && <TriggerIcon size={14} className="text-gray-400 shrink-0" />}
                    {selectedOption?.icon && (
                        <span className="text-primary-600 dark:text-orange-400 shrink-0">
                            {selectedOption.icon}
                        </span>
                    )}
                    <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 mr-2">
                    {selectedOption?.badge && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400">
                            {selectedOption.badge}
                        </span>
                    )}
                    <ChevronLeft
                        size={14}
                        className={`transform transition-transform duration-200 ${
                            isOpen ? '-rotate-90 text-primary-600 dark:text-orange-400' : 'rotate-0 text-gray-400'
                        }`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 left-0 top-full mt-2 z-50 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-1.5 max-h-60 overflow-y-auto no-scrollbar"
                    >
                        {options.map((option) => {
                            const isSelected = String(option.value) === String(value);
                            return (
                                <button
                                    key={option.value || 'default'}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between text-right cursor-pointer mb-0.5 last:mb-0 ${
                                        isSelected
                                            ? 'bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400 font-black'
                                            : 'text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary/60 hover:text-gray-900 dark:hover:text-dark-text-primary'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        {option.icon && (
                                            <div className={`p-1.5 rounded-lg shrink-0 ${
                                                isSelected 
                                                    ? 'bg-primary-100 dark:bg-orange-500/20 text-primary-600 dark:text-orange-400' 
                                                    : 'bg-gray-100 dark:bg-dark-tertiary text-gray-400'
                                            }`}>
                                                {option.icon}
                                            </div>
                                        )}
                                        <div className="truncate text-right">
                                            <div className="truncate">{option.label}</div>
                                            {option.sublabel && (
                                                <div className="text-[10px] text-gray-400 dark:text-dark-text-tertiary font-normal">
                                                    {option.sublabel}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 mr-2">
                                        {option.badge && (
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                                isSelected 
                                                    ? 'bg-primary-200/50 dark:bg-orange-500/20 text-primary-700 dark:text-orange-300' 
                                                    : 'bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-dark-text-tertiary'
                                            }`}>
                                                {option.badge}
                                            </span>
                                        )}
                                        {isSelected && (
                                            <Check size={14} className="text-primary-600 dark:text-orange-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function CouponsContent() {
    const { user, ensureTokenInHeaders } = useAuth();
    const { showSuccess, showError } = useToast();

    const [coupons, setCoupons] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive | expired
    const [copiedCode, setCopiedCode] = useState(null);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        templateId: '',
        maxUses: '',
        expiresAt: ''
    });

    useEffect(() => {
        fetchCoupons();
        fetchMyTemplates();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            ensureTokenInHeaders();
            const res = await api.get('/coupons/creator');
            if (res.data.success) {
                setCoupons(res.data.coupons || []);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showError(error.response?.data?.message || 'فشل في جلب قائمة الكوبونات');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTemplates = async () => {
        try {
            ensureTokenInHeaders();
            const res = await api.get('/templates/my-templates');
            const allTpls = res.data.templates || [];
            // Filter to paid templates only
            setTemplates(allTpls.filter(t => t.isPaid && t.price > 0));
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleCopy = (code) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showSuccess(`تم نسخ كود الخصم (${code}) بنجاح! 📋`);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const handleToggleActive = async (coupon) => {
        const cId = coupon.id || coupon._id;
        try {
            setTogglingId(cId);
            ensureTokenInHeaders();
            const res = await api.patch(`/coupons/creator/${cId}`, {
                isActive: !coupon.isActive
            });
            if (res.data.success) {
                setCoupons(prev => prev.map(c => (c.id === cId || c._id === cId) ? { ...c, isActive: !coupon.isActive } : c));
                showSuccess(coupon.isActive ? 'تم إيقاف تفعيل الكوبون مؤقتاً' : 'تم تفعيل الكوبون بنجاح');
            }
        } catch (error) {
            console.error('Error toggling coupon status:', error);
            showError(error.response?.data?.message || 'فشل في تغيير حالة الكوبون');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (couponId) => {
        try {
            ensureTokenInHeaders();
            const res = await api.delete(`/coupons/creator/${couponId}`);
            if (res.data.success) {
                setCoupons(prev => prev.filter(c => c.id !== couponId && c._id !== couponId));
                showSuccess('تم حذف كود الخصم بنجاح 🗑️');
                setConfirmingDeleteId(null);
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showError(error.response?.data?.message || 'فشل في حذف الكوبون');
        }
    };

    const generateRandomCode = () => {
        const words = ['NOTION', 'VIP', 'OFFER', 'SPECIAL', 'DEAL', 'CREATOR'];
        const word = words[Math.floor(Math.random() * words.length)];
        const randomNum = Math.floor(10 + Math.random() * 90);
        setFormData(prev => ({ ...prev, code: `${word}${randomNum}` }));
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            showError('الرجاء إدخال كود الخصم');
            return;
        }
        if (!formData.discountValue || Number(formData.discountValue) <= 0) {
            showError('الرجاء إدخال قيمة خصم صحيحة');
            return;
        }

        try {
            setSubmitting(true);
            ensureTokenInHeaders();
            const payload = {
                code: formData.code.trim().toUpperCase(),
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                templateId: formData.templateId || null,
                maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
                expiresAt: formData.expiresAt ? formData.expiresAt : null
            };

            const res = await api.post('/coupons/creator', payload);
            if (res.data.success) {
                showSuccess('تم إنشاء كود الخصم بنجاح! 🎉');
                setIsCreateModalOpen(false);
                setFormData({
                    code: '',
                    discountType: 'percentage',
                    discountValue: '',
                    templateId: '',
                    maxUses: '',
                    expiresAt: ''
                });
                fetchCoupons();
            }
        } catch (error) {
            console.error('Create coupon error:', error);
            showError(error.response?.data?.message || 'فشل في إنشاء كود الخصم');
        } finally {
            setSubmitting(false);
        }
    };

    // Stats calculations
    const stats = useMemo(() => {
        const total = coupons.length;
        const now = new Date();
        const active = coupons.filter(c => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > now) && (!c.maxUses || c.usedCount < c.maxUses)).length;
        const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
        return { total, active, totalUses };
    }, [coupons]);

    // Filtered list
    const filteredCoupons = useMemo(() => {
        const now = new Date();
        return coupons.filter(c => {
            const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.templateTitle && c.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()));

            const isExpired = c.expiresAt && new Date(c.expiresAt) <= now;
            const isExhausted = c.maxUses && c.usedCount >= c.maxUses;

            if (statusFilter === 'active') {
                return matchesSearch && c.isActive && !isExpired && !isExhausted;
            }
            if (statusFilter === 'inactive') {
                return matchesSearch && !c.isActive;
            }
            if (statusFilter === 'expired') {
                return matchesSearch && (isExpired || isExhausted);
            }
            return matchesSearch;
        });
    }, [coupons, searchQuery, statusFilter]);

    // Options for custom selects
    const discountTypeOptions = useMemo(() => [
        {
            value: 'percentage',
            label: 'نسبة مئوية (%)',
            sublabel: 'خصم نسبة من سعر القالب',
            icon: <Percent size={14} />,
            badge: '%'
        },
        {
            value: 'fixed',
            label: 'مبلغ ثابت (ج.م)',
            sublabel: 'خصم قيمة محددة بالجنيه',
            icon: <DollarSign size={14} />,
            badge: 'ج.م'
        }
    ], []);

    const templateOptions = useMemo(() => [
        {
            value: '',
            label: 'جميع قوالبي المدفوعة',
            sublabel: 'ينطبق الكوبون على جميع قوالبك',
            icon: <Layers size={14} />,
            badge: 'الكل'
        },
        ...templates.map(t => ({
            value: t._id || t.id,
            label: t.title,
            sublabel: `سعر القالب: ${t.price} ج.م`,
            icon: <Package size={14} />,
            badge: `${t.price} ج.م`
        }))
    ], [templates]);

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Header Block matching SalesContent & CreatorEarnings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                        كوبونات الخصم والعروض
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
                        أنشئ عروضاً ترويجية وكوبونات خصم مخصصة لقوالبك لزيادة مبيعاتك واستقطاب مشترين جدد
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 self-start sm:self-center"
                >
                    <Plus size={16} />
                    <span>إنشاء كوبون جديد</span>
                </button>
            </div>

            {/* Premium Stat cards Grid matching CreatorEarnings and SalesContent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">
                            إجمالي الكوبونات
                        </span>
                        <div className="p-2.5 bg-primary-50 dark:bg-orange-500/10 text-primary-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <Tag size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">
                        {stats.total.toLocaleString('ar-EG')}
                    </h3>
                </div>

                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">
                            كوبونات فعالة
                        </span>
                        <div className="p-2.5 bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 rounded-2xl group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {stats.active.toLocaleString('ar-EG')}
                    </h3>
                </div>

                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">
                            مرات الاستخدام الكلية
                        </span>
                        <div className="p-2.5 bg-purple-50 text-purple-500 dark:bg-purple-950/20 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users size={18} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">
                        {stats.totalUses.toLocaleString('ar-EG')}
                    </h3>
                </div>
            </div>

            {/* Filter & Search Bar - Notion Arabs Unified Style */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-gray-100/60 dark:border-white/5 shadow-sm">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="ابحث برمز الكوبون أو اسم القالب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 text-xs bg-gray-50 dark:bg-dark-tertiary/40 border border-transparent rounded-xl text-gray-800 dark:text-dark-text-primary focus:outline-none focus:bg-white dark:focus:bg-dark-tertiary focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'active', label: 'فعّال' },
                        { id: 'inactive', label: 'متوقف' },
                        { id: 'expired', label: 'منتهي' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                statusFilter === f.id
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary/60'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Coupons Grid / Empty State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-100/60 dark:border-white/5">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                    <span className="text-xs font-bold text-gray-400 dark:text-dark-text-tertiary">جاري تحميل الكوبونات...</span>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-dark-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-dark-text-tertiary">
                        <Tag size={26} />
                    </div>
                    <h3 className="text-base font-black text-gray-900 dark:text-dark-text-primary mb-1">
                        لا توجد كوبونات خصم حالياً
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-dark-text-tertiary max-w-md mx-auto mb-6">
                        {searchQuery ? 'لم يتم العثور على أي كوبون يطابق بحثك.' : 'ابدأ بإنشاء أول كود خصم لتقديمه لعملائك ومتابعيك لتنشيط المبيعات!'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all active:scale-95"
                        >
                            <Plus size={15} />
                            <span>إنشاء أول كود خصم</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCoupons.map((coupon) => {
                        const cId = coupon.id || coupon._id;
                        const now = new Date();
                        const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) <= now;
                        const isExhausted = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                        return (
                            <motion.div
                                key={cId}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-dark-secondary border border-gray-100/80 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                            >
                                {/* Ambient decorative background glow */}
                                <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>

                                {/* Top Section: Code, Discount Tag, Status */}
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            {/* Code Monospace Pill */}
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-orange-500/10 border border-primary-100 dark:border-orange-500/20 rounded-xl font-mono text-sm font-black text-primary-600 dark:text-orange-400 shadow-sm">
                                                <span>{coupon.code}</span>
                                                <button
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="p-1 hover:text-primary-700 dark:hover:text-orange-300 transition-colors"
                                                    title="نسخ الكود"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <Check size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Discount Value Badge */}
                                            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% خصم` : `${coupon.discountValue} ج.م خصم`}
                                            </span>
                                        </div>

                                        {/* Status Tag */}
                                        <div>
                                            {!coupon.isActive ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 dark:bg-dark-tertiary text-gray-500 dark:text-dark-text-tertiary">
                                                    متوقف مؤقتاً
                                                </span>
                                            ) : isExpired ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                                                    منتهي الصلاحية
                                                </span>
                                            ) : isExhausted ? (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">
                                                    اكتمل الحد
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
                                                    نشط ومتاح
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Template Scope */}
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-dark-text-secondary mb-4">
                                        <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-dark-tertiary flex items-center justify-center text-gray-400 shrink-0">
                                            <Layers size={13} />
                                        </div>
                                        <span className="font-bold truncate text-gray-800 dark:text-dark-text-primary">
                                            {coupon.templateTitle || 'جميع القوالب المدفوعة'}
                                        </span>
                                    </div>

                                    {/* Usage details & progress */}
                                    <div className="bg-gray-50/70 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 p-3.5 rounded-2xl mb-5 space-y-2.5">
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span className="text-gray-400 dark:text-dark-text-tertiary">مرات الاستخدام:</span>
                                            <span className="text-gray-800 dark:text-dark-text-primary font-mono">
                                                {coupon.usedCount || 0} {coupon.maxUses ? `/ ${coupon.maxUses}` : 'استخدام'}
                                            </span>
                                        </div>

                                        {coupon.maxUses && (
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-dark-card-border rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        coupon.usedCount >= coupon.maxUses
                                                            ? 'bg-amber-500'
                                                            : 'bg-primary-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.maxUses) * 100)}%` }}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-[11px] font-bold pt-1.5 border-t border-gray-100 dark:border-white/5">
                                            <span className="text-gray-400 dark:text-dark-text-tertiary">تاريخ الانتهاء:</span>
                                            <span className="text-gray-700 dark:text-dark-text-secondary">
                                                {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'دائم (غير محدد)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                                    <button
                                        onClick={() => handleToggleActive(coupon)}
                                        disabled={togglingId === cId}
                                        className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                                            coupon.isActive
                                                ? 'bg-gray-50 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-secondary'
                                                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {togglingId === cId ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : coupon.isActive ? (
                                            'إيقاف مؤقت'
                                        ) : (
                                            'تفعيل الكوبون'
                                        )}
                                    </button>

                                    {confirmingDeleteId === cId ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete(cId)}
                                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                                            >
                                                تأكيد الحذف
                                            </button>
                                            <button
                                                onClick={() => setConfirmingDeleteId(null)}
                                                className="px-2.5 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-xl"
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmingDeleteId(cId)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                            title="حذف الكوبون"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create Coupon Modal - Notion Arabs Theme Standard */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="relative bg-white dark:bg-dark-secondary rounded-3xl w-full max-w-lg shadow-2xl flex flex-col border border-gray-100 dark:border-white/10 max-h-[92vh] overflow-y-auto no-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-card-border flex items-center justify-between bg-gray-50/50 dark:bg-dark-tertiary rounded-t-3xl sticky top-0 z-20 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-orange-900/20 flex items-center justify-center text-primary-600 dark:text-orange-500">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-dark-text-primary">
                                            إنشاء كود خصم جديد
                                        </h3>
                                        <p className="text-xs text-gray-400 dark:text-dark-text-tertiary">
                                            حدد نسبة أو قيمة الخصم والقالب المخصص
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-secondary transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                                {/* Code Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary">
                                            رمز الكوبون (الكود) *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="text-[11px] font-black text-primary-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                                        >
                                            <Sparkles size={12} />
                                            <span>توليد تلقائي</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="مثال: NOTION30 أو RAMADAN"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-mono font-black focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:text-dark-text-primary uppercase"
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-dark-text-tertiary mt-1">
                                        أحرف إنجليزية وأرقام وشرطات فقط، بدون مسافات.
                                    </p>
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary block mb-1.5">
                                            نوع الخصم *
                                        </label>
                                        <CustomSelect
                                            value={formData.discountType}
                                            onChange={(val) => setFormData({ ...formData, discountType: val })}
                                            options={discountTypeOptions}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary block mb-1.5">
                                            قيمة الخصم *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="1"
                                                max={formData.discountType === 'percentage' ? '100' : '9999'}
                                                placeholder={formData.discountType === 'percentage' ? '25' : '100'}
                                                value={formData.discountValue}
                                                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                                required
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-black focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 dark:text-dark-text-primary"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                                                {formData.discountType === 'percentage' ? '%' : 'ج.م'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Template Scope */}
                                <div>
                                    <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary block mb-1.5">
                                        القالب المطبق عليه الكوبون
                                    </label>
                                    <CustomSelect
                                        value={formData.templateId}
                                        onChange={(val) => setFormData({ ...formData, templateId: val })}
                                        options={templateOptions}
                                        placeholder="اختر قالباً..."
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-dark-text-tertiary mt-1">
                                        اختر قالباً محدداً أو اتركه ليعمل الكوبون على جميع قوالبك المدفوعة.
                                    </p>
                                </div>

                                {/* Max Uses & Expiry */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary block mb-1.5">
                                            الحد الأقصى للاستخدام
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="غير محدود (اختياري)"
                                            value={formData.maxUses}
                                            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                            className="w-full px-3 py-3 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary-500 dark:text-dark-text-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-gray-700 dark:text-dark-text-secondary block mb-1.5">
                                            تاريخ الانتهاء
                                        </label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.expiresAt}
                                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                            className="w-full px-3 py-3 bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary-500 dark:text-dark-text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Modal Actions Footer */}
                                <div className="px-0 pt-4 border-t border-gray-100 dark:border-dark-card-border flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-5 py-2.5 text-xs font-black text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary rounded-xl hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
                                    >
                                        إلغاء
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={14} className="animate-spin" />
                                                <span>جاري الحفظ...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check size={14} />
                                                <span>حفظ ونشر الكوبون</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
