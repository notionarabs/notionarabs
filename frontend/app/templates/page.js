'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';

// Fallback data for when API fails
const fallbackTemplates = [
  {
    _id: 'fallback-1',
    title: "مخطط الدراسة",
    creator: { name: "علي حسن" },
    previewImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    price: 25,
    rating: 4.8,
    downloads: 1200,
    category: "الدراسة",
    description: "قالب شامل لتنظيم الدراسة والمذاكرة مع جداول زمنية وتتبع التقدم"
  },
  {
    _id: 'fallback-2',
    title: "لوحة تحكم الشركة الناشئة",
    creator: { name: "سارة محمد" },
    previewImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
    price: 45,
    rating: 4.9,
    downloads: 890,
    category: "الأعمال",
    description: "إدارة شاملة للمشاريع والمهام والموظفين في الشركات الناشئة"
  }
];

const categories = [
  { name: "الكل", value: "all" },
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "الإبداع", value: "الإبداع" },
  { name: "التقنية", value: "التقنية" },
  { name: "الصحة", value: "الصحة" },
  { name: "المالية", value: "المالية" },
  { name: "التنظيم", value: "التنظيم" },
  { name: "التخطيط", value: "التخطيط" }
];

const sortOptions = [
  { name: "الأحدث", value: "createdAt" },
  { name: "الأكثر شعبية", value: "downloads" },
  { name: "الأرخص", value: "price-asc" },
  { name: "الأغلى", value: "price-desc" },
  { name: "الأعلى تقييماً", value: "rating" }
];

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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

  // Fetch templates from API
  const fetchTemplates = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy: sortBy === 'price-asc' ? 'price' : sortBy === 'price-desc' ? 'price' : sortBy,
        sortOrder: sortBy === 'price-asc' ? 'asc' : 'desc'
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await api.get(`/templates?${params.toString()}`);

      if (response.data.success) {
        setTemplates(response.data.templates || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError('فشل في تحميل القوالب');
        setTemplates(fallbackTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('فشل في تحميل القوالب');
      setTemplates(fallbackTemplates);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTemplates(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchTemplates(1);
  }, [selectedCategory, sortBy, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates(1);
  };

  const handlePageChange = (newPage) => {
    fetchTemplates(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">
          {rating?.toFixed(1) || '0.0'}
        </span>
      </div>
    );
  };

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
        <div className="container-custom py-12">
          <div className="text-center">
            <h1 className="heading-1 mb-4">قوالب نوشن</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              اكتشف مجموعة متنوعة من قوالب نوشن المصممة خصيصاً للمستخدمين العرب.
              قوالب احترافية لتنظيم عملك وحياتك الشخصية
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container-custom py-8">
        <div className="bg-white dark:bg-dark-secondary rounded-lg p-6 shadow-sm border border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن قوالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pr-12"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-accent-400 hover:text-accent-600 dark:text-dark-text-tertiary dark:hover:text-dark-text-secondary transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1 min-w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
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
          <div className="flex items-center justify-between mt-6">
            <p className="text-accent-600 dark:text-dark-text-secondary">
              عرض {templates.length} من {pagination.total} قالب
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card p-6 animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Link key={template._id} href={`/templates/${template._id}`}>
                  <div className="card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    {/* Template Image */}
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg mb-4">
                      {template.previewImage ? (
                        <Image
                          src={template.previewImage}
                          alt={template.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                          <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Price Tag */}
                      <div className="absolute top-3 left-3">
                        {template.price === 0 ? (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            مجاني
                          </span>
                        ) : (
                          <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {template.price} ريال
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Template Info */}
                    <div>
                      <h3 className="font-bold text-lg text-accent-900 dark:text-dark-text-primary mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <p className="text-sm text-accent-500 dark:text-dark-text-tertiary mb-3">
                        بواسطة {template.creator?.name || 'مبدع غير معروف'}
                      </p>

                      <div className="flex items-center justify-between">
                        <StarRating rating={template.rating} />
                        <span className="text-sm text-accent-500 dark:text-dark-text-tertiary">
                          {template.downloads || 0} تحميل
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-accent-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لم يتم العثور على قوالب
              </h3>
              <p className="text-accent-600 dark:text-dark-text-secondary">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1 || loading}
                  className="px-3 py-2 text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === pagination.current;
                  const isNearCurrent = Math.abs(page - pagination.current) <= 2;

                  if (!isNearCurrent && page !== 1 && page !== pagination.pages) {
                    if (page === 2 || page === pagination.pages - 1) {
                      return <span key={page} className="px-2 text-accent-500">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isCurrentPage
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
                  className="px-3 py-2 text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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