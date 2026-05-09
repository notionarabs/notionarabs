'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../lib/api';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Wallet, Share2, Shield } from 'lucide-react';

import ImageUploadSection from './settings/ImageUploadSection';
import UsernameSection from './settings/UsernameSection';
import PersonalInfoSection from './settings/PersonalInfoSection';
import SocialLinksSection from './settings/SocialLinksSection';
import PreferencesSection from './settings/PreferencesSection';
import ModalsSection from './settings/ModalsSection';
import PaymentSettingsSection from './settings/PaymentSettingsSection';

export default function SettingsContent() {
    const router = useRouter();
    const { user, isAuthenticated, loading, logout, ensureTokenInHeaders, refreshUserData } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(null); // 'profile' or 'cover'
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payout' | 'socials' | 'preferences'
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
    const [usernameValidation, setUsernameValidation] = useState({
        isValid: true,
        message: '',
        isChecking: false
    });
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const [profileSettings, setProfileSettings] = useState({
        username: '',
        displayName: '',
        bio: '',
        profilePicture: '',
        backgroundImage: '',
        socialLinks: [],
        allowMessages: true,
        contactEmail: '',
        showTemplateCount: true,
        specialties: [],
        newSpecialty: '',
        payoutMethod: 'vodafone_cash',
        payoutDetails: {}
    });

    useEffect(() => {
        if (!loading && isAuthenticated && user) {
            loadProfileSettings();
        }
    }, [isAuthenticated, loading, user]);

    const loadProfileSettings = async () => {
        try {
            ensureTokenInHeaders();
            const response = await api.get('/auth/profile/settings');
            if (response.data && response.data.success) {
                const profileData = response.data.data;
                setProfileSettings(prev => ({
                    ...prev,
                    ...profileData,
                    username: profileData.username || user?.username || '',
                    displayName: profileData.displayName || user?.name || '',
                    bio: profileData.bio || '',
                    profilePicture: profileData.profilePicture || user?.profilePicture || '',
                    backgroundImage: profileData.backgroundImage || user?.backgroundImage || '',
                    socialLinks: Array.isArray(profileData.socialLinks) ? profileData.socialLinks : [],
                    specialties: Array.isArray(profileData.specialties) ? profileData.specialties : (Array.isArray(user?.specialties) ? user.specialties : [])
                }));
            }
        } catch (error) {
            console.error('Error loading profile settings:', error);
            setProfileSettings(prev => ({
                ...prev,
                username: user?.username || '',
                displayName: user?.name || '',
                bio: user?.bio || '',
                profilePicture: user?.profilePicture || '',
                backgroundImage: user?.backgroundImage || '',
                socialLinks: Array.isArray(user?.socialLinks) ? user.socialLinks : [],
                specialties: Array.isArray(user?.specialties) ? user.specialties : []
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const validateUsername = (username) => {
        const errors = [];
        if (!username || username.trim() === '') {
            errors.push('اسم المستخدم مطلوب');
        } else {
            if (username.length < 3) errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
            if (username.length > 20) errors.push('اسم المستخدم يجب أن يكون أقل من 20 حرف');
            if (!/^[a-z0-9_]+$/.test(username)) errors.push('اسم المستخدم يجب أن يحتوي على أحرف صغيرة وأرقام وشرطة سفلية فقط');
            if (username.startsWith('_') || username.endsWith('_')) errors.push('اسم المستخدم لا يمكن أن يبدأ أو ينتهي بشرطة سفلية');
            if (username.includes('__')) errors.push('اسم المستخدم لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين');

            const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'creator', 'creators', 'template', 'templates', 'blog', 'news', 'home', 'index', 'main', 'app', 'site', 'web', 'online', 'service', 'services'];
            if (reservedUsernames.includes(username.toLowerCase())) errors.push('هذا الاسم محجوز ولا يمكن استخدامه');
        }
        return { isValid: errors.length === 0, message: errors[0] || '', errors };
    };

    const checkUsernameAvailability = async (username) => {
        if (!username || username.trim() === '') {
            setUsernameValidation({ isValid: true, message: '', isChecking: false });
            return;
        }
        const validation = validateUsername(username);
        if (!validation.isValid) {
            setUsernameValidation({ ...validation, isChecking: false });
            return;
        }
        if (username.toLowerCase() === user?.username?.toLowerCase()) {
            setUsernameValidation({ isValid: true, message: 'اسم المستخدم الحالي', isChecking: false });
            return;
        }

        try {
            setUsernameValidation(prev => ({ ...prev, isChecking: true }));
            ensureTokenInHeaders();
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api' : 'http://localhost:5000/api');

            const cleanAxios = axios.create({
                baseURL: API_BASE_URL,
                headers: {
                    'Content-Type': 'application/json',
                    ...(api.defaults.headers.common['Authorization'] && { 'Authorization': api.defaults.headers.common['Authorization'] })
                },
                validateStatus: (status) => status < 500
            });

            const response = await cleanAxios.get(`/auth/check-username/${username}`);
            if (response.status === 200) {
                setUsernameValidation({ isValid: true, message: 'اسم المستخدم متاح', isChecking: false });
            } else {
                const errorMessage = response.data?.message || 'اسم المستخدم غير متاح';
                setUsernameValidation({ isValid: false, message: errorMessage, isChecking: false });
            }
        } catch (error) {
            setUsernameValidation({ isValid: false, message: 'خطأ في التحقق من اسم المستخدم', isChecking: false });
        }
    };

    const handleInputChange = (field, value) => {
        setProfileSettings(prev => ({ ...prev, [field]: value }));
        if (field === 'username') {
            const validation = validateUsername(value);
            if (value.toLowerCase() === user?.username?.toLowerCase()) {
                setUsernameValidation({ isValid: true, message: 'اسم المستخدم الحالي', isChecking: false });
            } else {
                setUsernameValidation({ ...validation, isChecking: validation.isValid && value.trim() !== '' });
            }
        }
    };

    useEffect(() => {
        if (profileSettings.username && isEditingUsername) {
            if (profileSettings.username.toLowerCase() === user?.username?.toLowerCase()) {
                setUsernameValidation({ isValid: true, message: 'اسم المستخدم الحالي', isChecking: false });
                return;
            }
            const validation = validateUsername(profileSettings.username);
            if (validation.isValid) {
                const timeoutId = setTimeout(() => checkUsernameAvailability(profileSettings.username), 500);
                return () => clearTimeout(timeoutId);
            } else {
                setUsernameValidation(prev => ({ ...prev, isChecking: false }));
            }
        }
    }, [profileSettings.username, user?.username, isEditingUsername]);

    const handleImageUpload = async (event, type = 'profile') => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
            return;
        }
        const formData = new FormData();
        const isProfile = type === 'profile';
        formData.append(isProfile ? 'profilePicture' : 'backgroundImage', file);

        try {
            setUploadingImage(isProfile ? 'profile' : 'cover');
            ensureTokenInHeaders();
            const endpoint = isProfile ? '/upload/profile-picture' : '/upload/backgroundImage';
            const response = await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setProfileSettings(prev => ({ ...prev, [isProfile ? 'profilePicture' : 'backgroundImage']: response.data.url }));
            showSuccess(isProfile ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'تم تحديث صورة الغلاف بنجاح');
        } catch (error) {
            showError('حدث خطأ في رفع الصورة');
        } finally {
            setUploadingImage(null);
        }
    };

    const handleSaveUsername = async () => {
        try {
            setIsSavingUsername(true);
            ensureTokenInHeaders();
            if (profileSettings.username === user?.username) {
                showSuccess('لم يتم تغيير اسم المستخدم');
                setIsEditingUsername(false);
                return;
            }
            const validation = validateUsername(profileSettings.username);
            if (!validation.isValid) { showError(validation.message); return; }

            await api.put('/auth/profile/settings', { username: profileSettings.username });
            showSuccess('تم حفظ اسم المستخدم بنجاح!');
            try { await refreshUserData(); } catch { }
            setIsEditingUsername(false);
        } catch (error) {
            showError(error.response?.data?.message || 'حدث خطأ في حفظ اسم المستخدم');
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            ensureTokenInHeaders();
            const cleanedSettings = {
                ...profileSettings,
                socialLinks: (profileSettings.socialLinks || []).filter(link => link.url && link.url.trim()),
                newSpecialty: undefined
            };
            if (!profileSettings.allowMessages || !(profileSettings.contactEmail || '').trim()) {
                delete cleanedSettings.contactEmail;
            }
            const res = await api.put('/auth/profile/settings', cleanedSettings);
            
            if (res.data?.success) {
                await refreshUserData();
            }

            showSuccess('تم حفظ إعدادات الملف الشخصي بنجاح! 🎉');
            setTimeout(() => router.push('/profile'), 300);
        } catch (error) {
            showError(error.response?.data?.message || 'حدث خطأ في حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        if (passwordErrors[field]) setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleChangePassword = async () => {
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
            showError(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'حذف') { showError('يرجى كتابة "حذف" للتأكيد'); return; }
        try {
            setIsDeleting(true);
            ensureTokenInHeaders();
            const response = await api.delete('/auth/account');
            if (response.data.success) {
                showSuccess('تم حذف حسابك بنجاح');
                setShowDeleteModal(false);
                setTimeout(async () => { await logout(); router.push('/'); }, 1000);
            }
        } catch (error) {
            showError(error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="animate-pulse space-y-8" dir="rtl">
                <div className="h-20 bg-gray-100 dark:bg-dark-tertiary rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 h-96 bg-gray-100 dark:bg-dark-tertiary rounded-3xl"></div>
                    <div className="h-96 bg-gray-100 dark:bg-dark-tertiary rounded-3xl"></div>
                </div>
            </div>
        );
    }

    const isCreator = user?.creatorStatus?.toLowerCase() === 'approved';

    const settingsTabs = [
        { id: 'profile', label: 'المعلومات الشخصية', icon: User },
        ...(isCreator ? [
            { id: 'payout', label: 'إعدادات الدفع والسحب', icon: Wallet },
            { id: 'socials', label: 'شبكات التواصل', icon: Share2 }
        ] : []),
        { id: 'preferences', label: 'الأمان والتفضيلات', icon: Shield },
    ];

    return (
        <div dir="rtl">
            <div className="mb-8 border-none pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">إعدادات الحساب</h1>
                    <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">إدارة بياناتك الشخصية وتفضيلات حسابك في مكان واحد</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-orange-500 dark:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 self-start sm:self-center"
                >
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {isSaving ? 'جاري الحفظ...' : 'حفظ جميع التغييرات'}
                </button>
            </div>

            {/* Premium Horizontal Navigation Tab Bar (Creators Only) */}
            {isCreator && (
                <div className="flex gap-3 border-b border-gray-100 dark:border-white/5 pb-3 overflow-x-auto scrollbar-hide mb-8">
                    {settingsTabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-6 py-3.5 rounded-2xl flex items-center gap-2.5 font-bold text-sm transition-all duration-300 select-none whitespace-nowrap shrink-0 ${
                                    isActive 
                                    ? 'text-primary-600 dark:text-orange-500' 
                                    : 'text-gray-500 dark:text-dark-text-secondary hover:text-gray-800 dark:hover:text-dark-text-primary'
                                }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="activeSettingsTab"
                                        className="absolute inset-0 bg-primary-50 dark:bg-orange-500/10 rounded-2xl"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <tab.icon className={`w-4.5 h-4.5 relative z-10 ${isActive ? 'scale-110' : ''} transition-transform duration-300`} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:gap-8">
                {isCreator ? (
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-dark-secondary border-none rounded-3xl shadow-sm overflow-hidden">
                                    <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-none">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">المعلومات الشخصية</h2>
                                    </div>
                                    <div className="p-6 lg:p-8 space-y-8">
                                        <ImageUploadSection profileSettings={profileSettings} uploadingImage={uploadingImage} handleImageUpload={handleImageUpload} user={user} isCreator={isCreator} />
                                        <div className="h-4"></div>
                                        <UsernameSection
                                            profileSettings={profileSettings}
                                            handleInputChange={handleInputChange}
                                            isEditingUsername={isEditingUsername}
                                            setIsEditingUsername={setIsEditingUsername}
                                            usernameValidation={usernameValidation}
                                            isSavingUsername={isSavingUsername}
                                            handleSaveUsername={handleSaveUsername}
                                            user={user}
                                            setUsernameValidation={setUsernameValidation}
                                        />
                                        <PersonalInfoSection profileSettings={profileSettings} handleInputChange={handleInputChange} isCreator={isCreator} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'payout' && (
                            <motion.div
                                key="payout"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <PaymentSettingsSection profileSettings={profileSettings} handleInputChange={handleInputChange} />
                            </motion.div>
                        )}

                        {activeTab === 'socials' && (
                            <motion.div
                                key="socials"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <SocialLinksSection
                                    profileSettings={profileSettings}
                                    updateSocialLink={(index, value) => setProfileSettings(prev => ({ ...prev, socialLinks: prev.socialLinks.map((l, i) => i === index ? { url: value } : l) }))}
                                    removeSocialLink={(index) => setProfileSettings(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }))}
                                    addSocialLink={() => setProfileSettings(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), { url: '' }] }))}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'preferences' && (
                            <motion.div
                                key="preferences"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                            >
                                <PreferencesSection
                                    profileSettings={profileSettings}
                                    handleInputChange={handleInputChange}
                                    settings={settings}
                                    handleSettingChange={handleSettingChange}
                                    setShowPasswordModal={setShowPasswordModal}
                                    setShowDeleteModal={setShowDeleteModal}
                                    isCreator={isCreator}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="space-y-8">
                        {/* Profile Info Section Card */}
                        <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-[2.5rem] shadow-sm overflow-hidden">
                            <div className="p-6 lg:p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-white/5">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">المعلومات الشخصية</h2>
                            </div>
                            <div className="p-6 lg:p-8 space-y-8">
                                <ImageUploadSection profileSettings={profileSettings} uploadingImage={uploadingImage} handleImageUpload={handleImageUpload} user={user} isCreator={isCreator} />
                                <div className="h-4"></div>
                                <UsernameSection
                                    profileSettings={profileSettings}
                                    handleInputChange={handleInputChange}
                                    isEditingUsername={isEditingUsername}
                                    setIsEditingUsername={setIsEditingUsername}
                                    usernameValidation={usernameValidation}
                                    isSavingUsername={isSavingUsername}
                                    handleSaveUsername={handleSaveUsername}
                                    user={user}
                                    setUsernameValidation={setUsernameValidation}
                                />
                                <PersonalInfoSection profileSettings={profileSettings} handleInputChange={handleInputChange} isCreator={isCreator} />
                            </div>
                        </div>

                        {/* Security and Preferences Card */}
                        <PreferencesSection
                            profileSettings={profileSettings}
                            handleInputChange={handleInputChange}
                            settings={settings}
                            handleSettingChange={handleSettingChange}
                            setShowPasswordModal={setShowPasswordModal}
                            setShowDeleteModal={setShowDeleteModal}
                            isCreator={isCreator}
                        />
                    </div>
                )}
            </div>

            <ModalsSection
                showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                deleteConfirmation={deleteConfirmation} setDeleteConfirmation={setDeleteConfirmation}
                isDeleting={isDeleting} handleDeleteAccount={handleDeleteAccount}
                showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal}
                passwordData={passwordData} handlePasswordChange={handlePasswordChange}
                passwordErrors={passwordErrors} isChangingPassword={isChangingPassword}
                handleChangePassword={handleChangePassword}
                setPasswordData={setPasswordData} setPasswordErrors={setPasswordErrors}
            />
        </div>
    );
}
