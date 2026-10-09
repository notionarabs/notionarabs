'use client';

import { useState, useEffect } from 'react';
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
  GraduationCap, 
  Award, 
  ArrowLeft, 
  ShieldCheck, 
  Check,
  Video,
  Database,
  Layout,
  Cpu,
  Star
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import AcademyComingSoon from './AcademyComingSoon';

const MODULE_ICONS = [
  Layout,       // 02 Getting Started
  Layers,       // 03 Pages & Blocks
  Database,     // 04 Database Fundamentals
  Database,     // 05 Advanced Databases
  Cpu,          // 06 Advanced Features
  Sparkles      // 07 Notion AI
];

export default function AcademyClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(0);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await api.get('/courses/notion-masterclass');
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
  }, []);

  // Show Coming Soon page for guests, normal users, and creators
  if (!authLoading && !isAdmin) {
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-24 selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* Admin Preview Mode Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center text-xs text-amber-500 dark:text-amber-400 font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md">
        <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>وضع معاينة الإدارة (Admin Preview Mode): الأكاديمية تظهر حالياً كـ "قريباً" لجميع الزوار والمستخدمين والمبدعين. أنت تشاهد النسخة الكاملة لأنك مسؤول.</span>
      </div>

      {/* Decorative Glow Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-amber-500/10 via-primary-500/15 to-purple-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Header Banner */}
      <section className="container-custom pt-12 md:pt-20 pb-12">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 text-sm font-medium"
          >
            <GraduationCap className="w-4 h-4" />
            <span>أكاديمية عرب نوشن • الدورة الرسمية الشاملة</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-tajawal text-gray-900 dark:text-white leading-[1.25]"
          >
            احتراف نوشن من الصفر <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary-500 to-orange-500">
              وحتى بناء أنظمة العمل المتكاملة
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto"
          >
            29 درساً تطبيقياً ومفصلاً باللغة العربية. تعلّم كيفية تنظيم أفكارك، بناء قواعد بيانات معقدة، كتابة الصيغ، وتسخير الذكاء الاصطناعي Notion AI لرفع إنتاجيتك إلى أقصى حد.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/academy/notion-masterclass/learn"
              className="px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-3 text-lg"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>ابدأ مشاهدة الدورة مجاناً</span>
              <ArrowLeft className="w-5 h-5 mr-1" />
            </Link>

            <a
              href="#curriculum"
              className="px-6 py-4 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition-all duration-200"
            >
              استعراض محتوى الفصول
            </a>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-500">29</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">درساً تطبيقياً فائق الدقة</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-primary-500">6</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">فصول تدريبية تدرجية</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-500">+5.5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">ساعات من الشرح المركز</div>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center">
            <div className="text-2xl md:text-3xl font-extrabold text-purple-500">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">مجاني بالكامل للمجتمع</div>
          </div>
        </div>
      </section>

      {/* Main Course Showcase Box */}
      <section className="container-custom py-8">
        <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-6 sm:p-8 md:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Right: Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>محتوى محدث 2026</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-tajawal text-gray-900 dark:text-white">
                دورة احتراف نوشن الشاملة (Notion Masterclass)
              </h2>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                هذه الدورة صُممت خصيصاً لتنقلك من المعرفة السطحية بالقوالب إلى بناء حلول مخصصة لأعمالك وحياتك اليومية. ستتعلم كل شيء بدءاً من أساسيات الكتل وحتى إنشاء علاقات قواعد البيانات واستثمار Notion AI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'تنظيم الصفحات وبناء أنظمة الـ Dashboards',
                  'قواعد البيانات، الجداول، والـ Relations المتقدمة',
                  'كتابة المعادلات والصيغ التلقائية Formulas 2.0',
                  'أتمتة العمل واستخدام الذكاء الاصطناعي Notion AI',
                  'أفضل الممارسات للتصميم وسرعة التصفح',
                  'قوالب ومشاريع تطبيقية مرفقة مع كل درس'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <div className="mt-0.5 rounded-full p-0.5 bg-amber-500/15 text-amber-500 flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/academy/notion-masterclass/learn"
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-md flex items-center gap-2 text-base"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>دخول قاعة التعلم الآن</span>
                </Link>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>وصول فوري ودائم لجميع الحلقات</span>
                </div>
              </div>
            </div>

            {/* Left: Video Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden aspect-video border border-gray-200 dark:border-neutral-800 shadow-2xl bg-neutral-950 group">
                {course?.previewVideoId ? (
                  <iframe
                    src={`https://iframe.mediadelivery.net/embed/774454/${course.previewVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
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
              <div className="text-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                مشغل الفيديو مقدم عبر سيرفرات Bunny.net فائقة السرعة
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Curriculum Accordion Section */}
      <section id="curriculum" className="container-custom py-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>منهج الدورة الدراسي</span>
          </div>
          <h2 className="text-3xl font-bold font-tajawal text-gray-900 dark:text-white">
            فهرس الدروس والفصول التطبيقية
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl mx-auto">
            محتوى منظم خطوة بخطوة من المفاهيم التأسيسية وحتى أسرار المحترفين
          </p>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4">
          {(course?.modules || []).map((module, mIdx) => {
            const isOpen = openModuleIndex === mIdx;
            const ModuleIcon = MODULE_ICONS[mIdx % MODULE_ICONS.length] || Layers;
            const moduleDuration = (module.lessons || []).reduce((acc, l) => acc + (l.duration || 0), 0);

            return (
              <div 
                key={module.id || mIdx}
                className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleModule(mIdx)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-right hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition gap-4"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <ModuleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-tajawal">
                        {module.titleAr || module.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{module.lessons?.length || 0} دروس</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(moduleDuration)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Accordion Content (Lessons list) */}
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
                            href={`/academy/notion-masterclass/learn?lesson=${lesson.id}`}
                            className="p-4 sm:px-6 flex items-center justify-between hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition group text-right"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-neutral-800 group-hover:bg-amber-500 group-hover:text-white text-gray-600 dark:text-gray-400 flex items-center justify-center text-xs font-semibold transition-colors">
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-500 transition-colors">
                                  {lesson.titleAr || lesson.title}
                                </div>
                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                  {lesson.title}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {formatLessonDuration(lesson.duration)}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
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

        {/* Big Bottom Action CTA */}
        <div className="mt-14 text-center p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500/15 via-primary-500/10 to-orange-500/15 border border-amber-500/20">
          <h3 className="text-2xl font-bold font-tajawal text-gray-900 dark:text-white mb-2">
            جاهز للانطلاق وبناء أنظمة عملك باحتراف؟
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
            ابدأ رحلة التعلم الآن وشاهد جميع الدروس الـ 29 مع مشغل فيديو ذكي يتتبع تقدمك ودروسك المكتملة.
          </p>
          <Link
            href="/academy/notion-masterclass/learn"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 text-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>ابدأ التعلم الآن مجاناً</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
