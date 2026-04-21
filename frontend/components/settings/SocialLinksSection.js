import SocialIcon from './SocialIcon';
import { detectPlatform, isValidSocialMediaUrl } from '../../lib/socialUtils';

export default function SocialLinksSection({
    profileSettings,
    updateSocialLink,
    removeSocialLink,
    addSocialLink
}) {
    return (
        <div className="bg-white dark:bg-dark-secondary border-none rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-none">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">روابط التواصل</h2>
                </div>
            </div>
            <div className="p-6 lg:p-8 space-y-6">
                {(profileSettings.socialLinks || []).map((link, index) => {
                    const platform = detectPlatform(link.url);
                    const isValid = !link.url || isValidSocialMediaUrl(link.url);
                    const hasError = link.url && !isValid;

                    return (
                        <div key={index} className="flex gap-4">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors">
                                    {hasError ? (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : platform ? (
                                        <div className={`${platform.color}`}>
                                            <SocialIcon platform={platform.icon} />
                                        </div>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="url"
                                    value={link.url || ''}
                                    onChange={(e) => updateSocialLink(index, e.target.value)}
                                    className={`w-full pl-4 pr-12 py-3.5 bg-white dark:bg-dark-tertiary border-none rounded-2xl text-gray-900 dark:text-dark-text-primary font-medium placeholder-gray-400 focus:ring-2 transition-all duration-300 shadow-sm ${hasError
                                        ? 'focus:ring-red-500'
                                        : 'focus:ring-primary-500 dark:focus:ring-orange-500'
                                        }`}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeSocialLink(index)}
                                className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl border-2 border-transparent hover:border-red-100 transition-all duration-300"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    );
                })}

                <button
                    type="button"
                    onClick={addSocialLink}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl text-gray-500 dark:text-dark-text-secondary font-bold hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 hover:bg-primary-50/30 dark:hover:bg-orange-900/10 transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة رابط جديد
                </button>
            </div>
        </div>
    );
}
