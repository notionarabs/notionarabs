'use client';

import { useAuth } from '../contexts/AuthContext';
import { useMaintenance } from '../contexts/MaintenanceContext';

export default function MaintenanceMode() {
  const { user, isAuthenticated } = useAuth();
  const { isMaintenanceMode, loading } = useMaintenance();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-primary z-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحقق من حالة الموقع...</p>
        </div>
      </div>
    );
  }

  // Don't show maintenance page if not in maintenance mode
  if (!isMaintenanceMode) {
    return null;
  }

  // Don't show maintenance page to admins
  if (isAuthenticated && user?.role === 'admin') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-dark-primary z-50 flex items-center justify-center" dir="rtl">
      <div className="max-w-md mx-auto text-center p-8">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-orange-400 mb-2">
            عرب نوشن
          </h1>
          <div className="w-16 h-1 bg-primary-600 dark:bg-orange-400 mx-auto rounded"></div>
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* Maintenance Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-4">
            الموقع في وضع الصيانة
          </h2>
          <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed">
            نقوم حالياً بإجراء بعض التحسينات على الموقع لخدمتكم بشكل أفضل.
            سنعود قريباً مع تجربة محسنة!
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-accent-900 dark:text-dark-text-primary mb-3">
            للاستفسارات أو المساعدة
          </h3>
          <div className="space-y-2 text-sm text-accent-600 dark:text-dark-text-secondary">
            <p>📧 البريد الإلكتروني: support@notionarabs.com</p>
            <p>📱 الهاتف: +201050505673</p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          إعادة تحميل الصفحة
        </button>

        {/* Footer */}
        <div className="mt-8 text-xs text-accent-500 dark:text-dark-text-tertiary">
          <p>© 2025 عرب نوشن. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
