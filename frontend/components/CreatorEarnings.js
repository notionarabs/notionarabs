'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '../lib/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

const CreatorEarnings = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Load creator stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/creators/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message || 'حدث خطأ في جلب الإحصائيات');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        setError('حدث خطأ في جلب الإحصائيات');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.creatorStatus === 'approved') {
      loadStats();
    }
  }, [user]);

  if (!user || user.creatorStatus !== 'approved') {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
          غير مصرح لك
        </h3>
        <p className="text-gray-500 dark:text-dark-text-tertiary">
          يجب أن تكون مبدعاً معتمداً لعرض الإحصائيات
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          إحصائياتي
        </h2>
        <div className="text-sm text-gray-500 dark:text-dark-text-terتيary">
          آخر تحديث: {formatDate(new Date())}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                إجمالي القوالب
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {stats?.totalTemplates || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                إجمالي التحميلات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {stats?.totalDownloads || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                متوسط التقييم
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Performance */}
      {stats?.topTemplates && stats.topTemplates.length > 0 && (
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
            أفضل القوالب أداءً
          </h3>

          <div className="space-y-3">
            {stats.topTemplates.map((template, index) => (
              <div key={template._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text-primary">{template.title}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                      {template.downloads} تحميل • تقييم {template.rating || 0}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                  {template.downloads} تحميل
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          حول المنصة المجانية
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• جميع القوالب متاحة مجاناً للمستخدمين</p>
          <p>• نحن نؤمن بمشاركة المعرفة والمحتوى العربي</p>
          <p>• يمكنك مشاركة قوالبك مع المجتمع العربي</p>
          <p>• نحتفل بالإبداع والمساهمة في بناء المحتوى العربي</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorEarnings;