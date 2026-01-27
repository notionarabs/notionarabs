'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { LayoutDashboard, CheckCircle, Star, Crown, Zap, Heart, Award } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import StarRating from '../../components/StarRating';
import Counter from '../../components/Counter';

// Map badge types to Lucide icons
const getBadgeIcon = (badgeType) => {
  const iconMap = {
    'verified': CheckCircle,
    'top-creator': Star,
    'best-creator': Crown,
    'active': Zap,
    'community-favorite': Heart,
    'trusted': Award
  };
  return iconMap[badgeType] || Star;
};

function StorePageContent() {
  const sortBy = 'createdAt';
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [topCreators, setTopCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Templates are now sorted and filtered server-side
  const templates = allTemplates;

  // Fetch templates from API with server-side search and pagination
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });

      const response = await api.get(`/templates?${params.toString()}`);

      if (response.data.success) {
        setAllTemplates(response.data.templates || []);
        // Update pagination from server response
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: response.data.pagination.current,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
        }
      } else {
        setError('فشل في تحميل القوالب');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('فشل في تحميل القوالب');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refetch when search/sort changes
  useEffect(() => {
    fetchTemplates();
  }, [sortBy, pagination.current]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setLoadingCreators(true);
        const response = await api.get('/stats/homepage');
        if (response.data.success) {
          setStats(response.data.stats);
          setTopCreators(response.data.topCreators || []);
        }
      } catch (fetchError) {
        console.error('Error fetching stats:', fetchError);
        setStats({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
        setTopCreators([]);
      } finally {
        setLoadingStats(false);
        setLoadingCreators(false);
      }
    };

    fetchStats();
  }, []);

  // Templates are already paginated from server
  const paginatedTemplates = templates;
  const limitedTemplates = paginatedTemplates.slice(0, 6);

  // Remove this useEffect as it conflicts with server pagination
  // The pagination is already set correctly from the server response

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-8 sm:py-10 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">متجر قوالب نوشن</h1>
            <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl mx-auto px-4 sm:px-0">
              تصفّح القوالب الأكثر تميزًا، وتعرّف على أبرز المبدعين، وابدأ مشاركة أعمالك مع المجتمع.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]" style={{ animationDelay: '0ms' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 dark:text-orange-500 mb-1 sm:mb-2 min-h-[2.25rem] sm:min-h-[2.75rem] md:min-h-[3rem]">
                {loadingStats ? (
                  <div className="mx-auto h-7 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 rounded-full bg-white/40 dark:bg-dark-tertiary/40 animate-pulse" aria-label="جارٍ التحميل"></div>
                ) : (
                  <Counter
                    end={stats.templates}
                    duration={800}
                    delay={0}
                    separator=","
                    startImmediately={true}
                  />
                )}
              </div>
              <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">قالب متاح</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]" style={{ animationDelay: '100ms' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2 min-h-[2.25rem] sm:min-h-[2.75rem] md:min-h-[3rem]">
                {loadingStats ? (
                  <div className="mx-auto h-7 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 rounded-full bg-white/40 dark:bg-dark-tertiary/40 animate-pulse" aria-label="جارٍ التحميل"></div>
                ) : (
                  <Counter
                    end={stats.creators}
                    duration={800}
                    delay={0}
                    separator=","
                    startImmediately={true}
                  />
                )}
              </div>
              <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">مبدع فعّال</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]" style={{ animationDelay: '200ms' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2 min-h-[2.25rem] sm:min-h-[2.75rem] md:min-h-[3rem]">
                {loadingStats ? (
                  <div className="mx-auto h-7 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 rounded-full bg-white/40 dark:bg-dark-tertiary/40 animate-pulse" aria-label="جارٍ التحميل"></div>
                ) : (
                  <Counter
                    end={stats.downloads}
                    duration={800}
                    delay={0}
                    separator=","
                    startImmediately={true}
                  />
                )}
              </div>
              <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">تحميلات</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]" style={{ animationDelay: '300ms' }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2 min-h-[2.25rem] sm:min-h-[2.75rem] md:min-h-[3rem]">
                {loadingStats ? (
                  <div className="mx-auto h-7 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 rounded-full bg-white/40 dark:bg-dark-tertiary/40 animate-pulse" aria-label="جارٍ التحميل"></div>
                ) : (
                  <Counter
                    end={stats.specialties}
                    duration={800}
                    delay={0}
                    separator=","
                    startImmediately={true}
                  />
                )}
              </div>
              <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">مجال متخصص</div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <section className="pt-10 sm:pt-14 md:pt-18 lg:pt-22 pb-6 sm:pb-8 md:pb-10 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10 pointer-events-auto">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2">
                القوالب المميزة
              </h2>
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                اكتشف قوالب مختارة بعناية من مجتمعنا العربي
              </p>
            </div>
            <Link
              href="/templates"
              className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 relative z-10 pointer-events-auto"
            >
              عرض الكل
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="p-4 sm:p-6">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                      <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : limitedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {limitedTemplates.map((template, index) => (
                <Link key={template._id} href={`/templates/${template.slug || template._id}`}>
                  <div
                    className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-48">
                      {template.previewImage && typeof template.previewImage === 'string' && template.previewImage.trim() ? (
                        // Skip Next.js optimization for Cloudinary images to avoid 402 errors
                        template.previewImage.includes('res.cloudinary.com') ? (
                          <img
                            src={template.previewImage}
                            alt={template.title}
                            className="w-full h-full object-cover object-[50%_30%]"
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image failed to load:', template.previewImage);
                              if (e.target) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <Image
                            src={template.previewImage}
                            alt={template.title}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover object-[50%_30%]"
                            loading="lazy"
                            quality={75}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            onError={(e) => {
                              console.error('Image failed to load:', template.previewImage);
                              if (e.target) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}

                    </div>

                    {/* Template Info */}
                    <div className="p-4 sm:p-6 relative">
                      <h3 className="font-semibold text-sm sm:text-base text-accent-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {template.title}
                      </h3>

                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={template.rating || 0} size="small" showNumber={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={template.creator?.name || 'مبدع'}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                            {template.creator?.name || 'مبدع غير معروف'}
                          </span>
                        </div>
                        {template.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {template.price} ر.س
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-accent-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لم يتم العثور على قوالب
              </h3>
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Popular Creators */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">المبدعون المميزون</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">تعرّف على أبرز المبدعين في مجتمعنا</p>
            </div>
            <Link
              href="/creators"
              className="inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 text-accent-700 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              تصفح جميع المبدعين
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCreators ? (
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-tertiary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-card-border h-full flex flex-col overflow-hidden">
                  <div className="text-center mb-4 flex-shrink-0">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 mb-3 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-3/4 mx-auto bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-4/5 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/5 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>

                    <div className="mt-auto flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-6 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-8 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-8 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-10 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-6 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (topCreators && topCreators.length > 0) ? (
              topCreators.slice(0, 4).map((cr, idx) => (
                <Link key={cr.id || idx} href={`/creators/${cr.username || cr.email?.split('@')[0] || cr.displayName || cr.name || cr.id || cr._id || idx}`}>
                  <div
                    className="group bg-white dark:bg-dark-tertiary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-card-border hover:shadow-md hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-300 h-full flex flex-col opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="text-center mb-4 flex-shrink-0">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        {cr.profilePicture ? (
                          <Image
                            src={cr.profilePicture}
                            alt={cr.name || 'مبدع'}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                            loading="lazy"
                            quality={80}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border-2 border-white shadow-md">
                            <span className="text-lg font-bold text-primary-500 dark:text-orange-400">
                              {cr.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <h3 className="font-bold text-accent-900 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {cr.name}
                        </h3>
                        {cr.badges && cr.badges.length > 0 && (
                          <div className="flex items-center gap-1">
                            {cr.badges.slice(0, 2).map((badge) => {
                              const BadgeIcon = getBadgeIcon(badge.type);
                              return (
                                <div
                                  key={badge._id}
                                  className="group/badge relative"
                                >
                                  <div className="flex items-center gap-1 p-1 bg-primary-50 dark:bg-orange-500/10 border border-primary-200 dark:border-orange-500/20 rounded transition-all duration-200 hover:shadow-md">
                                    <BadgeIcon
                                      className="w-3 h-3 text-primary-600 dark:text-orange-400"
                                      strokeWidth={2}
                                    />
                                  </div>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none z-10">
                                    {badge.label}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-3 leading-relaxed flex-1">
                        {cr.bio || cr.experience || cr.motivation || cr.description || 'مبدع قوالب نوشن متخصص في إنشاء قوالب احترافية وعملية.'}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-accent-600 dark:text-dark-text-secondary">
                            {(cr.templatesCount || cr.templateCount || cr.totalTemplates || 0).toLocaleString()}
                          </span>
                          <span className="text-accent-500 dark:text-dark-text-tertiary">قالب</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-accent-600 dark:text-dark-text-secondary">
                            {(cr.followersCount || cr.followers || cr.totalFollowers || 0).toLocaleString()}
                          </span>
                          <span className="text-accent-500 dark:text-dark-text-tertiary">متابع</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-accent-600 dark:text-dark-text-secondary">
                            {(cr.averageRating || cr.rating || cr.medianRating || 0).toFixed(1)}
                          </span>
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-accent-600 dark:text-dark-text-secondary">لا يوجد مبدعون لعرضهم حالياً.</div>
            )}
          </div>
        </div>
      </section>

      {/* Creator CTA */}
      <section className="py-10 sm:py-14 md:py-18 lg:py-22 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom max-w-5xl">
          <div className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 text-center relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-600/20 dark:from-orange-500/20 dark:to-orange-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-3 sm:mb-4">
                جاهز تصبح مبدعًا على نوشن؟
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-200 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                شارك قوالبك مع آلاف المستخدمين وابدأ في بناء دخل مستدام من خبرتك.
              </p>
              <Link
                href="/creators/apply"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-accent-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                كن مبدعًا الآن
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    }>
      <StorePageContent />
    </Suspense>
  );
}
