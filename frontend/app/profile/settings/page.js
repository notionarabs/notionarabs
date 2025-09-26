'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import LoadingIndicator from '../../../components/LoadingIndicator';
import Navigation from '../../../components/Navigation';
import Image from 'next/image';
import api from '../../../lib/api';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState({
    isValid: true,
    message: '',
    isChecking: false
  });
  const [profileSettings, setProfileSettings] = useState({
    username: '',
    displayName: '',
    bio: '',
    profilePicture: '',
    socialLinks: [],
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showTemplateCount: true,
    showJoinDate: true
  });

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
    if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }

    // Load profile settings if user is authenticated
    if (!loading && isAuthenticated && user) {
      loadProfileSettings();
    }
  }, [isAuthenticated, loading, user, router]);

  const loadProfileSettings = async () => {
    try {
      ensureTokenInHeaders();
      const response = await api.get('/auth/profile/settings');
      console.log('Profile settings response:', response.data);
      if (response.data && response.data.success) {
        const profileData = response.data.data;
        console.log('Profile data:', profileData);
        setProfileSettings(prev => ({
          ...prev,
          ...profileData,
          username: profileData.username || user?.username || '',
          displayName: profileData.displayName || user?.name || '',
          bio: profileData.bio || '',
          profilePicture: profileData.profilePicture || user?.profilePicture || '',
          socialLinks: Array.isArray(profileData.socialLinks) ? profileData.socialLinks : []
        }));
      }
    } catch (error) {
      console.error('Error loading profile settings:', error);
      // Initialize with user data if API fails
      setProfileSettings(prev => ({
        ...prev,
        username: user?.username || '',
        displayName: user?.name || '',
        bio: user?.bio || '',
        profilePicture: user?.profilePicture || '',
        socialLinks: Array.isArray(user?.socialLinks) ? user.socialLinks : []
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Username validation function
  const validateUsername = (username) => {
    const errors = [];

    if (!username || username.trim() === '') {
      errors.push('اسم المستخدم مطلوب');
    } else {
      if (username.length < 3) {
        errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      }
      if (username.length > 20) {
        errors.push('اسم المستخدم يجب أن يكون أقل من 20 حرف');
      }
      if (!/^[a-z0-9_]+$/.test(username)) {
        errors.push('اسم المستخدم يجب أن يحتوي على أحرف صغيرة وأرقام وشرطة سفلية فقط');
      }
      if (username.startsWith('_') || username.endsWith('_')) {
        errors.push('اسم المستخدم لا يمكن أن يبدأ أو ينتهي بشرطة سفلية');
      }
      if (username.includes('__')) {
        errors.push('اسم المستخدم لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين');
      }
      // Check for reserved usernames
      const reservedUsernames = ['admin', 'api', 'www', 'mail', 'ftp', 'root', 'support', 'help', 'contact', 'about', 'terms', 'privacy', 'login', 'signup', 'register', 'dashboard', 'profile', 'settings', 'account', 'user', 'users', 'creator', 'creators', 'template', 'templates', 'blog', 'news', 'home', 'index', 'main', 'app', 'site', 'web', 'online', 'service', 'services'];
      if (reservedUsernames.includes(username.toLowerCase())) {
        errors.push('هذا الاسم محجوز ولا يمكن استخدامه');
      }
    }

    return {
      isValid: errors.length === 0,
      message: errors[0] || '',
      errors: errors
    };
  };

  // Check username availability
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

    try {
      setUsernameValidation(prev => ({ ...prev, isChecking: true }));
      ensureTokenInHeaders();
      const response = await api.get(`/auth/check-username/${username}`);

      if (response.data.success) {
        if (response.data.available) {
          setUsernameValidation({ isValid: true, message: 'اسم المستخدم متاح', isChecking: false });
        } else {
          setUsernameValidation({ isValid: false, message: 'اسم المستخدم غير متاح', isChecking: false });
        }
      } else {
        setUsernameValidation({ isValid: false, message: 'خطأ في التحقق من اسم المستخدم', isChecking: false });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      if (error.response?.status === 409) {
        setUsernameValidation({ isValid: false, message: 'اسم المستخدم غير متاح', isChecking: false });
      } else {
        setUsernameValidation({ isValid: false, message: 'خطأ في التحقق من اسم المستخدم', isChecking: false });
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileSettings(prev => ({
        ...prev,
        [field]: value
      }));

      // Handle username validation
      if (field === 'username') {
        const validation = validateUsername(value);
        setUsernameValidation({ ...validation, isChecking: false });
      }
    }
  };

  const addSocialLink = () => {
    setProfileSettings(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { url: '' }]
    }));
  };

  const removeSocialLink = (index) => {
    setProfileSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index, value) => {
    setProfileSettings(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { url: value } : link
      )
    }));
  };

  const detectPlatform = (url) => {
    if (!url) return null;
    
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return { name: 'twitter', icon: 'twitter', color: 'text-blue-400' };
    }
    if (urlLower.includes('instagram.com')) {
      return { name: 'instagram', icon: 'instagram', color: 'text-pink-500' };
    }
    if (urlLower.includes('linkedin.com')) {
      return { name: 'linkedin', icon: 'linkedin', color: 'text-blue-600' };
    }
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return { name: 'youtube', icon: 'youtube', color: 'text-red-500' };
    }
    if (urlLower.includes('facebook.com')) {
      return { name: 'facebook', icon: 'facebook', color: 'text-blue-600' };
    }
    if (urlLower.includes('tiktok.com')) {
      return { name: 'tiktok', icon: 'tiktok', color: 'text-black dark:text-white' };
    }
    if (urlLower.includes('snapchat.com')) {
      return { name: 'snapchat', icon: 'snapchat', color: 'text-yellow-500' };
    }
    if (urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
      return { name: 'telegram', icon: 'telegram', color: 'text-blue-500' };
    }
    if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
      return { name: 'discord', icon: 'discord', color: 'text-indigo-500' };
    }
    if (urlLower.includes('github.com')) {
      return { name: 'github', icon: 'github', color: 'text-gray-800 dark:text-gray-200' };
    }
    if (urlLower.includes('behance.net')) {
      return { name: 'behance', icon: 'behance', color: 'text-blue-600' };
    }
    if (urlLower.includes('dribbble.com')) {
      return { name: 'dribbble', icon: 'dribbble', color: 'text-pink-500' };
    }
    
    return { name: 'website', icon: 'website', color: 'text-gray-400' };
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
        </svg>
      ),
      linkedin: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      youtube: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      website: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      )
    };
    
    return icons[platform] || icons.website;
  };

  // Debounced username availability check
  useEffect(() => {
    if (profileSettings.username && profileSettings.username !== user?.username) {
      const validation = validateUsername(profileSettings.username);
      if (validation.isValid) {
        const timeoutId = setTimeout(() => {
          checkUsernameAvailability(profileSettings.username);
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [profileSettings.username, user?.username]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setIsSaving(true);
      ensureTokenInHeaders();
      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfileSettings(prev => ({
        ...prev,
        profilePicture: response.data.url
      }));
      showSuccess('تم تحديث صورة الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('حدث خطأ في رفع الصورة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      ensureTokenInHeaders();

      // Validate username before saving
      if (profileSettings.username && profileSettings.username !== user?.username) {
        const validation = validateUsername(profileSettings.username);
        if (!validation.isValid) {
          showError(validation.message);
          setIsSaving(false);
          return;
        }

        // Check availability one more time
        try {
          const response = await api.get(`/auth/check-username/${profileSettings.username}`);
          if (!response.data.success || !response.data.available) {
            showError('اسم المستخدم غير متاح');
            setIsSaving(false);
            return;
          }
        } catch (error) {
          if (error.response?.status === 409) {
            showError('اسم المستخدم غير متاح');
          } else {
            showError('خطأ في التحقق من اسم المستخدم');
          }
          setIsSaving(false);
          return;
        }
      }

      // Clean up empty social links
      const cleanedSettings = {
        ...profileSettings,
        socialLinks: (profileSettings.socialLinks || []).filter(link => link.url && link.url.trim())
      };

      await api.put('/auth/profile/settings', cleanedSettings);
      showSuccess('تم حفظ إعدادات الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error saving profile settings:', error);

      if (error.response?.data?.errors) {
        // Show specific validation errors
        const firstError = error.response.data.errors[0];
        showError(firstError.msg || 'حدث خطأ في حفظ الإعدادات');
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('حدث خطأ في حفظ الإعدادات');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingIndicator />;
  }

  if (!isAuthenticated || user?.creatorStatus !== 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
      <Navigation />

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/profile"
              className="group p-3 hover:bg-white dark:hover:bg-dark-secondary rounded-xl transition-all duration-200 border border-gray-200 dark:border-dark-card-border hover:border-primary-300 dark:hover:border-orange-500/30 hover:shadow-sm"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="heading-1 mb-2">إعدادات الملف الشخصي</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                إدارة كيفية ظهور ملفك الشخصي للمستخدمين الآخرين
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="card p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="heading-2 text-primary-600 dark:text-orange-400">معلومات الملف الشخصي</h2>
              </div>

              {/* Profile Picture */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-4">
                  صورة الملف الشخصي
                </label>
                <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-dark-primary rounded-xl border border-gray-200 dark:border-dark-card-border">
                  <div className="relative group">
                    {profileSettings.profilePicture ? (
                      <Image
                        src={profileSettings.profilePicture}
                        alt="صورة الملف الشخصي"
                        width={100}
                        height={100}
                        className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-dark-secondary shadow-lg group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                        <span className="text-3xl font-bold text-white">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 dark:bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 dark:bg-orange-500 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-orange-600 transition-colors duration-200 cursor-pointer font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {isSaving ? 'جاري الرفع...' : 'تغيير الصورة'}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mt-2">
                      الحد الأقصى 5 ميجابايت • PNG, JPG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-dark-text-tertiary text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    value={profileSettings.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className={`w-full pl-4 pr-8 py-3 border rounded-xl focus:ring-2 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200 ${usernameValidation.isValid
                      ? 'border-gray-300 dark:border-dark-card-border focus:ring-primary-500 dark:focus:ring-orange-500'
                      : 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                      }`}
                    placeholder="username"
                  />
                  {/* Loading indicator */}
                  {usernameValidation.isChecking && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 dark:border-orange-500"></div>
                    </div>
                  )}
                  {/* Success/Error indicator */}
                  {!usernameValidation.isChecking && profileSettings.username && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {usernameValidation.isValid ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation message */}
                {usernameValidation.message && (
                  <p className={`text-xs mt-2 ${usernameValidation.isValid
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {usernameValidation.message}
                  </p>
                )}

                {/* URL preview */}
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                  سيتم استخدام هذا الاسم في رابط ملفك الشخصي: /creators/{profileSettings.username || profileSettings.email?.split('@')[0] || 'username'}
                </p>

                {/* Username requirements */}
                <div className="mt-3 p-3 bg-gray-50 dark:bg-dark-secondary rounded-lg">
                  <p className="text-xs font-medium text-gray-700 dark:text-dark-text-primary mb-2">متطلبات اسم المستخدم:</p>
                  <ul className="text-xs text-gray-600 dark:text-dark-text-secondary space-y-1">
                    <li>• يجب أن يكون بين 3-20 حرف</li>
                    <li>• أحرف صغيرة وأرقام وشرطة سفلية فقط</li>
                    <li>• لا يمكن أن يبدأ أو ينتهي بشرطة سفلية</li>
                    <li>• لا يمكن أن يحتوي على شرطتين سفليتين متتاليتين</li>
                    <li>• يجب أن يكون فريداً وغير محجوز</li>
                  </ul>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                  الاسم المعروض
                </label>
                <input
                  type="text"
                  value={profileSettings.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                  placeholder="أدخل اسمك المعروض"
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                  نبذة شخصية
                </label>
                <textarea
                  value={profileSettings.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200 resize-none"
                  rows={4}
                  placeholder="اكتب نبذة عن نفسك ومهاراتك..."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                    {profileSettings.bio.length}/500 حرف
                  </p>
                  <div className={`text-xs ${profileSettings.bio.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                    {profileSettings.bio.length > 450 ? 'اقتربت من الحد الأقصى' : ''}
                  </div>
                </div>
              </div>

            </div>

            {/* Social Links */}
            <div className="card p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="heading-2 text-primary-600 dark:text-orange-400">روابط التواصل الاجتماعي</h2>
              </div>

              <div className="space-y-6">
                {/* Social Links List */}
                {(profileSettings.socialLinks || []).map((link, index) => {
                  const platform = detectPlatform(link.url);
                  return (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                          رابط التواصل الاجتماعي
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            {platform ? (
                              <div className={`${platform.color}`}>
                                {getPlatformIcon(platform.icon)}
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
                            className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                            placeholder="https://example.com"
                          />
                        </div>
                        {platform && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-tertiary">
                            تم اكتشاف: {platform.name === 'twitter' ? 'تويتر' : 
                                       platform.name === 'instagram' ? 'إنستغرام' :
                                       platform.name === 'linkedin' ? 'لينكد إن' :
                                       platform.name === 'youtube' ? 'يوتيوب' :
                                       platform.name === 'facebook' ? 'فيسبوك' :
                                       platform.name === 'github' ? 'جيت هاب' :
                                       platform.name === 'website' ? 'موقع إلكتروني' : platform.name}
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200"
                        title="حذف الرابط"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}

                {/* Add Social Link Button */}
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-dashed border-gray-300 dark:border-dark-card-border rounded-xl text-gray-600 dark:text-dark-text-secondary hover:border-primary-500 dark:hover:border-orange-500 hover:text-primary-600 dark:hover:text-orange-400 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">إضافة رابط تواصل اجتماعي</span>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-8">
            {/* Privacy Settings */}
            <div className="card p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="heading-2 text-primary-600 dark:text-orange-400">إعدادات الخصوصية</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      إظهار البريد الإلكتروني
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      السماح للمستخدمين برؤية بريدك الإلكتروني
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileSettings.showEmail}
                      onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      إظهار رقم الهاتف
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      السماح للمستخدمين برؤية رقم هاتفك
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileSettings.showPhone}
                      onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      السماح بالرسائل
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      السماح للمستخدمين بإرسال رسائل لك
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileSettings.allowMessages}
                      onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      إظهار عدد القوالب
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      إظهار عدد القوالب المنشورة في ملفك الشخصي
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileSettings.showTemplateCount}
                      onChange={(e) => handleInputChange('showTemplateCount', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                      إظهار تاريخ الانضمام
                    </label>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      إظهار تاريخ انضمامك للمنصة في ملفك الشخصي
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileSettings.showJoinDate}
                      onChange={(e) => handleInputChange('showJoinDate', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500 dark:peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-accent-600 dark:hover:from-orange-600 dark:hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                جاري الحفظ...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
