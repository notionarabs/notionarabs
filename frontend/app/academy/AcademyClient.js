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
  GraduationCap, 
  Award, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  Video, 
  Database, 
  Layout, 
  Cpu, 
  Search, 
  Compass, 
  Users, 
  Target, 
  Zap, 
  FolderGit2, 
  HelpCircle,
  ExternalLink,
  Bell,
  Rocket,
  Filter,
  ArrowRight
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import AcademyComingSoon from './AcademyComingSoon';

// Course Catalog Data (Flagship + Upcoming Specialized Courses)
const ACADEMY_COURSES = [
  {
    id: 'notion-masterclass',
    slug: 'notion-masterclass',
    title: 'دورة احتراف نوشن الشاملة',
    titleEn: 'Notion Masterclass 2026',
    category: 'comprehensive',
    categoryLabel: 'دورة شاملة',
    badge: 'متاح الآن مجاناً',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    status: 'available',
    level: 'من الصفر للاحتراف',
    duration: '+5.5 ساعات',
    lessonsCount: '29 درساً',
    modulesCount: '6 فصول',
    description: 'الدليل العربي الأكثر شمولاً للانتقال من معرفة القوالب البسيطة إلى بناء أنظمة إدارة متكاملة، وقواعد بيانات ذكية، وصيغ Formulas 2.0، واستثمار Notion AI.',
    features: [
      'تنظيم الصفحات وأنظمة الـ Dashboards',
      'قواعد البيانات والـ Relations المعقدة',
      'صيغ ومعادلات Formulas 2.0',
      'أتمتة العمل واستخدام Notion AI'
    ],
    accentGradient: 'from-amber-500 to-primary-600',
    popular: true
  },
  {
    id: 'agile-project-os',
    slug: 'agile-project-os',
    title: 'إدارة المشاريع وفرق العمل في نوشن',
    titleEn: 'Agile & Team Workspaces',
    category: 'business',
    categoryLabel: 'إدارة الأعمال',
    badge: 'قريباً في 2026',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    status: 'coming_soon',
    level: 'متوسط إلى متقدم',
    duration: '3.5 ساعات',
    lessonsCount: '14 درساً',
    modulesCount: '4 فصول',
    description: 'كيفية تحويل نوشن إلى نظام تشغيل مركزي لشركتك الناشئة: تخطيط الـ Sprints، لوحات Kanban للمهام، إدارة صلاحيات الفريق، وتتبع مؤشرات الأداء.',
    features: [
      'هيكلة مساحات العمل للشركات والفرق',
      'تطبيق منهجية Agile و Sprints',
      'بناء نظام CRM لمتابعة العملاء',
      'إدارة الصلاحيات والأمان المتقدم'
    ],
    accentGradient: 'from-blue-500 to-indigo-600',
    popular: false
  },
  {
    id: 'automation-webhooks',
    slug: 'automation-webhooks',
    title: 'أتمتة نوشن والربط السحابي',
    titleEn: 'Notion Automation & Webhooks',
    category: 'automation',
    categoryLabel: 'الأتمتة والـ AI',
    badge: 'قريباً في 2026',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    status: 'coming_soon',
    level: 'متقدم',
    duration: '2.5 ساعة',
    lessonsCount: '10 دروس',
    modulesCount: '3 فصول',
    description: 'تعلّم ربط قواعد بيانات نوشن بالتطبيقات الخارجية مثل Telegram وGmail وGoogle Sheets عبر Make وZapier وWebhooks لبناء سير عمل ذاتي التشغيل.',
    features: [
      'إنشاء Webhooks وبوتات تلقائية',
      'الربط مع Make (Integromat) و Zapier',
      'مزامنة البيانات بين التطبيقات السحابية',
      'أتمتة إرسال التنبيهات والتقارير'
    ],
    accentGradient: 'from-purple-500 to-pink-600',
    popular: false
  },
  {
    id: 'template-business',
    slug: 'template-business',
    title: 'تصميم وبيع قوالب نوشن الرقمية',
    titleEn: 'Notion Template Creator Business',
    category: 'productivity',
    categoryLabel: 'صناعة المحتوى',
    badge: 'قريباً في 2026',
    badgeColor: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    status: 'coming_soon',
    level: 'لصناع المحتوى والمصممين',
    duration: '2.0 ساعة',
    lessonsCount: '8 دروس',
    modulesCount: '3 فصول',
    description: 'خطوات تحويل خبرتك في نوشن إلى منتجات رقمية مدرة للدخل: تصميم تجربة مستخدم جذابة، إعداد صفحات البيع على عرب نوشن وGumroad، والتسويق الرقمي.',
    features: [
      'مبادئ تصميم قوالب جذابة وسهلة الاستخدام',
      'إعداد الدفع وصفحات الهبوط على منصات البيع',
      'حماية القوالب وتجهيز أدلة الاستخدام',
      'استراتيجيات التسويق بالمحتوى والجمهور'
    ],
    accentGradient: 'from-orange-500 to-amber-600',
    popular: false
  }
];

// Curated Learning Tracks (Yanfaa-inspired paths)
const LEARNING_TRACKS = [
  {
    id: 'starter',
    title: 'مسار التأسيس وبناء العادات',
    titleEn: 'Notion Starter & Life OS',
    level: 'للمبتدئين',
    duration: '1.5 ساعة',
    lessonsCount: '8 دروس',
    description: 'ابدأ من الصفر تماماً، تعرّف على بنية الصفحات والكتل وطريقة بناء لوحة تحكمك الشخصية الأولى لتنظيم العادات والمهام اليومية.',
    icon: Compass,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-500 dark:text-blue-400',
    tags: ['الأساسيات', 'تنظيم الوقت', 'الملاحظات']
  },
  {
    id: 'business',
    title: 'مسار الشركات وإدارة فرق العمل',
    titleEn: 'Business & Team Workspaces',
    level: 'متوسط إلى متقدم',
    duration: '2.5 ساعة',
    lessonsCount: '11 درساً',
    description: 'كيفية تحويل نوشن إلى نظام تشغيل كامل لشركتك الناشئة: إدارة المشاريع بأسلوب Agile، متابعة العملاء CRM، ومشاركة الصلاحيات.',
    icon: Users,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-500 dark:text-amber-400',
    tags: ['إدارة المشاريع', 'الـ CRM', 'فرق العمل']
  },
  {
    id: 'advanced',
    title: 'مسار الصيغ البرمجية والـ AI',
    titleEn: 'Formulas 2.0 & Notion AI',
    level: 'متقدم',
    duration: '2.0 ساعة',
    lessonsCount: '10 دروس',
    description: 'تعمّق في قوة العلاقات (Relations & Rollups)، كتابة معادلات منطقية وحسابية متقدمة باستخدام Formulas 2.0، وتوظيف Notion AI.',
    icon: Zap,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-500 dark:text-purple-400',
    tags: ['Formulas 2.0', 'Notion AI', 'أتمتة']
  }
];

// Practical Projects Showcase (Bahaa Henish inspired)
const REAL_WORLD_PROJECTS = [
  {
    title: 'نظام إدارة المشاريع الشامل (Project OS)',
    category: 'إدارة الأعمال',
    description: 'قواعد بيانات مترابطة لإدارة مهام الفريق، دورات العمل (Sprints)، ومتابعة مؤشرات الإنجاز في مكان مركزي واحد.',
    icon: FolderGit2,
    badge: 'مشروع رئيسي'
  },
  {
    title: 'المخزن المعرفي ونظام الملاحظات (Second Brain)',
    category: 'الإنتاجية الشخصية',
    description: 'تطبيق منهجية PARA الشهيرة لتنظيم الملاحظات، الكتب، الأفكار والمشاريع مع فلاتر ذكية وسريعة.',
    icon: BookOpen,
    badge: 'الأكثر شعبية'
  },
  {
    title: 'لوحة إدارة العملاء والمالية (Client CRM)',
    category: 'المستقلين والشركات',
    description: 'تتبع مراحل التواصل مع العملاء، العروض المقدمة، والإيرادات الشهرية بحسابات آلية.',
    icon: Target,
    badge: 'تطبيقي'
  },
  {
    title: 'مركز العادات والأهداف (Habits Tracker)',
    category: 'التطوير الذاتي',
    description: 'متابعة الروتين الصباحي والمسائي، نسب التقدم الأسبوعية التلقائية بأحدث صيغ Formulas 2.0.',
    icon: CheckCircle2,
    badge: 'سهل الاستخدام'
  }
];

