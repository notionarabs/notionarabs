'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';

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
    }
  };

  const handleStatusChange = (template, action) => {
    setSelectedTemplate(template);
    setSelectedAction(action);
    setAdminNotes('');
    setShowModal(true);
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
      alert('حدث خطأ أثناء تحديث حالة القالب');
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
            <button
              onClick={() => router.push('/admin')}
              className="btn-outline"
            >
              العودة للوحة الإدارة
            </button>
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

        {/* Templates Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
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
                      <div className="flex items-center">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                      {template.price} ريال
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
                        <a
                          href={template.notionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          عرض
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
    </div>
  );
}
