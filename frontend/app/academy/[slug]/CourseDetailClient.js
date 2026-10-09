'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  GraduationCap, 
  Award, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Check, 
  Video, 
  Database, 
  Layout, 
  Cpu, 
  Star,
  Search,
  Compass,
  Users,
  Target,
  Zap,
  FolderGit2,
  HelpCircle,
  Share2,
  FileText,
  UserCheck
} from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import AcademyComingSoon from '../AcademyComingSoon';

const MODULE_ICONS = [
  Layout,       // 02 Getting Started
  Layers,       // 03 Pages & Blocks
  Database,     // 04 Database Fundamentals
  Database,     // 05 Advanced Databases
  Cpu,          // 06 Advanced Features
  Sparkles      // 07 Notion AI
];

export default function CourseDetailClient({ slug = 'notion-masterclass' }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStickyBar, setShowStickyBar] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isDev = process.env.NODE_ENV === 'development';
  const bunnyLibraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID || '774454';

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await api.get(`/courses/${slug}`);
        if (res.data?.course) {
          setCourse(res.data.course);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  // Handle sticky CTA visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show Coming Soon page in production for non-admins if desired
  if (!authLoading && !isAdmin && !isDev) {
    return <AcademyComingSoon user={user} isAuthenticated={isAuthenticated} />;
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0 دقيقة';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours} ساعة و ${remMins} دقيقة`;
  };

  const formatLessonDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleModule = (index) => {
    setOpenModuleIndex(prev => prev === index ? -1 : index);
  };

  const totalLessons = useMemo(() => {
    return (course?.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  }, [course?.modules]);

  const totalDuration = useMemo(() => {
    return (course?.modules || []).reduce((acc, m) => {
      return acc + (m.lessons || []).reduce((lAcc, l) => lAcc + (l.duration || 0), 0);
    }, 0);
  }, [course?.modules]);

  const filteredModules = useMemo(() => {
    if (!course?.modules) return [];
    if (!searchQuery.trim()) return course.modules;

    const query = searchQuery.trim().toLowerCase();
    return course.modules
      .map(module => {
        const matchingLessons = (module.lessons || []).filter(lesson => 
          (lesson.titleAr || '').toLowerCase().includes(query) ||
          (lesson.title || '').toLowerCase().includes(query)
        );
        return {
          ...module,
          lessons: matchingLessons
        };
      })
      .filter(module => (module.lessons || []).length > 0);
  }, [course?.modules, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 selection:bg-amber-500/20 selection:text-amber-400 overflow-x-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] sm:h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[1200px] h-[400px] sm:h-[650px] bg-gradient-to-tr from-amber-500/15 via-primary-500/15 to-orange-500/10 blur-[110px] sm:blur-[140px] rounded-full" />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="container-custom pt-6 sm:pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <Link href="/" className="hover:text-amber-500 transition">الرئيسية</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link href="/academy" className="hover:text-amber-500 transition">الأكاديمية</Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-gray-900 dark:text-gray-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {course?.titleAr || 'دورة احتراف نوشن الشاملة'}
          </span>
        </nav>
      </div>

      {/* Course Hero & Showcase */}
      <section className="container-custom pt-4 sm:pt-8 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Right Column: Course Info & Pitch */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>دورة معتمدة ومحدثة 2026</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مجانية 100%</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-tajawal text-gray-900 dark:text-white leading-[1.25] break-words">
              دورة احتراف نوشن الشاملة <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary-500 to-orange-500">
                (Notion Masterclass)
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              الدليل العربي المتكامل للانتقال من استخدام نوشن البسيط لتدوين الملاحظات إلى بناء أنظمة إدارة متكاملة، وقواعد بيانات ذكية، وصيغ formulas 2.0، وأتمتة مساحات العمل للشركات والأفراد.
            </p>

            {/* Key Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-gray-200 dark:border-neutral-800/80 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                <span>{totalLessons || 29} درساً تطبيقياً</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>{formatDuration(totalDuration) || '+5.5 ساعات'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>شهادة إتمام</span>
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4 text-purple-500" />
                <span>باللغة العربية</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href={`/academy/${slug}/learn`}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base sm:text-lg"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ مشاهدة الدورة مجاناً</span>
                <ArrowLeft className="w-5 h-5 mr-1" />
              </Link>

              <a
                href="#curriculum"
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition text-center text-sm sm:text-base"
              >
                استعراض فهرس الدروس
              </a>
            </div>
          </div>

          {/* Left Column: Video Teaser & Card Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-4 sm:p-5">
              
              {/* Bunny Stream Teaser */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-neutral-950 shadow-inner group mb-4">
                {course?.previewVideoId ? (
                  <iframe
                    src={`https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${course.previewVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                    loading="lazy"
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                    <Play className="w-12 h-12 text-amber-500 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Course Card Summary Box */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    مجاني بالكامل
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    $79 (100% خصم)
                  </span>
                </div>

                <Link
                  href={`/academy/${slug}/learn`}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-center text-white bg-amber-500 hover:bg-amber-600 transition shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>دخول قاعة التعلم فوراً</span>
                </Link>

                <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>وصول فوري ودائم لجميع الحلقات الـ 29</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>قوالب تطبيقية مرفقة مع كل فصل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>مشغل فيديو ذكي يحفظ تقدمك بالكامل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>دعم فني عبر مجتمع التيليجرام الرسمي</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* What You Will Learn (Udemy style grid) */}
      <section className="container-custom py-10 max-w-5xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 sm:p-8 md:p-10 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold font-tajawal text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span>ماذا ستتعلم في هذه الدورة؟</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            {[
              'فهم معماري دقيق لقواعد البيانات المترابطة (Relations & Rollups)',
              'كتابة الصيغ المنطقية والحسابية الجديدة كلياً Formulas 2.0',
              'بناء لوحات تحكم (Dashboards) سريعة الاستجابة للهاتف والحاسوب',
              'تسخير الذكاء الاصطناعي Notion AI لتلخيص وتنظيم المهام',
              'أفضل الممارسات لتسريع تصفح صفحات ومساحات عمل نوشن',
              'بناء أنظمة متكاملة لإدارة المشاريع والشركات وفرق العمل',
              'تطبيق منهجية Second Brain لتنظيم المعرفة والملاحظات الشخصية',
              'تحويل القوالب إلى حلول برمجية بدون كتابة كود (No-Code)'
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                <div className="mt-0.5 rounded-full p-0.5 bg-emerald-500/15 text-emerald-500 flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-World Projects Showcase (Bahaa Henish style) */}
      <section className="container-custom py-10 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-tajawal text-gray-900 dark:text-white">
            مشاريع وأنظمة عملية ستبنيها بيدك
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            تخرج من الدورة بحلول جاهزة للعمل يمكنك الاعتماد عليها في أعمالك وحياتك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'نظام إدارة المشاريع (Project OS)',
              icon: FolderGit2,
              desc: 'إدارة مهام الفريق ودورات العمل مع متابعة نسب الإنجاز التلقائية.'
            },
            {
              title: 'المخزن المعرفي (Second Brain)',
              icon: BookOpen,
              desc: 'تطبيق منهجية PARA لتنظيم الأفكار والكتب والروابط بذكاء.'
            },
            {
              title: 'نظام إدارة العملاء (CRM)',
              icon: Target,
              desc: 'متابعة الصفقات، الفواتير، ومراحل التواصل مع العملاء بانتظام.'
            },
            {
              title: 'مركز العادات والأهداف (Habits)',
              icon: CheckCircle2,
              desc: 'متابعة الروتين اليومي والأسبوعي بحسابات تلقائية وصيغ حديثة.'
            }
          ].map((proj, i) => {
            const Icon = proj.icon;
            return (
              <div key={i} className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5 font-tajawal">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {proj.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curriculum Accordion Section with Live Search (Udemy style) */}
      <section id="curriculum" className="container-custom py-10 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-tajawal text-gray-900 dark:text-white">
            فهرس المنهج الدراسي الكامل
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {totalLessons || 29} درساً مقسمة عبر 6 فصول تطبيقية متدرجة
          </p>
        </div>

        {/* Live Lesson Search */}
        <div className="max-w-xl mx-auto mb-6 relative px-2 sm:px-0">
          <Search className="w-4 h-4 text-gray-400 absolute right-6 sm:right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث في محتوى الدروس (مثال: قواعد بيانات، صيغ، AI...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-11 sm:pr-12 pl-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition shadow-sm"
          />
        </div>

        {/* Modules Accordion */}
        <div className="space-y-3 sm:space-y-4">
          {filteredModules.map((module, mIdx) => {
            const isOpen = openModuleIndex === mIdx || searchQuery.trim().length > 0;
            const ModuleIcon = MODULE_ICONS[mIdx % MODULE_ICONS.length] || Layers;
            const moduleDuration = (module.lessons || []).reduce((acc, l) => acc + (l.duration || 0), 0);

            return (
              <div 
                key={module.id || mIdx}
                className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden transition-all duration-200 shadow-sm"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(mIdx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <ModuleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-tajawal truncate">
                        {module.titleAr || module.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>{module.lessons?.length || 0} دروس</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(moduleDuration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Lessons List */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100 dark:border-neutral-800/80 bg-gray-50/50 dark:bg-neutral-950/40"
                    >
                      <div className="divide-y divide-gray-100 dark:divide-neutral-800/60">
                        {(module.lessons || []).map((lesson, lIdx) => (
                          <Link
                            key={lesson.id || lIdx}
                            href={`/academy/${slug}/learn?lesson=${lesson.id}`}
                            className="p-3.5 sm:p-4 sm:px-6 flex items-center justify-between hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition group text-right gap-3"
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 dark:bg-neutral-800 group-hover:bg-amber-500 group-hover:text-white text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-semibold transition-colors flex-shrink-0">
                                <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-500 transition-colors break-words">
                                  {lesson.titleAr || lesson.title}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                  {lesson.title}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {formatLessonDuration(lesson.duration)}
                              </span>
                              <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                                مشاهدة
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Target Audience & Requirements (Udemy style) */}
      <section className="container-custom py-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 dark:text-white font-tajawal mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500" />
              <span>لمن هذه الدورة؟</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>المبتدئون الراغبون في تنظيم مهامهم وحياتهم باستخدام نوشن.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>أصحاب الأعمال ورواد الأعمال الراغبون في بناء مساحات عمل لفريقهم.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>المستقلون وصناع المحتوى الراغبون في إدارة عملائهم ومشاريعهم.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 dark:text-white font-tajawal mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>المتطلبات الأساسية</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>لا يشترط أي خبرة مسبقة بنوشن أو أي لغة برمجة.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>حساب نوشن مجاني تماماً (Notion Free Account).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>جهاز حاسوب أو هاتف متصل بالإنترنت للتطبيق المباشر.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Sticky Bottom Action Bar (Mobile & Desktop) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-neutral-950/95 border-t border-gray-200 dark:border-neutral-800 backdrop-blur-md py-3 px-4 shadow-2xl"
          >
            <div className="container-custom max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="truncate">
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white font-tajawal truncate">
                  {course?.titleAr || 'دورة احتراف نوشن الشاملة'}
                </div>
                <div className="text-[11px] text-emerald-500 font-semibold">
                  مجاناً 100% • 29 درساً
                </div>
              </div>

              <Link
                href={`/academy/${slug}/learn`}
                className="flex-shrink-0 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-md flex items-center gap-2 text-xs sm:text-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>دخول قاعة التعلم</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function GlobeIcon(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
