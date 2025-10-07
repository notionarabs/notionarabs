'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ExportButton from '../../../components/ExportButton';
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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <div className="container-custom py-12 text-center">
          <LoadingIndicator />
          <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary mt-4">جاري تحميل السجلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary" dir="rtl">
      <main className="container-custom py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 px-4 sm:px-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">سجلات تحميل القوالب</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary">تتبع المستخدمين الذين قاموا بتحميل قوالبك</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => router.back()} className="btn-outline whitespace-nowrap px-3 py-2 h-9 text-sm">
              العودة
            </button>
            <ExportButton
              endpoint={exportEndpoint}
              filename={`${(user?.username || 'creator')}-downloads-${new Date().toISOString().split('T')[0]}.csv`}
              label="تصدير CSV"
              className="whitespace-nowrap px-3 py-2 h-9 text-sm"
              direct={true}
            />
            <div className="relative">
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="form-input appearance-none text-sm h-9 pr-8 pl-8 py-1 w-auto min-w-[160px]"
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
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-card-border">
            <thead className="bg-gray-50 dark:bg-dark-secondary">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-tertiary">المستخدم</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-terتيary">البريد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-terتيary">القالب</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-terتيary">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-dark-text-secondary">لا توجد عمليات تحميل بعد</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-dark-secondary/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text-primary">{r.userName || r.userUsername || 'مستخدم'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">{r.userEmail || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                      {r.previewImage ? (
                        <Image src={r.previewImage} alt={r.templateTitle} width={28} height={28} className="w-7 h-7 rounded object-cover" />
                      ) : (
                        <span className="w-7 h-7 rounded bg-gray-100 dark:bg-dark-tertiary inline-block" />
                      )}
                      <a className="hover:underline" href={`/templates/${r.templateId}`} target="_blank" rel="noreferrer">{r.templateTitle}</a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-dark-text-secondary">{new Date(r.date).toLocaleString('en-US')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button className="btn-outline px-3 py-2 text-sm" onClick={() => handlePageChange(pagination.current - 1)} disabled={pagination.current === 1}>السابق</button>
            <span className="text-sm text-gray-700 dark:text-dark-text-secondary">صفحة {pagination.current} من {pagination.pages}</span>
            <button className="btn-outline px-3 py-2 text-sm" onClick={() => handlePageChange(pagination.current + 1)} disabled={pagination.current === pagination.pages}>التالي</button>
          </div>
        )}
      </main>
    </div>
  );
}


