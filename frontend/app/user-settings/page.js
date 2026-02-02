'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingIndicator from '../../components/LoadingIndicator';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Mail, Shield, Key, Trash2, Home, User,
  CheckCircle, AlertTriangle, X, Save, Eye, EyeOff
} from 'lucide-react';

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError } = useToast();
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect creators to full settings page
    if (!loading && isAuthenticated && user && user.creatorStatus === 'approved') {
      router.push('/profile?tab=settings');
    }
    if (!loading && isAuthenticated && user) {
      setIsLoading(false);
    }
  }, [isAuthenticated, loading, user, router]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call for now or implement actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccess('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      showError('حدث خطأ في حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'كلمة المرور الحالية مطلوبة';

    if (!passwordData.newPassword) {
      errors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'يجب أن تكون 6 أحرف على الأقل';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsChangingPassword(true);
      const response = await api.post('/auth/change-password', passwordData);
      if (response.data.success) {
        showSuccess('تم تغيير كلمة المرور بنجاح');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
      }
    } catch (error) {
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
      ensureTokenInHeaders();
      const response = await api.delete('/auth/account');
      if (response.data.success) {
        showSuccess('تم حذف حسابك بنجاح');
        setShowDeleteModal(false);
        setTimeout(async () => {
          await logout();
          router.push('/');
        }, 1000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب';
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-card-border">
        <div className="container-custom py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-lg transition-colors text-gray-500">
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-l from-primary-600 to-primary-400 bg-clip-text text-transparent">
              إعدادات الحساب
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95 w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container-custom py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Notifications Card */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">إعدادات الإشعارات</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-dark-secondary rounded-lg shadow-sm">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">الإشعارات العامة</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تلقي تنبيهات حول نشاطك</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-dark-secondary rounded-lg shadow-sm">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">النشرة البريدية</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">آخر الأخبار والتحديثات</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Security Card */}
          <motion.section variants={itemVariants} className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">الأمان والحساب</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="p-4 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-dark-tertiary dark:hover:bg-dark-tertiary/80 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-dark-card-border group"
              >
                <div className="p-3 bg-white dark:bg-dark-secondary rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Key className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">تغيير كلمة المرور</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-4 flex flex-col items-center justify-center gap-3 bg-red-50 hover:bg-red-100/50 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-xl transition-all border border-red-100 dark:border-red-900/30 group"
              >
                <div className="p-3 bg-white dark:bg-dark-secondary rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">حذف الحساب</span>
              </button>
            </div>
          </motion.section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={itemVariants} className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-dark-card-border p-6 sm:p-8 sticky top-28">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {user?.name?.[0].toUpperCase() || 'U'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{user?.email}</p>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-tertiary rounded-xl text-sm">
                  <span className="text-gray-500 dark:text-gray-400">تاريخ الانضمام</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
                </div>
                {user?.creatorStatus === 'approved' && (
                  <div className="flex items-center justify-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    حساب مبدع موثق
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-secondary rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-dark-card-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">تغيير كلمة المرور</h3>
                <button onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { id: 'currentPassword', label: 'كلمة المرور الحالية', show: showCurrentPassword, setShow: setShowCurrentPassword },
                  { id: 'newPassword', label: 'كلمة المرور الجديدة', show: showNewPassword, setShow: setShowNewPassword },
                  { id: 'confirmPassword', label: 'تأكيد كلمة المرور', show: showConfirmPassword, setShow: setShowConfirmPassword }
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.show ? "text" : "password"}
                        value={passwordData[field.id]}
                        onChange={(e) => handlePasswordChange(field.id, e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border ${passwordErrors[field.id] ? 'border-red-300' : 'border-gray-200 dark:border-dark-card-border'} bg-gray-50 dark:bg-dark-tertiary focus:ring-2 focus:ring-primary-500 outline-none`}
                      />
                      <button
                        onClick={() => field.setShow(!field.show)}
                        className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                        type="button"
                      >
                        {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors[field.id] && <p className="text-xs text-red-500 mt-1">{passwordErrors[field.id]}</p>}
                  </div>
                ))}
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3">
                <button onClick={() => setShowPasswordModal(false)} className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-tertiary">إلغاء</button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                >
                  {isChangingPassword ? 'جاري التغيير...' : 'حفظ التغييرات'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-secondary rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">حذف الحساب نهائياً</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  هذا الإجراء سيؤدي لحذف جميع بياناتك ولا يمكن التراجع عنه. <br />
                  يرجى كتابة كلمة <b>"حذف"</b> للتأكيد.
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-4 py-2.5 mb-6 text-center rounded-xl border border-gray-200 dark:border-dark-card-border bg-gray-50 dark:bg-dark-tertiary outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="اكتب كلمة حذف هنا"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-tertiary">إلغاء</button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmation !== 'حذف'}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
                  >
                    {isDeleting ? 'جاري الحذف...' : 'حذف الحساب'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
