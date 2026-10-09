'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Play, 
  CheckCircle, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Layers, 
  Clock, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  Share2, 
  MessageSquare, 
  Menu, 
  X, 
  GraduationCap, 
  Sparkles,
  Award,
  Maximize2
} from 'lucide-react';
import api from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';
import AcademyComingSoon from '../../AcademyComingSoon';
import toast from 'react-hot-toast';

export default function ClassroomClient({ slug = 'notion-masterclass' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get('lesson');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [openModules, setOpenModules] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'community'

  // Flatten all lessons for easy previous/next navigation
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    const list = [];
    course.modules.forEach(m => {
      (m.lessons || []).forEach(l => {
        list.push({
          ...l,
          moduleTitle: m.titleAr || m.title,
          moduleId: m.id
        });
      });
    });
    return list;
  }, [course]);

  // Load course and progress
  useEffect(() => {
    async function fetchCourseData() {
      try {
        const res = await api.get(`/courses/${slug}`);
        if (res.data?.course) {
          const loadedCourse = res.data.course;
          setCourse(loadedCourse);

          // Get progress from backend or localStorage
          let savedCompleted = [];
          if (res.data.userProgress?.completedLessonIds?.length) {
            savedCompleted = res.data.userProgress.completedLessonIds;
          } else {
            try {
              const local = localStorage.getItem(`notion_arabs_progress_${slug}`);
              if (local) savedCompleted = JSON.parse(local);
            } catch (e) {}
          }
          setCompletedLessonIds(savedCompleted);

          // Flatten lessons to find active
          const flat = [];
          (loadedCourse.modules || []).forEach(m => {
            (m.lessons || []).forEach(l => flat.push(l));
          });

          // Determine current lesson:
          let initialLesson = null;
          if (requestedLessonId) {
            initialLesson = flat.find(l => l.id === requestedLessonId || l.bunnyVideoId === requestedLessonId);
          }
          if (!initialLesson && flat.length > 0) {
            // Find first uncompleted lesson, or fall back to first lesson
            initialLesson = flat.find(l => !savedCompleted.includes(l.id)) || flat[0];
          }
          setCurrentLesson(initialLesson);

          // Automatically expand module of the current lesson
          if (initialLesson) {
            const parentMod = loadedCourse.modules.find(m => 
              (m.lessons || []).some(l => l.id === initialLesson.id)
            );
            if (parentMod) {
              setOpenModules({ [parentMod.id]: true });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course classroom:', err);
        toast.error('تعذر تحميل بيانات الدورة');
      } finally {
        setLoading(false);
      }
    }
    fetchCourseData();
  }, [slug, requestedLessonId]);

  // Handle switching lesson
  const handleSelectLesson = useCallback((lesson) => {
    setCurrentLesson(lesson);
    // Expand its module
    const parentMod = course?.modules?.find(m => 
      (m.lessons || []).some(l => l.id === lesson.id)
    );
    if (parentMod) {
      setOpenModules(prev => ({ ...prev, [parentMod.id]: true }));
    }
    // Update URL query without full reload
    router.replace(`/academy/${slug}/learn?lesson=${lesson.id}`, { scroll: false });
    // On small screens, close sidebar when choosing lesson
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [course, router, slug]);

  // Toggle lesson complete status
  const handleToggleComplete = async () => {
    if (!currentLesson) return;
    const isCompleted = completedLessonIds.includes(currentLesson.id);
    const newCompleted = isCompleted 
      ? completedLessonIds.filter(id => id !== currentLesson.id)
      : [...completedLessonIds, currentLesson.id];

    setCompletedLessonIds(newCompleted);

    // Save locally
    try {
      localStorage.setItem(`notion_arabs_progress_${slug}`, JSON.stringify(newCompleted));
    } catch (e) {}

    // Save to backend if authenticated
    if (isAuthenticated) {
      try {
        await api.post(`/courses/${slug}/lessons/${currentLesson.id}/progress`, {
          isCompleted: !isCompleted
        });
      } catch (e) {
        console.warn('Backend progress sync notice:', e.message);
      }
    }

    if (!isCompleted) {
      toast.success('أحسنت! تم إكمال الدرس 🎉');
      // If there is a next lesson, prompt or move forward
      const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        const next = allLessons[currentIndex + 1];
        handleSelectLesson(next);
      }
    }
  };

  // Next / Previous navigation
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const toggleModuleAccordion = (modId) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const progressPercentage = useMemo(() => {
    if (!allLessons.length) return 0;
    return Math.round((completedLessonIds.length / allLessons.length) * 100);
  }, [completedLessonIds, allLessons]);

  const formatLessonDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Gate access to Admins only
  if (!authLoading && !isAdmin) {
    return <AcademyComingSoon user={user} isAuthenticated={isAuthenticated} isClassroom={true} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">جاري إعداد قاعة التعلم...</p>
      </div>
    );
  }

  const bunnyLibraryId = course?.bunnyLibraryId || '774454';
  const streamEmbedUrl = currentLesson?.bunnyVideoId 
    ? `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${currentLesson.bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-400">
      
      {/* 1. LMS Top Navbar */}
      <header className="h-16 border-b border-neutral-800 bg-[#0f0f0f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        
        {/* Right side (RTL): Back & Course Title */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <Link 
            href="/academy"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-gray-300 hover:text-white text-xs sm:text-sm font-medium transition"
          >
            <ArrowRight className="w-4 h-4 ml-1" />
            <span>العودة للأكاديمية</span>
          </Link>

          <div className="h-5 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2 truncate">
            <GraduationCap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <h1 className="text-xs sm:text-sm font-bold text-gray-200 truncate font-tajawal">
              {course?.title || 'دورة احتراف نوشن الشاملة'}
            </h1>
          </div>
        </div>

        {/* Left side (RTL): Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-300">
                {completedLessonIds.length} من {allLessons.length} درساً
              </div>
              <div className="text-[10px] text-gray-500">
                {progressPercentage}% منجز
              </div>
            </div>
            <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-medium"
            title="تبديل القائمة الجانبية"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">فهرس الدروس</span>
          </button>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Video Player & Lesson Notes Main Column */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 p-4 sm:p-6 lg:p-8 space-y-6 ${sidebarOpen ? 'lg:mr-88 xl:mr-96' : ''}`}>
          
          {/* Video Container Box */}
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl border border-neutral-800 group">
              {streamEmbedUrl ? (
                <iframe
                  key={currentLesson?.bunnyVideoId}
                  src={streamEmbedUrl}
                  loading="lazy"
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                  allowFullScreen={true}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                  <Play className="w-12 h-12 text-amber-500 mb-2 animate-pulse" />
                  <p>اختر درساً من القائمة للبدء</p>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar below Video */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-amber-500 mb-1">
                  {currentLesson?.moduleTitle || 'الفصل التدريبي'}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-tajawal">
                  {currentLesson?.titleAr || currentLesson?.title || 'عنوان الدرس'}
                </h2>
                <div className="text-xs text-gray-400 mt-0.5">
                  {currentLesson?.title} • {formatLessonDuration(currentLesson?.duration)}
                </div>
              </div>

              {/* Action Buttons: Prev, Complete, Next */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {prevLesson && (
                  <button
                    onClick={() => handleSelectLesson(prevLesson)}
                    className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white transition text-xs font-semibold flex items-center gap-1"
                    title="الدرس السابق"
                  >
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                    <span className="hidden sm:inline">السابق</span>
                  </button>
                )}

                <button
                  onClick={handleToggleComplete}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                    completedLessonIds.includes(currentLesson?.id)
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedLessonIds.includes(currentLesson?.id) ? 'مكتمل (اضغط للإلغاء)' : 'تحديد كمكتمل ومتابعة'}
                  </span>
                </button>

                {nextLesson && (
                  <button
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white transition text-xs font-semibold flex items-center gap-1"
                    title="الدرس التالي"
                  >
                    <span className="hidden sm:inline">التالي</span>
                    <ChevronLeft className="w-4 h-4 mr-0.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Resources & Notes Tabs */}
            <div className="mt-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden">
              <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-4">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-3.5 px-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'notes'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ملاحظات وتلخيص الدرس
                </button>
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`py-3.5 px-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'resources'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  الموارد وقوالب نوشن
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`py-3.5 px-4 text-sm font-bold border-b-2 transition ${
                    activeTab === 'community'
                      ? 'border-amber-500 text-amber-500'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  مجتمع النقاش والدعم
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'notes' && (
                  <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                    <h3 className="text-base font-bold text-white font-tajawal">
                      أبرز ما تتعلمه في هذا الدرس:
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>تطبيق عملي خطوة بخطوة داخل مساحة عمل نوشن الفعلية.</li>
                      <li>فهم المبادئ المعمارية لتنظيم البيانات بدون تعقيد.</li>
                      <li>اختصارات وحيل سريعة لتسريع بناء الصفحات وتسهيل العمل اليومي.</li>
                    </ul>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                      💡 <strong>نصيحة تطبيقية:</strong> احرص على فتح نوشن في نافذة مجاورة وتطبيق كل خطوة تشاهدها في الفيديو مباشرة لتثبيت المعلومة.
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 mb-2">
                      قوالب وروابط مساعدة متعلقة بهذه الوحدة التدريبية:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        href="/templates"
                        className="p-3.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs text-gray-200 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-amber-500" />
                          <span>تصفح قوالب عرب نوشن الجاهزة</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                      <Link
                        href="/widgets"
                        className="p-3.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/60 flex items-center justify-between text-xs text-gray-200 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-primary-500" />
                          <span>ودجتس وأدوات نوشن التفاعلية</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'community' && (
                  <div className="space-y-3 text-sm text-gray-300">
                    <p>
                      هل واجهتك صعوبة في تطبيق خطوة معينة؟ انضم لمجتمع عرب نوشن واطرح استفساراتك وسيقوم المبدعون بمساعدتك فوراً.
                    </p>
                    <a
                      href="https://t.me/notionarabs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/30 text-xs font-bold transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>الانضمام لمجتمع التيليجرام الرسمي</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* 3. RTL Course Curriculum Sidebar */}
        <aside 
          className={`fixed lg:absolute top-16 bottom-0 right-0 w-88 xl:w-96 bg-[#0f0f0f] border-l border-neutral-800 z-30 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
            <div>
              <h3 className="text-sm font-bold text-white font-tajawal">
                فهرس الدروس (29 درساً)
              </h3>
              <p className="text-[11px] text-gray-400">
                {completedLessonIds.length} مكتمل من أصل {allLessons.length}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-neutral-800 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modules List with Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/80">
            {(course?.modules || []).map((module, mIdx) => {
              const isOpen = openModules[module.id] ?? (mIdx === 0);
              const moduleLessons = module.lessons || [];
              const completedInModule = moduleLessons.filter(l => completedLessonIds.includes(l.id)).length;
              const isModuleCompleted = completedInModule === moduleLessons.length && moduleLessons.length > 0;

              return (
                <div key={module.id} className="bg-neutral-900/30">
                  
                  {/* Module Accordion Row */}
                  <button
                    onClick={() => toggleModuleAccordion(module.id)}
                    className="w-full p-3.5 px-4 flex items-center justify-between text-right hover:bg-neutral-800/40 transition gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        isModuleCompleted 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-neutral-800 text-gray-400'
                      }`}>
                        {mIdx + 1}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-gray-200 truncate font-tajawal">
                          {module.titleAr || module.title}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {completedInModule}/{moduleLessons.length} مكتمل
                        </div>
                      </div>
                    </div>

                    <div className="text-gray-500 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {/* Lessons list inside module */}
                  {isOpen && (
                    <div className="bg-black/30 divide-y divide-neutral-900">
                      {moduleLessons.map((lesson) => {
                        const isCurrent = currentLesson?.id === lesson.id;
                        const isDone = completedLessonIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full p-3 px-4 flex items-center justify-between text-right transition gap-3 ${
                              isCurrent
                                ? 'bg-amber-500/15 border-r-2 border-amber-500 text-white'
                                : 'hover:bg-neutral-800/40 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate flex-1">
                              {/* Completion circle */}
                              <div className="flex-shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : isCurrent ? (
                                  <Play className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse ml-0.5" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-neutral-600" />
                                )}
                              </div>

                              <div className="truncate">
                                <div className={`text-xs truncate ${isCurrent ? 'font-bold text-amber-400' : 'font-medium'}`}>
                                  {lesson.titleAr || lesson.title}
                                </div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {lesson.title}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                              {formatLessonDuration(lesson.duration)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Stats */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-center">
            <span className="text-[11px] text-gray-400">
              مشغل Bunny Stream • جودة HD 1080p
            </span>
          </div>
        </aside>

      </div>
    </div>
  );
}
