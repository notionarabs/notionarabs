'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingIndicator from '../../../components/LoadingIndicator';
import api from '../../../lib/api';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      fetchCreatorProfile();
    }
  }, [username]);

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      // The backend now handles both username and ID lookups in the same route
      const response = await api.get(`/creators/${username}`);
      setCreator(response.data.creator);
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Username being requested:', username);

      if (error.response?.status === 500) {
        setError('خطأ في الخادم - يرجى المحاولة لاحقاً');
      } else if (error.response?.status === 404) {
        setError('المبدع غير موجود');
      } else {
        setError('حدث خطأ في تحميل بيانات المبدع');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="heading-1 mb-4">المبدع غير موجود</h1>
            <p className="body-large text-gray-600 dark:text-dark-text-secondary mb-8">
              لم نتمكن من العثور على المبدع المطلوب
            </p>
            <Link
              href="/creators"
              className="btn-primary"
            >
              تصفح المبدعين
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary transition-colors duration-300">
      <div className="container-custom py-8">
        {/* Profile Header */}
        <div className="card p-8 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {creator.profilePicture ? (
                <Image
                  src={creator.profilePicture}
                  alt={`صورة ${creator.displayName || creator.name}`}
                  width={120}
                  height={120}
                  className="w-30 h-30 rounded-2xl object-cover border-4 border-white dark:border-dark-secondary shadow-lg"
                />
              ) : (
                <div className="w-30 h-30 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {(creator.displayName || creator.name)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              {creator.creatorStatus === 'approved' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="heading-1 text-primary-600 dark:text-orange-400">
                  {creator.displayName || creator.name}
                </h1>
                {/* Show email if username is not custom */}
                {creator.username === creator.email?.split('@')[0] && (
                  <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                    ({creator.email})
                  </span>
                )}
                {creator.creatorStatus === 'approved' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300">
                    مبدع معتمد
                  </span>
                )}
              </div>

              {/* Bio */}
              {creator.bio && (
                <p className="body-large text-gray-700 dark:text-dark-text-secondary mb-4">
                  {creator.bio}
                </p>
              )}

              {/* Custom Message */}
              {creator.customMessage && (
                <div className="bg-primary-50 dark:bg-orange-900/20 border border-primary-200 dark:border-orange-500/20 rounded-xl p-4 mb-4">
                  <p className="text-primary-700 dark:text-orange-300 font-medium">
                    "{creator.customMessage}"
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-dark-text-tertiary">
                {creator.showTemplateCount && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{creator.templateCount || 0} قالب</span>
                  </div>
                )}
                {creator.showJoinDate && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>انضم {new Date(creator.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
                {creator.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{creator.rating.toFixed(1)} تقييم</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-3">
              {creator.showEmail && creator.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-tertiary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{creator.email}</span>
                </div>
              )}
              {creator.showPhone && creator.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-text-tertiary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0  24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{creator.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {creator.socialLinks && Object.values(creator.socialLinks).some(link => link) && (
          <div className="card p-6 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm mb-8">
            <h2 className="heading-2 mb-6 text-primary-600 dark:text-orange-400">روابط التواصل</h2>
            <div className="flex flex-wrap gap-4">
              {creator.socialLinks.website && (
                <a
                  href={creator.socialLinks.website.startsWith('http') ? creator.socialLinks.website : `https://${creator.socialLinks.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-primary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-tertiary transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span className="text-sm font-medium">الموقع الإلكتروني</span>
                </a>
              )}
              {creator.socialLinks.twitter && (
                <a
                  href={`https://twitter.com/${creator.socialLinks.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  <span className="text-sm font-medium">تويتر</span>
                </a>
              )}
              {creator.socialLinks.linkedin && (
                <a
                  href={creator.socialLinks.linkedin.startsWith('http') ? creator.socialLinks.linkedin : `https://${creator.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="text-sm font-medium">لينكد إن</span>
                </a>
              )}
              {creator.socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${creator.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/30 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z" />
                  </svg>
                  <span className="text-sm font-medium">إنستغرام</span>
                </a>
              )}
              {creator.socialLinks.youtube && (
                <a
                  href={creator.socialLinks.youtube.startsWith('http') ? creator.socialLinks.youtube : `https://${creator.socialLinks.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-sm font-medium">يوتيوب</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Templates Section */}
        <div className="card p-6 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl shadow-sm">
          <h2 className="heading-2 mb-6 text-primary-600 dark:text-orange-400">قوالب {creator.displayName || creator.name}</h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="heading-3 mb-2 text-gray-600 dark:text-dark-text-secondary">لا توجد قوالب متاحة</h3>
            <p className="text-gray-500 dark:text-dark-text-tertiary">
              لم ينشر {creator.displayName || creator.name} أي قوالب بعد
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
