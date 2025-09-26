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
  const [profileSettings, setProfileSettings] = useState({
    username: '',
    displayName: '',
    bio: '',
    profilePicture: '',
    socialLinks: {
      website: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: ''
    },
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showTemplateCount: true,
    showJoinDate: true,
    customMessage: ''
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
      if (response.data) {
        setProfileSettings(prev => ({
          ...prev,
          ...response.data,
          username: response.data.username || user.username || '',
          displayName: response.data.displayName || user.name || '',
          bio: response.data.bio || '',
          profilePicture: response.data.profilePicture || user.profilePicture || '',
          socialLinks: {
            website: response.data.socialLinks?.website || '',
            twitter: response.data.socialLinks?.twitter || '',
            linkedin: response.data.socialLinks?.linkedin || '',
            instagram: response.data.socialLinks?.instagram || '',
            youtube: response.data.socialLinks?.youtube || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading profile settings:', error);
      // Initialize with user data if API fails
      setProfileSettings(prev => ({
        ...prev,
        displayName: user.name || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      }));
    } finally {
      setIsLoading(false);
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
    }
  };

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

      // Clean up empty social links
      const cleanedSettings = {
        ...profileSettings,
        socialLinks: Object.fromEntries(
          Object.entries(profileSettings.socialLinks).map(([key, value]) => [
            key,
            value && value.trim() ? value.trim() : ''
          ])
        )
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
                    className="w-full pl-4 pr-8 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                    placeholder="username"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                  سيتم استخدام هذا الاسم في رابط ملفك الشخصي: /creators/{profileSettings.username || 'username'}
                </p>
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

              {/* Custom Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                  رسالة مخصصة
                </label>
                <textarea
                  value={profileSettings.customMessage}
                  onChange={(e) => handleInputChange('customMessage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200 resize-none"
                  rows={3}
                  placeholder="رسالة ترحيبية تظهر في ملفك الشخصي..."
                />
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
                  {profileSettings.customMessage.length}/200 حرف
                </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    الموقع الإلكتروني
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={profileSettings.socialLinks.website}
                      onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    تويتر
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={profileSettings.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    لينكد إن
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={profileSettings.socialLinks.linkedin}
                      onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    إنستغرام
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={profileSettings.socialLinks.instagram}
                      onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    يوتيوب
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={profileSettings.socialLinks.youtube}
                      onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="youtube.com/c/channelname"
                    />
                  </div>
                </div>
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

            {/* Profile Visibility */}
            <div className="card p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="heading-2 text-primary-600 dark:text-orange-400">رؤية الملف الشخصي</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="public"
                    checked={profileSettings.profileVisibility === 'public'}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-orange-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="mr-3 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                    عام - مرئي للجميع
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="followers"
                    checked={profileSettings.profileVisibility === 'followers'}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-orange-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="mr-3 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                    للمتابعين فقط
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="profileVisibility"
                    value="private"
                    checked={profileSettings.profileVisibility === 'private'}
                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-orange-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="mr-3 text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                    خاص - مرئي لك فقط
                  </span>
                </label>
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
