'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ExportButton from '../../../components/ExportButton';
import Navigation from '../../../components/Navigation';
import Cookies from 'js-cookie';

export default function CreatorSalesPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 20 });
  const [templateFilter, setTemplateFilter] = useState('all');

  const fetchDownloads = async (page = 1, templateId) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      if (templateId && templateId !== 'all') params.set('templateId', templateId);
      const res = await api.get(`/creators/me/downloads?${params.toString()}`);
      if (res?.data?.success) {
        setRows(res.data.downloads || []);
        setPagination(res.data.pagination || { current: page, pages: 1, total: 0, limit: 20 });
      } else {
        setRows([]);
      }
    } catch (_) {
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user?.creatorStatus !== 'approved') {
        router.push('/');
        return;
      }
      fetchDownloads(1, templateFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, user, templateFilter]);

  const uniqueTemplates = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      if (!map.has(r.templateId)) {
        map.set(r.templateId, { id: r.templateId, title: r.templateTitle, previewImage: r.previewImage });
      }
    });
    return Array.from(map.values());
  }, [rows]);

  const exportEndpoint = useMemo(() => {
    const params = new URLSearchParams();
    if (templateFilter && templateFilter !== 'all') params.set('templateId', templateFilter);
    const token = Cookies.get('authToken');
    if (token) params.set('token', token);
    const q = params.toString();
    return `/creators/me/downloads/export-public${q ? `?${q}` : ''}`;
  }, [templateFilter]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchDownloads(newPage, templateFilter);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary" dir="rtl">
        <Navigation activePage="profile" />
        <div className="container-custom py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 mb-6 sm:mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
              <div className="w-full sm:w-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Sales Table Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-tertiary">
                  <tr>
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary" dir="rtl">
      <main className="container-custom py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-1 sm:mb-2">
              سجلات تحميل القوالب
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-dark-text-secondary">
              تتبع المستخدمين الذين قاموا بتحميل قوالبك
            </p>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Filter Dropdown */}
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="form-input appearance-none text-xs sm:text-sm h-9 sm:h-10 pr-8 pl-8 py-1 w-full"
              >
                <option value="all">كل القوالب</option>
                {uniqueTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-4 h-4 text-accent-400 dark:text-dark-text-quaternary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 01.92 1.18l-4.25 3.37a.75.75 0 01-.92 0L5.21 8.41a.75.75 0 01.02-1.2z" clipRule="evenodd" />
                </svg>
              </span>
            </div>

            {/* Buttons Group */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ExportButton
                endpoint={exportEndpoint}
                filename={`${(user?.username || 'creator')}-downloads-${new Date().toISOString().split('T')[0]}.csv`}
                label="تصدير"
                className="flex-1 sm:flex-initial whitespace-nowrap px-3 sm:px-4 py-2 h-9 sm:h-10 text-xs sm:text-sm"
                direct={true}
              />
              <button
                onClick={() => router.back()}
                className="btn-outline flex-1 sm:flex-initial whitespace-nowrap px-3 sm:px-4 py-2 h-9 sm:h-10 text-xs sm:text-sm"
              >
                العودة
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Table View - Hidden on Mobile */}
        <div className="hidden md:block card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-card-border">
            <thead className="bg-gray-50 dark:bg-dark-secondary">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">المستخدم</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">البريد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">القالب</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wider">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
                    لا توجد عمليات تحميل بعد
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-dark-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text-primary">
                      {r.userName || r.userUsername || 'مستخدم'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">
                      {r.userEmail || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text-primary">
                      <div className="flex items-center gap-2">
                        {r.previewImage ? (
                          <Image src={r.previewImage} alt={r.templateTitle} width={28} height={28} className="w-7 h-7 rounded object-cover flex-shrink-0" />
                        ) : (
                          <span className="w-7 h-7 rounded bg-gray-100 dark:bg-dark-tertiary inline-block flex-shrink-0" />
                        )}
                        <a className="hover:underline hover:text-accent-500 dark:hover:text-accent-400 transition-colors" href={`/templates/${r.templateId}`} target="_blank" rel="noreferrer">
                          {r.templateTitle}
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary whitespace-nowrap">
                      {new Date(r.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View - Hidden on Desktop */}
        <div className="md:hidden space-y-3">
          {rows.length === 0 ? (
            <div className="card py-8 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
              لا توجد عمليات تحميل بعد
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="card p-4 space-y-3 hover:shadow-md transition-shadow">
                {/* Template Info */}
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-dark-card-border">
                  {r.previewImage ? (
                    <Image
                      src={r.previewImage}
                      alt={r.templateTitle}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded bg-gray-100 dark:bg-dark-tertiary inline-block flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <a
                      className="text-sm font-medium text-gray-900 dark:text-dark-text-primary hover:text-accent-500 dark:hover:text-accent-400 transition-colors block truncate"
                      href={`/templates/${r.templateId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.templateTitle}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                      {new Date(r.date).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary">المستخدم:</span>
                    <span className="text-sm text-gray-900 dark:text-dark-text-primary text-left">
                      {r.userName || r.userUsername || 'مستخدم'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary">البريد:</span>
                    <span className="text-sm text-gray-600 dark:text-dark-text-secondary text-left break-all">
                      {r.userEmail || '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-6">
            <button
              className="btn-outline w-full sm:w-auto px-4 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
            >
              السابق
            </button>
            <span className="text-xs sm:text-sm text-gray-700 dark:text-dark-text-secondary font-medium">
              صفحة {pagination.current} من {pagination.pages}
            </span>
            <button
              className="btn-outline w-full sm:w-auto px-4 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
            >
              التالي
            </button>
          </div>
        )}
      </main>
    </div>
  );
}


