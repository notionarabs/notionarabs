'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '../../../../lib/api';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import StarRating from '../../../../components/StarRating';

// Map category slugs to Arabic names
const categoryMap = {
  'productivity': 'الإنتاجية',
  'study': 'الدراسة',
  'business': 'الأعمال',
  'personal': 'الحياة الشخصية',
  'creativity': 'الإبداع',
  'technology': 'التقنية',
  'health': 'الصحة',
  'finance': 'المالية',
  'organization': 'التنظيم',
  'planning': 'التخطيط',
  'religious': 'ديني',
  'marketing': 'التسويق',
  'design': 'التصميم',
  'development': 'التطوير',
  'education': 'التعليم',
  'travel': 'السفر',
  'food': 'الطعام',
  'sports': 'الرياضة',
  'entertainment': 'الترفيه',
  'fashion': 'الموضة',
  'beauty': 'الجمال',
  'home': 'المنزل',
  'garden': 'الحديقة',
  'pets': 'الحيوانات الأليفة',
  'cars': 'السيارات',
  'programming': 'البرمجة',
  'database': 'قواعد البيانات',
  'cybersecurity': 'الأمان السيبراني',
  'ai': 'الذكاء الاصطناعي',
  'blockchain': 'البلوك تشين',
  'ecommerce': 'التجارة الإلكترونية',
  'sales': 'المبيعات',
  'customer-service': 'خدمة العملاء',
  'hr': 'الموارد البشرية',
  'accounting': 'المحاسبة',
  'investment': 'الاستثمار',
  'real-estate': 'العقارات',
  'insurance': 'التأمين',
  'law': 'القانون',
  'medicine': 'الطب',
  'nursing': 'التمريض',
  'physical-therapy': 'العلاج الطبيعي',
  'nutrition': 'التغذية',
  'cooking': 'الطبخ',
  'desserts': 'الحلويات',
  'beverages': 'المشروبات',
  'restaurants': 'المطاعم',
  'arts': 'الفنون',
  'music': 'الموسيقى',
  'drawing': 'الرسم',
  'sculpture': 'النحت',
  'photography': 'التصوير',
  'video': 'الفيديو',
  'writing': 'الكتابة',
  'translation': 'الترجمة',
  'languages': 'اللغات',
  'history': 'التاريخ',
  'geography': 'الجغرافيا',
  'science': 'العلوم',
  'mathematics': 'الرياضيات',
  'physics': 'الفيزياء',
  'chemistry': 'الكيمياء',
  'biology': 'الأحياء',
  'psychology': 'علم النفس',
  'sociology': 'علم الاجتماع',
  'philosophy': 'الفلسفة',
  'literature': 'الأدب',
  'poetry': 'الشعر',
  'theater': 'المسرح',
  'cinema': 'السينما',
  'gaming': 'الألعاب',
  'esports': 'الرياضة الإلكترونية',
  'tourism': 'السياحة',
  'hospitality': 'الفندقة',
  'transportation': 'النقل',
  'aviation': 'الطيران',
  'maritime': 'البحرية',
  'agriculture': 'الزراعة',
  'environment': 'البيئة',
  'energy': 'الطاقة',
  'construction': 'البناء',
  'engineering': 'الهندسة',
  'architecture': 'العمارة',
  'decoration': 'الديكور',
  'furniture': 'الأثاث',
  'tools': 'الأدوات',
  'devices': 'الأجهزة',
  'software': 'البرامج',
  'applications': 'التطبيقات',
  'websites': 'المواقع',
  'web-development': 'التطوير الويب',
  'app-development': 'تطوير التطبيقات',
  'e-learning': 'التعليم الإلكتروني',
  'meetings': 'الاجتماعات',
  'communication': 'التواصل',
  'social-networks': 'الشبكات الاجتماعية',
  'content': 'المحتوى',
  'advertising': 'الإعلان',
  'public-relations': 'العلاقات العامة',
  'branding': 'العلامة التجارية',
  'strategy': 'الاستراتيجية',
  'leadership': 'القيادة',
  'management': 'الإدارة',
  'projects': 'المشاريع',
  'operations': 'العمليات',
  'quality': 'الجودة',
  'innovation': 'الابتكار',
  'research-development': 'البحث والتطوير',
  'analysis': 'التحليل',
  'statistics': 'الإحصاء',
  'data': 'البيانات',
  'reports': 'التقارير',
  'presentations': 'العروض التقديمية',
  'training': 'التدريب',
  'professional-development': 'التطوير المهني',
  'consulting': 'الاستشارات',
  'services': 'الخدمات',
  'products': 'المنتجات',
  'manufacturing': 'التصنيع',
  'distribution': 'التوزيع',
  'warehouses': 'المخازن',
  'logistics': 'اللوجستيات'
};

const sortOptions = [
  { name: "الأحدث", value: "createdAt" },
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأعلى تقييماً", value: "rating" }
];

function CategoryTemplatesContent() {
  const params = useParams();
  const categorySlug = params.id;
  const [sortBy, setSortBy] = useState('createdAt');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  // Get category name from slug
  const categoryName = categoryMap[categorySlug] || categorySlug;

  // Fetch templates for this category
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        category: categoryName,
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });

      const response = await api.get(`/templates?${params.toString()}`);

      if (response.data.success) {
        setTemplates(response.data.templates || []);
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
  }, [categorySlug, sortBy, pagination.current]);

  // Templates are already paginated and sorted from server
  const paginatedTemplates = templates;

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-12 sm:py-16 md:py-20">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Elegant Three-Dot Loader */}
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-8 sm:py-10 md:py-12">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 px-4">قوالب {categoryName}</h1>
            <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-4">
              اكتشف مجموعة متنوعة من قوالب {categoryName} المصممة خصيصاً للمستخدمين العرب.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container-custom py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          {/* Sort Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="sort-filter" className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-1.5 sm:mb-2">
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
            <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
              عرض {paginatedTemplates.length} من {pagination.total} قالب في {categoryName}
            </p>
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
                <div key={index} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-44 md:h-48 lg:h-52 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 sm:mb-3 w-3/4"></div>
                    <div className="flex items-center justify-between">
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
          ) : paginatedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedTemplates.map((template) => (
                <Link key={template._id} href={`/templates/${template.slug || template._id}`}>
                  <div className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-40 sm:h-44 md:h-48 lg:h-52">
                      {template.previewImage ? (
                        <Image
                          src={template.previewImage}
                          alt={template.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 relative">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-accent-900 dark:text-dark-text-primary mb-2 sm:mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {template.title}
                      </h3>

                      {/* Rating */}
                      <div className="mb-2 sm:mb-3">
                        <StarRating rating={template.rating || 0} size="small" showNumber={true} />
                      </div>

                      <div className="flex items-center justify-between">
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
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          مجاني
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
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
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-4">
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

export default function CategoryTemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    }>
      <CategoryTemplatesContent />
    </Suspense>
  );
}
