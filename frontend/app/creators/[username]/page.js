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
  const [creatorTemplates, setCreatorTemplates] = useState([]);
  const [creatorBlogs, setCreatorBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Platform detection and styling functions
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

  const getPlatformName = (platformName) => {
    const names = {
      twitter: 'تويتر',
      instagram: 'إنستغرام',
      linkedin: 'لينكد إن',
      youtube: 'يوتيوب',
      facebook: 'فيسبوك',
      tiktok: 'تيك توك',
      snapchat: 'سناب شات',
      telegram: 'تيليجرام',
      discord: 'ديسكورد',
      github: 'جيت هاب',
      behance: 'بيهانس',
      dribbble: 'دريببل',
      website: 'موقع إلكتروني'
    };

    return names[platformName] || 'رابط';
  };

  const getPlatformStyles = (platformName) => {
    const styles = {
      twitter: 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30',
      instagram: 'bg-pink-100 dark:bg-pink-900/20 hover:bg-pink-200 dark:hover:bg-pink-900/30',
      linkedin: 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30',
      youtube: 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30',
      facebook: 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30',
      tiktok: 'bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white',
      snapchat: 'bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30',
      telegram: 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30',
      discord: 'bg-indigo-100 dark:bg-indigo-900/20 hover:bg-indigo-200 dark:hover:bg-indigo-900/30',
      github: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
      behance: 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30',
      dribbble: 'bg-pink-100 dark:bg-pink-900/20 hover:bg-pink-200 dark:hover:bg-pink-900/30',
      website: 'bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-quaternary'
    };

    return styles[platformName] || 'bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-quaternary';
  };

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

      // Fetch creator's templates
      try {
        const templatesResponse = await api.get(`/templates?creator=${response.data.creator.id}&limit=12`);
        if (templatesResponse.data.success) {
          setCreatorTemplates(templatesResponse.data.templates);
        }
      } catch (templatesError) {
        console.log('No templates found for creator');
      }

      // Fetch creator's blogs
      try {
        const blogsResponse = await api.get(`/blogs/author/${response.data.creator.id}?limit=6`);
        if (blogsResponse.data.success) {
          setCreatorBlogs(blogsResponse.data.blogs);
        }
      } catch (blogsError) {
        console.log('No blogs found for creator');
      }
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

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !creator) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="heading-1 mb-4">المبدع غير موجود</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Profile Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Full Background Image with Overlay */}
        {creator.backgroundImage ? (
          <div className="absolute inset-0">
            <Image
              src={creator.backgroundImage}
              alt={`خلفية ${creator.displayName || creator.name}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 dark:bg-black dark:from-black dark:via-black dark:to-black"></div>
        )}

        <div className="container-custom relative z-10">
          {/* Elegant Breadcrumb */}
          <nav className="flex items-center gap-3 text-sm text-white/80 pt-8 pb-8">
            <Link href="/creators" className="hover:text-white transition-colors duration-200 flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-sm font-medium">المبدعين</span>
            </Link>
            <div className="w-1 h-1 rounded-full bg-white/60"></div>
            <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">{creator.displayName || creator.name}</span>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-[calc(100vh-120px)] py-12">

            {/* Profile Section */}
            <div className="flex-shrink-0 order-2 lg:order-1">
              <div className="relative group">
                {/* Profile Picture with Enhanced Styling */}
                <div className="relative">
                  {creator.profilePicture ? (
                    <Image
                      src={creator.profilePicture}
                      alt={`صورة ${creator.displayName || creator.name}`}
                      width={300}
                      height={300}
                      className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl object-cover border-4 border-white/20 shadow-2xl group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-105 transition-all duration-500">
                      <span className="text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl">
                        {(creator.displayName || creator.name)?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Verification Badge */}
                  {creator.creatorStatus === 'approved' && (
                    <div className="absolute -top-2 -right-2 w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white group-hover:scale-110 transition-all duration-300">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-400/20 to-accent-400/20 dark:from-orange-400/20 dark:to-orange-300/20 blur-3xl -z-10 group-hover:blur-4xl transition-all duration-700"></div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 text-center lg:text-right order-1 lg:order-2">
              {/* Creator Name */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                  {creator.displayName || creator.name}
                </h1>
                {creator.creatorStatus === 'approved' && (
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-full border border-yellow-300/30 shadow-xl">
                    <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-lg font-semibold text-yellow-200">مبدع معتمد</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {creator.bio && (
                <div className="mb-10 max-w-4xl mx-auto lg:mx-0">
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light drop-shadow-lg">
                    {creator.bio}
                  </p>
                </div>
              )}

              {/* Custom Message */}
              {creator.customMessage && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-10 max-w-3xl mx-auto lg:mx-0 shadow-2xl">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-primary-400/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                      </svg>
                    </div>
                    <span className="text-white/80 text-sm font-medium">رسالة من المبدع</span>
                  </div>
                  <p className="text-white font-medium text-lg leading-relaxed italic">
                    "{creator.customMessage}"
                  </p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {creator.showTemplateCount !== false && (
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                      {creator.templateCount || creatorTemplates.length || 0}
                    </div>
                    <div className="text-sm text-white/80 font-medium">قوالب</div>
                  </div>
                )}
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {creator.followers || 0}
                  </div>
                  <div className="text-sm text-white/80 font-medium">متابع</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {creator.rating ? creator.rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-white/80 font-medium">تقييم</div>
                </div>
                {creator.showJoinDate !== false && (
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                    <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                      {creator.createdAt ? new Date(creator.createdAt).getFullYear() : '2024'}
                    </div>
                    <div className="text-sm text-white/80 font-medium">سنة الانضمام</div>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {creator.showEmail && creator.email && (
                  <div className="group flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">{creator.email}</span>
                  </div>
                )}
                {creator.showPhone && creator.phone && (
                  <div className="group flex items-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-xl hover:bg-white/20 hover:scale-105 transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm font-medium">{creator.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      {creator.socialLinks && Array.isArray(creator.socialLinks) && creator.socialLinks.length > 0 && (
        <section id="social-links" className="section-padding bg-gradient-to-br from-gray-50 to-white dark:from-dark-secondary dark:to-dark-primary transition-colors duration-300">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-accent-500 dark:text-dark-text-primary mb-6">روابط التواصل</h2>
              <p className="text-xl text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto">تواصل مع {creator.displayName || creator.name} عبر منصات التواصل المختلفة</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {creator.socialLinks.map((link, index) => {
                if (!link.url) return null;

                const platform = detectPlatform(link.url);
                const platformName = platform ? getPlatformName(platform.name) : 'رابط';

                return (
                  <a
                    key={index}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-6 px-10 py-6 rounded-3xl transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-3xl backdrop-blur-sm border-2 ${platform ? getPlatformStyles(platform.name) : 'bg-white/80 dark:bg-dark-tertiary/80 hover:bg-white dark:hover:bg-dark-quaternary border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {platform ? (
                      <div className={`${platform.color} group-hover:scale-125 transition-transform duration-300`}>
                        {getPlatformIcon(platform.icon)}
                      </div>
                    ) : (
                      <svg className="w-8 h-8 text-gray-600 dark:text-dark-text-secondary group-hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                    <span className="font-bold text-xl">{platformName}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Creator Section */}
      {creator.allowMessages !== false && (
        <section className="section-padding bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 dark:from-orange-600 dark:via-orange-500 dark:to-orange-700 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container-custom relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-5xl font-bold text-white mb-6">تواصل مع المبدع</h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                هل لديك سؤال أو تريد التعاون مع {creator.displayName || creator.name}؟ تواصل معه مباشرة
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href={`/contact?creator=${creator.id}`}
                  className="group bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-8 py-4 text-white font-bold text-lg hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  إرسال رسالة
                </Link>
                {creator.socialLinks && Array.isArray(creator.socialLinks) && creator.socialLinks.length > 0 && (
                  <Link
                    href="#social-links"
                    className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl px-8 py-4 text-white font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    روابط التواصل
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Templates Section */}
      <section className="section-padding bg-gradient-to-br from-white via-gray-50 to-white dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16">
            <div>
              <h2 className="text-5xl font-bold text-accent-500 dark:text-dark-text-primary mb-6">قوالب {creator.displayName || creator.name}</h2>
              <p className="text-xl text-accent-600 dark:text-dark-text-secondary max-w-2xl">
                اكتشف القوالب المبتكرة من هذا المبدع
              </p>
            </div>
            {creatorTemplates.length > 0 && (
              <Link
                href={`/templates?creator=${creator.id}`}
                className="mt-6 md:mt-0 group bg-primary-500 hover:bg-primary-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl inline-flex items-center gap-3"
              >
                عرض جميع القوالب
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>

          {creatorTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {creatorTemplates.slice(0, 8).map((template) => (
                <Link key={template._id || template.id} href={`/templates/${template._id || template.id}`}>
                  <div className="group bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      {template.previewImage ? (
                        <Image
                          src={template.previewImage}
                          alt={template.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                          <svg className="w-16 h-16 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <span className="absolute top-4 right-4 text-xs px-4 py-2 rounded-full font-bold bg-primary-500 text-white shadow-lg">
                        {template.price === 0 ? 'مجاني' : 'مدفوع'}
                      </span>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                        <StarRating rating={template.rating || 0} />
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="font-bold text-xl text-accent-500 dark:text-dark-text-primary mb-3 group-hover:text-primary-500 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {template.title}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary mb-6 font-medium">بواسطة {creator.displayName || creator.name}</p>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <StarRating rating={template.rating || 0} />
                          <span className="text-sm text-accent-600 dark:text-dark-text-secondary font-medium">({template.downloads || 0})</span>
                        </div>
                        <div className={`text-xl font-bold ${template.price === 0 ? 'text-accent-600 dark:text-dark-text-secondary' : 'text-primary-500'}`}>
                          {template.price === 0 ? 'مجاني' : `${template.price} ريال`}
                        </div>
                      </div>

                      <button className="w-full bg-primary-500 hover:bg-primary-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-4 text-accent-500 dark:text-dark-text-primary">لا توجد قوالب متاحة</h3>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                لم ينشر {creator.displayName || creator.name} أي قوالب بعد
              </p>
              <Link href="/templates" className="btn-primary">
                تصفح القوالب الأخرى
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Blogs Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-dark-secondary dark:via-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16">
            <div>
              <h2 className="text-5xl font-bold text-accent-500 dark:text-dark-text-primary mb-6">مقالات {creator.displayName || creator.name}</h2>
              <p className="text-xl text-accent-600 dark:text-dark-text-secondary max-w-2xl">
                اكتشف المقالات والنصائح من هذا المبدع
              </p>
            </div>
            {creatorBlogs.length > 0 && (
              <Link
                href={`/blog?author=${creator.id}`}
                className="mt-6 md:mt-0 group bg-primary-500 hover:bg-primary-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl inline-flex items-center gap-3"
              >
                عرض جميع المقالات
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>

          {creatorBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creatorBlogs.slice(0, 6).map((blog) => (
                <Link key={blog._id || blog.id} href={`/blog/${blog.slug}`}>
                  <article className="group bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="relative h-56 bg-gray-200 overflow-hidden">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                          <svg className="w-16 h-16 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-bold shadow-lg">
                          {blog.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary font-medium">
                          {blog.readTime || '5 دقائق'}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="font-bold text-xl text-accent-500 dark:text-dark-text-primary mb-4 group-hover:text-primary-500 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary mb-6 line-clamp-3 text-base leading-relaxed">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-accent-500 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-sm text-accent-600 dark:text-dark-text-secondary font-medium">{blog.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-accent-500 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="text-sm text-accent-600 dark:text-dark-text-secondary font-medium">{blog.likes || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              {creator.displayName || creator.name?.charAt(0) || 'م'}
                            </span>
                          </div>
                          <span className="text-sm text-accent-600 dark:text-dark-text-secondary font-medium">
                            {creator.displayName || creator.name}
                          </span>
                        </div>
                        <span className="text-sm text-accent-500 dark:text-dark-text-tertiary font-medium">
                          {new Date(blog.publishedAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-4 text-accent-500 dark:text-dark-text-primary">لا توجد مقالات متاحة</h3>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                لم ينشر {creator.displayName || creator.name} أي مقالات بعد
              </p>
              <Link href="/blog" className="btn-primary">
                تصفح المقالات الأخرى
              </Link>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
