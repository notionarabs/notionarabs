'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import api from '../../lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [isLoading, setIsLoading] = useState(true);
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
    <div>
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {/* Page Header */}
        <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-20 md:py-24 overflow-hidden">
          <div className="container-custom text-center relative z-10">
            <h1 className="heading-1 text-white mb-4">الإعدادات</h1>
            <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto mb-8">
              إدارة إعدادات حسابك وتفضيلاتك الشخصية
            </p>
          </div>
          {/* Background shapes */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute w-60 h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute w-60 h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute w-60 h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">

            <div className="max-w-4xl mx-auto space-y-8">

              {/* Notification Settings */}
              <div className="card-interactive p-8">
                <h2 className="heading-3 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V9a7.5 7.5 0 0115 0v8z" />
                    </svg>
                  </div>
                  إعدادات الإشعارات
                </h2>

                <div className="space-y-6">
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
                      className={`
                          relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                          ${settings.notifications
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg'
                          : 'bg-gray-300 hover:bg-gray-400 dark:bg-dark-tertiary'
                        }
                        `}
                      aria-label={`${settings.notifications ? 'Disable' : 'Enable'} notifications`}
                    >
                      {/* Toggle Circle */}
                      <div
                        className={`
                            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
                            transition-all duration-300 ease-in-out transform
                            ${settings.notifications
                            ? 'ltr:translate-x-6 rtl:-translate-x-[1.6rem]'
                            : 'ltr:translate-x-0.5 rtl:-translate-x-0.5'
                          }
                          `}
                      >
                        {/* Icon inside the circle */}
                        <div className="flex items-center justify-center w-full h-full">
                          {settings.notifications ? (
                            <svg
                              className="w-3 h-3 text-primary-500 transition-all duration-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              {/* Bell icon */}
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-600 transition-all duration-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              {/* Bell slash icon */}
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Background gradient overlay for active state */}
                      {settings.notifications && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/20 to-primary-600/20"></div>
                      )}
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
                      className={`
                          relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                          ${settings.emailUpdates
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg'
                          : 'bg-gray-300 hover:bg-gray-400 dark:bg-dark-tertiary'
                        }
                        `}
                      aria-label={`${settings.emailUpdates ? 'Disable' : 'Enable'} email updates`}
                    >
                      {/* Toggle Circle */}
                      <div
                        className={`
                            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
                            transition-all duration-300 ease-in-out transform
                            ${settings.emailUpdates
                            ? 'ltr:translate-x-6 rtl:-translate-x-[1.6rem]'
                            : 'ltr:translate-x-0.5 rtl:-translate-x-0.5'
                          }
                          `}
                      >
                        {/* Icon inside the circle */}
                        <div className="flex items-center justify-center w-full h-full">
                          {settings.emailUpdates ? (
                            <svg
                              className="w-3 h-3 text-primary-500 transition-all duration-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              {/* Mail icon */}
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3 text-gray-600 transition-all duration-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              {/* Mail slash icon */}
                              <path fillRule="evenodd" d="M2.94 2.94A2 2 0 014 2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 01.94-1.06zM4 4v10h12V4H4z" clipRule="evenodd" />
                              <path d="M2 4l8 4 8-4" stroke="currentColor" strokeWidth="1" fill="none" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Background gradient overlay for active state */}
                      {settings.emailUpdates && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/20 to-primary-600/20"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="card-interactive p-8">
                <h2 className="heading-3 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  إجراءات الحساب
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="btn-outline text-sm py-3"
                  >
                    تغيير كلمة المرور
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-800"
                  >
                    حذف الحساب
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center">
                <button className="btn-primary py-3 px-8">
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                حذف الحساب نهائياً
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع البيانات المرتبطة به نهائياً، بما في ذلك:
              </p>
              <ul className="text-sm text-gray-600 dark:text-dark-text-secondary space-y-1 mb-4">
                <li>• جميع المقالات التي كتبتها</li>
                <li>• جميع القوالب التي أنشأتها</li>
                <li>• معلومات الملف الشخصي</li>
                <li>• جميع البيانات الأخرى المرتبطة بحسابك</li>
              </ul>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                اكتب "حذف" في المربع أدناه للتأكيد:
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="اكتب حذف هنا"
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
                    <span>جاري الحذف...</span>
                  </div>
                ) : (
                  'حذف نهائياً'
                )}
              </button>
            </div>
          </div>
        </div>
      )
      }

      {/* Change Password Modal */}
      {
        showPasswordModal && (
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
    </div>
  );
}
