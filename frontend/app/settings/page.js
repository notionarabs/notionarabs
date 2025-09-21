'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import ThemeToggle from '../../components/ThemeToggle';

export default function SettingsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    language: 'ar',
    timezone: 'Asia/Riyadh',
    profileVisibility: 'public'
  });

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // Here you would typically save to backend
    console.log(`Setting ${key} changed to:`, value);
  };

  if (loading || isLoading) {
    return <LoadingIndicator />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            يجب تسجيل الدخول للوصول إلى الإعدادات
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            يرجى تسجيل الدخول لعرض وتعديل إعداداتك
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            الإعدادات
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            إدارة إعدادات حسابك وتفضيلاتك الشخصية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                إعدادات الملف الشخصي
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      رؤية الملف الشخصي
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      تحكم في من يمكنه رؤية ملفك الشخصي
                    </p>
                  </div>
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">عام</option>
                    <option value="private">خاص</option>
                    <option value="friends">الأصدقاء فقط</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V9a7.5 7.5 0 0115 0v8z" />
                </svg>
                إعدادات الإشعارات
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      الإشعارات العامة
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      تلقي إشعارات حول الأنشطة المهمة
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-tertiary'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                      تحديثات البريد الإلكتروني
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      تلقي تحديثات منتظمة عبر البريد الإلكتروني
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailUpdates', !settings.emailUpdates)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.emailUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-dark-tertiary'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Language & Region Settings */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                اللغة والمنطقة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    اللغة
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    المنطقة الزمنية
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                    <option value="Europe/London">لندن (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                المظهر
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    الوضع الحالي: {theme === 'dark' ? 'الليلي' : 'النهاري'}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
                إجراءات الحساب
              </h2>

              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg transition-colors duration-200">
                  تغيير كلمة المرور
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg transition-colors duration-200">
                  تصدير البيانات
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200">
                  حذف الحساب
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              حفظ التغييرات
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
