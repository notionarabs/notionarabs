'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';

export default function CreatorTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.creatorStatus !== 'approved') {
      router.push('/');
      return;
    }

    fetchTemplates();
  }, [isAuthenticated, user, router, selectedStatus]);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'قيد المراجعة',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        icon: '⏳'
      },
      approved: {
        label: 'موافق عليه',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        icon: '✅'
      },
      rejected: {
        label: 'مرفوض',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        icon: '❌'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        <span className="ml-1">{config.icon}</span>
        {config.label}
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

  if (user?.creatorStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h1 className="heading-1 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary">يجب أن تكون مبدعاً معتمداً للوصول إلى هذه الصفحة</p>
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
              <h1 className="heading-1 mb-2">قوالبك المقدمة</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                تتبع حالة قوالبك المقدمة ومراجعة تفاصيلها
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/templates/create')}
                className="btn-primary"
              >
                إنشاء قالب جديد
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="btn-outline"
              >
                العودة للملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">إجمالي القوالب</h3>
            <p className="text-3xl font-bold text-primary-500 dark:text-orange-500">{templates.length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">قيد المراجعة</h3>
            <p className="text-3xl font-bold text-yellow-500">{templates.filter(t => t.status === 'pending').length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">موافق عليها</h3>
            <p className="text-3xl font-bold text-green-500">{templates.filter(t => t.status === 'approved').length}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-2">مرفوضة</h3>
            <p className="text-3xl font-bold text-red-500">{templates.filter(t => t.status === 'rejected').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                تصفية حسب الحالة
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
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

        {/* Templates List */}
        {filteredTemplates.length > 0 ? (
          <div className="space-y-6">
            {filteredTemplates.map((template) => (
              <div key={template._id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Template Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-accent-500 dark:text-dark-text-primary mb-2">
                          {template.title}
                        </h3>
                        <p className="text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(template.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">الفئة:</span>
                        <span className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">السعر:</span>
                        <span className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                          {template.price} ريال
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDifficultyBadge(template.difficulty)}
                      </div>
                    </div>

                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary text-xs rounded-full">
                            +{template.tags.length - 3} أخرى
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-accent-600 dark:text-dark-text-secondary">
                      <span>تاريخ الإرسال: {formatDate(template.createdAt)}</span>
                      {template.approvedAt && (
                        <span>تاريخ الموافقة: {formatDate(template.approvedAt)}</span>
                      )}
                      {template.rejectedAt && (
                        <span>تاريخ الرفض: {formatDate(template.rejectedAt)}</span>
                      )}
                    </div>

                    {template.adminNotes && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                        <h4 className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                          ملاحظات الإدارة:
                        </h4>
                        <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          {template.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <a
                      href={template.notionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-center"
                    >
                      عرض في نوتيون
                    </a>

                    {template.status === 'pending' && (
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
                            // Add delete functionality here
                          }
                        }}
                        className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                      >
                        حذف القالب
                      </button>
                    )}

                    {template.status === 'rejected' && (
                      <button
                        onClick={() => {
                          // Add edit functionality here
                        }}
                        className="btn-outline"
                      >
                        تعديل القالب
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-dark-text-quaternary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
              {selectedStatus === 'all' ? 'لم تقم بإرسال أي قوالب بعد' : 'لا توجد قوالب بهذه الحالة'}
            </h3>
            <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
              {selectedStatus === 'all'
                ? 'ابدأ بإنشاء قالبك الأول وشاركه مع العالم'
                : 'جرب تغيير فلتر الحالة لعرض قوالب أخرى'
              }
            </p>
            <button
              onClick={() => router.push('/templates/create')}
              className="btn-primary"
            >
              إنشاء قالب جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}