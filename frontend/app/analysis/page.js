'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import api from '../../lib/api';
import Image from 'next/image';

export default function AnalysisPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, ensureTokenInHeaders } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [timeRange, setTimeRange] = useState('all'); // all | 7d | 30d | 90d | 1y
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user && user.creatorStatus !== 'approved') {
        router.push('/user-settings');
        return;
      }
      loadData();
    }
  }, [loading, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      ensureTokenInHeaders();

      // Fetch creator templates
      const templatesRes = await api.get('/templates/my-templates');

      setTemplates(Array.isArray(templatesRes.data.templates) ? templatesRes.data.templates : []);
    } catch (e) {
      setError('تعذر تحميل بيانات التحليلات');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (timeRange === 'all') return templates;
    const now = Date.now();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days = daysMap[timeRange] || 0;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return templates.filter((t) => {
      const dateStr = t.approvedAt || t.createdAt || t.updatedAt;
      if (!dateStr) return false;
      const ts = new Date(dateStr).getTime();
      return !Number.isNaN(ts) && ts >= cutoff;
    });
  }, [templates, timeRange]);

  const metrics = useMemo(() => {
    const totalTemplates = filteredTemplates.length;
    const totalViews = filteredTemplates.reduce((sum, t) => sum + (t.views || 0), 0);
    const totalDownloads = filteredTemplates.reduce((sum, t) => sum + (t.downloads || 0), 0);
    const ratings = filteredTemplates.map(t => t.rating || 0).filter(r => r > 0).sort((a, b) => a - b);
    const medianRating = ratings.length === 0
      ? 0
      : (ratings.length % 2 === 0
        ? (ratings[ratings.length / 2 - 1] + ratings[ratings.length / 2]) / 2
        : ratings[Math.floor(ratings.length / 2)]);

    const topByDownloads = [...filteredTemplates].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
    const topByViews = [...filteredTemplates].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

    const totalEarnings = user?.totalEarnings || 0;

    return { totalTemplates, totalViews, totalDownloads, medianRating, topByDownloads, topByViews, totalEarnings };
  }, [filteredTemplates, user?.totalEarnings]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Charts Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-28"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.creatorStatus !== 'approved') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
          <Link
            href="/profile"
            className="group p-2 sm:p-3 hover:bg-white dark:hover:bg-dark-secondary rounded-xl transition-all duration-200 border border-gray-200 dark:border-dark-card-border hover:border-primary-300 dark:hover:border-orange-500/30 hover:shadow-sm flex-shrink-0"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-600 dark:text-orange-400 mb-1 sm:mb-2">تحليلات المبدع</h1>
            <p className="text-sm sm:text-base lg:text-lg text-accent-600 dark:text-dark-text-secondary">كل ما يهمك تتبعه في مكان واحد</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <KpiCard title="إجمالي القوالب" value={metrics.totalTemplates} iconBg="from-primary-500 to-accent-500" />
          <KpiCard title="إجمالي المشاهدات" value={metrics.totalViews} iconBg="from-blue-500 to-indigo-500" />
          <KpiCard title="إجمالي التحميلات" value={metrics.totalDownloads} iconBg="from-emerald-500 to-green-600" />
          <KpiCard title="التقييم الوسيط" value={metrics.medianRating.toFixed(2)} iconBg="from-yellow-500 to-orange-500" />
        </div>

        {/* All Templates with States */}
        <div className="card p-4 sm:p-6 lg:p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            <SectionHeader title="القوالب المعتمدة" />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary whitespace-nowrap">المدة:</label>
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none px-2 sm:px-3 pl-10 sm:pl-12 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-primary hover:border-primary-300 dark:hover:border-orange-400 transition-colors"
                >
                  <option value="all">كل الوقت</option>
                  <option value="7d">آخر 7 أيام</option>
                  <option value="30d">آخر 30 يوم</option>
                  <option value="90d">آخر 90 يوم</option>
                  <option value="1y">آخر سنة</option>
                </select>
                <span className="pointer-events-none absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border text-gray-500 shadow-sm transition-colors">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').length === 0 ? (
            <EmptyState text="لا توجد قوالب معتمدة" />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-600 dark:text-dark-text-secondary">
                      <th className="py-2 pr-2 font-medium">العنوان</th>
                      <th className="py-2 pr-2 font-medium">المشاهدات</th>
                      <th className="py-2 pr-2 font-medium">التحميلات</th>
                      <th className="py-2 pr-2 font-medium">التقييم</th>
                      <th className="py-2 pr-2 font-medium">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-card-border">
                    {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').map((t) => (
                      <tr key={t._id} className="text-gray-900 dark:text-dark-text-primary">
                        <td className="py-3 pr-2 max-w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center flex-shrink-0">
                              {(t.coverImage || t.previewImage) ? (
                                <Image src={t.coverImage || t.previewImage} alt={t.title} width={40} height={40} className="w-10 h-10 object-cover" />
                              ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium line-clamp-1">{t.title}</p>
                              <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{t.category || 'غير مصنف'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-2">{t.views || 0}</td>
                        <td className="py-3 pr-2">{t.downloads || 0}</td>
                        <td className="py-3 pr-2">{(t.rating || 0)} ({t.ratingCount || t.numRatings || t.ratingsCount || 0})</td>
                        <td className="py-3 pr-2">
                          <Link href={`/templates/${t._id}`} className="text-primary-600 dark:text-orange-400 hover:underline">عرض</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredTemplates.filter((t) => (t.status || '').toLowerCase() === 'approved').map((t) => (
                  <div key={t._id} className="p-3 sm:p-4 border border-gray-200 dark:border-dark-card-border rounded-xl bg-gray-50 dark:bg-dark-tertiary hover:border-primary-300 dark:hover:border-orange-400 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-primary flex items-center justify-center flex-shrink-0">
                        {(t.coverImage || t.previewImage) ? (
                          <Image src={t.coverImage || t.previewImage} alt={t.title} width={56} height={56} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-dark-text-primary text-sm sm:text-base mb-1 line-clamp-2">{t.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{t.category || 'غير مصنف'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-dark-card-border">
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-0.5">المشاهدات</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{t.views || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-dark-card-border">
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-0.5">التحميلات</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{t.downloads || 0}</p>
                      </div>
                      <div className="text-center p-2 bg-white dark:bg-dark-secondary rounded-lg border border-gray-200 dark:border-dark-card-border">
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mb-0.5">التقييم</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">{(t.rating || 0)} ({t.ratingCount || t.numRatings || t.ratingsCount || 0})</p>
                      </div>
                    </div>
                    <Link
                      href={`/templates/${t._id}`}
                      className="block w-full text-center py-2 px-4 bg-primary-600 dark:bg-orange-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      عرض القالب
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function KpiCard({ title, value, iconBg }) {
  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-text-tertiary mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-orange-400">{value}</p>
        </div>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r ${iconBg} flex items-center justify-center flex-shrink-0 ml-2`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3v7h6v-7c0-1.657-1.343-3-3-3z" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 dark:text-orange-400">{title}</h2>
    </div>
  );
}

function TemplateRow({ template }) {
  return (
    <div className="py-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center">
        {template.coverImage ? (
          <Image src={template.coverImage} alt={template.title} width={48} height={48} className="w-12 h-12 object-cover" />
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m0 0l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary line-clamp-1">{template.title}</p>
        <div className="text-xs text-gray-500 dark:text-dark-text-tertiary flex items-center gap-3 mt-1">
          <span>مشاهدات: {template.views || 0}</span>
          <span>تحميلات: {template.downloads || 0}</span>
          <span>تقييم: {template.rating || 0}</span>
        </div>
      </div>
      <Link href={`/templates/${template._id}`} className="text-sm text-primary-600 dark:text-orange-400 hover:underline">عرض</Link>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-4 sm:p-6 text-center text-sm sm:text-base text-gray-500 dark:text-dark-text-tertiary border border-dashed border-gray-200 dark:border-dark-card-border rounded-lg sm:rounded-xl">
      {text}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();
  const styles = normalized === 'approved'
    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : normalized === 'pending'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      : normalized === 'rejected'
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  const label = normalized === 'approved'
    ? 'معتمد'
    : normalized === 'pending'
      ? 'قيد المراجعة'
      : normalized === 'rejected'
        ? 'مرفوض'
        : (status || 'غير معروف');

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}


