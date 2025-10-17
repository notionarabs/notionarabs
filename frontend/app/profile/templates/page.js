'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { formatDate } from '../../../lib/dateUtils';
import Navigation from '../../../components/Navigation';
import ExportButton from '../../../components/ExportButton';

export default function CreatorTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.creatorStatus !== 'approved') {
      router.push('/');
      return;
    }

    fetchTemplates();
  }, [authLoading, isAuthenticated, user, router, selectedStatus]);

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

  const getDifficultyBadge = (difficulty) => {
    const difficultyConfig = {
      beginner: { label: 'مبتدئ', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      intermediate: { label: 'متوسط', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      advanced: { label: 'متقدم', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.beginner;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const filteredTemplates = selectedStatus === 'all'
    ? templates
    : templates.filter(template => template.status === selectedStatus);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Elegant Three-Dot Loader */}
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.creatorStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300 px-4 sm:px-0">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">يجب أن تكون مبدعاً معتمداً للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      <Navigation activePage="profile" />
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">قوالبي</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                تتبع حالة قوالبي ومراجعة تفاصيلها
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ExportButton
                endpoint={`/templates/export-public?token=${typeof window !== 'undefined' ? (require('js-cookie').get('authToken') || '') : ''}`}
                filename={`${(user?.username || (user?.email ? user.email.split('@')[0] : 'templates'))}-templates-${new Date().toISOString().split('T')[0]}.csv`}
                label="تصدير قوالبى"
                direct={true}
              />
              <button
                onClick={() => router.push('/templates/create')}
                className="btn-primary text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto text-center"
              >
                إنشاء قالب جديد
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="btn-outline text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto text-center"
              >
                العودة للملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">إجمالي القوالب</h3>
            <p className="text-xl sm:text-3xl font-bold text-primary-500 dark:text-orange-500">{templates.length}</p>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">قيد المراجعة</h3>
            <p className="text-xl sm:text-3xl font-bold text-yellow-500">{templates.filter(t => t.status === 'pending').length}</p>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">موافق عليها</h3>
            <p className="text-xl sm:text-3xl font-bold text-green-500">{templates.filter(t => t.status === 'approved').length}</p>
          </div>
          <div className="card p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">مرفوضة</h3>
            <p className="text-xl sm:text-3xl font-bold text-red-500">{templates.filter(t => t.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                تصفية حسب الحالة
              </label>
              <div className="relative inline-block">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-input appearance-none pr-10 w-full sm:w-auto"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="approved">موافق عليها</option>
                  <option value="rejected">مرفوضة</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-accent-400 dark:text-dark-text-quaternary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 01.92 1.18l-4.25 3.37a.75.75 0 01-.92 0L5.21 8.41a.75.75 0 01.02-1.2z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Templates List */}
        {filteredTemplates.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {filteredTemplates.map((template) => (
              <div key={template._id} className="card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  {/* Image */}
                  <div className="w-full sm:w-32 md:w-48 h-48 sm:h-24 md:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-tertiary flex-shrink-0">
                    {template.previewImage ? (
                      <Image src={template.previewImage} alt={template.title} width={192} height={128} className="w-full h-full object-cover object-[50%_30%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-tertiary">🖼️</div>
                    )}
                  </div>

                  {/* Title + Small description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-accent-500 dark:text-dark-text-primary mb-2">
                      {template.title}
                    </h3>
                    <div className="mb-2 sm:mb-3">
                      {getStatusBadge(template.status)}
                    </div>
                    <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary line-clamp-2">
                      {template.description}
                    </p>

                    {/* Admin Comments */}
                    {template.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-tertiary rounded-lg border-l-4 border-primary-500">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-accent-700 dark:text-dark-text-primary mb-1">
                              ملاحظات الإدارة:
                            </h4>
                            <p className="text-sm text-accent-600 dark:text-dark-text-secondary whitespace-pre-wrap">
                              {template.adminNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                    {/* Default actions */}
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

                    {/* Confirmation actions */}
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
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-dark-text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
              {selectedStatus === 'all' ? 'لم تقم بإرسال أي قوالب بعد' : 'لا توجد قوالب بهذه الحالة'}
            </h3>
            <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-6">
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
      </div>
    </div>
  );
}