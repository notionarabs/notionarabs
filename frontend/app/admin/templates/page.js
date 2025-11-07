'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import toast from 'react-hot-toast';
import { Star, Zap, Crown, Award, CheckCircle, Heart, Pin, PinOff } from 'lucide-react';

// Map badge types to Lucide icons
const getBadgeIcon = (badgeType) => {
  const iconMap = {
    'verified': CheckCircle,
    'top-creator': Star,
    'best-creator': Crown,
    'active': Zap,
    'community-favorite': Heart,
    'trusted': Award,
    'special': Star
  };
  return iconMap[badgeType] || Star;
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [pinLoading, setPinLoading] = useState(null);

  const { user, isAuthenticated, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to resolve to avoid redirecting during reload
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchTemplates();
    fetchStats();
  }, [authLoading, isAuthenticated, user, router, selectedStatus, currentPage]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.get(`/admin/templates?status=${selectedStatus}&page=${currentPage}`);
      setTemplates(response.data.templates);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Set empty state if API fails (API endpoint not implemented yet)
      setTemplates([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.get('/admin/template-stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails (API endpoint not implemented yet)
      setStats({
        totalTemplates: 0,
        pendingTemplates: 0,
        approvedTemplates: 0,
        rejectedTemplates: 0
      });
    }
  };

  const handleStatusCardClick = (statusValue) => {
    setCurrentPage(1);
    setSelectedStatus((prev) => {
      if (statusValue === 'all' && prev === 'all') {
        return 'all';
      }
      if (statusValue === prev) {
        return prev;
      }
      return statusValue;
    });
  };


  const handleStatusChange = (template, action) => {
    setSelectedTemplate(template);
    setSelectedAction(action);
    setAdminNotes('');
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

      // Clear selections and close bulk actions panel
      setSelectedTemplates([]);
      setBulkAction('');
      setAdminNotes('');
      setShowBulkActions(false);

      // Refresh templates and stats to get the updated data from server
      await fetchTemplates();
      await fetchStats();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('حدث خطأ أثناء تنفيذ الإجراء الجماعي');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedTemplate || !selectedAction) return;

    setActionLoading(true);
    try {
      await api.put(`/admin/templates/${selectedTemplate._id}/status`, {
        status: selectedAction,
        adminNotes
      });

      // Close modal first
      setShowModal(false);
      setSelectedTemplate(null);
      setSelectedAction(null);
      setAdminNotes('');

      // Refresh templates and stats to get the updated data from server
      await fetchTemplates();
      await fetchStats();
    } catch (error) {
      console.error('Error updating template status:', error);
      alert('حدث خطأ أثناء تحديث حالة القالب');
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
        toast.success(response.data.message);

        // Update local state immediately to reflect the change
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
        // If response is not successful but no error was thrown
        toast.error(response.data.message || 'حدث خطأ أثناء تثبيت القالب');
      }
    } catch (error) {
      console.error('Error pinning template:', error);
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء تثبيت القالب';
      toast.error(errorMessage);
    } finally {
      setPinLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'موافق عليه', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'مرفوض', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          <div className="container-custom py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex-1 animate-pulse">
                <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
                <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-4 sm:py-6 md:py-8">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 mb-6 sm:mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Templates Table Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-card-border">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="mr-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-24"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="heading-1 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-accent-500 dark:text-dark-text-primary">إدارة القوالب</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                مراجعة وموافقة على القوالب المقدمة من المبدعين
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                العودة للوحة الإدارة
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-4 sm:py-6 md:py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleStatusCardClick('all')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleStatusCardClick('all');
                }
              }}
              className={`bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-200 cursor-pointer select-none ${selectedStatus === 'all'
                ? 'border-primary-400 dark:border-orange-400 shadow-md'
                : 'border-gray-200 dark:border-dark-card-border hover:border-primary-300 dark:hover:border-orange-400/60'
              } p-4 sm:p-6`}
            >
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">إجمالي القوالب</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-500 dark:text-orange-500">{stats.totalTemplates}</p>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleStatusCardClick('pending')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleStatusCardClick('pending');
                }
              }}
              className={`bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-200 cursor-pointer select-none ${selectedStatus === 'pending'
                ? 'border-yellow-400 shadow-md'
                : 'border-gray-200 dark:border-dark-card-border hover:border-yellow-300 dark:hover:border-yellow-500/60'
              } p-4 sm:p-6`}
            >
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">قيد المراجعة</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-500">{stats.pendingTemplates}</p>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleStatusCardClick('approved')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleStatusCardClick('approved');
                }
              }}
              className={`bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-200 cursor-pointer select-none ${selectedStatus === 'approved'
                ? 'border-green-400 shadow-md'
                : 'border-gray-200 dark:border-dark-card-border hover:border-green-300 dark:hover:border-green-500/60'
              } p-4 sm:p-6`}
            >
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">موافق عليها</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500">{stats.approvedTemplates}</p>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleStatusCardClick('rejected')}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleStatusCardClick('rejected');
                }
              }}
              className={`bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border transition-colors duration-200 cursor-pointer select-none ${selectedStatus === 'rejected'
                ? 'border-red-400 shadow-md'
                : 'border-gray-200 dark:border-dark-card-border hover:border-red-300 dark:hover:border-red-500/60'
              } p-4 sm:p-6`}
            >
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">مرفوضة</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500">{stats.rejectedTemplates}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                تصفية حسب الحالة
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">موافق عليها</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTemplates.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                  تم تحديد {selectedTemplates.length} قالب
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-xs sm:text-sm"
                >
                  إجراءات جماعية
                </button>
              </div>
              <button
                onClick={() => setSelectedTemplates([])}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline text-center sm:text-right"
              >
                إلغاء التحديد
              </button>
            </div>

            {showBulkActions && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  >
                    <option value="">اختر الإجراء</option>
                    <option value="approve">موافقة</option>
                    <option value="reject">رفض</option>
                  </select>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="ملاحظات الإدارة (اختياري)"
                    rows={2}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  />
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || actionLoading}
                    className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'جاري المعالجة...' : 'تطبيق'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Table */}
        <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === templates.length && templates.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">القالب</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">المبدع</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الفئة</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">السعر</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الحالة</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">التاريخ</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-card-border">
                {templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary">
                    <td className="px-4 sm:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template._id)}
                        onChange={() => handleSelectTemplate(template._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Preview Image */}
                        <div className="flex-shrink-0">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={`معاينة ${template.title}`}
                              className="w-12 h-10 sm:w-16 sm:h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-12 h-10 sm:w-16 sm:h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Template Info */}
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                            {template.title}
                          </div>
                          <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary truncate max-w-xs">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {template.tags && template.tags.length > 0 && (
                              <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                                {template.tags.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={`صورة ${template.creator.name}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              quality={100}
                            />
                          ) : (
                            <span className="text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm">
                              {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          )}
                        </div>
                        <div className="mr-2 sm:mr-3">
                          <div className="text-xs sm:text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                            {template.creator?.name}
                          </div>
                          <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                            {template.creator?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      {template.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {template.price} ر.س
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">مجاني</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(template.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                      {formatDate(template.createdAt)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 sm:gap-2">
                        {/* Badges Display */}
                        {template.badges && template.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.badges.map((badge) => {
                              const BadgeIcon = getBadgeIcon(badge.type);
                              return (
                                <span
                                  key={badge._id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-orange-500/10 border border-primary-200 dark:border-orange-500/20 text-primary-700 dark:text-orange-400"
                                >
                                  <BadgeIcon className="w-3 h-3" strokeWidth={2} />
                                  <span>{badge.label}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Pin/Unpin button */}
                        <button
                          type="button"
                          onClick={() => handlePinTemplate(template._id)}
                          disabled={pinLoading === template._id}
                          className={`flex items-center gap-1 justify-center font-medium py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200 ${template.isPinned
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                            : 'bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary'
                            }`}
                        >
                          {pinLoading === template._id ? (
                            <span className="loading-spinner w-3 h-3"></span>
                          ) : template.isPinned ? (
                            <PinOff className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <Pin className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                          {template.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
                        </button>

                        {/* View Details button (always available) */}
                        <button
                          onClick={() => handleViewDetails(template)}
                          className="bg-white dark:bg-dark-secondary border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                        >
                          عرض التفاصيل
                        </button>

                        {/* Status-specific actions */}
                        {template.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(template, 'approved')}
                              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleStatusChange(template, 'rejected')}
                              className="bg-white dark:bg-dark-secondary border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        {template.status === 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(template, 'approved')}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                          >
                            موافقة
                          </button>
                        )}
                        {template.status === 'approved' && (
                          <button
                            onClick={() => handleStatusChange(template, 'rejected')}
                            className="bg-white dark:bg-dark-secondary border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-1 sm:py-2 px-2 sm:px-3 rounded text-xs sm:text-sm transition-colors duration-200"
                          >
                            رفض
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {templates.map((template) => (
              <div key={template._id} className="border-b border-gray-200 dark:border-dark-card-border p-4">
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template._id)}
                    onChange={() => handleSelectTemplate(template._id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Preview Image */}
                      <div className="flex-shrink-0">
                        {template.previewImage ? (
                          <img
                            src={template.previewImage}
                            alt={`معاينة ${template.title}`}
                            className="w-12 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-10 bg-gray-100 dark:bg-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-accent-500 dark:text-dark-text-primary mb-1">
                          {template.title}
                        </h3>
                        <p className="text-xs text-accent-600 dark:text-dark-text-secondary line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={`صورة ${template.creator.name}`}
                              width={24}
                              height={24}
                              className="w-full h-full object-cover"
                              quality={100}
                            />
                          ) : (
                            <span className="text-primary-600 dark:text-primary-400 font-medium text-xs">
                              {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-accent-600 dark:text-dark-text-secondary">
                          {template.creator?.name}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary px-2 py-1 rounded-full">
                        {template.category}
                      </span>
                      {template.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {template.price} ر.س
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">مجاني</span>
                      )}
                      {getStatusBadge(template.status)}
                    </div>

                    {/* Badges Display */}
                    {template.badges && template.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.badges.map((badge) => (
                          <span
                            key={badge._id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: badge.color + '20', color: badge.color }}
                          >
                            <span>{badge.icon}</span>
                            <span>{badge.label}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePinTemplate(template._id)}
                        disabled={pinLoading === template._id}
                        className={`flex items-center gap-1 justify-center font-medium py-1 px-2 rounded text-xs transition-colors duration-200 ${template.isPinned
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                          : 'bg-white dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-dark-text-primary'
                          }`}
                      >
                        {pinLoading === template._id ? (
                          <span className="loading-spinner w-3 h-3"></span>
                        ) : template.isPinned ? (
                          <PinOff className="w-3 h-3" />
                        ) : (
                          <Pin className="w-3 h-3" />
                        )}
                        {template.isPinned ? 'إلغاء' : 'تثبيت'}
                      </button>
                      <button
                        onClick={() => handleViewDetails(template)}
                        className="bg-white dark:bg-dark-secondary border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium py-1 px-2 rounded text-xs transition-colors duration-200"
                      >
                        عرض التفاصيل
                      </button>
                      {template.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(template, 'approved')}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-1 px-2 rounded text-xs transition-colors duration-200"
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => handleStatusChange(template, 'rejected')}
                            className="bg-white dark:bg-dark-secondary border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-1 px-2 rounded text-xs transition-colors duration-200"
                          >
                            رفض
                          </button>
                        </>
                      )}
                      {template.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(template, 'approved')}
                          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-1 px-2 rounded text-xs transition-colors duration-200"
                        >
                          موافقة
                        </button>
                      )}
                      {template.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(template, 'rejected')}
                          className="bg-white dark:bg-dark-secondary border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-1 px-2 rounded text-xs transition-colors duration-200"
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-dark-secondary px-4 py-3 border-t border-gray-200 dark:border-dark-card-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary text-center sm:text-right">
                  صفحة {currentPage} من {totalPages}
                </div>
                <div className="flex gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              تأكيد {selectedAction === 'approved' ? 'الموافقة على' : 'رفض'} القالب
            </h3>
            <div className="mb-3 sm:mb-4 p-3 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
              <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                <span className="font-medium">القالب:</span> {selectedTemplate.title}
              </p>
              <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                <span className="font-medium">المبدع:</span> {selectedTemplate.creator?.name}
              </p>

              {/* Preview Image */}
              {selectedTemplate.previewImage && (
                <div className="mt-3">
                  <p className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-secondary mb-2">
                    صورة المعاينة:
                  </p>
                  <img
                    src={selectedTemplate.previewImage}
                    alt={`معاينة ${selectedTemplate.title}`}
                    className="w-full max-w-sm h-32 sm:h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                ملاحظات الإدارة (اختياري)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                placeholder="أضف ملاحظات حول القرار..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                  setSelectedAction(null);
                  setAdminNotes('');
                }}
                className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
                disabled={actionLoading}
              >
                إلغاء
              </button>
              <button
                onClick={confirmStatusChange}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                {actionLoading ? 'جاري المعالجة...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Details Modal */}
      {showDetailsModal && selectedTemplateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-accent-500 dark:text-dark-text-primary">
                تفاصيل القالب
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTemplateDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Template Info */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-3 sm:p-4">
                  <h4 className="text-sm sm:text-base font-semibold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">معلومات القالب</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-secondary">العنوان:</span>
                      <p className="text-sm sm:text-base text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الوصف:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الفئة:</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-full">
                        {selectedTemplateDetails.category}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">السعر:</span>
                      {selectedTemplateDetails.isPaid ? (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-semibold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            مدفوع - {selectedTemplateDetails.price} ر.س
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 mt-1">مجاني</p>
                      )}
                    </div>
                    {selectedTemplateDetails.tags && selectedTemplateDetails.tags.length > 0 && (
                      <div>
                        <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الكلمات المفتاحية:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplateDetails.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">معلومات المبدع</h4>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden">
                      {selectedTemplateDetails.creator?.profilePicture ? (
                        <Image
                          src={selectedTemplateDetails.creator.profilePicture}
                          alt={`صورة ${selectedTemplateDetails.creator.name}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          quality={100}
                        />
                      ) : (
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-lg">
                          {selectedTemplateDetails.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-accent-500 dark:text-dark-text-primary">
                        {selectedTemplateDetails.creator?.name}
                      </p>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        {selectedTemplateDetails.creator?.email}
                      </p>
                      {selectedTemplateDetails.creator?.bio && (
                        <p className="text-xs text-accent-500 dark:text-dark-text-tertiary mt-1 line-clamp-2">
                          {selectedTemplateDetails.creator.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTemplateDetails.features && (
                  <div className="card p-4">
                    <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">المميزات</h4>
                    <p className="text-accent-500 dark:text-dark-text-primary whitespace-pre-line">
                      {selectedTemplateDetails.features}
                    </p>
                  </div>
                )}

                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">إحصائيات الأداء</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">المشاهدات:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.views || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">التحميلات:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.downloads || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">التقييم:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">
                        {selectedTemplateDetails.rating ? selectedTemplateDetails.rating.toFixed(1) : '0.0'} ⭐
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">عدد المراجعات:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.reviewsCount || 0}</p>
                    </div>
                  </div>
                </div>

                {(selectedTemplateDetails.approvedAt || selectedTemplateDetails.rejectedAt) && (
                  <div className="card p-4">
                    <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">معلومات المراجعة</h4>
                    <div className="space-y-3">
                      {selectedTemplateDetails.approvedAt && (
                        <div>
                          <span className="font-medium text-green-600 dark:text-green-400">تمت الموافقة في:</span>
                          <p className="text-accent-500 dark:text-dark-text-primary">
                            {new Date(selectedTemplateDetails.approvedAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      )}
                      {selectedTemplateDetails.rejectedAt && (
                        <div>
                          <span className="font-medium text-red-600 dark:text-red-400">تم الرفض في:</span>
                          <p className="text-accent-500 dark:text-dark-text-primary">
                            {new Date(selectedTemplateDetails.rejectedAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      )}
                      {selectedTemplateDetails.adminNotes && (
                        <div>
                          <span className="font-medium text-accent-600 dark:text-dark-text-secondary">ملاحظات الإدارة:</span>
                          <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Preview Image */}
              <div className="space-y-6">
                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">صور المعاينة</h4>
                  {selectedTemplateDetails.previewImage ? (
                    <div className="space-y-4">
                      <img
                        src={selectedTemplateDetails.previewImage}
                        alt={`معاينة ${selectedTemplateDetails.title}`}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        الصورة الرئيسية
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 dark:bg-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">لا توجد صورة معاينة</p>
                      </div>
                    </div>
                  )}

                  {selectedTemplateDetails.previewImages && selectedTemplateDetails.previewImages.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium text-accent-600 dark:text-dark-text-secondary mb-3">صور إضافية</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTemplateDetails.previewImages.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`معاينة إضافية ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">روابط</h4>
                  <div className="space-y-3">
                    <a
                      href={selectedTemplateDetails.notionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      عرض قالب نوشن
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTemplateDetails(null);
                }}
                className="btn-outline"
              >
                إغلاق
              </button>
              {selectedTemplateDetails.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleStatusChange(selectedTemplateDetails, 'approved');
                    }}
                    className="btn-primary"
                  >
                    موافقة
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleStatusChange(selectedTemplateDetails, 'rejected');
                    }}
                    className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                  >
                    رفض
                  </button>
                </>
              )}
              {selectedTemplateDetails.status === 'rejected' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleStatusChange(selectedTemplateDetails, 'approved');
                  }}
                  className="btn-primary"
                >
                  موافقة
                </button>
              )}
              {selectedTemplateDetails.status === 'approved' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleStatusChange(selectedTemplateDetails, 'rejected');
                  }}
                  className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                >
                  رفض
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
