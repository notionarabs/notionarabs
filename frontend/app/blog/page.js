'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useToast } from '../../contexts/ToastContext';
import StarRating from '../../components/StarRating';
import Fuse from 'fuse.js';


const categories = [
  { name: "الكل", value: "all" },
  // الإنتاجية والتنظيم
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "التخطيط", value: "التخطيط" },
  { name: "إدارة الوقت", value: "إدارة الوقت" },
  { name: "إدارة المشاريع", value: "إدارة المشاريع" },
  { name: "التنظيم", value: "التنظيم" },
  { name: "التنسيق", value: "التنسيق" },
  { name: "التطوير الشخصي", value: "التطوير الشخصي" },
  { name: "النمو الشخصي", value: "النمو الشخصي" },
  { name: "التطوير الذاتي", value: "التطوير الذاتي" },
  { name: "النجاح الشخصي", value: "النجاح الشخصي" },
  { name: "التميز الشخصي", value: "التميز الشخصي" },
  { name: "الإنجاز الشخصي", value: "الإنجاز الشخصي" },
  { name: "القيادة", value: "القيادة" },
  { name: "العمل الجماعي", value: "العمل الجماعي" },
  { name: "التواصل", value: "التواصل" },
  { name: "العرض والخطابة", value: "العرض والخطابة" },
  { name: "التفاوض", value: "التفاوض" },
  { name: "حل المشاكل", value: "حل المشاكل" },
  { name: "الإبداع", value: "الإبداع" },
  { name: "الابتكار", value: "الابتكار" },
  { name: "ريادة الأعمال", value: "ريادة الأعمال" },

  // التقنية والبرمجة
  { name: "التقنية", value: "التقنية" },
  { name: "البرمجة", value: "البرمجة" },
  { name: "التطوير", value: "التطوير" },
  { name: "التصميم الجرافيكي", value: "التصميم الجرافيكي" },
  { name: "التصوير", value: "التصوير" },
  { name: "الفيديو", value: "الفيديو" },
  { name: "الصوت", value: "الصوت" },
  { name: "الكتابة", value: "الكتابة" },
  { name: "الترجمة", value: "الترجمة" },
  { name: "التكنولوجيا", value: "التكنولوجيا" },
  { name: "الذكاء الاصطناعي", value: "الذكاء الاصطناعي" },
  { name: "البيانات", value: "البيانات" },
  { name: "الأمن السيبراني", value: "الأمن السيبراني" },
  { name: "البلوك تشين", value: "البلوك تشين" },
  { name: "الواقع الافتراضي", value: "الواقع الافتراضي" },
  { name: "الروبوتات", value: "الروبوتات" },
  { name: "الطاقة المتجددة", value: "الطاقة المتجددة" },
  { name: "البيئة", value: "البيئة" },
  { name: "الاستدامة", value: "الاستدامة" },

  // المالية والأعمال
  { name: "الاستثمار", value: "الاستثمار" },
  { name: "التداول", value: "التداول" },
  { name: "العقارات", value: "العقارات" },
  { name: "التأمين", value: "التأمين" },
  { name: "البنوك", value: "البنوك" },
  { name: "التمويل", value: "التمويل" },
  { name: "الادخار", value: "الادخار" },
  { name: "الاستهلاك", value: "الاستهلاك" },
  { name: "التسوق", value: "التسوق" },
  { name: "البيع", value: "البيع" },
  { name: "الشراء", value: "الشراء" },
  { name: "التوزيع", value: "التوزيع" },
  { name: "الخدمة العملاء", value: "الخدمة العملاء" },
  { name: "المبيعات", value: "المبيعات" },
  { name: "التسويق", value: "التسويق" },
  { name: "التسويق الرقمي", value: "التسويق الرقمي" },
  { name: "وسائل التواصل", value: "وسائل التواصل" },
  { name: "المحتوى", value: "المحتوى" },
  { name: "العلامة التجارية", value: "العلامة التجارية" },
  { name: "العلاقات العامة", value: "العلاقات العامة" },
  { name: "الإعلان", value: "الإعلان" },
  { name: "الترويج", value: "الترويج" },
  { name: "المحاسبة", value: "المحاسبة" },
  { name: "القانون", value: "القانون" },

  // التصميم والفنون
  { name: "تصميم", value: "تصميم" },
  { name: "الفنون", value: "الفنون" },
  { name: "الرسم", value: "الرسم" },
  { name: "النحت", value: "النحت" },
  { name: "التصميم الداخلي", value: "التصميم الداخلي" },
  { name: "التصميم الصناعي", value: "التصميم الصناعي" },
  { name: "الأزياء", value: "الأزياء" },
  { name: "الموضة", value: "الموضة" },
  { name: "الجمال", value: "الجمال" },
  { name: "التجميل", value: "التجميل" },
  { name: "العناية بالبشرة", value: "العناية بالبشرة" },
  { name: "العناية بالشعر", value: "العناية بالشعر" },

  // التعليم والعلوم
  { name: "التعليم", value: "التعليم" },
  { name: "التعليم الإلكتروني", value: "التعليم الإلكتروني" },
  { name: "التدريب", value: "التدريب" },
  { name: "التطوير المهني", value: "التطوير المهني" },
  { name: "التطوير الوظيفي", value: "التطوير الوظيفي" },
  { name: "العلوم", value: "العلوم" },
  { name: "الطب", value: "الطب" },
  { name: "الهندسة", value: "الهندسة" },
  { name: "الرياضيات", value: "الرياضيات" },
  { name: "الفيزياء", value: "الفيزياء" },
  { name: "الكيمياء", value: "الكيمياء" },
  { name: "الأحياء", value: "الأحياء" },
  { name: "الجيولوجيا", value: "الجيولوجيا" },
  { name: "الفلك", value: "الفلك" },
  { name: "النفس", value: "النفس" },
  { name: "الاجتماع", value: "الاجتماع" },
  { name: "التاريخ", value: "التاريخ" },
  { name: "الجغرافيا", value: "الجغرافيا" },
  { name: "الفلسفة", value: "الفلسفة" },
  { name: "السياسة", value: "السياسة" },
  { name: "الاقتصاد", value: "الاقتصاد" },

  // الصحة واللياقة
  { name: "الصحة", value: "الصحة" },
  { name: "الصحة النفسية", value: "الصحة النفسية" },
  { name: "الطب البديل", value: "الطب البديل" },
  { name: "التغذية", value: "التغذية" },
  { name: "اللياقة البدنية", value: "اللياقة البدنية" },
  { name: "الرياضة", value: "الرياضة" },
  { name: "كمال الأجسام", value: "كمال الأجسام" },
  { name: "الركض", value: "الركض" },
  { name: "السباحة", value: "السباحة" },
  { name: "ركوب الدراجات", value: "ركوب الدراجات" },
  { name: "اليوغا", value: "اليوغا" },
  { name: "البيلاتس", value: "البيلاتس" },
  { name: "الرقص", value: "الرقص" },
  { name: "الفنون القتالية", value: "الفنون القتالية" },

  // الحياة الشخصية والعلاقات
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "العلاقات", value: "العلاقات" },
  { name: "الأسرة", value: "الأسرة" },
  { name: "الأطفال", value: "الأطفال" },
  { name: "المراهقين", value: "المراهقين" },
  { name: "كبار السن", value: "كبار السن" },
  { name: "النساء", value: "النساء" },
  { name: "الرجال", value: "الرجال" },
  { name: "الزواج", value: "الزواج" },
  { name: "الطلاق", value: "الطلاق" },
  { name: "التربية", value: "التربية" },
  { name: "الأبوة", value: "الأبوة" },
  { name: "الأمومة", value: "الأمومة" },

  // الترفيه والهوايات
  { name: "الترفيه", value: "الترفيه" },
  { name: "الألعاب", value: "الألعاب" },
  { name: "ألعاب الفيديو", value: "ألعاب الفيديو" },
  { name: "الألعاب الإلكترونية", value: "الألعاب الإلكترونية" },
  { name: "الألعاب الجماعية", value: "الألعاب الجماعية" },
  { name: "ألعاب الطاولة", value: "ألعاب الطاولة" },
  { name: "الأحجيات", value: "الأحجيات" },
  { name: "السفر", value: "السفر" },
  { name: "السياحة", value: "السياحة" },
  { name: "المطارات", value: "المطارات" },
  { name: "الفنادق", value: "الفنادق" },
  { name: "المطاعم", value: "المطاعم" },
  { name: "الطبخ", value: "الطبخ" },
  { name: "الوصفات", value: "الوصفات" },
  { name: "المشروبات", value: "المشروبات" },
  { name: "الحلويات", value: "الحلويات" },
  { name: "الخبز", value: "الخبز" },
  { name: "المشاوي", value: "المشاوي" },
  { name: "السلطات", value: "السلطات" },
  { name: "الشوربات", value: "الشوربات" },
  { name: "المقبلات", value: "المقبلات" },
  { name: "الأطباق الرئيسية", value: "الأطباق الرئيسية" },

  // الأخبار والمراجعات
  { name: "الأخبار", value: "الأخبار" },
  { name: "المراجعات", value: "المراجعات" },
  { name: "التقارير", value: "التقارير" },
  { name: "التحليل", value: "التحليل" },
  { name: "الإحصائيات", value: "الإحصائيات" },
  { name: "البحث", value: "البحث" },
  { name: "الدراسات", value: "الدراسات" },
  { name: "الاستطلاعات", value: "الاستطلاعات" },
  { name: "الاستبيانات", value: "الاستبيانات" },
  { name: "المقابلات", value: "المقابلات" },
  { name: "التجارب", value: "التجارب" },
  { name: "الاختبارات", value: "الاختبارات" },
  { name: "التقييم", value: "التقييم" },
  { name: "القياس", value: "القياس" },
  { name: "التتبع", value: "التتبع" },
  { name: "المراقبة", value: "المراقبة" },

  // النصائح العامة
  { name: "نصائح", value: "نصائح" },
  { name: "حيل", value: "حيل" },
  { name: "أسرار", value: "أسرار" },
  { name: "طرق", value: "طرق" },
  { name: "أساليب", value: "أساليب" },
  { name: "تقنيات", value: "تقنيات" },
  { name: "استراتيجيات", value: "استراتيجيات" },
  { name: "خطط", value: "خطط" },
  { name: "برامج", value: "برامج" },
  { name: "أنظمة", value: "أنظمة" },
  { name: "قوانين", value: "قوانين" },
  { name: "مبادئ", value: "مبادئ" },
  { name: "قواعد", value: "قواعد" },
  { name: "معايير", value: "معايير" },
  { name: "مقاييس", value: "مقاييس" },
  { name: "مؤشرات", value: "مؤشرات" },
  { name: "أهداف", value: "أهداف" },
  { name: "نتائج", value: "نتائج" },
  { name: "فعالية", value: "فعالية" },
  { name: "كفاءة", value: "كفاءة" },
  { name: "أداء", value: "أداء" },
  { name: "جودة", value: "جودة" },
  { name: "تحسين", value: "تحسين" },
  { name: "تطوير", value: "تطوير" },
  { name: "تغيير", value: "تغيير" },
  { name: "تحول", value: "تحول" },
  { name: "تنسيق", value: "تنسيق" },
  { name: "إدارة", value: "إدارة" },
  { name: "تحكم", value: "تحكم" },
  { name: "مراقبة", value: "مراقبة" },
  { name: "تتبع", value: "تتبع" },
  { name: "قياس", value: "قياس" },
  { name: "تقييم", value: "تقييم" },
  { name: "اختبارات", value: "اختبارات" },
  { name: "تجارب", value: "تجارب" },
  { name: "مقابلات", value: "مقابلات" },
  { name: "استبيانات", value: "استبيانات" },
  { name: "استطلاعات", value: "استطلاعات" },
  { name: "دراسات", value: "دراسات" },
  { name: "بحث", value: "بحث" },
  { name: "إحصائيات", value: "إحصائيات" },
  { name: "تحليل", value: "تحليل" },
  { name: "تقارير", value: "تقارير" },
  { name: "مراجعات", value: "مراجعات" },
  { name: "أخبار", value: "أخبار" },
  { name: "عام", value: "عام" }
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
  const [allBlogPosts, setAllBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 9
  });
  const { showError } = useToast();

  // Fuse.js configuration for blogs
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'category', weight: 0.15 },
      { name: 'categories', weight: 0.15 },
      { name: 'tags', weight: 0.1 },
      { name: 'author.name', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    // Support both Arabic and English
    ignoreLocation: true,
    findAllMatches: true,
    // Custom search function to handle both languages
    getFn: (obj, path) => {
      const value = Fuse.config.getFn(obj, path);
      if (typeof value === 'string') {
        // Normalize text for better matching
        return value.toLowerCase().trim();
      }
      return value;
    }
  }), []);

  // Create Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(allBlogPosts, fuseOptions);
  }, [allBlogPosts, fuseOptions]);

  // Filtered and sorted blog posts
  const blogPosts = useMemo(() => {
    let filteredPosts = allBlogPosts;

    // Apply category filter - check both single category and multiple categories
    if (selectedCategory !== 'all') {
      filteredPosts = filteredPosts.filter(post => {
        // Check if post has multiple categories
        if (post.categories && post.categories.length > 0) {
          return post.categories.includes(selectedCategory);
        }
        // Fallback to single category
        return post.category === selectedCategory;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchResults = fuse.search(searchTerm.trim().toLowerCase());
      filteredPosts = searchResults.map(result => result.item);
    }

    // Apply sorting
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt);
      } else if (sortBy === 'views') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

    return sortedPosts;
  }, [allBlogPosts, selectedCategory, searchTerm, sortBy, fuse]);

  // Fetch all blog posts from API (no server-side search)
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: '1000' // Get all blogs for client-side search
        });

        const response = await api.get(`/blogs?${params.toString()}`);

        if (response.data.success) {
          setAllBlogPosts(response.data.blogs || []);
        } else {
          setError('فشل في تحميل المقالات');
          showError('فشل في تحميل المقالات');
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('فشل في تحميل المقالات');
        showError('فشل في تحميل المقالات');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [showError]);

  // Update pagination when blog posts change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: blogPosts.length,
      pages: Math.ceil(blogPosts.length / prev.limit)
    }));
  }, [blogPosts]);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="container-custom text-center relative z-10 px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">مدونة عرب نوشن</h1>
          <p className="text-base sm:text-lg md:text-xl text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            اكتشف أحدث النصائح والحيل لاستخدام نوشن بكفاءة أكبر. مقالات متخصصة للمبدعين العرب.
          </p>
        </div>
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute w-40 h-40 sm:w-60 sm:h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-40 h-40 sm:w-60 sm:h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-40 h-40 sm:w-60 sm:h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-6 sm:py-8 md:py-12 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom px-4 sm:px-6">
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6 sm:mb-8">
              <input
                type="text"
                placeholder="ابحث في المقالات... (مثال: نصائح نوشن، إنتاجية، تصميم)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pr-10 sm:pr-12 pl-4 py-3 sm:py-4 text-base sm:text-lg"
                dir="rtl"
              />
              <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">

              {/* Sort By */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="sort-by" className="text-sm font-medium text-accent-700 dark:text-dark-text-primary whitespace-nowrap">
                  الترتيب:
                </label>
                <div className="relative flex-1 sm:flex-initial">
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select text-sm cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full sm:min-w-32 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-ms-expand]:opacity-0 [&::-webkit-calendar-picker-indicator]:text-accent-400 [&::-ms-expand]:text-accent-400 dark:[&::-webkit-calendar-picker-indicator]:text-dark-text-tertiary dark:[&::-ms-expand]:text-dark-text-tertiary"
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
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-6 sm:py-8 md:py-12">
        <div className="container-custom px-4 sm:px-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            {loading ? (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
                عرض {blogPosts.length} من {pagination.total} مقال
              </p>
            )}
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6">
              {/* Elegant Three-Dot Loader */}
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {blogPosts.map((post, index) => (
                <Link key={post._id} href={`/blog/${post.slug}`}>
                  <div
                    className="card-interactive overflow-hidden group opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full opacity-30"></div>
                        <div className="absolute top-12 right-8 w-8 h-8 bg-white rounded-full opacity-20"></div>
                        <div className="absolute bottom-8 left-12 w-12 h-12 bg-white rounded-full opacity-25"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 bg-white rounded-full opacity-30"></div>
                        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white rounded-full opacity-20"></div>
                      </div>

                      {/* Main Content Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                      {/* Generated Image Content */}
                      <div className="absolute inset-0 flex flex-col justify-center items-center p-3 sm:p-4 text-center">
                        {/* Blog Icon */}
                        <div className="mb-2 sm:mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                            </svg>
                          </div>
                        </div>

                        {/* Auto-generated Title */}
                        <h3 className="text-white text-xs sm:text-sm font-bold leading-tight mb-1.5 sm:mb-2 drop-shadow-lg max-w-full line-clamp-2 px-1">
                          {post.title}
                        </h3>

                        {/* Auto-generated Subtitle */}
                        <p className="text-white text-[10px] sm:text-xs opacity-90 max-w-full line-clamp-2 px-1">
                          {post.excerpt ?
                            (post.excerpt.length > 60 ? post.excerpt.substring(0, 60) + '...' : post.excerpt) :
                            'اكتشف المزيد في هذا المقال المميز'
                          }
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-accent-500 dark:text-dark-text-tertiary mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            {post.author?.profilePicture ? (
                              <img
                                src={post.author.profilePicture}
                                alt={post.author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary-600 dark:text-primary-400 font-medium text-xs">
                                {post.author?.name?.charAt(0) || 'م'}
                              </span>
                            )}
                          </div>
                          <span className="truncate">{post.author?.name || 'كاتب غير معروف'}</span>
                        </div>
                        <span className="text-xs whitespace-nowrap">{formatDate(post.publishedAt || post.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-accent-500 dark:text-dark-text-tertiary">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {post.views || 0}
                          </span>
                          {post.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <StarRating rating={post.rating} size="small" showNumber={false} />
                              <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                                ({post.totalRatings || 0})
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-accent-500 dark:text-dark-text-tertiary whitespace-nowrap">
                          {post.readTime || '5 دقائق'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-accent-400 dark:text-dark-text-quaternary mx-auto mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                لم يتم العثور على مقالات
              </h3>
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                جرب تغيير معايير البحث أو الفلترة
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Post - Only show if we have featured posts */}
      {blogPosts.some(post => post.featured) && (
        <section className="py-6 sm:py-8 md:py-12 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom px-4 sm:px-6">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">المقال المميز</h2>
            </div>

            <div className="card-interactive overflow-hidden max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2">
                  <div className="relative h-48 sm:h-64 md:h-full min-h-[200px] bg-gradient-to-br from-orange-400 via-orange-500 to-red-500">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full opacity-30"></div>
                      <div className="absolute top-12 right-8 w-8 h-8 bg-white rounded-full opacity-20"></div>
                      <div className="absolute bottom-8 left-12 w-12 h-12 bg-white rounded-full opacity-25"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 bg-white rounded-full opacity-30"></div>
                      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white rounded-full opacity-20"></div>
                    </div>

                    {/* Main Content Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                    {/* Generated Image Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-4 sm:p-6 text-center">
                      {/* Blog Icon */}
                      <div className="mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Auto-generated Title */}
                      <h3 className="text-white text-base sm:text-lg font-bold leading-tight mb-1.5 sm:mb-2 drop-shadow-lg max-w-full line-clamp-2 px-2">
                        {blogPosts.find(post => post.featured)?.title}
                      </h3>

                      {/* Auto-generated Subtitle */}
                      <p className="text-white text-xs sm:text-sm opacity-90 max-w-full line-clamp-2 sm:line-clamp-3 px-2">
                        {blogPosts.find(post => post.featured)?.excerpt ?
                          (blogPosts.find(post => post.featured)?.excerpt.length > 100 ? blogPosts.find(post => post.featured)?.excerpt.substring(0, 100) + '...' : blogPosts.find(post => post.featured)?.excerpt) :
                          'اكتشف المزيد في هذا المقال المميز'
                        }
                      </p>
                    </div>

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <span className="px-2.5 py-1 sm:px-3 bg-primary-500 text-white text-xs sm:text-sm rounded-full">
                        مميز
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(blogPosts.find(post => post.featured)?.categories && blogPosts.find(post => post.featured)?.categories.length > 0 ?
                        blogPosts.find(post => post.featured)?.categories :
                        [blogPosts.find(post => post.featured)?.category]).slice(0, 3).map((category, index) => (
                          <span key={index} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-xs sm:text-sm rounded-full">
                            {category}
                          </span>
                        ))}
                      {((blogPosts.find(post => post.featured)?.categories && blogPosts.find(post => post.featured)?.categories.length > 3) ||
                        (!blogPosts.find(post => post.featured)?.categories && blogPosts.find(post => post.featured)?.category)) && (
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-xs sm:text-sm rounded-full">
                            +{((blogPosts.find(post => post.featured)?.categories && blogPosts.find(post => post.featured)?.categories.length) || 1) - 3} أخرى
                          </span>
                        )}
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                    {blogPosts.find(post => post.featured)?.title}
                  </h3>

                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-6 line-clamp-3">
                    {blogPosts.find(post => post.featured)?.excerpt}
                  </p>

                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm">
                        {blogPosts.find(post => post.featured)?.author?.name?.charAt(0) || 'م'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">بواسطة</p>
                      <p className="font-medium text-sm sm:text-base text-accent-700 dark:text-dark-text-primary truncate">
                        {blogPosts.find(post => post.featured)?.author?.name || 'كاتب غير معروف'}
                      </p>
                    </div>
                    <div className="flex-1 hidden sm:block"></div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                        {formatDate(blogPosts.find(post => post.featured)?.publishedAt || blogPosts.find(post => post.featured)?.createdAt)}
                      </p>
                      <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                        {blogPosts.find(post => post.featured)?.readTime || '5 دقائق'}
                      </p>
                    </div>
                  </div>

                  <Link href={`/blog/${blogPosts.find(post => post.featured)?.slug}`} className="btn-primary w-full sm:w-auto text-center">
                    اقرأ المقال
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


    </main>
  );
}