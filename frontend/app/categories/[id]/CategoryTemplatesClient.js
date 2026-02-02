'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';
import StarRating from '../../../components/StarRating';

const sortOptions = [
  { name: "الأحدث", value: "createdAt" },
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأعلى تقييماً", value: "rating" }
];

export default function CategoryTemplatesClient({
  categorySlug,
  categoryName,
  initialTemplates = [],
  initialPagination = { current: 1, pages: 1, total: 0, limit: 12 }
}) {
  const [sortBy, setSortBy] = useState('createdAt');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [templates, setTemplates] = useState(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(initialPagination);
  const [currentPage, setCurrentPage] = useState(initialPagination.current || 1);
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  // Fetch templates for this category
  const fetchTemplates = async (pageToFetch) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category: categoryName,
        page: pageToFetch.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });

      const response = await api.get(`/templates?${params.toString()}`);

      if (response.data.success) {
        setTemplates(response.data.templates || []);
        // Update pagination from server response
        if (response.data.pagination) {
          const nextCurrent = response.data.pagination.current || pageToFetch;
          setPagination(prev => ({
            ...prev,
            current: nextCurrent,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
          setCurrentPage(nextCurrent);
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

  // Refetch when page or sort changes
  useEffect(() => {
    fetchTemplates(currentPage);
  }, [sortBy, currentPage, categoryName]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, categoryName]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSortOpen) {
        return;
      }
      if (
        sortButtonRef.current?.contains(event.target) ||
        sortMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsSortOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSortOpen]);

  // Handle Escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Filters */}
      <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          {/* Sort Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="sr-only">الترتيب</label>
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  type="button"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  className="form-input flex items-center justify-between text-sm sm:text-base text-accent-900 dark:text-dark-text-primary shadow-sm hover:border-primary-300 dark:hover:border-primary-500/60 w-full"
                >
                  <span>
                    {sortOptions.find((option) => option.value === sortBy)?.name || sortOptions[0].name}
                  </span>
                  <span className={`text-accent-400 dark:text-dark-text-tertiary transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {isSortOpen && (
                  <div
                    ref={sortMenuRef}
                    role="listbox"
                    className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg overflow-hidden"
                  >
                    {sortOptions.map((option) => {
                      const isActive = option.value === sortBy;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full text-right px-4 py-2.5 text-sm sm:text-base transition-colors flex items-center justify-between ${isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-accent-700 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                            }`}
                        >
                          <span>{option.name}</span>
                          {isActive && (
                            <span className="text-primary-600 dark:text-primary-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mt-4 sm:mt-6">
            {loading ? (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
                عرض {templates.length} من {pagination.total} قالب في {categoryName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom max-w-[1600px] mx-auto px-4 sm:px-6">
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
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card-interactive overflow-hidden animate-pulse flex flex-col">
                  <div className="h-40 sm:h-44 md:h-48 lg:h-52 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3 w-3/4"></div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                      </div>
                      <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {templates.map((template, index) => (
                <Link key={template._id} href={`/templates/${template.slug || template._id}`} className="block h-full">
                  <div
                    className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards] flex flex-col h-full"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-40 sm:h-44 md:h-48 lg:h-52">
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
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 relative flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-accent-900 dark:text-dark-text-primary mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {template.title}
                      </h3>

                      {/* Short Description */}
                      <p className="text-xs text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2 min-h-[2rem]">
                        {template.description || 'وصف مختصر للقالب غير متوفر حالياً.'}
                      </p>

                      {/* Rating */}
                      <div className="mb-2 sm:mb-3">
                        <StarRating rating={template.rating || 0} size="small" showNumber={true} />
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={template.creator?.name || 'مبدع'}
                              width={20}
                              height={20}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] sm:text-xs font-medium text-primary-600 dark:text-primary-400">
                                {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                              </span>
                            </div>
                          )}
                          <span className="text-[10px] sm:text-xs text-accent-500 dark:text-dark-text-tertiary truncate">
                            {template.creator?.name || 'مبدع غير معروف'}
                          </span>
                        </div>
                        {template.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-[10px] sm:text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {template.price} ر.س
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
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
            <div className="text-center py-8 sm:py-12 md:py-16 px-4 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
              <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-accent-400 dark:text-dark-text-quaternary mx-auto mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لا توجد قوالب في {categoryName}
              </h3>
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-6 max-w-md mx-auto">
                لم يتم العثور على قوالب في هذا التصنيف حالياً
              </p>
              <Link
                href="/templates"
                className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                تصفح جميع القوالب
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && !loading && (
            <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-4 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.3s_forwards]">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1 || loading}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === pagination.current;
                  const isNearCurrent = Math.abs(page - pagination.current) <= 1;

                  if (!isNearCurrent && page !== 1 && page !== pagination.pages) {
                    if (page === 2 || page === pagination.pages - 1) {
                      return <span key={page} className="hidden sm:inline px-1 md:px-2 text-accent-500 text-xs sm:text-sm">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${isCurrentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current >= pagination.pages || loading}
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
