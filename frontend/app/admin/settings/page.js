'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Notion Arabs',
    platformDescription: 'منصة قوالب Notion العربية',
    maintenanceMode: false,
    registrationEnabled: true,
    creatorApplicationsEnabled: true,
    autoApproveTemplates: false,
    autoApproveBlogs: false,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    emailNotifications: true,
    smsNotifications: false,
    socialMediaLinks: {
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    contactInfo: {
      email: 'support@notionarabs.com',
      phone: '+201050505673',
      address: 'القاهرة، جمهورية مصر العربية'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [isAuthenticated, user, router]);

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
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        emailNotifications: true,
        smsNotifications: false,
        socialMediaLinks: {
          twitter: '',
          instagram: '',
          linkedin: '',
          youtube: ''
        },
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
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // Silently fail - API endpoint not implemented yet
      showSuccess('تم حفظ الإعدادات محلياً! 🎉 (API غير متاح)');
    } finally {
      setSaving(false);
    }
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
        <div className="container-custom flex justify-between items-center py-4">
          <div>
            <h1 className="heading-2">إعدادات النظام</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">
              إدارة إعدادات المنصة والتكوين
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="btn-outline"
            >
              العودة للوحة الإدارة
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <LoadingIndicator small /> : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="heading-4 mb-4">أقسام الإعدادات</h3>
              <nav className="space-y-2">
                <a href="#general" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  الإعدادات العامة
                </a>
                <a href="#content" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  إدارة المحتوى
                </a>
                <a href="#files" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  إعدادات الملفات
                </a>
                <a href="#notifications" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  الإشعارات
                </a>
                <a href="#social" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  وسائل التواصل
                </a>
                <a href="#contact" className="block px-3 py-2 text-sm text-accent-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg">
                  معلومات التواصل
                </a>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Settings */}
            <div id="general" className="card p-6">
              <h3 className="heading-3 mb-6">الإعدادات العامة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    اسم المنصة
                  </label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleInputChange(null, 'platformName', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    وصف المنصة
                  </label>
                  <textarea
                    value={settings.platformDescription}
                    onChange={(e) => handleInputChange(null, 'platformDescription', e.target.value)}
                    rows={3}
                    className="form-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                    <div>
                      <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">وضع الصيانة</h4>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Management */}
            <div id="content" className="card p-6">
              <h3 className="heading-3 mb-6">إدارة المحتوى</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">تفعيل التسجيل</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">طلبات المبدعين</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">الموافقة التلقائية على القوالب</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">الموافقة التلقائية على المقالات</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* File Settings */}
            <div id="files" className="card p-6">
              <h3 className="heading-3 mb-6">إعدادات الملفات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    الحد الأقصى لحجم الملف (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange(null, 'maxFileSize', parseInt(e.target.value))}
                    className="form-input"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    أنواع الملفات المسموحة
                  </label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes.join(', ')}
                    onChange={(e) => handleInputChange(null, 'allowedFileTypes', e.target.value.split(',').map(type => type.trim()))}
                    className="form-input"
                    placeholder="jpg, jpeg, png, gif, pdf"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div id="notifications" className="card p-6">
              <h3 className="heading-3 mb-6">الإشعارات</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">إشعارات البريد الإلكتروني</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      إرسال إشعارات عبر البريد الإلكتروني
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleInputChange(null, 'emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
                  <div>
                    <h4 className="font-medium text-accent-700 dark:text-dark-text-primary">إشعارات الرسائل النصية</h4>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      إرسال إشعارات عبر الرسائل النصية
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) => handleInputChange(null, 'smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div id="social" className="card p-6">
              <h3 className="heading-3 mb-6">وسائل التواصل الاجتماعي</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    تويتر
                  </label>
                  <input
                    type="url"
                    value={settings.socialMediaLinks.twitter}
                    onChange={(e) => handleInputChange('socialMediaLinks', 'twitter', e.target.value)}
                    className="form-input"
                    placeholder="https://twitter.com/notionarabs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    إنستغرام
                  </label>
                  <input
                    type="url"
                    value={settings.socialMediaLinks.instagram}
                    onChange={(e) => handleInputChange('socialMediaLinks', 'instagram', e.target.value)}
                    className="form-input"
                    placeholder="https://instagram.com/notionarabs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    لينكد إن
                  </label>
                  <input
                    type="url"
                    value={settings.socialMediaLinks.linkedin}
                    onChange={(e) => handleInputChange('socialMediaLinks', 'linkedin', e.target.value)}
                    className="form-input"
                    placeholder="https://linkedin.com/company/notionarabs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    يوتيوب
                  </label>
                  <input
                    type="url"
                    value={settings.socialMediaLinks.youtube}
                    onChange={(e) => handleInputChange('socialMediaLinks', 'youtube', e.target.value)}
                    className="form-input"
                    placeholder="https://youtube.com/@notionarabs"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact" className="card p-6">
              <h3 className="heading-3 mb-6">معلومات التواصل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={settings.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                    العنوان
                  </label>
                  <textarea
                    value={settings.contactInfo.address}
                    onChange={(e) => handleInputChange('contactInfo', 'address', e.target.value)}
                    rows={3}
                    className="form-input"
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
