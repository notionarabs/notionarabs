'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import api from '../../lib/api';
import ProfileSidebar from '../../components/ProfileSidebar';
import TemplatesContent from '../../components/TemplatesContent';
import BlogsContent from '../../components/BlogsContent';
import SalesContent from '../../components/SalesContent';
import SettingsContent from '../../components/SettingsContent';
import AnalyticsContent from '../../components/AnalyticsContent';
import CreatorEarnings from '../../components/CreatorEarnings';
import AdminPayouts from '../../components/AdminPayouts';
import NotificationsContent from '../../components/NotificationsContent';
import { 
  Camera, Mail, User as UserIcon, AtSign, Settings, LayoutDashboard, Edit3, 
  Download, TrendingUp, DollarSign, Bell, Award, Calendar, CheckCircle2, 
  Sparkles, Star, Percent, Briefcase, Plus, Heart, Info, Shield, ExternalLink, 
  Share2, Loader2, Check, ArrowLeft, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialIcon from '../../components/settings/SocialIcon';
import { detectPlatform } from '../../lib/socialUtils';

// Profile Overview Component - Turn into Executive Creator Command Center
function ProfileOverview({ user: propUser, onNavigate }) {
  const isCreator = propUser?.creatorStatus?.toLowerCase() === 'approved';
  const isAdmin = propUser?.role?.toLowerCase() === 'admin';

  const [liveStats, setLiveStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(isCreator);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (isCreator) {
      const fetchDashboardData = async () => {
        try {
          const [statsRes, notificationsRes] = await Promise.all([
            api.get('/creators/me/stats'),
            api.get('/notifications')
          ]);
          
          if (statsRes.data?.success) {
            setLiveStats(statsRes.data.stats);
          }
          if (notificationsRes.data?.success) {
            setRecentActivity((notificationsRes.data.notifications || []).slice(0, 2));
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoadingStats(false);
        }
      };
      fetchDashboardData();
    }
  }, [isCreator]);

  const followersCount = liveStats ? (liveStats.followers || 0) : (propUser?.followersCount || propUser?.followers || 0);
  const templatesCount = liveStats ? (liveStats.totalTemplates || 0) : (propUser?.templatesCount || 0);
  const ratingValue = liveStats ? (liveStats.averageRating || 0) : (propUser?.rating || 0);
  const earningsValue = liveStats ? (liveStats.currentBalance || 0) : (propUser?.totalEarnings || propUser?.balance || 0);

  const getJoinedDate = () => {
    if (!propUser?.createdAt) return 'عضو جديد';
    try {
      const date = new Date(propUser.createdAt);
      return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'عضو جديد';
    }
  };

  const checklist = [
    { id: 'name', label: 'الاسم الكامل', complete: !!propUser?.name, points: 15 },
    { id: 'username', label: 'اسم المستخدم', complete: !!propUser?.username, points: 15 },
    { id: 'profilePicture', label: 'الصورة الشخصية', complete: !!propUser?.profilePicture, points: 20 },
    { id: 'backgroundImage', label: 'صورة الغلاف', complete: !!propUser?.backgroundImage, points: 15 },
    { id: 'bio', label: 'النبذة التعريفية', complete: !!propUser?.bio, points: 20 },
    { id: 'socials', label: 'روابط التواصل', complete: propUser?.socialLinks && propUser.socialLinks.length > 0, points: 15 }
  ];

  const completionPercentage = checklist.reduce((sum, item) => sum + (item.complete ? item.points : 0), 0);

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="absolute top-0 right-0 w-4 h-4 text-gray-300 dark:text-gray-600" />
            <div className="absolute top-0 right-0 w-2 h-4 overflow-hidden">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 max-w-none" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">مدير المنصة</span>;
    if (isCreator) return <span className="bg-primary-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">مبدع معتمد</span>;
    return <span className="bg-gray-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">مستكشف</span>;
  };



  return (
    <div className="space-y-6 lg:space-y-8 max-w-5xl mx-auto">
      {/* 1. Executive Identity Card */}
      <div className="relative bg-white dark:bg-dark-secondary rounded-[2.5rem] border border-gray-100/60 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="h-40 sm:h-52 relative group overflow-hidden">
          {propUser?.backgroundImage ? (
            <Image src={propUser.backgroundImage} alt="Cover" fill className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" priority unoptimized />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-6 left-6 z-10">{getRoleBadge()}</div>
        </div>

        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 relative z-20">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border-4 border-white dark:border-dark-secondary shadow-xl bg-gradient-to-br from-primary-500 to-accent-500">
              {propUser?.profilePicture ? (
                <Image src={propUser.profilePicture} alt={propUser.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-black">{propUser?.name?.charAt(0)?.toUpperCase()}</div>
              )}
            </div>
            <div className="text-center sm:text-right pb-2 flex-1">
              <h2 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight mb-2">{propUser?.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-black text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                {propUser?.username && <span className="text-primary-600 dark:text-orange-400">@{propUser.username}</span>}
                <span className="opacity-30">•</span>
                <span>انضم في {getJoinedDate()}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => onNavigate?.('settings')} className="p-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 transition-colors shadow-sm cursor-pointer border-none"><Settings size={18} className="text-gray-600 dark:text-dark-text-secondary" /></button>
              {isCreator && propUser?.username && (
                <a href={`/creators/${propUser.username}`} target="_blank" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-primary-500/20 flex items-center gap-2 transition-all active:scale-95 decoration-none"><ExternalLink size={16} /><span>عرض الملف العام</span></a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Performance Matrix & Monthly Pulse */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'المتابعون', value: followersCount, unit: 'متابع', color: 'purple', trend: null },
            { label: 'قوالب منشورة', value: templatesCount, unit: 'قالب', color: 'orange', trend: null },
            { label: 'التقييم العام', value: ratingValue.toFixed(1), unit: 'نجوم', color: 'amber', isStars: true },
            { label: 'الرصيد المتاح', value: (earningsValue || 0).toLocaleString('ar-EG'), unit: 'ج.م', color: 'emerald', isLocked: true }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:translate-y-[-2px] transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                {stat.isLocked && <span className="text-[8px] font-black bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-md">قريباً</span>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${stat.isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-dark-text-primary'}`}>{stat.value}</span>
                <span className={`text-[10px] font-bold text-${stat.color}-500 opacity-60`}>{stat.unit}</span>
              </div>
              {stat.isStars && <div className="mt-2">{renderStars(ratingValue)}</div>}
            </div>
          ))}
        </div>
        

      </div>

      {/* 3. Main Dashboard Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Double-Column: Primary Content & Actions */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Bio showcase - Now as a Main Featured Card */}
          <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-primary-500" />
                <span>النبذة التعريفية المبدعة</span>
              </div>
              <button onClick={() => onNavigate?.('settings')} className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors border-none bg-transparent cursor-pointer">
                <Edit3 size={14} className="text-primary-500" />
              </button>
            </h3>
            <div className="relative">
              <p className="text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed font-medium whitespace-pre-line bg-gray-50/50 dark:bg-dark-tertiary/20 p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-inner">
                {propUser?.bio || 'لا توجد نبذة تعريفية مضافة حالياً لصفحتك العامة. أضف نبذة لتعريف المجتمع بك ومهاراتك المميزة!'}
              </p>
              {!propUser?.bio && (
                <div className="mt-4 flex justify-end">
                  <button onClick={() => onNavigate?.('settings')} className="text-[10px] font-black text-primary-600 hover:underline border-none bg-transparent cursor-pointer">إضافة نبذة الآن →</button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Control Center */}
          {isCreator && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/templates/create" className="p-7 bg-white dark:bg-dark-secondary rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:translate-y-[-4px] transition-all group decoration-none border-b-4 border-b-primary-500/20">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:rotate-6 transition-transform"><Plus size={28} /></div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 dark:text-dark-text-primary uppercase tracking-wider">إنشاء قالب</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">نشر في المتجر</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-dark-text-tertiary leading-relaxed font-medium">حوّل تصاميمك المميزة إلى مصدر إلهام للمجتمع العربي ✨</p>
              </Link>
              <Link href="/blog/create" className="p-7 bg-white dark:bg-dark-secondary rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:translate-y-[-4px] transition-all group decoration-none border-b-4 border-b-amber-500/20">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 group-hover:-rotate-6 transition-transform"><Edit3 size={28} /></div>
                  <div>
                    <h4 className="text-base font-black text-gray-900 dark:text-dark-text-primary uppercase tracking-wider">كتابة مقال</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">نشر في المدونة</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-dark-text-tertiary leading-relaxed font-medium">شارك خبراتك في نوشين وارفع من وعي مجتمع المبدعين 📚</p>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side Column: Meta & Progress */}
        <div className="space-y-6 lg:space-y-8">
          {/* Recent Activity Snapshot - Connected to Live Notifications (Filtered for Unread) */}
          {isCreator && (
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">آخر النشاطات</h3>
                <button onClick={() => onNavigate?.('notifications')} className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors border-none bg-transparent cursor-pointer">
                  <Bell size={14} className="text-primary-500" />
                </button>
              </div>
              <div className="space-y-3">
                {(() => {
                  const unreadActivity = recentActivity.filter(n => !n.isRead);
                  return unreadActivity.length > 0 ? (
                    unreadActivity.map((notif, idx) => (
                      <div key={notif._id || idx} className="p-4 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-2xl border border-gray-100/50 dark:border-white/5 hover:bg-white dark:hover:bg-dark-tertiary transition-all group">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${notif.type?.includes('follow') ? 'bg-primary-500' : 'bg-amber-500'}`}></div>
                          <span className="text-[8px] text-gray-400 font-black uppercase tracking-wider">
                            {notif.type?.includes('follow') ? 'متابعة جديدة' : 'تنبيه جديد'}
                          </span>
                          <span className="text-[8px] text-gray-300 mr-auto">{new Date(notif.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-700 dark:text-dark-text-primary line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 opacity-40">
                      <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Check size={20} className="text-emerald-500" strokeWidth={3} />
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">أنت على اطلاع بكل شيء ✨</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


          {/* Socials Showcase */}
          <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">شبكة التواصل</h3>
            {propUser?.socialLinks?.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {propUser.socialLinks.map((link, idx) => {
                  const platform = detectPlatform(link.url);
                  return (
                    <a key={idx} href={link.url} target="_blank" className={`h-12 rounded-2xl bg-gray-50 dark:bg-dark-tertiary/40 hover:scale-110 transition-transform flex items-center justify-center border border-gray-100/30 dark:border-white/5 ${platform?.color || 'text-gray-400 shadow-sm'}`}>
                      <SocialIcon platform={platform?.icon} className="w-6 h-6" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50/50 dark:bg-dark-tertiary/10 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/5">
                <Share2 size={24} className="text-gray-300 mb-2 mx-auto opacity-50" />
                <p className="text-[10px] text-gray-400 font-bold">لم تضف روابط بعد</p>
              </div>
            )}
          </div>

          {/* Completion Milestone */}
          {completionPercentage === 100 ? (
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 mx-auto mb-5 rotate-3"><Check size={36} strokeWidth={4} /></div>
              <h4 className="text-base font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2">الملف مكتمل</h4>
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500/50 font-black leading-relaxed">أنت الآن تظهر بأفضل صورة للمجتمع ✨</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اكتمال الملف</span>
                <span className="text-sm font-black text-primary-500">{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-dark-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <p className="mt-4 text-[10px] text-gray-400 font-bold text-center">أكمل ملفك لزيادة فرصة ظهورك!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeSection, setActiveSection] = useState(tabParam || 'profile');

  useEffect(() => {
    setActiveSection(tabParam || 'profile');
  }, [tabParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Handle section navigation
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Update URL query parameter instantly without triggering Next.js server round-trips
    const newPath = section === 'profile' ? '/profile' : `/profile?tab=${section}`;
    window.history.pushState({ section }, '', newPath);
    // Scroll to top when changing sections (instant to avoid glitches with layout shifts)
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">

        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block fixed top-0 right-0 h-screen w-64 bg-white dark:bg-dark-secondary border-none p-6 z-40">
            <div className="space-y-8 animate-pulse">
              {/* Section 1 */}
              <div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
              {/* Section 2 */}
              <div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 min-h-screen lg:mr-64">
            <div className="max-w-6xl mx-auto p-6 sm:p-8 animate-pulse">

              {/* Header Text */}
              <div className="mb-8">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Cover Image */}
              <div className="mb-8 relative">
                <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>

              {/* Profile Info */}
              <div className="mb-8 -mt-20 relative z-10 flex items-end gap-4 px-4">
                <div className="h-32 w-32 bg-gray-300 dark:bg-gray-600 rounded-full border-none shadow-lg"></div>
                <div className="mb-4 space-y-2">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Form/Content Skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                </div>
                <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>

            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return null;
  }

  if (!loading && isAuthenticated && user && user.creatorStatus?.toLowerCase() === 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">

        <div className="container-custom py-12 sm:py-16 px-4 sm:px-0">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4">
                طلبك قيد المراجعة
              </h1>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                تم استلام طلبك للانضمام كمبدع وهو قيد المراجعة حالياً. سنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/" className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-center">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto text-center">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileOverview user={user} onNavigate={handleSectionChange} />;
      case 'settings':
        return <SettingsContent />;
      case 'templates':
        return <TemplatesContent />;
      case 'blogs':
        return <BlogsContent />;
      case 'sales':
        return <SalesContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'earnings':
        return <CreatorEarnings />;
      case 'notifications':
        return <NotificationsContent />;
      case 'admin-payouts':
        return <AdminPayouts />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">


      <div className="flex">
        {/* Sidebar with custom navigation handler */}
        <ProfileSidebar
          userStatus={user?.creatorStatus}
          role={user?.role}
          onNavigate={handleSectionChange}
          activeSection={activeSection}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:mr-64 bg-secondary-50 dark:bg-dark-primary overflow-hidden">
          <div className="max-w-6xl mx-auto p-4 pt-20 sm:p-8 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
