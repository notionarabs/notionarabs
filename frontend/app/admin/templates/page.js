'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import ExportButton from '../../../components/ExportButton';

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

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
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
  }, [isAuthenticated, user, router, selectedStatus, currentPage]);

  const fetchTemplates = async () => {
    try {
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

      // Refresh templates
      await fetchTemplates();
      await fetchStats();

      setSelectedTemplates([]);
      setBulkAction('');
      setAdminNotes('');
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      // Silently fail - API endpoint not implemented yet
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

      // Refresh templates
      await fetchTemplates();
      await fetchStats();

      setShowModal(false);
      setSelectedTemplate(null);
      setSelectedAction(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating template status:', error);
      // Silently fail - API endpoint not implemented yet
    } finally {
      setActionLoading(false);
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

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      beginner: { label: 'مبتدئ', className: 'bg-blue-100 text-blue-800' },
      intermediate: { label: 'متوسط', className: 'bg-orange-100 text-orange-800' },
      advanced: { label: 'متقدم', className: 'bg-red-100 text-red-800' }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
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
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 mb-2">إدارة القوالب</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                مراجعة وموافقة على القوالب المقدمة من المبدعين
              </p>
            </div>
            <div className="flex gap-3">
              <ExportButton
                endpoint="/templates/export"
                filename={`templates-data-${new Date().toISOString().split('T')[0]}.csv`}
                label="تصدير القوالب"
              />
              <button
                onClick={() => router.push('/admin')}
                className="btn-outline"
              >
                العودة للوحة الإدارة
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">إجمالي القوالب</h3>
              <p className="text-3xl font-bold text-primary-500 dark:text-orange-500">{stats.totalTemplates}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">قيد المراجعة</h3>
              <p className="text-3xl font-bold text-yellow-500">{stats.pendingTemplates}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">موافق عليها</h3>
              <p className="text-3xl font-bold text-green-500">{stats.approvedTemplates}</p>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">مرفوضة</h3>
              <p className="text-3xl font-bold text-red-500">{stats.rejectedTemplates}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                تصفية حسب الحالة
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-input"
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
          <div className="card p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  تم تحديد {selectedTemplates.length} قالب
                </span>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="btn-outline text-sm px-3 py-1"
                >
                  إجراءات جماعية
                </button>
              </div>
              <button
                onClick={() => setSelectedTemplates([])}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                إلغاء التحديد
              </button>
            </div>

            {showBulkActions && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="form-select"
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
                    className="form-input flex-1"
                  />
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || actionLoading}
                    className="btn-primary"
                  >
                    {actionLoading ? 'جاري المعالجة...' : 'تطبيق'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Templates Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === templates.length && templates.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">القالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">المبدع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الفئة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">السعر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-secondary divide-y divide-gray-200 dark:divide-dark-card-border">
                {templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.includes(template._id)}
                        onChange={() => handleSelectTemplate(template._id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Preview Image */}
                        <div className="flex-shrink-0">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={`معاينة ${template.title}`}
                              className="w-16 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-16 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Template Info */}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                            {template.title}
                          </div>
                          <div className="text-sm text-accent-600 dark:text-dark-text-secondary truncate max-w-xs">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getDifficultyBadge(template.difficulty)}
                            {template.tags && template.tags.length > 0 && (
                              <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                                {template.tags.slice(0, 2).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {template.creator?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="mr-3">
                          <div className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                            {template.creator?.name}
                          </div>
                          <div className="text-sm text-accent-600 dark:text-dark-text-secondary">
                            {template.creator?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-600 dark:text-dark-text-secondary">
                      {template.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      مجاني
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(template.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-600 dark:text-dark-text-secondary">
                      {formatDate(template.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {template.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(template, 'approved')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleStatusChange(template, 'rejected')}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewDetails(template)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          تفاصيل
                        </button>
                        <a
                          href={template.notionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          نوشن
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-dark-secondary px-4 py-3 border-t border-gray-200 dark:border-dark-card-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  صفحة {currentPage} من {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-4">
              تأكيد {selectedAction === 'approved' ? 'الموافقة على' : 'رفض'} القالب
            </h3>
            <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                <span className="font-medium">القالب:</span> {selectedTemplate.title}
              </p>
              <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                <span className="font-medium">المبدع:</span> {selectedTemplate.creator?.name}
              </p>

              {/* Preview Image */}
              {selectedTemplate.previewImage && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-accent-600 dark:text-dark-text-secondary mb-2">
                    صورة المعاينة:
                  </p>
                  <img
                    src={selectedTemplate.previewImage}
                    alt={`معاينة ${selectedTemplate.title}`}
                    className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                ملاحظات الإدارة (اختياري)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="form-input"
                placeholder="أضف ملاحظات حول القرار..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTemplate(null);
                  setSelectedAction(null);
                  setAdminNotes('');
                }}
                className="btn-outline"
                disabled={actionLoading}
              >
                إلغاء
              </button>
              <button
                onClick={confirmStatusChange}
                className="btn-primary"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary">
                تفاصيل القالب
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTemplateDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Template Info */}
              <div className="space-y-6">
                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">معلومات القالب</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">العنوان:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الوصف:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.description}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الفئة:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">السعر:</span>
                      <p className="text-green-600 dark:text-green-400">مجاني</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">مستوى الصعوبة:</span>
                      <div className="mt-1">{getDifficultyBadge(selectedTemplateDetails.difficulty)}</div>
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
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">الاسم:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.creator?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-accent-600 dark:text-dark-text-secondary">البريد الإلكتروني:</span>
                      <p className="text-accent-500 dark:text-dark-text-primary">{selectedTemplateDetails.creator?.email}</p>
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
              </div>

              {/* Right Column - Preview Image */}
              <div className="space-y-6">
                <div className="card p-4">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">صورة المعاينة</h4>
                  {selectedTemplateDetails.previewImage ? (
                    <div className="space-y-4">
                      <img
                        src={selectedTemplateDetails.previewImage}
                        alt={`معاينة ${selectedTemplateDetails.title}`}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        تم التقاط هذه الصورة تلقائياً من قالب نوشن
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
                    className="btn-primary bg-green-600 hover:bg-green-700"
                  >
                    موافقة
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleStatusChange(selectedTemplateDetails, 'rejected');
                    }}
                    className="btn-primary bg-red-600 hover:bg-red-700"
                  >
                    رفض
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
