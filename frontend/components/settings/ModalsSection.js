import Link from 'next/link';

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
    setPasswordErrors
}) {
    return (
        <>
            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="card-interactive max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
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

                        <div className="mb-4 sm:mb-6">
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="اكتب 'حذف' هنا"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary text-sm sm:text-base focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                dir="rtl"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="flex-1 btn-outline text-sm sm:text-base py-2 sm:py-3"
                                disabled={isDeleting}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmation !== 'حذف'}
                                className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
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

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="card-interactive max-w-md w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
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

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
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
                                className="flex-1 btn-outline text-sm sm:text-base py-2 sm:py-3"
                                disabled={isChangingPassword}
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
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
