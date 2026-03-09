export default function UsernameSection({
    profileSettings,
    handleInputChange,
    isEditingUsername,
    setIsEditingUsername,
    usernameValidation,
    isSavingUsername,
    handleSaveUsername,
    user,
    setUsernameValidation
}) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                اسم المستخدم
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <span className="font-bold text-lg">@</span>
                    </div>
                    <input
                        type="text"
                        value={profileSettings.username}
                        onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        disabled={!isEditingUsername}
                        className={`w-full pl-4 pr-10 py-3.5 bg-white dark:bg-dark-tertiary border-2 rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:ring-0 transition-all duration-300 ${!isEditingUsername
                            ? 'border-gray-100 dark:border-dark-card-border/50 bg-gray-50/50 dark:bg-dark-tertiary/50 cursor-not-allowed text-gray-500'
                            : usernameValidation.isValid
                                ? 'border-gray-200 dark:border-dark-card-border focus:border-primary-500 dark:focus:border-orange-500'
                                : 'border-red-200 dark:border-red-900/50 focus:border-red-500'
                            }`}
                        placeholder="username"
                    />
                    {usernameValidation.isChecking && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                            <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!usernameValidation.isChecking && profileSettings.username && isEditingUsername && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                            {usernameValidation.isValid ? (
                                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit/Save/Cancel buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                    {!isEditingUsername ? (
                        <button
                            type="button"
                            onClick={() => setIsEditingUsername(true)}
                            className="px-5 py-3.5 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-600 dark:text-dark-text-secondary hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 transition-all duration-300 shadow-sm"
                            title="تعديل اسم المستخدم"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleSaveUsername}
                                disabled={isSavingUsername || !usernameValidation.isValid}
                                className="flex-1 sm:flex-none px-6 py-3.5 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                {isSavingUsername ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>حفظ</span>
                                    </div>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingUsername(false);
                                    handleInputChange('username', user?.username || '');
                                    setUsernameValidation({ isValid: true, message: '', isChecking: false });
                                }}
                                className="flex-1 sm:flex-none px-6 py-3.5 bg-gray-100 dark:bg-dark-secondary text-gray-600 dark:text-dark-text-secondary font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-dark-tertiary transition-all duration-300"
                            >
                                إلغاء
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Validation message - only show while editing */}
            {isEditingUsername && usernameValidation.message && (
                <p className={`text-xs mt-2 ${usernameValidation.isValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {usernameValidation.message}
                </p>
            )}

            {/* URL preview */}
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                سيتم استخدام هذا الاسم في رابط ملفك الشخصي: /creators/{profileSettings.username || user?.email?.split('@')[0] || 'username'}
            </p>

            {/* Username requirements - only show when editing */}
            {isEditingUsername && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-secondary rounded-lg">
                    <p className="text-xs font-medium text-gray-700 dark:text-dark-text-primary mb-2">متطلبات اسم المستخدم:</p>
                    <ul className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-1">
                        <li className="flex items-start gap-2">
                            <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                            <span>يجب أن يكون بين 3-20 حرف</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                            <span>أحرف صغيرة وأرقام وشرطة سفلية فقط</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                            <span>لا يمكن أن يبدأ أو ينتهي بشرطة سفلية</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                            <span>لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary-500 dark:text-orange-400 mt-0.5">•</span>
                            <span>يجب أن يكون فريداً وغير محجوز</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