// Platform Pillars (Why Learn with Notion Arabs?)
const PLATFORM_PILLARS = [
  {
    title: 'محتوى عربي متكامل وعصري',
    desc: 'شروحات واضحة مبنية لمعايير 2026 باللغة العربية تراعي أحدث تحديثات نوشن الرسمية.',
    icon: Award,
    color: 'text-amber-500 bg-amber-500/10'
  },
  {
    title: 'قوالب جاهزة للنسخ المباشر',
    desc: 'كل دورة وفصل تطبيقي يتضمن قوالب عمل جاهزة يمكنك نسخها إلى مساحة عملك فوراً.',
    icon: Layers,
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  {
    title: 'مشغل سحابي يحفظ تقدمك',
    desc: 'فيديوهات فائقة السرعة بدقة 1080p عبر سيرفرات Bunny.net مع حفظ الدروس المنجزة آلياً.',
    icon: Video,
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    title: 'مجتمع نشط ودعم مستمر',
    desc: 'نقاشات ومساعدة في حل التحديات عبر مجتمع عرب نوشن الرسمي على التيليجرام.',
    icon: Users,
    color: 'text-purple-500 bg-purple-500/10'
  }
];

// FAQs (Freelanzwya & Udemy inspired)
const FAQS = [
  {
    q: 'هل دورة احتراف نوشن الشاملة مجانية بالكامل؟',
    a: 'نعم، دورة احتراف نوشن الشاملة (Notion Masterclass) متاحة مجاناً 100% لجميع أفراد المجتمع العربي بدقة 1080p، ويمكنك مشاهدة جميع حلقاتها الـ 29 بدون أي رسوم.'
  },
  {
    q: 'ما الفرق بين صفحة الأكاديمية وصفحة الدورة؟',
    a: 'صفحة الأكاديمية (/academy) هي البوابة الرئيسية التي تستعرض جميع الدورات والمسارات التدريبية المتاحة والقادمة، بينما صفحة الدورة (/academy/notion-masterclass) تعرض المنهج الدراسي المفصل وفهرس الحلقات وأهداف الكورس المحدد.'
  },
  {
    q: 'هل أحتاج لأي خبرة برمجية سابقة للبدء؟',
    a: 'إطلاقاً! دورات الأكاديمية تبدأ من الصفر تماماً خطوة بخطوة، مع تطبيقات بصرية سهلة الفهم تلائم المبتدئين تماماً وتتدرج حتى الاحتراف.'
  },
  {
    q: 'هل تتوفر قوالب عمل مرفقة مع الشروحات؟',
    a: 'نعم، كل فصل تطبيقي ومسار تدريبي يأتي مرفقاً بقوالب نوشن جاهزة يمكنك نسخها لحسابك بضغطة زر واحدة والتطبيق المباشر عليها.'
  },
  {
    q: 'كيف يمكنني متابعة تقدمي في الكورس؟',
    a: 'داخل قاعة التعلم التفاعلية، يتم حفظ الدروس التي أكملتها تلقائياً، وتظهر لك نسبة إنجازك لكل فصل لتستأنف المشاهدة في أي وقت ومن أي جهاز.'
  }
];

export default function AcademyClient() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const bunnyLibraryId = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID || '774454';

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

  // In production, show Coming Soon page for non-admins; in local development, allow direct testing
  const isDev = process.env.NODE_ENV === 'development';
  if (!authLoading && !isAdmin && !isDev) {
    return <AcademyComingSoon user={user} isAuthenticated={isAuthenticated} />;
  }

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return ACADEMY_COURSES;
    return ACADEMY_COURSES.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans pb-32 selection:bg-amber-500/20 selection:text-amber-400 overflow-x-hidden">
      
      {/* Decorative Gradient Background Blur */}
      <div className="absolute top-0 inset-x-0 h-[550px] sm:h-[700px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[1200px] h-[400px] sm:h-[700px] bg-gradient-to-tr from-amber-500/15 via-primary-500/15 to-orange-500/10 blur-[100px] sm:blur-[140px] rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="container-custom pt-8 sm:pt-14 md:pt-20 pb-8 sm:pb-12 text-center">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 text-xs sm:text-sm font-semibold shadow-sm"
          >
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>أكاديمية عرب نوشن • البوابة التعليمية الرسمية</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-tajawal text-gray-900 dark:text-white leading-[1.2] sm:leading-[1.25] break-words"
          >
            احترف نوشن من الصفر <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary-500 to-orange-500">
              وابنِ أنظمة عمل رقمية متكاملة
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto px-2 sm:px-0"
          >
            وجهتك العربية الأولى للتعلم التطبيقي: دورات ومسارات متدرجة تنقلك من الاستخدام البسيط للقوالب إلى بناء حلول مخصصة لحياتك، أعمالك، وفرق العمل باحترافية.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 max-w-md sm:max-w-none mx-auto"
          >
            <Link
              href="/academy/notion-masterclass/learn"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 shadow-xl shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 sm:gap-3 text-base sm:text-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>ابدأ مشاهدة الدورة مجاناً</span>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            </Link>

            <Link
              href="/academy/notion-masterclass"
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition-all duration-200 text-center text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>استعراض تفاصيل الدورة والمنهج</span>
            </Link>
          </motion.div>
        </div>

        {/* Live Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-8 sm:mt-12 max-w-4xl mx-auto">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center shadow-sm backdrop-blur-sm">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-500">29+</div>
            <div className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">درساً تطبيقياً فائق الدقة</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center shadow-sm backdrop-blur-sm">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary-500">+5.5</div>
            <div className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">ساعات تدريبية مكثفة</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center shadow-sm backdrop-blur-sm">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-500">3</div>
            <div className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">مسارات تخصصية متدرجة</div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800/80 text-center shadow-sm backdrop-blur-sm">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-500">100%</div>
            <div className="text-[11px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">مجاني بالكامل للمجتمع</div>
          </div>
        </div>
      </section>

      {/* Featured Masterclass Banner Showcase */}
      <section className="container-custom py-6 sm:py-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950 p-5 sm:p-8 md:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Right: Info */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الدورة الشاملة الرئيسية • محدث 2026</span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-tajawal text-gray-900 dark:text-white leading-tight">
                دورة احتراف نوشن الشاملة (Notion Masterclass)
              </h2>

              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                الدورة التدريبية المتكاملة التي تبدأ معك من كتل نوشن البسيطة، مروراً بهيكلة قواعد البيانات، كتابة معادلات Formulas 2.0، واستثمار الذكاء الاصطناعي لبناء حلول حقيقية.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                {[
                  'تنظيم الصفحات وبناء أنظمة الـ Dashboards',
                  'قواعد البيانات والـ Relations المتقدمة',
                  'كتابة المعادلات والصيغ Formulas 2.0',
                  'أتمتة العمل واستخدام Notion AI'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <div className="mt-0.5 rounded-full p-0.5 bg-amber-500/15 text-amber-500 flex-shrink-0">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/academy/notion-masterclass/learn"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>دخول قاعة التعلم الآن</span>
                </Link>
                <Link
                  href="/academy/notion-masterclass"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>تفاصيل ومنهج الدورة</span>
                </Link>
              </div>
            </div>

            {/* Left: Video Preview Card */}
            <div className="lg:col-span-5 order-first lg:order-last">
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video border border-gray-200 dark:border-neutral-800 shadow-xl bg-neutral-950 group">
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
                    <Play className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="text-center mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                مشغل الفيديو مقدم عبر سيرفرات Bunny.net فائقة السرعة • دقة 1080p
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Courses Catalog Section (Yanfaa & Udemy style) */}
      <section id="courses" className="container-custom py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>دليل الدورات التدريبية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-tajawal text-gray-900 dark:text-white">
            استكشف دورات الأكاديمية
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-xl mx-auto px-2 sm:px-0">
            برامج تدريبية متخصصة تبدأ بالدورة الشاملة المجانية وتتوسع لتشمل مسارات الأعمال والأتمتة
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'جميع الدورات' },
            { id: 'comprehensive', label: 'الدورات الشاملة' },
            { id: 'business', label: 'إدارة الأعمال والفرق' },
            { id: 'automation', label: 'الأتمتة والـ AI' },
            { id: 'productivity', label: 'صناعة المحتوى' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-800 hover:border-amber-500/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((item) => {
            const isAvailable = item.status === 'available';

            return (
              <div 
                key={item.id}
                className="group rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-6 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 shadow-sm"
              >
                <div>
                  {/* Top Badge & Level */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {item.level}
                    </span>
                  </div>

                  {/* Title & En Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-tajawal mb-1 group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-[11px] sm:text-xs text-gray-400 font-mono mb-3">
                    {item.titleEn}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Meta Strip */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 py-3 border-y border-gray-100 dark:border-neutral-800/80 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {item.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-primary-500" />
                      {item.lessonsCount}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-500" />
                      {item.modulesCount}
                    </span>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-1.5 mb-6">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div>
                  {isAvailable ? (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        href={`/academy/${item.slug}`}
                        className="py-2.5 px-3 rounded-xl text-center font-semibold text-xs sm:text-sm bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>تفاصيل المنهج</span>
                      </Link>
                      <Link
                        href={`/academy/${item.slug}/learn`}
                        className="py-2.5 px-3 rounded-xl text-center font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>دخول التعلم</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 text-center flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Bell className="w-3.5 h-3.5 text-amber-500" />
                      <span>قيد الإعداد والإنتاج • سيتاح قريباً عبر الأكاديمية</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Learning Tracks Section (Yanfaa-inspired) */}
      <section id="tracks" className="container-custom py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>المسارات التعليمية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-tajawal text-gray-900 dark:text-white">
            اختر المسار الأنسب لأهدافك
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-xl mx-auto px-2 sm:px-0">
            خريطة طريق موجهة لنقلك خطوة بخطوة بحسب المجال الذي ترغب بالتركيز عليه
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {LEARNING_TRACKS.map((track) => {
            const IconComponent = track.icon;
            return (
              <div 
                key={track.id}
                className="group relative rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-5 sm:p-6 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 shadow-sm"
              >
                <div>
                  {/* Track Header */}
                  <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${track.color} border ${track.borderColor} flex items-center justify-center ${track.accentColor}`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 font-medium">
                      {track.level}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-tajawal mb-1">
                    {track.title}
                  </h3>
                  <div className="text-[11px] sm:text-xs text-gray-400 font-mono mb-2.5 sm:mb-3">
                    {track.titleEn}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {track.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {track.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 sm:pt-4 border-t border-gray-100 dark:border-neutral-800/80 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {track.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-primary-500" />
                      {track.lessonsCount}
                    </span>
                  </div>

                  <Link
                    href="/academy/notion-masterclass/learn"
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl text-center font-semibold text-xs sm:text-sm bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 group-hover:bg-amber-500 group-hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>دخول المسار</span>
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Practical Systems Showcase (Bahaa Henish inspired) */}
      <section className="container-custom py-10 sm:py-14 max-w-6xl mx-auto">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مشاريع عملية ستبنيها</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-tajawal text-gray-900 dark:text-white">
            أنظمة عمل حقيقية تخرج بها من الأكاديمية
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm max-w-xl mx-auto px-2 sm:px-0">
            لا نكتفي بالشرح النظري، بل نبني معاً أنظمة تشغيل كاملة يمكنك استخدامها في عملك فوراً
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {REAL_WORLD_PROJECTS.map((proj, idx) => {
            const Icon = proj.icon;
            return (
              <div 
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-col justify-between shadow-sm hover:border-amber-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      {proj.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white font-tajawal mb-1.5 sm:mb-2">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3 sm:mb-4">
                    {proj.description}
                  </p>
                </div>
                <div className="text-[11px] text-amber-500 font-medium pt-2 border-t border-gray-100 dark:border-neutral-800/60">
                  {proj.category}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section className="container-custom py-10 sm:py-14 max-w-5xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-tajawal text-gray-900 dark:text-white">
            لماذا تتعلم مع أكاديمية عرب نوشن؟
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            تجربة تعليمية صممت خصيصاً للمجتمع العربي لضمان الفهم والتطبيق العملي
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLATFORM_PILLARS.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pil.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white font-tajawal">
                  {pil.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pil.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section (Freelanzwya & Udemy style) */}
      <section className="container-custom py-10 sm:py-14 max-w-4xl mx-auto">
        <div className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-tajawal text-gray-900 dark:text-white">
            كل ما تود معرفته عن الأكاديمية
          </h2>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {FAQS.map((faq, idx) => {
            const isFaqOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaqIndex(isFaqOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-right font-bold text-gray-900 dark:text-white flex items-center justify-between gap-3 sm:gap-4 font-tajawal text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-neutral-800/40 transition"
                >
                  <span className="min-w-0 flex-1">{faq.q}</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                    {isFaqOpen ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isFaqOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-neutral-800/60"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Enrollment CTA */}
      <section className="container-custom pt-4 sm:pt-6 max-w-5xl mx-auto">
        <div className="text-center p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/15 via-primary-500/10 to-orange-500/15 border border-amber-500/20 shadow-xl">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-tajawal text-gray-900 dark:text-white mb-2 sm:mb-3 leading-tight">
            جاهز للانطلاق وبناء أنظمة عملك باحتراف؟
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            انضم الآن وابدأ بمشاهدة دورة احتراف نوشن الشاملة الـ 29 درساً مع مشغل فيديو تفاعلي يحفظ تقدمك ومرفق بقوالب عمل جاهزة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/notion-masterclass/learn"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-primary-600 hover:from-amber-600 hover:to-primary-700 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 text-base sm:text-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>ابدأ التعلم الآن مجاناً</span>
            </Link>
            <Link
              href="/academy/notion-masterclass"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition text-sm sm:text-base"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>تفاصيل الدورة والمنهج الكامل</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
