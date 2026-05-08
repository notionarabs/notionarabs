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
  const { user, isAuthenticated, loading, logout, ensureTokenInHeaders, refreshUserData } = useAuth();
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

  useEffect(() => {
    if (!loading && isAuthenticated && user && !user.createdAt && refreshUserData) {
      refreshUserData();
    }
  }, [user, isAuthenticated, loading, refreshUserData]);

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
      const validationError = error.response?.data?.errors?.[0]?.msg;
      const errorMessage = validationError || error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
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
    <div className="min-h-screen bg-transparent transition-colors duration-300 relative overflow-x-hidden" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/5 relative z-10">
        <div className="container-custom py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-gray-100/50 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-500">
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-black bg-gradient-to-l from-primary-600 to-primary-400 bg-clip-text text-transparent">
              إعدادات الحساب
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold shadow-large disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
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
        className="container-custom py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Notifications Card */}
          <motion.section variants={itemVariants} className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] shadow-large border-none p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">إعدادات الإشعارات</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-dark-secondary rounded-lg shadow-soft">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">الإشعارات العامة</h3>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-dark-secondary rounded-lg shadow-soft">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">النشرة البريدية</h3>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </motion.section>

          {/* Security Card */}
          <motion.section variants={itemVariants} className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] shadow-large border-none p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-500">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">الأمان والحساب</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.googleId ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border-none shadow-soft text-center select-none">
                  <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.277.614 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.582 1 2 5.582 2 11.24s4.582 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.082-1.355-.22-1.955H12.24z" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-xs">مستمر عبر Google</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal max-w-[200px]">
                    حسابك محمي بالكامل ومصادق عليه عبر حساب Google الخاص بك.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="p-6 flex flex-col items-center justify-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border-none shadow-soft hover:shadow-large transition-all group cursor-pointer active:scale-98"
                >
                  <div className="p-3 bg-primary/10 rounded-full group-hover:scale-110 transition-transform text-primary">
                    <Key className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-200">تغيير كلمة المرور</span>
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-6 flex flex-col items-center justify-center gap-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border-none shadow-soft hover:shadow-large transition-all group cursor-pointer active:scale-98"
              >
                <div className="p-3 bg-red-500/10 rounded-full group-hover:scale-110 transition-transform text-red-500">
                  <Trash2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-red-600 dark:text-red-400">حذف الحساب</span>
              </button>
            </div>
          </motion.section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={itemVariants} className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] shadow-large border-none p-6 sm:p-8 sticky top-28">
            <div className="flex flex-col items-center text-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name || 'User'}
                  className="w-20 h-20 rounded-2xl object-cover shadow-large mb-4 border border-gray-100/50 dark:border-white/5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-large mb-4">
                  {user?.name?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-6">{user?.email}</p>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400">
                  <span>تاريخ الانضمام</span>
                  <span className="font-bold text-gray-900 dark:text-white">{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
                </div>
                {user?.creatorStatus === 'approved' && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl text-sm font-black shadow-soft">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 dark:bg-[#121318]/95 border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">تغيير كلمة المرور</h3>
                </div>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {[
                  { id: 'currentPassword', label: 'كلمة المرور الحالية', show: showCurrentPassword, setShow: setShowCurrentPassword, placeholder: 'أدخل كلمة المرور الحالية' },
                  { id: 'newPassword', label: 'كلمة المرور الجديدة', show: showNewPassword, setShow: setShowNewPassword, placeholder: 'أدخل كلمة المرور الجديدة' },
                  { id: 'confirmPassword', label: 'تأكيد كلمة المرور الجديدة', show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: 'أعد إدخال كلمة المرور الجديدة' }
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.show ? "text" : "password"}
                        value={passwordData[field.id]}
                        onChange={(e) => handlePasswordChange(field.id, e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${passwordErrors[field.id] ? 'border-red-500 focus:ring-red-500/10' : 'border-gray-200 dark:border-white/10'}`}
                        placeholder={field.placeholder}
                        dir="rtl"
                      />
                      <button
                        onClick={() => field.setShow(!field.show)}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        type="button"
                      >
                        {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordErrors[field.id] && <p className="text-xs font-bold text-red-500 mt-1.5">{passwordErrors[field.id]}</p>}
                    
                    {field.id === 'currentPassword' && (
                      <p className="mt-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        هل نسيت كلمة المرور الحالية؟{' '}
                        <Link
                          href="/forgot-password"
                          className="text-primary hover:underline font-bold"
                          onClick={() => setShowPasswordModal(false)}
                        >
                          انقر هنا لإعادة تعيينها
                        </Link>
                      </p>
                    )}

                    {field.id === 'newPassword' && (
                      <p className="mt-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        يجب أن تحتوي على 6 أحرف على الأقل
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                <button 
                  onClick={() => setShowPasswordModal(false)} 
                  className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-98"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all active:scale-98 cursor-pointer"
                >
                  {isChangingPassword ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    'حفظ كلمة المرور'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 dark:bg-[#121318]/95 border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] w-full max-w-md p-6 sm:p-8 overflow-hidden text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">حذف الحساب نهائياً ⚠️</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                هذا الإجراء سيؤدي لحذف جميع بياناتك من مجتمع عرب نوشن نهائياً ولا يمكن التراجع عنه. <br />
                لتأكيد الحذف، اكتب كلمة <span className="font-mono bg-red-500/10 text-red-600 px-2 py-1 rounded-lg">حذف</span> للتأكيد.
              </p>
              
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-3 mb-6 text-center rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-400"
                placeholder="اكتب كلمة 'حذف' هنا"
                dir="rtl"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-98"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== 'حذف'}
                  className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl shadow-lg shadow-red-600/10 transition-all active:scale-98 cursor-pointer"
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الحذف...</span>
                    </div>
                  ) : (
                    'حذف الحساب نهائياً'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
