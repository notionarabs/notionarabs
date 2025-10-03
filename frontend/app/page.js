'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../lib/api';
import FollowButton from '../components/FollowButton';
import { Settings, BookOpen, Briefcase, Sunrise, Palette, Laptop, Dumbbell, PiggyBank, FolderTree, CalendarDays, LayoutDashboard, Users, Newspaper, Check, X, Youtube, Facebook, Send } from 'lucide-react';

// Fallback data for when API fails
const fallbackTemplates = [
  {
    title: "مخطط الدراسة",
    creator: "علي حسن",
    imgSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    tag: "شائع",
    price: "مجاني",
    rating: 4.8,
    downloads: 1200,
    isFree: true,
  },
  {
    title: "لوحة تحكم الشركة الناشئة",
    creator: "سارة محمد",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
    tag: "جديد",
    price: "مجاني",
    rating: 4.9,
    downloads: 890,
    isFree: true,
  },
  {
    title: "المذكرة الشخصية",
    creator: "أحمد ياسر",
    imgSrc: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&crop=center",
    tag: "مجاني",
    price: "مجاني",
    rating: 4.7,
    downloads: 2100,
    isFree: true,
  },
  {
    title: "مدير المهام",
    creator: "منى خالد",
    imgSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    tag: "رائج",
    price: "مجاني",
    rating: 4.6,
    downloads: 1500,
    isFree: true,
  },
];

