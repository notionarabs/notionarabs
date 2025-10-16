'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import StarRating from '../../components/StarRating';
import { useSearchParams } from 'next/navigation';
const sortOptions = [
  { name: "الأحدث", value: "createdAt" },
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأعلى تقييماً", value: "rating" }
];

function TemplatesPageContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

      // Add search parameter if there's a search term
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

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
  }, [searchTerm, sortBy, pagination.current]);

  // Templates are already paginated from server
  const paginatedTemplates = templates;

  // Update pagination when templates change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: templates.length,
      pages: Math.ceil(templates.length / prev.limit)
    }));
  }, [templates]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-8 sm:py-10 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">قوالب نوشن</h1>
            <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl mx-auto px-4 sm:px-0">
              اكتشف مجموعة متنوعة من قوالب نوشن المصممة خصيصاً للمستخدمين العرب.
              قوالب احترافية لتنظيم عملك وحياتك الشخصية
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container-custom py-6 sm:py-8">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث في القوالب... (مثال: قالب إنتاجية، تصميم، دراسة)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pr-12 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>

          {/* Sort Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="sort-filter" className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                الترتيب
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-ms-expand]:opacity-0 [&::-webkit-calendar-picker-indicator]:text-accent-400 [&::-ms-expand]:text-accent-400 dark:[&::-webkit-calendar-picker-indicator]:text-dark-text-tertiary dark:[&::-ms-expand]:text-dark-text-tertiary"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
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
                عرض {paginatedTemplates.length} من {pagination.total} قالب
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom max-w-[1600px] mx-auto">
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
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6">
              {/* Elegant Three-Dot Loader */}
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : paginatedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {paginatedTemplates.map((template, index) => (
                <Link key={template._id} href={`/templates/${template.slug || template._id}`}>
                  <div
                    className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-48">
                      {template.previewImage ? (
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
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}

                    </div>

                    {/* Template Info */}
                    <div className="p-4 sm:p-6 relative">
                      <h3 className="font-semibold text-sm sm:text-base text-accent-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
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

          {/* Pagination */}
          {pagination.pages > 1 && !loading && (
            <div className="flex justify-center mt-8 sm:mt-12 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.3s_forwards]">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1 || loading}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === pagination.current;
                  const isNearCurrent = Math.abs(page - pagination.current) <= 2;

                  if (!isNearCurrent && page !== 1 && page !== pagination.pages) {
                    if (page === 2 || page === pagination.pages - 1) {
                      return <span key={page} className="px-1 sm:px-2 text-accent-500 text-xs sm:text-sm">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${isCurrentPage
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
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    }>
      <TemplatesPageContent />
    </Suspense>
  );
}