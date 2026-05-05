import Image from 'next/image';

export default function ImageUploadSection({ profileSettings, uploadingImage, handleImageUpload, user }) {
    return (
        <div className="relative mb-8 group">
            {/* Cover Image */}
            <div className="relative h-48 w-full bg-gray-100 dark:bg-dark-tertiary rounded-xl overflow-hidden group/cover">
                <Image
                    src={profileSettings.backgroundImage || '/images/default-cover.png'}
                    alt="صورة الغلاف"
                    fill
                    className="object-cover transition-transform duration-500 group-hover/cover:scale-105"
                />


                {/* Cover Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <label
                        htmlFor="cover-image-upload"
                        className="cursor-pointer px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/50 rounded-lg text-white font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                    >
                        {uploadingImage === 'cover' ? (
                            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        )}
                        <span>{uploadingImage === 'cover' ? 'جاري الرفع...' : 'تغيير الغلاف'}</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                        className="hidden"
                        id="cover-image-upload"
                    />
                </div>
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-10 right-6 sm:right-8">
                <div className="relative group/profile">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-white dark:bg-dark-secondary shadow-lg">
                        {profileSettings.profilePicture ? (
                            <Image
                                src={profileSettings.profilePicture}
                                alt="صورة الملف الشخصي"
                                width={112}
                                height={112}
                                className="w-full h-full rounded-xl object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                                <span className="text-3xl sm:text-4xl font-black text-white">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <label
                        htmlFor="profile-picture-upload"
                        className="absolute -bottom-2 -right-2 w-9 h-9 bg-white dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border shadow-lg flex items-center justify-center text-gray-500 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-orange-400 hover:scale-110 cursor-pointer transition-all"
                    >
                        {uploadingImage === 'profile' ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        )}
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        className="hidden"
                        id="profile-picture-upload"
                    />
                </div>
            </div>
        </div>
    );
}
