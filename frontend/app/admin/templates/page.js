'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Zap,
  Crown,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Pin,
  PinOff,
  Eye,
  ArrowRight,
  Filter,
  Search,
  Layout,
  Calendar,
  User as UserIcon,
  Tag,
  CreditCard,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  ShoppingBag,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';
import { useToast } from '../../../contexts/ToastContext';
import { getCategoryName } from '../../../lib/categoryMapping';

// Map badge types to Lucide icons
const getBadgeIcon = (badgeType) => {
  switch (badgeType) {
    case 'featured': return Star;
    case 'premium': return Crown;
    case 'new': return Zap;
    case 'best-seller': return Award;
    default: return Star;
  }
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);

  // Bulk actions
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const [pinLoading, setPinLoading] = useState(null);

  const { user, isAuthenticated, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const breadcrumbItems = [
    { name: 'لوحة الإدارة', url: '/admin' },
    { name: 'إدارة القوالب', url: '/admin/templates' }
  ];

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      ensureTokenInHeaders && ensureTokenInHeaders();

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        status: selectedStatus,
        search: debouncedSearch
      });

      const response = await api.get(`/admin/templates?${params.toString()}`);

      if (response.data.success) {
        setTemplates(response.data.templates);
        // Use either response.data.totalPages or response.data.pagination.pages
        setTotalPages(response.data.totalPages || response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showError('حدث خطأ أثناء جلب القوالب');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, debouncedSearch, ensureTokenInHeaders, showError]);

  const fetchStats = useCallback(async () => {
    try {
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.get('/admin/template-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
    }
  }, [ensureTokenInHeaders]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchTemplates();
    fetchStats();
  }, [isAuthenticated, user, authLoading, fetchTemplates, fetchStats, router]);

  const handleStatusCardClick = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleStatusChange = (template, status) => {
    setSelectedTemplate(template);
    setSelectedAction(status);
    setShowModal(true);
  };

  const handleViewDetails = (template) => {
    setSelectedTemplateDetails(template);
    setShowDetailsModal(true);
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTemplates.length === templates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(templates.map(t => t._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTemplates.length === 0) return;

    try {
      setActionLoading(true);
      await api.put('/admin/templates/bulk-action', {
        templateIds: selectedTemplates,
        action: bulkAction,
        adminNotes
      });

      showSuccess('تم تنفيذ الإجراء الجماعي بنجاح');
      setSelectedTemplates([]);
      setBulkAction('');
      setAdminNotes('');
      setShowBulkActions(false);

      await fetchTemplates();
      await fetchStats();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showError('حدث خطأ أثناء تنفيذ الإجراء الجماعي');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedTemplate || !selectedAction) return;

    setActionLoading(true);
    try {
      const response = await api.put(`/admin/templates/${selectedTemplate._id}/status`, {
        status: selectedAction,
        adminNotes
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowModal(false);
        setSelectedTemplate(null);
        setSelectedAction(null);
        setAdminNotes('');

        await fetchTemplates();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating template status:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء تحديث حالة القالب');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePinTemplate = async (templateId) => {
    try {
      setPinLoading(templateId);
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.put(`/admin/templates/${templateId}/pin`);

      if (response.data.success) {
        showSuccess(response.data.message);
        setTemplates(prev =>
          prev.map(template =>
            template._id === templateId
              ? {
                ...template,
                isPinned: response.data.template.isPinned,
                pinnedAt: response.data.template.pinnedAt
              }
              : template
          )
        );
      } else {
        showError(response.data.message || 'حدث خطأ أثناء تثبيت القالب');
      }
    } catch (error) {
      console.error('Error pinning template:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء تثبيت القالب');
    } finally {
      setPinLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'قيد المراجعة', className: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30', icon: Clock },
      approved: { label: 'موافق عليه', className: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30', icon: CheckCircle },
      rejected: { label: 'مرفوض', className: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${config.className}`}>
        <Icon className="w-3 h-3 text-current" />
        {config.label}
      </span>
    );
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 pb-20" dir="rtl">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-orange-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] -left-[5%] w-[30%] h-[30%] bg-primary-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <BreadcrumbWrapper items={breadcrumbItems} />
        </div>

        <div className="container-custom relative z-10 pt-6">
          <div className="flex flex-col gap-8">
            <div className="h-12 bg-white/50 dark:bg-dark-secondary/50 rounded-2xl w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/50 dark:bg-dark-secondary/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
            <div className="h-96 bg-white/50 dark:bg-dark-secondary/50 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 pb-20 overflow-x-hidden" dir="rtl">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-orange-500/[0.03] rounded-full" />
        <div className="absolute bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-500/[0.03] rounded-full" />
      </div>

      <div className="relative z-10">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <div className="container-custom relative z-10 pt-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <Layout className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">لوحة التحكم</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-accent-500 dark:text-dark-text-primary tracking-tight">
              إدارة <span className="text-gradient-orange">القوالب</span>
            </h1>
            <p className="text-accent-400 dark:text-dark-text-tertiary max-w-lg leading-relaxed font-medium">
              مراجعة وتحرير القوالب المقدمة من المبدعين. يمكنك الموافقة، الرفض، أو تثبيت القوالب المميزة.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => router.push('/admin')}
              className="group flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-2xl font-bold text-accent-500 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-all duration-300 shadow-soft hover:shadow-glow"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>العودة للرئيسية</span>
            </button>
          </motion.div>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats && [
            { id: 'all', label: 'إجمالي القوالب', value: stats.totalTemplates, icon: Layout, color: 'primary' },
            { id: 'pending', label: 'قيد المراجعة', value: stats.pendingTemplates, icon: Clock, color: 'amber' },
            { id: 'approved', label: 'موافق عليها', value: stats.approvedTemplates, icon: CheckCircle, color: 'emerald' },
            { id: 'rejected', label: 'مرفوضة', value: stats.rejectedTemplates, icon: XCircle, color: 'rose' }
          ].map((stat) => (
            <div
              key={stat.id}
              onClick={() => handleStatusCardClick(stat.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-dark-secondary ${selectedStatus === stat.id
                ? 'border-orange-500 shadow-sm'
                : 'border-gray-100 dark:border-dark-card-border hover:border-orange-300'
                }`}
            >
              <div className="flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary-50 text-primary-500' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-rose-50 text-rose-500'
                  }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-accent-400 dark:text-dark-text-tertiary text-xs font-bold uppercase">{stat.label}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">{stat.value}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300" />
                <input
                  type="text"
                  placeholder="البحث في القوالب..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-dark-tertiary/50 border-none pr-10 pl-4 py-3 rounded-xl text-sm outline-none text-right"
                />
              </div>
              <div className="relative">
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300" />
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-dark-tertiary/50 border-none appearance-none pr-10 pl-10 py-3 rounded-xl text-sm outline-none cursor-pointer text-right"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">موافق عليها</option>
                  <option value="rejected">مرفوضة</option>
                </select>
                <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Action Alert */}
        <AnimatePresence>
          {selectedTemplates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8"
            >
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                <div className="flex items-center gap-4 text-primary-500">
                  <div className="p-3 bg-primary-500/20 rounded-2xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">تم تحديد {selectedTemplates.length} قالب</h4>
                    <p className="text-sm font-bold opacity-80">يمكنك إجراء عمليات جماعية على القوالب المحددة.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-dark-secondary border-none rounded-xl font-bold text-sm outline-none shadow-soft"
                  >
                    <option value="">اختر الإجراء الجماعي...</option>
                    <option value="approve">موافقة جماعية</option>
                    <option value="reject">رفض جماعي</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || actionLoading}
                    className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold shadow-soft hover:shadow-glow disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {actionLoading ? 'جاري التنفيذ...' : 'تطبيق'}
                  </button>
                  <button
                    onClick={() => setSelectedTemplates([])}
                    className="p-3 text-accent-400 hover:text-rose-500 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Table */}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-50 dark:border-dark-card-border bg-gray-50/50 dark:bg-dark-tertiary/30">
                  <th className="px-6 py-4 text-right">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === templates.length && templates.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">تمثيل القالب</th>
                  <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">المبدع</th>
                  <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">التصنيف & السعر</th>
                  <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">حالة المراجعة</th>
                  <th className="px-6 py-6 text-left text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border">
                {templates.map((template, idx) => (
                  <tr
                    key={template._id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/20 transition-all duration-300"
                  >
                    <td className="px-8 py-5 text-right">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template._id)}
                        onChange={() => handleSelectTemplate(template._id)}
                        className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center gap-5">
                        <div className="relative group/img flex-shrink-0">
                          <div className="w-20 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-tertiary shadow-soft">
                            {template.previewImage ? (
                              <Image
                                src={template.previewImage}
                                alt={template.title}
                                width={80}
                                height={56}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                unoptimized={template.previewImage.startsWith('http')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-accent-200">
                                <Layout className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          {template.isPinned && (
                            <div className="absolute -top-2 -right-2 p-1.5 bg-orange-500 text-white rounded-lg shadow-glow-orange scale-90">
                              <Pin className="w-3 h-3 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 text-right">
                          <span className="text-sm font-black text-accent-500 dark:text-dark-text-primary truncate transition-colors group-hover:text-orange-500">
                            {template.title}
                          </span>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-accent-300 dark:text-dark-text-tertiary uppercase">
                              <Calendar className="w-3 h-3" />
                              {formatDate(template.createdAt)}
                            </span>
                            {template.views > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <Eye className="w-3 h-3" />
                                {template.views}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={template.creator.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized={template.creator.profilePicture.startsWith('http')}
                            />
                          ) : (
                            <UserIcon className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-bold text-accent-500 dark:text-dark-text-primary">{template.creator?.name}</span>
                          <span className="text-[10px] font-medium text-accent-300 dark:text-dark-text-tertiary">{template.creator?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-accent-400 dark:text-dark-text-tertiary">
                          {getCategoryName(template.category)}
                          <Tag className="w-3 h-3" />
                        </span>
                        <div className="flex items-center gap-1.5">
                          {template.isPaid ? (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30 font-black text-[11px]">
                              {template.price} ر.س
                              <CreditCard className="w-3 h-3" />
                            </div>
                          ) : (
                            <span className="text-[11px] font-black text-accent-300 uppercase">مجاني</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      {getStatusBadge(template.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(template)}
                          className="p-2.5 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl text-accent-400 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-soft"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-4 bg-gray-100 dark:bg-dark-card-border mx-1" />

                        <button
                          onClick={() => handlePinTemplate(template._id)}
                          disabled={pinLoading === template._id}
                          className={`p-2.5 rounded-xl transition-all shadow-soft border ${template.isPinned
                            ? 'bg-orange-500 text-white shadow-glow-orange border-transparent'
                            : 'bg-white dark:bg-dark-secondary border-gray-100 dark:border-dark-card-border text-accent-400 hover:text-orange-500'
                            }`}
                        >
                          {pinLoading === template._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            template.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />
                          )}
                        </button>

                        {template.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(template, 'approved')}
                              className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-soft"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(template, 'rejected')}
                              className="p-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-soft"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-6 bg-gray-50/50 dark:bg-dark-tertiary/20 border-t border-gray-50 dark:border-dark-card-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-accent-300 uppercase tracking-widest">
                صفحة {currentPage} من {totalPages}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl font-black text-xs text-accent-500 dark:text-dark-text-primary disabled:opacity-50 transition-all hover:translate-x-1 shadow-soft"
                >
                  <span>السابق</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl font-black text-xs text-accent-500 dark:text-dark-text-primary disabled:opacity-50 transition-all hover:-translate-x-1 shadow-soft"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>التالي</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Modal */}
      <AnimatePresence>
        {showModal && selectedTemplate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-accent-500/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-glow overflow-hidden border border-gray-100 dark:border-dark-card-border"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl ${selectedAction === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {selectedAction === 'approved' ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <h3 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">
                    تأكيد {selectedAction === 'approved' ? 'الموافقة' : 'الرفض'}
                  </h3>
                </div>

                <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-3xl p-6 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-12 rounded-xl overflow-hidden shadow-soft">
                      <img src={selectedTemplate.previewImage} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-accent-500 dark:text-dark-text-primary">{selectedTemplate.title}</h4>
                      <p className="text-xs font-medium text-accent-300">{selectedTemplate.creator?.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-black text-accent-500 dark:text-dark-text-primary">ملاحظات الإدارة (اختياري)</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="لماذا تم هذا الإجراء؟ سيظهر للمبدع..."
                      className="w-full bg-white dark:bg-dark-secondary border-none rounded-2xl p-4 text-sm font-medium shadow-soft outline-none focus:ring-2 focus:ring-orange-500/20 transition-all min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={confirmStatusChange}
                    disabled={actionLoading}
                    className={`flex-1 py-4 rounded-2xl font-black shadow-glow transition-all active:scale-95 ${selectedAction === 'approved'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                  >
                    {actionLoading ? 'جاري المعالجة...' : 'تأكيد القرار'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-8 py-4 bg-gray-100 dark:bg-dark-tertiary text-accent-400 rounded-2xl font-black hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedTemplateDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
              className="absolute inset-0 bg-accent-500/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-5xl bg-white dark:bg-dark-secondary rounded-[3rem] shadow-soft-xl overflow-hidden border border-gray-100 dark:border-dark-card-border max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 border-b border-gray-50 dark:border-dark-card-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary leading-none mb-1">تفاصيل القالب</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent-300 uppercase tracking-widest">{selectedTemplateDetails._id}</span>
                      {getStatusBadge(selectedTemplateDetails.status)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl text-accent-300 hover:text-rose-500 transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Scrolling Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Preview */}
                  <div className="lg:col-span-12">
                    <div className="relative group rounded-[2rem] overflow-hidden shadow-glow">
                      <img
                        src={selectedTemplateDetails.previewImage}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                        <a
                          href={selectedTemplateDetails.notionLink}
                          target="_blank"
                          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                        >
                          <ExternalLink className="w-4 h-4" />
                          معاينة في نوشن
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Template Basics */}
                  <div className="lg:col-span-8 space-y-8">
                    <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-[2.5rem] p-8">
                      <h4 className="text-xl font-black text-accent-500 dark:text-dark-text-primary mb-6 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-orange-500" />
                        المعلومات الأساسية
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-2">اسم القالب</label>
                          <p className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.title}</p>
                        </div>
                        <div>
                          <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">وصف القالب</label>
                          <p className="text-sm font-medium text-accent-400 leading-relaxed">{selectedTemplateDetails.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-dark-card-border">
                          <div>
                            <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">التصنيف</label>
                            <span className="inline-block px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl font-black text-xs">
                              {getCategoryName(selectedTemplateDetails.category)}
                            </span>
                          </div>
                          <div>
                            <label className="text-xs font-black text-accent-300 uppercase tracking-widest block mb-1">السعر</label>
                            <span className="text-lg font-black text-emerald-500">
                              {selectedTemplateDetails.isPaid ? `${selectedTemplateDetails.price} ر.س` : 'مجاني'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="bg-gray-50 dark:bg-dark-tertiary/20 rounded-[2.5rem] p-8">
                      <h4 className="text-xl font-black text-accent-500 dark:text-dark-text-primary mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-500" />
                        المميزات & العلامات
                      </h4>
                      <div className="space-y-6">
                        <p className="text-sm font-medium text-accent-400 leading-relaxed whitespace-pre-line">
                          {selectedTemplateDetails.features}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-4">
                          {selectedTemplateDetails.tags?.map((tag, i) => (
                            <span key={i} className="px-4 py-1.5 bg-white dark:bg-dark-secondary rounded-xl font-bold text-xs text-accent-400 border border-gray-100 dark:border-dark-card-border shadow-soft capitalize">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sidebar */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Creator Card */}
                    <div className="bg-white dark:bg-dark-tertiary/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-dark-card-border shadow-soft">
                      <h4 className="text-sm font-black text-accent-300 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">صاحب العمل</h4>
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden ring-8 ring-primary-50 dark:ring-primary-500/10 shadow-glow">
                          <img
                            src={selectedTemplateDetails.creator?.profilePicture}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h5 className="text-lg font-black text-accent-500 dark:text-dark-text-primary leading-none mb-1">
                            {selectedTemplateDetails.creator?.name}
                          </h5>
                          <p className="text-xs font-bold text-accent-300">{selectedTemplateDetails.creator?.email}</p>
                        </div>
                        <p className="text-xs font-medium text-accent-400 line-clamp-3 italic">
                          "{selectedTemplateDetails.creator?.bio || 'لا يوجد نبذة تعريفية.'}"
                        </p>
                      </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="bg-gradient-to-br from-primary-500 to-orange-500 rounded-[2.5rem] p-8 text-white shadow-glow-orange">
                      <h4 className="text-xs font-black text-white/60 uppercase tracking-widest mb-6 border-b border-white/10 pb-4 text-center">أداء القالب</h4>
                      <div className="grid grid-cols-2 gap-y-6 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Eye className="w-4 h-4 opacity-70" />
                            <span className="text-sm opacity-80 font-bold">المشاهدات</span>
                          </div>
                          <span className="text-2xl font-black tabular-nums">{selectedTemplateDetails.views || 0}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Download className="w-4 h-4 opacity-70" />
                            <span className="text-sm opacity-80 font-bold">التحميلات</span>
                          </div>
                          <span className="text-2xl font-black tabular-nums">{selectedTemplateDetails.downloads || 0}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Star className="w-4 h-4 opacity-70" />
                            <span className="text-sm opacity-80 font-bold">التقييم</span>
                          </div>
                          <span className="text-2xl font-black tabular-nums">{selectedTemplateDetails.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Heart className="w-4 h-4 opacity-70" />
                            <span className="text-sm opacity-80 font-bold">المراجعات</span>
                          </div>
                          <span className="text-2xl font-black tabular-nums">{selectedTemplateDetails.reviewsCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-8 border-t border-gray-50 dark:border-dark-card-border flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-8 py-4 bg-gray-50 dark:bg-dark-tertiary text-accent-400 rounded-2xl font-black hover:bg-gray-100 transition-all"
                >
                  إغلاق النافذة
                </button>
                {selectedTemplateDetails.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleStatusChange(selectedTemplateDetails, 'approved');
                      }}
                      className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-glow hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      موافقة فورية
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleStatusChange(selectedTemplateDetails, 'rejected');
                      }}
                      className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-hot hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      رفض القالب
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
