'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Layout,
  ArrowRight
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';
import { useToast } from '../../../contexts/ToastContext';

// Import subcomponents
import TemplateFilters from './components/TemplateFilters';
import TemplateTable from './components/TemplateTable';
import TemplateDetailsModal from './components/TemplateDetailsModal';
import StatusModal from './components/StatusModal';

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

  const handleViewDetails = async (template) => {
    try {
      const response = await api.get(`/admin/templates/${template._id}`);
      if (response.data.success) {
        setSelectedTemplateDetails(response.data.template);
      } else {
        setSelectedTemplateDetails(template);
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
      setSelectedTemplateDetails(template);
    }
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
    if (!bulkAction || selectedTemplates.length === 0 || actionLoading) return;

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
    if (!selectedTemplate || !selectedAction || actionLoading) return;

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
            className="space-y-2 text-right"
          >
            <div className="flex items-center gap-3 mb-1 justify-start">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <Layout className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">لوحة التحكم</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-accent-500 dark:text-dark-text-primary tracking-tight">
              إدارة <span className="inline-block text-gradient-orange pt-2 pb-2 -mt-2 -mb-2">القوالب</span>
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
              <div className="flex flex-col gap-3 text-right">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary-50 text-primary-500' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-500' :
                    stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-rose-50 text-rose-500'
                  }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-accent-400 dark:text-dark-text-tertiary text-xs font-bold uppercase">{stat.label}</h3>
                  <div className="flex items-end gap-1 justify-start">
                    <span className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">{stat.value}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <TemplateFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setCurrentPage={setCurrentPage}
        />

        {/* Table */}
        <TemplateTable
          templates={templates}
          selectedTemplates={selectedTemplates}
          handleSelectAll={handleSelectAll}
          handleSelectTemplate={handleSelectTemplate}
          handleViewDetails={handleViewDetails}
          handlePinTemplate={handlePinTemplate}
          handleStatusChange={handleStatusChange}
          pinLoading={pinLoading}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          actionLoading={actionLoading}
          handleBulkAction={handleBulkAction}
          setSelectedTemplates={setSelectedTemplates}
        />
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={selectedTemplate}
        action={selectedAction}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        onConfirm={confirmStatusChange}
        actionLoading={actionLoading}
      />

      {/* Template Details Modal */}
      <TemplateDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        template={selectedTemplateDetails}
        handleStatusChange={handleStatusChange}
        formatDate={formatDate}
      />
    </div>
  );
}
