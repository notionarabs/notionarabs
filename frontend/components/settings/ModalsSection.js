import Link from 'next/link';
import { useState } from 'react';

export default function ModalsSection({
    showDeleteModal,
    setShowDeleteModal,
    deleteConfirmation,
    setDeleteConfirmation,
    isDeleting,
    handleDeleteAccount,
    showPasswordModal,
    setShowPasswordModal,
    passwordData,
    handlePasswordChange,
    passwordErrors,
    isChangingPassword,
    handleChangePassword,
    setPasswordData,
    setPasswordErrors,
    isCreator = false
}) {
    // Password visibility states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordErrors({});
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    return (
        <>
            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-white/95 dark:bg-[#121318]/95 border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto transition-all transform scale-100">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-500 dark:text-red-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                                حذف الحساب نهائياً ⚠️
                            </h3>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                                نحن نأسف لرؤيتك تترك مجتمع عرب نوشن. هذا الإجراء سيمحو حسابك وجميع بياناتك نهائياً ولا يمكن التراجع عنه بأي شكل من الأشكال.
                            </p>
                            
                            <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-2xl p-4 sm:p-5 mb-4">
                                <h4 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    سيتم حذف البيانات التالية نهائياً:
                                </h4>
                                <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300/90 space-y-2.5">
                                    <li className="flex items-center gap-2 font-semibold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        الملف الشخصي والمعلومات الشخصية
                                    </li>
                                    {isCreator && (
                                        <>
                                            <li className="flex items-center gap-2 font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                جميع المقالات والمدونات المنشورة
                                            </li>
                                            <li className="flex items-center gap-2 font-semibold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                جميع القوالب والمحتوى المنشور
                                            </li>
                                        </>
                                    )}
                                    <li className="flex items-center gap-2 font-semibold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        جميع التقييمات والتعليقات والمتابعات
                                    </li>
                                </ul>
                            </div>
                            
                            <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-4 mb-4">
                                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2.5">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="leading-relaxed">
                                        <strong>اقتراح آمن:</strong> يمكنك إيقاف حسابك مؤقتاً بدلاً من حذفه نهائياً. {isCreator ? 'هذا سيخفي ملفك وقوالبك مع الحفاظ التام على بياناتك.' : 'هذا سيخفي ملفك الشخصي مع الحفاظ التام على بياناتك.'}
                                    </span>
                                </p>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                لتأكيد الحذف النهائي، اكتب <span className="font-mono bg-red-500/10 text-red-600 px-2 py-1 rounded-lg">حذف</span> في المربع أدناه:
                            </p>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="اكتب 'حذف' هنا لتأكيد طلبك"
                                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none text-center font-bold transition-all"
                                dir="rtl"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-98"
                                disabled={isDeleting}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmation !== 'حذف'}
                                className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl transition-all active:scale-98 cursor-pointer shadow-lg shadow-red-600/10"
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
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
                    <div className="bg-white/95 dark:bg-[#121318]/95 border border-gray-100 dark:border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto transition-all transform scale-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none">
                                تغيير كلمة المرور
                            </h3>
                        </div>

                        <div className="space-y-5">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    كلمة المرور الحالية
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${passwordErrors.currentPassword
                                            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                                            : 'border-gray-200 dark:border-white/10'
                                            }`}
                                        placeholder="أدخل كلمة المرور الحالية"
                                        dir="rtl"
                                    />
                                    <button
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                        type="button"
                                    >
                                        {showCurrent ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="mt-1.5 text-xs font-bold text-red-500">{passwordErrors.currentPassword}</p>
                                )}
                                <p className="mt-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    هل نسيت كلمة المرور الحالية؟{' '}
                                    <Link
                                        href="/forgot-password"
                                        className="text-primary hover:underline font-bold"
                                        onClick={closePasswordModal}
                                    >
                                        انقر هنا لإعادة تعيينها
                                    </Link>
                                </p>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${passwordErrors.newPassword
                                            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                                            : 'border-gray-200 dark:border-white/10'
                                            }`}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                        dir="rtl"
                                    />
                                    <button
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                        type="button"
                                    >
                                        {showNew ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="mt-1.5 text-xs font-bold text-red-500">{passwordErrors.newPassword}</p>
                                )}
                                <p className="mt-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                    يجب أن تحتوي على 6 أحرف على الأقل
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    تأكيد كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 border rounded-2xl bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all ${passwordErrors.confirmPassword
                                            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500'
                                            : 'border-gray-200 dark:border-white/10'
                                            }`}
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        dir="rtl"
                                    />
                                    <button
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                        type="button"
                                    >
                                        {showConfirm ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1.5 text-xs font-bold text-red-500">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8">
                            <button
                                onClick={closePasswordModal}
                                className="flex-1 px-4 py-3 text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer active:scale-98"
                                disabled={isChangingPassword}
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
                    </div>
                </div>
            )}
        </>
    );
}