// Use Lucide icons instead of external images for categories
const categories = [
  { name: "الإنتاجية", count: 0, Icon: Settings, bg: "from-primary-100 to-primary-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الدراسة", count: 0, Icon: BookOpen, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الأعمال", count: 0, Icon: Briefcase, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "الحياة الشخصية", count: 0, Icon: Sunrise, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30" },
  { name: "الإبداع", count: 0, Icon: Palette, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "التقنية", count: 0, Icon: Laptop, bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30" },
  { name: "الصحة", count: 0, Icon: Dumbbell, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "المالية", count: 0, Icon: PiggyBank, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "التنظيم", count: 0, Icon: FolderTree, bg: "from-zinc-100 to-zinc-200 dark:from-zinc-900/30 dark:to-zinc-800/30" },
  { name: "التخطيط", count: 0, Icon: CalendarDays, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
];

// Map Arabic category names to English slugs for URLs
const categorySlugMap = {
  'الإنتاجية': 'productivity',
  'الدراسة': 'study',
  'الأعمال': 'business',
  'الحياة الشخصية': 'personal',
  'الإبداع': 'creativity',
  'التقنية': 'technology',
  'الصحة': 'health',
  'المالية': 'finance',
  'التنظيم': 'organization',
  'التخطيط': 'planning',
  // Fallbacks for simpler labels used in this grid
  'العمل': 'work',
  'الحياة': 'life',
  'الشخصي': 'personal'
};

const creators = [
  { name: "ليلى أحمد", templates: 20, bio: "قوالب الإنتاجية", imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", rating: 4.9 },
  { name: "عمر خالد", templates: 15, bio: "إعدادات الدراسة والبحث", imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", rating: 4.8 },
  { name: "فاطمة نور", templates: 25, bio: "لوحات العمل والأعمال", imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", rating: 4.7 },
];


export default function HomePage() {
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
  const [topCreators, setTopCreators] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loadingCreators, setLoadingCreators] = useState(true);

  // Fetch featured templates from API
  useEffect(() => {
    const fetchFeaturedTemplates = async () => {
      try {
        setLoading(true);
        const response = await api.get('/templates?limit=3&sortBy=downloads&sortOrder=desc');

        if (response.data.success) {
          setFeaturedTemplates(response.data.templates || []);
        } else {
          setFeaturedTemplates(fallbackTemplates);
        }
      } catch (error) {
        setFeaturedTemplates(fallbackTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTemplates();
  }, []);

  // Fetch homepage aggregates (totals, top creators, category counts)
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        setLoadingCreators(true);
        const categoriesArabic = [
          'الإنتاجية',
          'الدراسة',
          'الأعمال',
          'الحياة الشخصية',
          'الإبداع',
          'التقنية',
          'الصحة',
          'المالية',
          'التنظيم',
          'التخطيط'
        ];

        const templatesCountReq = api.get('/templates?limit=1');
        const creatorsReq = api.get('/creators?limit=3&sortBy=popular');
        const specialtiesCountReq = api.get('/creators/stats/specialties');
        const downloadsCountReq = api.get('/creators/stats/downloads');
        const categoryCountReqs = categoriesArabic.map((name) =>
          api
            .get(`/templates?category=${encodeURIComponent(name)}&limit=1`)
            .then((res) => ({ name, total: res?.data?.pagination?.total || 0 }))
            .catch(() => ({ name, total: 0 }))
        );

        const [templatesRes, creatorsRes, specialtiesRes, downloadsRes, categoryTotalsArr] = await Promise.all([
          templatesCountReq,
          creatorsReq,
          specialtiesCountReq,
          downloadsCountReq,
          Promise.all(categoryCountReqs)
        ]);

        const totalTemplates = templatesRes?.data?.pagination?.total || 0;
        const totalCreators = creatorsRes?.data?.pagination?.total || 0;
        const totalSpecialties = specialtiesRes?.data?.count || 0;
        const totalDownloads = downloadsRes?.data?.count || 0;
        setStats({ templates: totalTemplates, creators: totalCreators, specialties: totalSpecialties, downloads: totalDownloads });

        const creatorsList = creatorsRes?.data?.creators || [];
        setTopCreators(creatorsList);

        const totalsMap = {};
        categoryTotalsArr.forEach(({ name, total }) => {
          totalsMap[name] = total;
        });
        setCategoryTotals(totalsMap);
      } catch (error) {
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchHomepageData();
  }, []);

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };



  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Enhanced Hero Section with Notion-inspired Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 transition-colors duration-300">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Floating Notion-style Blocks */}
          <div className="hidden sm:block absolute top-20 left-10 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 rounded-lg shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden sm:block absolute top-40 right-20 w-12 h-12 bg-gray-100/70 dark:bg-dark-quaternary/70 rounded-md shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-32 left-1/4 w-20 h-20 bg-white/50 dark:bg-dark-tertiary/50 rounded-xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden lg:block absolute top-1/3 right-1/3 w-14 h-14 bg-gray-50/80 dark:bg-dark-quaternary/80 rounded-lg shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-20 right-10 w-18 h-18 bg-white/40 dark:bg-dark-tertiary/40 rounded-2xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>

          {/* Gradient Orbs */}
          <div className="hidden sm:block absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-orange-500/10 dark:to-orange-600/10 rounded-full blur-3xl motion-safe:animate-pulse"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-100/40 to-black/20 dark:from-dark-tertiary/20 dark:to-dark-primary/40 rounded-full blur-3xl motion-safe:animate-pulse"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="container-custom relative z-10">
          {/* Hero Content */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm text-accent-500 dark:text-dark-text-primary rounded-full text-sm font-medium mb-6 text-reveal shadow-lg dark:shadow-dark-medium border border-primary-200 dark:border-orange-500/30 transition-colors duration-300">
                <span className="w-2 h-2 bg-primary-500 dark:bg-orange-500 rounded-full ml-2 pulse-glow"></span>
                قوالب عربية عالية الجودة
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6 text-reveal-delayed leading-tight tracking-tight">
                <div className="block">
                  <div className="block">المنصة العربية الأولى لقوالب</div>
                  <div className="block mt-2 md:mt-3 lg:mt-4">نوشن</div>
                </div>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto text-reveal-delayed-2 leading-relaxed px-2 sm:px-0">
                اكتشف قوالب نوشن عربية عالية الجودة مصممة للعمل والدراسة والتنظيم الشخصي. انضم لمجتمع المبدعين العرب وابدأ رحلتك نحو الإنتاجية.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 text-reveal-delayed-3">
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  استكشف القوالب
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/creators/apply"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm text-accent-600 dark:text-dark-text-primary rounded-xl border-2 border-primary-200 dark:border-orange-500/30 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  انضم كمبدع
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 dark:text-orange-500 mb-1 sm:mb-2">{stats.templates}</div>
                  <div className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary">قالب متاح</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.creators}</div>
                  <div className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary">مبدع نشط</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.downloads}</div>
                  <div className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary">تحميل</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.specialties}</div>
                  <div className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary">مجال متخصص</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Templates */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">القوالب المميزة</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">اكتشف أفضل القوالب المصممة من قبل مجتمعنا العربي</p>
            </div>
            <a
              href="/templates"
              className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              عرض الكل
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700"></div>
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
              ))
            ) : (
              featuredTemplates.map((t, idx) => (
                <Link key={t._id || idx} href={`/templates/${t.slug || t._id}`}>
                  <div className="group card-interactive overflow-hidden">
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden rounded-lg">
                      {t.previewImage ? (
                        <Image
                          src={t.previewImage}
                          alt={t.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="absolute top-2 sm:top-3 right-2 sm:right-3 text-xs px-2 sm:px-3 py-1 rounded-full font-medium bg-green-500 text-white">
                        مجاني
                      </span>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="font-bold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-2 group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                        {t.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary mb-3">بواسطة {t.creator?.name || 'مبدع غير معروف'}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <StarRating rating={t.rating || 0} />
                          <span className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">({t.downloads || 0})</span>
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-secondary">مجاني</div>
                      </div>

                      <button className="w-full btn-primary py-2 sm:py-3 px-4 text-sm sm:text-base">
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Categories */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">تصفح حسب التصنيف</h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">اختر التصنيف المناسب لاحتياجاتك</p>
          </div>

          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {categories.slice(0, 6).map((c, idx) => (
                <Link href={`/templates?category=${encodeURIComponent(c.name)}`} key={idx} className="group">
                  <div className="card-interactive border-2 border-gray-100 overflow-hidden hover:border-accent-300 hover:shadow-large transition-all duration-300">
                    <div className={`h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden relative flex items-center justify-center bg-gradient-to-br ${c.bg}`}>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                        <c.Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-accent-700 dark:text-dark-text-primary" />
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 lg:p-6 text-center">
                      <h3 className="font-bold text-xs sm:text-sm md:text-base text-accent-500 dark:text-dark-text-primary group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors mb-1 sm:mb-2">
                        {c.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-secondary">{categoryTotals[c.name] ?? 0} قالب</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Creators */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">المبدعين المميزين</h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">تعرف على أفضل المبدعين في مجتمعنا</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {loadingCreators ? (
              [...Array(5)].map((_, idx) => (
                <div key={idx} className="group text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto" />
                  </div>
                </div>
              ))
            ) : (topCreators && topCreators.length > 0) ? (
              topCreators.map((cr, idx) => (
                <div key={cr.id || idx} className="group text-center">
                  <Link href={`/creators/${cr.username || cr.email?.split('@')[0] || cr.displayName || cr.name || cr.id || cr._id || idx}`}>
                    <div className="transition-transform duration-300 group-hover:scale-105">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                        {cr.profilePicture ? (
                          <Image
                            src={cr.profilePicture}
                            alt={cr.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border-2 border-white shadow-md">
                            <span className="text-lg sm:text-xl font-bold text-primary-500 dark:text-orange-400">
                              {cr.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm sm:text-base text-accent-500 dark:text-dark-text-primary group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                        {cr.name}
                      </h3>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-accent-600 dark:text-dark-text-secondary">لا يوجد مبدعين لعرضهم حالياً.</div>
            )}
          </div>
        </div>
      </section>




      {/* Enhanced Call-to-Action Banner */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container-custom max-w-6xl">
          <div className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-600/20 dark:from-orange-500/20 dark:to-orange-600/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white dark:text-dark-text-primary mb-4 sm:mb-6">
                ابدأ بيع قوالبك اليوم!
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl mx-auto leading-relaxed">
                انضم إلى آلاف المبدعين العرب وابدأ في كسب المال من قوالبك المبتكرة
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8">
                <Link
                  href="/creators/apply"
                  className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-large hover:shadow-glow w-full sm:w-auto text-center"
                >
                  كن مبدعاً
                  <svg className="inline-block mr-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/templates"
                  className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center"
                >
                  تصفح القوالب
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-300 dark:text-dark-text-tertiary">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-dark-text-primary" /><span>بدون رسوم إعداد</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-dark-text-primary" /><span>دفع آمن وسريع</span></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-dark-text-primary" /><span>دعم فني 24/7</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-end">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
