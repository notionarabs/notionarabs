export default function PreferencesSection({
    profileSettings,
    handleInputChange,
    settings,
    handleSettingChange,
    setShowPasswordModal,
    setShowDeleteModal
}) {
    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Privacy Settings */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">الخصوصية</h2>
                </div>
                <div className="p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                        <div>
                            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary leading-none">
                                السماح بالرسائل
                            </label>
                            <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mt-1">تلقي رسائل من المستخدمين</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={profileSettings.allowMessages}
                                onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>

                    {profileSettings.allowMessages && (
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">بريد التواصل</label>
                            <input
                                type="email"
                                value={profileSettings.contactEmail || ''}
                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-card-border rounded-xl text-sm font-bold placeholder-gray-400 focus:border-primary-500 dark:focus:border-orange-500 transition-all duration-300"
                                placeholder="example@email.com"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                        <div>
                            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary leading-none">
                                عدد القوالب
                            </label>
                            <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mt-1">إظهار الإجمالي في ملفك</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={profileSettings.showTemplateCount}
                                onChange={(e) => handleInputChange('showTemplateCount', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">خيارات أخرى</h2>
                </div>
                <div className="p-6 lg:p-8 space-y-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-dark-tertiary border-2 border-gray-100 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary font-bold rounded-2xl hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 transition-all duration-300"
                    >
                        تغيير كلمة المرور
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-dark-tertiary border-2 border-red-50 dark:border-red-900/10 text-red-500 font-bold rounded-2xl hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                        حذف الحساب نهائياً
                    </button>
                </div>
            </div>

            {/* Notifications & Settings */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-dark-card-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">التفضيلات</h2>
                </div>
                <div className="p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">إشعارات النظام</label>
                            <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">تلقي تنبيهات بالأنشطة</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={settings.notifications}
                                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary">بريد التحديثات</label>
                            <p className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary">نشرة دورية للحساب</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer" dir="ltr">
                            <input
                                type="checkbox"
                                checked={settings.emailUpdates}
                                onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
