'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'عرب نوشن',
    platformDescription: 'منصة قوالب Notion العربية',
    maintenanceMode: false,
    registrationEnabled: true,
    creatorApplicationsEnabled: true,
    autoApproveTemplates: false,
    autoApproveBlogs: false,
    contactInfo: {
      email: 'support@notionarabs.com',
      phone: '+201050505673',
      address: 'القاهرة، جمهورية مصر العربية'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    // Don't do anything while authentication is still loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [isAuthenticated, user, router, authLoading]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Set default settings if API fails (API endpoint not implemented yet)
      setSettings({
        platformName: '',
        platformDescription: '',
        maintenanceMode: false,
        registrationEnabled: true,
        creatorApplicationsEnabled: true,
        autoApproveTemplates: false,
        autoApproveBlogs: false,
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);
      if (response.data.success) {
        showSuccess('تم حفظ الإعدادات بنجاح! 🎉');
        // Update settings with the response data
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('فشل في حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultSettings = {
      platformName: 'عرب نوشن',
      platformDescription: 'منصة قوالب Notion العربية',
      maintenanceMode: false,
      registrationEnabled: true,
      creatorApplicationsEnabled: true,
      autoApproveTemplates: false,
      autoApproveBlogs: false,
      contactInfo: {
        email: 'support@notionarabs.com',
        phone: '+201050505673',
        address: 'القاهرة، جمهورية مصر العربية'
      }
    };
    setSettings(defaultSettings);
    showSuccess('تم إعادة تعيين الإعدادات إلى القيم الافتراضية');
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <LoadingIndicator />
          <p className="loading-text mt-4">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <LoadingIndicator />
          <p className="loading-text mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <div className="text-center">
          <h1 className="heading-2 mb-4">غير مصرح لك بالوصول</h1>
          <p className="body-large">هذه الصفحة مخصصة للمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-white/95 dark:bg-dark-secondary/95 transition-colors duration-300">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary">إعدادات النظام</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mt-1">
                إدارة إعدادات المنصة والتكوين
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                العودة للوحة الإدارة
              </button>
              <button
                onClick={handleResetToDefaults}
                className="w-full sm:w-auto bg-white dark:bg-dark-secondary border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                إعادة تعيين
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <LoadingIndicator small /> : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6 sticky top-24">
              <h3 className="text-base sm:text-lg font-semibold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">أقسام الإعدادات</h3>
              <nav className="space-y-1 sm:space-y-2">
                <a href="#general" className="block px-3 py-2 text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg transition-colors duration-200">
                  الإعدادات العامة
                </a>
                <a href="#content" className="block px-3 py-2 text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg transition-colors duration-200">
                  إدارة المحتوى
                </a>
                <a href="#contact" className="block px-3 py-2 text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg transition-colors duration-200">
                  معلومات التواصل
                </a>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* General Settings */}
            <div id="general" className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">الإعدادات العامة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    اسم المنصة
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleInputChange(null, 'platformName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    وصف المنصة
                  </label>
                  <textarea
                    value={settings.platformDescription}
                    onChange={(e) => handleInputChange(null, 'platformDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${settings.maintenanceMode ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-dark-tertiary'}`}>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                        وضع الصيانة
                        {settings.maintenanceMode && (
                          <span className="ml-2 text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full animate-pulse">
                            🚧 نشط - الموقع مغلق
                          </span>
                        )}
                      </h4>
                      <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                        إيقاف الموقع مؤقتاً للصيانة
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => handleInputChange(null, 'maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Management */}
            <div id="content" className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">إدارة المحتوى</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${settings.registrationEnabled ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-dark-tertiary'}`}>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                      تفعيل التسجيل
                      {settings.registrationEnabled && <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">مفعل</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                      السماح للمستخدمين الجدد بالتسجيل
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.registrationEnabled}
                      onChange={(e) => handleInputChange(null, 'registrationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${settings.creatorApplicationsEnabled ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-dark-tertiary'}`}>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                      طلبات المبدعين
                      {settings.creatorApplicationsEnabled && <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">مفعل</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                      السماح بتقديم طلبات الانضمام كمبدع
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.creatorApplicationsEnabled}
                      onChange={(e) => handleInputChange(null, 'creatorApplicationsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${settings.autoApproveTemplates ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-dark-tertiary'}`}>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                      الموافقة التلقائية على القوالب
                      {settings.autoApproveTemplates && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">مفعل</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                      الموافقة تلقائياً على القوالب الجديدة
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoApproveTemplates}
                      onChange={(e) => handleInputChange(null, 'autoApproveTemplates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${settings.autoApproveBlogs ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-dark-tertiary'}`}>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                      الموافقة التلقائية على المقالات
                      {settings.autoApproveBlogs && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">مفعل</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                      الموافقة تلقائياً على المقالات الجديدة
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoApproveBlogs}
                      onChange={(e) => handleInputChange(null, 'autoApproveBlogs', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>


            {/* Contact Information */}
            <div id="contact" className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">معلومات التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    dir="ltr"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    العنوان
                  </label>
                  <textarea
                    value={settings.contactInfo.address}
                    onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
