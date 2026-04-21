'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useToast } from '../../contexts/ToastContext';
import StarRating from '../../components/StarRating';
import Footer from '../../components/Footer';
// Removed Fuse.js import - now using server-side search


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
  const [isSortOpen, setIsSortOpen] = useState(false);
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
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const blogPosts = allBlogPosts;

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let backendSortBy = 'publishedAt';
      let backendSortOrder = 'desc';

      if (sortBy === 'oldest') {
        backendSortBy = 'publishedAt';
        backendSortOrder = 'asc';
      } else if (sortBy === 'views') {
        backendSortBy = 'views';
        backendSortOrder = 'desc';
      }

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy: backendSortBy,
        sortOrder: backendSortOrder
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/blogs?${params.toString()}`);

      if (response.data.success) {
        setAllBlogPosts(response.data.blogs || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: response.data.pagination.current,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
        }
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

  useEffect(() => {
    fetchBlogPosts();
  }, [searchTerm, selectedCategory, sortBy, pagination.current]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSortOpen) return;
      if (sortButtonRef.current?.contains(event.target) || sortMenuRef.current?.contains(event.target)) return;
      setIsSortOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSortOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-[#0a0a0a] text-foreground dark:text-white transition-colors duration-300" dir="rtl">
      
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tight">
              مدونة <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">عرب نوشن</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              مكانك الأول لتعلم أسرار الإنتاجية، احتراف نظم نوشن، ومتابعة أحدث الابتكارات التقنية بأيادٍ عربية.
            </p>

             <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all hover:border-primary/50 focus-within:border-primary">
                <input
                  type="text"
                  placeholder="عن ماذا تريد أن تقرأ اليوم؟ (مثال: تنظيم الوقت، برمجة، إدارة فريق)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchBlogPosts()}
                  className="w-full bg-transparent border-none focus:ring-0 px-8 py-5 text-lg text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/30"
                />
                <button
                  onClick={() => fetchBlogPosts()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {blogPosts.some(post => post.featured) && (
        <section className="py-20">
          <div className="container-custom px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-px bg-primary/30" />
              <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-widest">المقال المميز</h2>
            </div>

            {(() => {
              const post = blogPosts.find(p => p.featured);
              return (
                <Link href={`/blog/${post.slug}`} className="group block relative overflow-hidden rounded-[3rem] bg-card border border-card-border hover:border-primary/40 transition-all duration-700 shadow-2xl shadow-primary/5">
                  <div className="flex flex-col lg:flex-row min-h-[500px]">
                    <div className="w-full lg:w-1/2 relative overflow-hidden h-64 lg:h-auto">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-600 opacity-90 group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 flex items-center justify-center text-white/10">
                          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                          </svg>
                       </div>
                       <div className="absolute top-8 right-8 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/5 text-white font-black text-xs uppercase tracking-widest">
                        نظام مختار
                       </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-3 mb-8">
                        {(post.categories || [post.category]).slice(0, 3).map((cat, i) => (
                          <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-3xl lg:text-5xl font-black text-foreground dark:text-white mb-6 leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-lg text-foreground/60 dark:text-white/40 mb-10 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-6 pb-10 border-b border-card-border mb-10">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-primary/10 border border-card-border overflow-hidden p-0.5">
                              {post.author?.profilePicture ? (
                                <img src={post.author.profilePicture} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-black">{post.author?.name?.charAt(0)}</div>
                              )}
                           </div>
                           <div>
                              <p className="text-xs text-foreground/40 dark:text-white/30 font-bold uppercase tracking-widest">المؤلف</p>
                              <p className="text-sm font-black text-foreground dark:text-white">{post.author?.name || "كاتب عرب نوشن"}</p>
                           </div>
                         </div>
                         <div className="h-8 w-px bg-card-border" />
                         <div>
                            <p className="text-xs text-foreground/40 dark:text-white/30 font-bold uppercase tracking-widest">وقت القراءة</p>
                            <p className="text-sm font-black text-foreground dark:text-white">{post.readTime || "5 دقائق"}</p>
                         </div>
                      </div>

                      <div className="btn-primary inline-flex self-start px-8 py-4 rounded-2xl">
                        اقرأ المقال الكامل
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="py-20">
        <div className="container-custom px-4 sm:px-6">
           <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary/30" />
                <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-widest">أحدث المقالات</h2>
              </div>

               <div className="flex items-center gap-6">
                  {loading ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-foreground/40 dark:text-white/30 hidden sm:block">
                      تم العثور على <span className="text-foreground dark:text-white">{pagination.total}</span> مقال متاح
                    </p>
                  )}

                  <div className="relative">
                    <button
                      ref={sortButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSortOpen(!isSortOpen);
                      }}
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold hover:border-primary/40 transition-all focus:outline-none"
                    >
                      <span className="text-foreground/40 dark:text-white/30 tracking-widest">الترتيب:</span>
                      <span className="text-foreground dark:text-white">{sortOptions.find(o => o.value === sortBy)?.name}</span>
                    </button>
                    {isSortOpen && (
                      <div ref={sortMenuRef} className="absolute z-50 mt-3 w-48 left-0 rounded-2xl bg-white dark:bg-dark-secondary border border-card-border shadow-2xl overflow-hidden">
                        {sortOptions.map((opt) => (
                          <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-6 py-4 text-sm font-bold transition-all ${sortBy === opt.value ? 'bg-primary/10 text-primary' : 'text-foreground/60 dark:text-white/50 hover:bg-white/5 hover:text-primary'}`}>
                            {opt.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
           </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[500px] rounded-[2.5rem] bg-card border-none animate-pulse" />
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {blogPosts.map((post, index) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group h-full">
                  <div
                    className="relative overflow-hidden rounded-[2.5rem] bg-card border border-card-border hover:border-primary/40 transition-all duration-500 shadow-2xl shadow-primary/5 h-full flex flex-col"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-56 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600 opacity-90 transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:rotate-12 transition-transform duration-700">
                          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                          </svg>
                          <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {post.category || post.categories?.[0] || "مقال"}
                          </div>
                       </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-foreground dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-foreground/60 dark:text-white/40 mb-8 line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-card-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-card-border p-0.5">
                            {post.author?.profilePicture ? (
                              <img src={post.author.profilePicture} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary">{post.author?.name?.charAt(0)}</div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground/80 dark:text-white/70 truncate">{post.author?.name || "مبدع"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40 dark:text-white/30 uppercase tracking-widest">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           {post.readTime || "5د"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
               <h3 className="text-xl font-black text-foreground/40 dark:text-white/20 uppercase tracking-widest">لم يتم العثور على مقالات</h3>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && !loading && (
            <div className="flex justify-center mt-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setPagination(p => ({...p, current: Math.max(1, p.current - 1)})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={pagination.current <= 1}
                  className="px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold text-foreground dark:text-white hover:border-primary/40 disabled:opacity-30 focus:outline-none"
                >
                  السابق
                </button>
                <div className="flex items-center gap-2">
                   {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPagination(p => ({...p, current: i + 1})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all focus:outline-none ${pagination.current === i + 1 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-white/5 dark:bg-white/5 border-card-border text-foreground/60 dark:text-white/40 hover:border-primary/40'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setPagination(p => ({...p, current: Math.min(pagination.pages, p.current + 1)})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={pagination.current >= pagination.pages}
                  className="px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold text-foreground dark:text-white hover:border-primary/40 disabled:opacity-30 focus:outline-none"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}