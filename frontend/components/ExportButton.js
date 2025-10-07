'use client';

import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import api from '../lib/api';
import Cookies from 'js-cookie';

const ExportButton = ({
  endpoint,
  filename,
  label = "تصدير البيانات",
  className = "",
  icon = true,
  disabled = false,
  direct = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Direct download (no axios) - best for CSV exports and avoids CORS/auth header issues
      if (direct) {
        const base = api.defaults.baseURL?.replace(/\/$/, '') || '';
        const href = `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

        const a = document.createElement('a');
        a.href = href;
        a.download = filename || `export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showSuccess('تم بدء تنزيل الملف');
        return;
      }

      // Ensure auth header is present (in case the page loaded before context set headers)
      const token = Cookies.get('authToken');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv'
        },
        timeout: 20000
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename || `export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('تم تصدير البيانات بنجاح');
    } catch (error) {
      console.error('Export error:', error);
      // Fallback to direct download if axios fails (handles CORS/server nuances)
      try {
        const base = api.defaults.baseURL?.replace(/\/$/, '') || '';
        const href = `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        const a = document.createElement('a');
        a.href = href;
        a.download = filename || `export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showSuccess('تم بدء تنزيل الملف');
      } catch (_) {
        const msg = error?.response?.status === 403 ? 'غير مصرح لك بتصدير هذه البيانات' : 'فشل في تصدير البيانات';
        showError(msg);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`btn-secondary flex items-center gap-2 ${className}`}
      dir="rtl"
    >
      {isExporting ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          جاري التصدير...
        </>
      ) : (
        <>
          {icon && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {label}
        </>
      )}
    </button>
  );
};

export default ExportButton;
