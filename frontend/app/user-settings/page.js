'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    profileVisibility: 'public'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }

    // Redirect creators to full settings page
    if (!loading && isAuthenticated && user && user.creatorStatus === 'approved') {
      router.push('/settings');
    }

    // Load user settings if authenticated
    if (!loading && isAuthenticated && user) {
      loadUserSettings();
    }
  }, [isAuthenticated, loading, user, router]);

  const loadUserSettings = async () => {
    try {
      // Load basic user settings
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user settings:', error);
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save user settings
      showSuccess('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'كلمة المرور الجديدة يجب أن تحتوي على حرف صغير وحرف كبير ورقم واحد على الأقل';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await api.post('/auth/change-password', passwordData);

      if (response.data.success) {
        showSuccess('تم تغيير كلمة المرور بنجاح');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      showError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'حذف') {
      showError('يرجى كتابة "حذف" للتأكيد');
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Starting account deletion process...');

      // Debug: Check if token is set
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      console.log('Auth token present:', !!token);
      console.log('API headers:', api.defaults.headers.common);

      // Ensure token is set in headers
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Token set in headers:', api.defaults.headers.common['Authorization']);
      } else {
        throw new Error('No authentication token found');
      }

      const response = await api.delete('/auth/account');

      if (response.data.success) {
        console.log('Account deletion successful');
        showSuccess('تم حذف حسابك بنجاح');
        setShowDeleteModal(false);

        // Small delay to show success message
        setTimeout(async () => {
          // Logout user and redirect to home
          await logout();
          router.push('/');
        }, 1000);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب';
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingIndicator />;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom section-padding text-center">
          <h1 className="heading-1 mb-4">
            يجب تسجيل الدخول للوصول إلى الإعدادات
          </h1>
          <p className="body-large text-accent-600 dark:text-dark-text-secondary">
            يرجى تسجيل الدخول لعرض وتعديل إعداداتك
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              إعدادات الحساب
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إدارة إعدادات حسابك وتفضيلاتك
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* إعدادات الإشعارات */}
              <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V9a7.5 7.5 0 0115 0v8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    إعدادات الإشعارات
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        الإشعارات العامة
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تلقي إشعارات حول الأنشطة المهمة
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        تحديثات البريد الإلكتروني
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تلقي تحديثات منتظمة عبر البريد الإلكتروني
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* إجراءات الحساب */}
              <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    إجراءات الحساب
                  </h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary-500 dark:bg-orange-500 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-orange-600 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    حذف الحساب
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  معلومات الحساب
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الاسم</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الانضمام</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.createdAt ? formatDate(user.createdAt) : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="card-interactive max-w-md w-full mx-4 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                تغيير كلمة المرور
              </h3>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.currentPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-dark-card-border'
                    }`}
                  placeholder="أدخل كلمة المرور الحالية"
                  dir="rtl"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.currentPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
                  لا تتذكر كلمة المرور الحالية؟{' '}
                  <Link
                    href="/forgot-password"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    انقر هنا لإعادة تعيينها
                  </Link>
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.newPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-dark-card-border'
                    }`}
                  placeholder="أدخل كلمة المرور الجديدة"
                  dir="rtl"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.newPassword}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-tertiary">
                  يجب أن تحتوي على 6 أحرف على الأقل مع حرف صغير وحرف كبير ورقم
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${passwordErrors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-dark-card-border'
                    }`}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  dir="rtl"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordErrors({});
                }}
                className="flex-1 btn-outline"
                disabled={isChangingPassword}
              >
                إلغاء
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 btn-primary"
              >
                {isChangingPassword ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري التغيير...</span>
                  </div>
                ) : (
                  'تغيير كلمة المرور'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="card-interactive max-w-md w-full mx-4 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                حذف الحساب نهائياً ⚠️
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed mb-6">
                نحن نأسف لرؤيتك تترك مجتمع عرب نوشن. هذا الإجراء سيمحو حسابك وجميع بياناتك نهائياً ولا يمكن التراجع عنه.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  سيتم حذف البيانات التالية نهائياً:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    الملف الشخصي والمعلومات الشخصية
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    جميع المقالات والمدونات المنشورة
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    جميع القوالب والمحتوى المنشور
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    جميع التقييمات والتعليقات والمتابعات
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    <strong>اقتراح:</strong> يمكنك إيقاف حسابك مؤقتاً بدلاً من حذفه نهائياً. هذا سيمنع الآخرين من رؤية ملفك الشخصي مع الحفاظ على بياناتك.
                  </span>
                </p>
              </div>

              <p className="text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
                لتأكيد الحذف، اكتب <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">حذف</span> في المربع أدناه:
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="اكتب 'حذف' هنا"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 btn-outline"
                disabled={isDeleting}
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'حذف'}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري حذف الحساب...</span>
                  </div>
                ) : (
                  'حذف الحساب نهائياً'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
