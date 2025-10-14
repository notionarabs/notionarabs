'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import StarRating from '../components/StarRating';
import { Settings, BookOpen, Briefcase, Heart, Palette, Laptop, Dumbbell, PiggyBank, FolderTree, CalendarDays, LayoutDashboard, Users, Check, Youtube, Facebook, Send, Zap, Target, Lightbulb, TrendingUp, Crown, Sparkles, Award, Trophy, Gem, Download, CheckCircle, Star } from 'lucide-react';

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

// Most important categories with better icons
const categories = [
  { name: "الإنتاجية", count: 0, Icon: Zap, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الدراسة", count: 0, Icon: BookOpen, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الأعمال", count: 0, Icon: TrendingUp, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "الحياة الشخصية", count: 0, Icon: Heart, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30" },
  { name: "الإبداع", count: 0, Icon: Lightbulb, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "التخطيط", count: 0, Icon: Target, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "المراجعة", count: 0, Icon: Check, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "التسويق", count: 0, Icon: Users, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
];

// Map Arabic category names to English slugs for URLs
const categorySlugMap = {
  'الإنتاجية': 'productivity',
  'الدراسة': 'study',
  'الأعمال': 'business',
  'الحياة الشخصية': 'personal',
  'الإبداع': 'creativity',
  'التخطيط': 'planning',
  'المراجعة': 'review',
  'التسويق': 'marketing',
  // Fallbacks for simpler labels used in this grid
  'العمل': 'business',
  'الحياة': 'personal',
  'الشخصي': 'personal'
};

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { isMaintenanceMode, hasCheckedMaintenance } = useMaintenance();
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
  const [topCreators, setTopCreators] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [loadingCreators, setLoadingCreators] = useState(true);
  const animationsPlayedRef = useRef(false);

  // Mark animations as played after they complete
  useEffect(() => {
    const timer = setTimeout(() => {
      animationsPlayedRef.current = true;
    }, 2000); // After all animations complete (0.9s + 1s)

    return () => clearTimeout(timer);
  }, []);

  // Fetch featured templates from API (prioritizing pinned, then most famous and highest-rated)
  useEffect(() => {
    // Don't fetch data until maintenance mode check is complete
    if (!hasCheckedMaintenance) {
      return;
    }

    const fetchFeaturedTemplates = async () => {
      try {
        setLoading(true);

        // Check if maintenance mode is active before making API calls
        if (isMaintenanceMode) {
          setLoading(false);
          return;
        }

        let pinnedTemplates = [];
        let regularTemplates = [];

        // Step 1: Fetch ALL templates to get pinned ones (we'll filter client-side)
        // This ensures pinned templates are always included
        const allTemplatesResponse = await api.get('/templates?limit=100&sortBy=createdAt&sortOrder=desc');

        if (allTemplatesResponse.data.success) {
          const allTemplates = allTemplatesResponse.data.templates || [];

          // Separate pinned from regular templates
          pinnedTemplates = allTemplates.filter(t => t.isPinned);
          const pinnedIds = new Set(pinnedTemplates.map(t => t._id));

          // Get high-rated templates (excluding already pinned ones)
          regularTemplates = allTemplates
            .filter(t => !pinnedIds.has(t._id) && (
              (t.rating >= 3.5 && (t.reviewsCount >= 1 || t.downloads >= 5)) ||
              t.downloads >= 10
            ))
            .slice(0, 30);
        }

        // If we don't have enough regular templates, just take the first non-pinned ones
        if (regularTemplates.length < 6) {
          const fallbackResponse = await api.get('/templates?limit=20&sortBy=downloads&sortOrder=desc');
          if (fallbackResponse.data.success) {
            const fallbackTemplates = fallbackResponse.data.templates || [];
            const existingIds = new Set([
              ...pinnedTemplates.map(t => t._id),
              ...regularTemplates.map(t => t._id)
            ]);

            const additionalTemplates = fallbackTemplates
              .filter(t => !existingIds.has(t._id))
              .slice(0, 6 - regularTemplates.length);

            regularTemplates.push(...additionalTemplates);
          }
        }

        // Sort pinned templates by pinnedAt date (most recently pinned first)
        pinnedTemplates.sort((a, b) => {
          const dateA = a.pinnedAt ? new Date(a.pinnedAt) : new Date(0);
          const dateB = b.pinnedAt ? new Date(b.pinnedAt) : new Date(0);
          return dateB - dateA;
        });

        // Sort regular templates by a combination of factors
        regularTemplates.sort((a, b) => {
          const scoreA = (a.rating || 0) * 0.5 + (a.downloads || 0) * 0.3 + (a.reviewsCount || 0) * 0.2;
          const scoreB = (b.rating || 0) * 0.5 + (b.downloads || 0) * 0.3 + (b.reviewsCount || 0) * 0.2;
          return scoreB - scoreA;
        });

        // Combine: pinned first, then regular templates (limit to 6 total)
        const combinedTemplates = [...pinnedTemplates, ...regularTemplates].slice(0, 6);

        setFeaturedTemplates(combinedTemplates);
      } catch (error) {
        console.error('Error fetching featured templates:', error);
        // Fallback to simple download-based selection
        try {
          const response = await api.get('/templates?limit=6&sortBy=downloads&sortOrder=desc');
          if (response.data.success) {
            setFeaturedTemplates(response.data.templates || []);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch failed:', fallbackError);
          setFeaturedTemplates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTemplates();
  }, [hasCheckedMaintenance]);

  // Fetch homepage aggregates (totals, top creators, category counts)
  useEffect(() => {
    // Don't fetch data until maintenance mode check is complete
    if (!hasCheckedMaintenance) {
      return;
    }

    const fetchHomepageData = async () => {
      try {
        setLoadingCreators(true);

        // Check if maintenance mode is active before making API calls
        if (isMaintenanceMode) {
          setLoadingCreators(false);
          return;
        }

        // Use optimized single endpoint for all homepage stats
        const response = await api.get('/stats/homepage');

        if (response.data.success) {
          setStats(response.data.stats);
          setCategoryTotals(response.data.categoryTotals);
          setTopCreators(response.data.topCreators);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        // Fallback to default values
        setStats({ templates: 0, creators: 0, specialties: 0, downloads: 0 });
        setCategoryTotals({});
        setTopCreators([]);
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchHomepageData();
  }, [hasCheckedMaintenance, isMaintenanceMode]);




  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Enhanced Hero Section with Notion-inspired Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 transition-colors duration-300 min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] flex items-center">
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

        {/* Well-Separated Animated Template Squares */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Large Blue Template - Top Left */}
          <div className="hidden lg:block absolute top-16 left-16 w-32 h-32 bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl mb-3 shadow-lg"></div>
              <div className="w-16 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Green Template - Top Right */}
          <div className="hidden lg:block absolute top-24 right-24 w-20 h-20 bg-white/70 dark:bg-dark-tertiary/70 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Small Purple Template - Middle Left */}
          <div className="hidden md:block absolute top-1/2 left-8 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 backdrop-blur-sm rounded-lg shadow-md dark:shadow-dark-soft floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-3">
              <div className="w-6 h-6 bg-purple-500 rounded-md mb-1"></div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Extra Large Orange Template - Bottom Right */}
          <div className="hidden xl:block absolute bottom-16 right-16 w-36 h-36 bg-white/50 dark:bg-dark-tertiary/50 backdrop-blur-sm rounded-3xl shadow-2xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-xl"></div>
              <div className="w-20 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-16 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-12 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Red Template - Bottom Left */}
          <div className="hidden lg:block absolute bottom-24 left-12 w-24 h-24 bg-white/65 dark:bg-dark-tertiary/65 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-14 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-10 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>
        </div>

        <div className="container-custom relative z-10">
          {/* Hero Content */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              {/* Enhanced Badge with Better Contrast */}
              <div className={`inline-flex items-center px-4 py-2 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-full text-sm font-semibold mb-6 ${!animationsPlayedRef.current ? 'text-reveal' : ''} shadow-lg dark:shadow-dark-medium border border-primary-300 dark:border-orange-400/50 transition-colors duration-300`}>
                <span className="w-2 h-2 bg-primary-600 dark:bg-orange-400 rounded-full ml-2 pulse-glow"></span>
                قوالب عربية عالية الجودة
              </div>

              {/* Main Heading */}
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6 ${!animationsPlayedRef.current ? 'text-reveal-delayed' : ''} leading-tight tracking-tight`}>
                <div className="block">
                  <div className="block">المنصة العربية الأولى</div>
                  <div className="block mt-2 md:mt-3 lg:mt-4"><span className="whitespace-nowrap">لقوالب نوشن</span></div>
                </div>
              </h1>

              {/* Enhanced Description with Better Typography */}
              <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayedRef.current ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                اكتشف قوالب نوشن عربية عالية الجودة مصممة للعمل والدراسة والتنظيم الشخصي. انضم لمجتمع المبدعين العرب وابدأ رحلتك نحو الإنتاجية.
              </p>

              {/* Enhanced CTA Buttons with Better Animations */}
              <div className={`flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 ${!animationsPlayedRef.current ? 'text-reveal-delayed-3' : ''}`}>
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  استكشف القوالب
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={isAuthenticated && user?.creatorStatus === 'approved' ? '/profile' : '/creators/apply'}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-xl border-2 border-primary-300 dark:border-orange-400/50 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  {isAuthenticated && user?.creatorStatus === 'approved' ? 'لوحة التحكم' : 'انضم كمبدع'}
                </Link>
              </div>

              {/* Enhanced Stats with Better Visual Hierarchy and Consistent Shadows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 dark:text-orange-500 mb-1 sm:mb-2">{stats.templates}</div>
                  <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">قالب متاح</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.creators}</div>
                  <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">مبدع نشط</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.downloads}</div>
                  <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">تحميل</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/10 dark:bg-dark-tertiary/20 backdrop-blur-sm shadow-lg border border-white/20 dark:border-dark-card-border/30">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-1 sm:mb-2">{stats.specialties}</div>
                  <div className="text-xs sm:text-sm font-medium text-accent-600 dark:text-dark-text-primary">مجال متخصص</div>
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
            <Link
              href="/templates"
              className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              عرض الكل
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(6)].map((_, idx) => (
                <div key={idx} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
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
                  <div className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-40">
                      {t.previewImage ? (
                        <Image
                          src={t.previewImage}
                          alt={t.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover object-[50%_30%]"
                          priority={idx < 3}
                          loading={idx < 3 ? 'eager' : 'lazy'}
                          quality={85}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-4 sm:p-6 relative">
                      <h3 className="font-semibold text-sm sm:text-base text-accent-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {t.title}
                      </h3>

                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={t.rating || 0} size="small" showNumber={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.creator?.profilePicture ? (
                            <Image
                              src={t.creator.profilePicture}
                              alt={t.creator?.name || 'مبدع'}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                              loading="lazy"
                              quality={75}
                            />
                          ) : (
                            <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                {t.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                            {t.creator?.name || 'مبدع غير معروف'}
                          </span>
                        </div>
                        {t.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t.price} ر.س
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Categories - Redesigned */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">التصنيفات المميزة</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">اكتشف طرق جديدة لاستخدام نوشن</p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 text-accent-700 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              تصفح جميع التصنيفات
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 8).map((c, idx) => (
              <Link href={`/categories/${categorySlugMap[c.name] || c.name.toLowerCase()}`} key={idx} className="group">
                <div className="bg-white dark:bg-dark-tertiary rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border hover:shadow-md hover:border-accent-300 dark:hover:border-accent-400 transition-all duration-300 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${c.bg} backdrop-blur-sm border border-white/20 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <c.Icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3 className="font-bold text-sm sm:text-base text-accent-500 dark:text-dark-text-primary text-center mb-2 group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                    {c.name}
                  </h3>

                  {/* Template Count */}
                  <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary text-center mb-4">
                    {categoryTotals[c.name] ?? 0} قالب
                  </p>

                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Creators */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">المبدعين المميزين</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">تعرف على أفضل المبدعين في مجتمعنا</p>
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
                    {/* Profile Picture Skeleton with Shimmer */}
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 mb-3 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />

                    {/* Name Skeleton */}
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-3/4 mx-auto bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    {/* Bio Skeleton */}
                    <div className="space-y-2 mb-4 flex-1">
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-4/5 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/5 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>

                    {/* Stats skeleton - matches actual card structure */}
                    <div className="mt-auto flex items-center justify-between text-xs">
                      {/* Template Count */}
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-6 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-8 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                      </div>

                      {/* Followers */}
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-8 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-10 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                      </div>

                      {/* Rating */}
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
                  <div className="group bg-white dark:bg-dark-tertiary rounded-xl p-6 shadow-sm border border-gray-200 dark:border-dark-card-border hover:shadow-md hover:border-primary-300 dark:hover:border-primary-400 transition-all duration-300 h-full flex flex-col">
                    <div className="text-center mb-4 flex-shrink-0">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        {cr.profilePicture ? (
                          <Image
                            src={cr.profilePicture}
                            alt={cr.name}
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
                        {/* Creator Badges */}
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
                                  {/* Tooltip */}
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

                      {/* Creator Stats */}
                      <div className="mt-auto flex items-center justify-between text-xs">
                        {/* Template Count */}
                        <div className="flex items-center gap-1">
                          <span className="text-accent-600 dark:text-dark-text-secondary">
                            {(cr.templatesCount || cr.templateCount || cr.totalTemplates || 0).toLocaleString()}
                          </span>
                          <span className="text-accent-500 dark:text-dark-text-tertiary">قالب</span>
                        </div>

                        {/* Followers */}
                        <div className="flex items-center gap-1">
                          <span className="text-accent-600 dark:text-dark-text-secondary">
                            {(cr.followersCount || cr.followers || cr.totalFollowers || 0).toLocaleString()}
                          </span>
                          <span className="text-accent-500 dark:text-dark-text-tertiary">متابع</span>
                        </div>

                        {/* Rating */}
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
                  href={isAuthenticated && user?.creatorStatus === 'approved' ? '/profile' : '/creators/apply'}
                  className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-large hover:shadow-glow w-full sm:w-auto text-center"
                >
                  {isAuthenticated && user?.creatorStatus === 'approved' ? 'لوحة التحكم' : 'كن مبدعاً'}
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
                  alt="عرب نوشن - منصة قوالب نوشن العربية"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  loading="lazy"
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
