'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
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

  const handlePasswordChange = async () => {
    setIsChangingPassword(true);
    setPasswordErrors({});

    // Validation
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setIsChangingPassword(false);
      return;
    }

    try {
      // Change password logic here
      showSuccess('تم تغيير كلمة المرور بنجاح');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      showError('حدث خطأ في تغيير كلمة المرور');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'حذف') {
      showError('يرجى كتابة "حذف" للتأكيد');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete account logic here
      showSuccess('تم حذف الحساب بنجاح');
      logout();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      showError('حدث خطأ في حذف الحساب');
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  إعدادات الإشعارات
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        الإشعارات العامة
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تلقي إشعارات حول التحديثات المهمة
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        تحديثات البريد الإلكتروني
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تلقي تحديثات عبر البريد الإلكتروني
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* إجراءات الحساب */}
              <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  إجراءات الحساب
                </h2>
                
                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        تغيير كلمة المرور
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        قم بتحديث كلمة المرور لحسابك
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      تغيير
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <h3 className="text-sm font-medium text-red-900 dark:text-red-400">
                        حذف الحساب
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-500">
                        حذف حسابك نهائياً (لا يمكن التراجع)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
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
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card-bg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              تغيير كلمة المرور
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-card-bg dark:text-white"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-card-bg dark:text-white"
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-dark-card-bg dark:text-white"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {isChangingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card-bg rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              حذف الحساب
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع البيانات المرتبطة به نهائياً.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اكتب "حذف" للتأكيد
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-dark-card-bg dark:text-white"
                placeholder="حذف"
              />
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف الحساب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
