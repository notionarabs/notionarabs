export default function PersonalInfoSection({ profileSettings, handleInputChange, isCreator = false }) {
    return (
        <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-3">
                <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    الاسم المعروض
                </label>
                <input
                    type="text"
                    value={profileSettings.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-5 py-3.5 bg-gray-50/70 dark:bg-dark-tertiary border border-gray-100 dark:border-white/5 rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 transition-all duration-300 shadow-sm outline-none"
                    placeholder="أدخل اسمك المعروض"
                />
            </div>

            {isCreator && (
                <div className="space-y-3">
                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        نبذة شخصية
                    </label>
                    <textarea
                        value={profileSettings.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50/70 dark:bg-dark-tertiary border border-gray-100 dark:border-white/5 rounded-2xl text-gray-900 dark:text-dark-text-primary font-medium placeholder-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 transition-all duration-300 min-h-[140px] resize-none shadow-sm outline-none"
                        rows={4}
                        placeholder="اكتب نبذة عن نفسك ومهاراتك..."
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                            {(profileSettings.bio || '').length}/500 حرف
                        </p>
                        <div className={`text-xs ${(profileSettings.bio || '').length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                            {(profileSettings.bio || '').length > 450 ? 'اقتربت من الحد الأقصى' : ''}
                        </div>
                    </div>
                </div>
            )}

            {/* Specialties / Notion Interests (Only for Creators) */}
            {isCreator && (
                <div className="space-y-4">
                    <label className="text-sm font-black text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {isCreator ? 'المجالات والاهتمامات' : 'اهتماماتك ومجالات استخدامك لنوشن'}
                    </label>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {(profileSettings.specialties || []).map((specialty, index) => (
                            <span
                                key={index}
                                className="group inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-primary text-sm font-bold rounded-xl border-none hover:bg-primary-50 dark:hover:bg-orange-950/20 transition-all duration-300 shadow-sm"
                            >
                                {specialty}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newSpecialties = profileSettings.specialties.filter((_, i) => i !== index);
                                        handleInputChange('specialties', newSpecialties);
                                    }}
                                    className="text-gray-400 group-hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={profileSettings.newSpecialty || ''}
                            onChange={(e) => handleInputChange('newSpecialty', e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (profileSettings.newSpecialty && profileSettings.newSpecialty.trim()) {
                                        const newSpecialties = [...(profileSettings.specialties || []), profileSettings.newSpecialty.trim()];
                                        handleInputChange('specialties', newSpecialties);
                                        handleInputChange('newSpecialty', '');
                                    }
                                }
                            }}
                            className="flex-1 px-5 py-3.5 bg-gray-50/70 dark:bg-dark-tertiary border border-gray-100 dark:border-white/5 rounded-2xl text-gray-900 dark:text-dark-text-primary font-bold placeholder-gray-400 focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 transition-all duration-300 shadow-sm outline-none"
                            placeholder={isCreator ? 'أضف مجال جديد (نوشن، تصميم...)' : 'أضف اهتماماً (دراسة، تنظيم شخصي، إدارة أعمال...)'}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (profileSettings.newSpecialty && profileSettings.newSpecialty.trim()) {
                                    const newSpecialties = [...(profileSettings.specialties || []), profileSettings.newSpecialty.trim()];
                                    handleInputChange('specialties', newSpecialties);
                                    handleInputChange('newSpecialty', '');
                                }
                            }}
                            className="px-6 py-3.5 bg-primary-500 dark:bg-orange-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all duration-300 shadow-sm border-none cursor-pointer"
                        >
                            إضافة
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
