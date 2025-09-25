'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useToast } from '../../contexts/ToastContext';

// Fallback data for when API fails
const fallbackBlogPosts = [
  {
    id: 1,
    title: "10 نصائح لاستخدام نوتيون بكفاءة أكبر",
    excerpt: "اكتشف أفضل الطرق لتنظيم عملك وحياتك باستخدام نوتيون",
    content: "نوتيون هو أداة قوية لتنظيم المعلومات، ولكن هناك طرق لاستخدامه بكفاءة أكبر...",
    author: "أحمد المطيري",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-15",
    readTime: "5 دقائق",
    category: "نصائح",
    tags: ["نوتيون", "الإنتاجية", "التنظيم"],
    featured: true,
    imgSrc: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "كيفية إنشاء قوالب نوتيون احترافية",
    excerpt: "دليل شامل لتصميم قوالب نوتيون جذابة ومفيدة",
    content: "إنشاء قوالب نوتيون احترافية يتطلب فهم عميق للمنصة وتصميم تجربة المستخدم...",
    author: "فاطمة نور",
    authorImg: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-12",
    readTime: "8 دقائق",
    category: "تصميم",
    tags: ["قوالب", "تصميم", "نوتيون"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "أفضل قوالب نوتيون للطلاب",
    excerpt: "مجموعة مختارة من القوالب التي تساعد الطلاب في تنظيم دراستهم",
    content: "الطلاب يحتاجون إلى تنظيم ممتاز لإدارة وقتهم ودراستهم، وهذه القوالب ستساعدهم...",
    author: "عمر خالد",
    authorImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-10",
    readTime: "6 دقائق",
    category: "الدراسة",
    tags: ["طلاب", "دراسة", "تنظيم"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "نظام إدارة المشاريع بنوتيون",
    excerpt: "كيفية استخدام نوتيون لإدارة مشاريعك بكفاءة عالية",
    content: "نوتيون يوفر أدوات قوية لإدارة المشاريع، من التخطيط إلى التنفيذ والمتابعة...",
    author: "نورا أحمد",
    authorImg: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-08",
    readTime: "7 دقائق",
    category: "الأعمال",
    tags: ["مشاريع", "إدارة", "نوتيون"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "تحسين الإنتاجية مع نوتيون",
    excerpt: "نصائح عملية لزيادة إنتاجيتك اليومية باستخدام نوتيون",
    content: "الإنتاجية هي مفتاح النجاح، ونوتيون يمكن أن يكون أداة رائعة لتحسينها...",
    author: "خالد محمد",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-05",
    readTime: "5 دقائق",
    category: "الإنتاجية",
    tags: ["إنتاجية", "تنظيم", "نصائح"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 6,
    title: "قوالب نوتيون للمطورين",
    excerpt: "قوالب متخصصة للمطورين والمبرمجين لتنظيم مشاريعهم",
    content: "المطورون يحتاجون إلى تنظيم خاص لمشاريعهم، وهذه القوالب ستساعدهم...",
    author: "سارة التقنية",
    authorImg: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-03",
    readTime: "6 دقائق",
    category: "التقنية",
    tags: ["مطورين", "برمجة", "مشاريع"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center"
  }
];

const categories = [
  { name: "الكل", value: "all" },
  { name: "نصائح", value: "نصائح" },
  { name: "تصميم", value: "تصميم" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "الإبداع", value: "الإبداع" },
  { name: "التقنية", value: "التقنية" },
  { name: "الصحة", value: "الصحة" },
  { name: "المالية", value: "المالية" },
  { name: "التنظيم", value: "التنظيم" },
  { name: "التخطيط", value: "التخطيط" },
  { name: "تعليم", value: "تعليم" }
];

const sortOptions = [
  { name: "الأحدث", value: "newest" },
  { name: "الأقدم", value: "oldest" },
  { name: "الأكثر مشاهدة", value: "views" }
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 9
  });
  const { showError } = useToast();

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: '1',
          limit: '9',
          sortBy: sortBy === 'newest' ? 'publishedAt' : sortBy === 'oldest' ? 'publishedAt' : 'views',
          sortOrder: sortBy === 'newest' ? 'desc' : sortBy === 'oldest' ? 'asc' : 'desc'
        });

        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }

        const response = await api.get(`/blogs?${params.toString()}`);

        if (response.data.success) {
          setBlogPosts(response.data.blogs || []);
          setPagination(response.data.pagination || pagination);
        } else {
          setError('فشل في تحميل المقالات');
          setBlogPosts(fallbackBlogPosts.filter(post => !post.featured));
          showError('فشل في تحميل المقالات');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('فشل في تحميل المقالات');
        setBlogPosts(fallbackBlogPosts.filter(post => !post.featured));
        showError('فشل في تحميل المقالات');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [selectedCategory, searchTerm, sortBy, showError]);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-20 md:py-24 overflow-hidden">
        <div className="container-custom text-center relative z-10">
          <h1 className="heading-1 text-white mb-4">مدونة نوتيون العرب</h1>
          <p className="body-large text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto mb-8">
            اكتشف أحدث النصائح والحيل لاستخدام نوتيون بكفاءة أكبر. مقالات متخصصة للمبدعين العرب.
          </p>
        </div>
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-60 h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pl-12 pr-4 py-4 text-lg"
                dir="rtl"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-dark-tertiary text-accent-600 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-quaternary'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  ترتيب حسب:
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select text-sm"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding">
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

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-accent-600 dark:text-dark-text-secondary">
              عرض {blogPosts.length} من {pagination.total} مقال
            </p>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`}>
                  <div className="card-interactive overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium bg-primary-100 text-primary-800">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2 group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-accent-500 dark:text-dark-text-tertiary mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-medium text-xs">
                              {post.author?.name?.charAt(0) || 'م'}
                            </span>
                          </div>
                          <span>{post.author?.name || 'كاتب غير معروف'}</span>
                        </div>
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-accent-500 dark:text-dark-text-tertiary">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {post.likes || 0}
                          </span>
                        </div>
                        <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                          {post.readTime || '5 دقائق'}
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
                لم يتم العثور على مقالات
              </h3>
              <p className="text-accent-600 dark:text-dark-text-secondary">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Post - Only show if we have featured posts */}
      {blogPosts.some(post => post.featured) && (
        <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="heading-2 mb-4">المقال المميز</h2>
            </div>

            <div className="card-interactive overflow-hidden max-w-4xl mx-auto">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative h-64 md:h-full">
                    {blogPosts.find(post => post.featured)?.featuredImage ? (
                      <Image
                        src={blogPosts.find(post => post.featured).featuredImage}
                        alt={blogPosts.find(post => post.featured).title}
                        width={800}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                        <svg className="w-16 h-16 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                        مميز
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-sm rounded-full">
                      {blogPosts.find(post => post.featured)?.category}
                    </span>
                  </div>

                  <h3 className="heading-3 mb-4">
                    {blogPosts.find(post => post.featured)?.title}
                  </h3>

                  <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-6 line-clamp-3">
                    {blogPosts.find(post => post.featured)?.excerpt}
                  </p>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                        {blogPosts.find(post => post.featured)?.author?.name?.charAt(0) || 'م'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">بواسطة</p>
                      <p className="font-medium text-accent-700 dark:text-dark-text-primary">
                        {blogPosts.find(post => post.featured)?.author?.name || 'كاتب غير معروف'}
                      </p>
                    </div>
                    <div className="flex-1"></div>
                    <div className="text-right">
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        {formatDate(blogPosts.find(post => post.featured)?.publishedAt || blogPosts.find(post => post.featured)?.createdAt)}
                      </p>
                      <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                        {blogPosts.find(post => post.featured)?.readTime || '5 دقائق'}
                      </p>
                    </div>
                  </div>

                  <Link href={`/blog/${blogPosts.find(post => post.featured)?.slug}`} className="btn-primary">
                    اقرأ المقال
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            اشترك في نشرتنا البريدية
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8">
            احصل على أحدث المقالات والنصائح حول نوتيون والإنتاجية مباشرة في بريدك الإلكتروني
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 form-input"
                dir="rtl"
              />
              <button className="btn-primary whitespace-nowrap">
                اشترك
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mt-2">
              نحترم خصوصيتك. لن نرسل لك بريد عشوائي.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}