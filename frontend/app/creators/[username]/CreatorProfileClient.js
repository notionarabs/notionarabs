'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Mail,
  Star,
  Sparkles,
  Download,
  CheckCircle,
  Share2,
  Calendar,
  Search,
  ChevronDown,
  XCircle
} from 'lucide-react';
import Footer from '../../../components/Footer';
import LoadingIndicator from '../../../components/LoadingIndicator';
import TemplateCard from '../../../components/TemplateCard';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import FollowButton from '../../../components/FollowButton';
import SocialIcon from '../../../components/settings/SocialIcon';
import { detectPlatform } from '../../../lib/socialUtils';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

export default function CreatorProfileClient({ initialCreator }) {
  const params = useParams();
  const username = params.username;
  useAuth();
  const { showSuccess } = useToast();
  
  const [creator, setCreator] = useState(initialCreator);
  const [creatorTemplates, setCreatorTemplates] = useState([]);
  const [loading, setLoading] = useState(!initialCreator);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [isCoverDark, setIsCoverDark] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Dynamic contrast detection for cover image
  useEffect(() => {
    const coverUrl = creator?.backgroundImage || '/images/default-cover.png';
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.src = coverUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1;
        canvas.height = 1;
        // Sample the bottom part where the text overlaps
        ctx.drawImage(img, img.width / 2, img.height * 0.7, img.width / 10, img.height / 10, 0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const brightness = (data[0] * 299 + data[1] * 587 + data[2] * 114) / 1000;
        setIsCoverDark(brightness < 140); // threshold
      } catch (e) {
        console.warn("Could not calculate cover brightness (CORS or Error)", e);
        // Fallback: If it's the default cover, we know it's relatively dark/colorful
        if (coverUrl === '/images/default-cover.png') {
            setIsCoverDark(true);
        } else {
            setIsCoverDark(false); 
        }
      }
    };
  }, [creator?.backgroundImage]);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 9,
    total: 0,
    pages: 1
  });

  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const normalizeExternalUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    if (initialCreator) {
        setCreator(initialCreator);
    } else if (username) {
      fetchCreatorProfile();
    }
  }, [username, initialCreator]);

  useEffect(() => {
    if (creator?.id) {
      fetchCreatorTemplates();
    }
  }, [pagination.current, creator?.id, sortBy, searchQuery]);

  // Type-to-search (debounced) so users don't need Enter
  useEffect(() => {
    const t = setTimeout(() => {
      const next = (searchInput || '').trim();
      setSearchQuery(prev => (prev === next ? prev : next));
      setPagination(prev => (prev.current === 1 ? prev : ({ ...prev, current: 1 })));
    }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (event) => {
      const t = event.target;
      if (!t) return;
      if (sortButtonRef.current?.contains(t)) return;
      if (sortMenuRef.current?.contains(t)) return;
      setIsSortOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortOpen]);

  const fetchCreatorTemplates = async () => {
    if (!creator) return;

    try {
      setTemplatesLoading(true);
      const query = searchQuery ? `&search=${searchQuery}` : '';
      const templatesResponse = await api.get(`/templates?creator=${creator.id}&page=${pagination.current}&limit=${pagination.limit}&sortBy=${sortBy}${query}`);
      if (templatesResponse.data.success) {
        setCreatorTemplates(templatesResponse.data.templates);
        if (templatesResponse.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: templatesResponse.data.pagination.current,
            pages: templatesResponse.data.pagination.pages,
            total: templatesResponse.data.pagination.total
          }));
        }
      }
    } catch (templatesError) {
      console.error('Error fetching creator templates:', templatesError);
      setCreatorTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      const creatorResponse = await api.get(`/creators/${username}`);
      if (creatorResponse.data.success) {
        setCreator(creatorResponse.data.creator);
      }
    } catch (error) {
      console.error('Error fetching creator profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (n) => {
    setPagination(prev => ({ ...prev, current: n }));
    document.getElementById('creator-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading && !creator) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]" dir="rtl">
        <LoadingIndicator />
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#0a0a0a] py-20 text-center" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">المبدع غير موجود</h1>
        <Link href="/creators" className="text-primary-600 hover:underline">تصفح المبدعين</Link>
      </main>
    );
  }


  return (
    <>
      <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300 pb-20 pt-0 text-foreground dark:text-white" dir="rtl">
        {/* Ambient Mesh Background (match site) */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        {/* Cover Image */}
        <div className="relative z-10">
          <div className="relative h-[180px] sm:h-[220px] md:h-[260px] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            <Image 
              src={creator.backgroundImage || '/images/default-cover.png'} 
              alt="Cover" 
              fill 
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-transparent dark:from-black/45 dark:via-black/25 dark:to-transparent" />
          
          {/* Share Button (Top Left) */}
          <div className="absolute top-4 left-4 z-20">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `ملف المبدع | ${creator.displayName || creator.name}`,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showSuccess('تم نسخ الرابط بنجاح!');
                }
              }}
              className="p-2.5 bg-white/60 hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/45 backdrop-blur-md rounded-xl text-zinc-900 dark:text-white shadow-sm transition-colors flex items-center justify-center border border-white/20 dark:border-white/10"
              title="مشاركة الملف"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
        </div>

        {/* Profile Header Section */}
        <div className="container-custom max-w-7xl relative z-10">
          {/* Force column placement like Notion (layout LTR, content RTL) */}
          <div className="flex flex-col md:flex-row gap-12 items-start w-full -mt-4 sm:-mt-6" dir="rtl">
            
            {/* Main (Notion-like) */}
            <section className="relative z-10 space-y-12 w-full md:flex-1 min-w-0" dir="rtl">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20 relative z-20 px-4 sm:px-0">
                {/* Avatar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative group flex-shrink-0"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] border-[6px] border-white dark:border-[#0a0a0a] bg-zinc-100 dark:bg-zinc-800 shadow-xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                    {creator.profilePicture && !profileImageError ? (
                      <Image
                        src={creator.profilePicture}
                        alt={creator.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        onError={() => setProfileImageError(true)}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-400">
                        {(creator.displayName || creator.name)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {creator.badges?.some(b => b.type === 'verified') && (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="absolute -bottom-1 -right-1 bg-primary text-white p-2.5 rounded-2xl border-[4px] border-white dark:border-[#0a0a0a] shadow-lg z-30 flex items-center justify-center"
                      title="مبدع معتمد"
                    >
                      <CheckCircle className="w-4 h-4" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>

                {/* Identity */}
                <div className="min-w-0 pb-1">
                  <h1 className={`text-3xl sm:text-4xl font-black tracking-tight truncate transition-colors duration-500 ${isCoverDark ? 'text-white drop-shadow-md' : 'text-zinc-900'} dark:text-white`}>
                    {creator.displayName || creator.name}
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-white/40 font-black uppercase tracking-widest truncate mt-1">
                    @{creator.username}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="max-w-2xl">
                <p className="text-[15px] sm:text-[16px] leading-8 text-foreground/70 dark:text-white/55 font-medium whitespace-pre-wrap mt-6">
                  {creator.bio || creator.experience || 'مبدع مستقل يساهم في إثراء المحتوى العربي على نوشن.'}
                </p>
              </div>

                {/* Stats (calm, Notion-like) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-12 pt-10 border-t border-card-border">
                  {[
                    { label: 'قالب', value: pagination.total || 0 },
                    { label: 'متابع', value: creator.followers || 0 },
                    { label: 'تحميل', value: (creator.stats?.totalDownloads || 0).toLocaleString() },
                    { label: 'تقييم', value: `${typeof creator.rating === 'number' ? creator.rating.toFixed(1) : (creator.rating || '5.0')} (${creator.stats?.totalRatings || 0})` }
                  ].map((s) => (
                    <div key={s.label} className="text-right">
                      <div className="text-3xl font-black text-foreground dark:text-white">{s.value}</div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40 dark:text-white/25 mt-2">{s.label}</div>
                    </div>
                  ))}
                </div>
            </section>

            {/* Sidebar (actions + meta) */}
            <aside className="md:mt-8 w-full md:w-80 md:flex-none md:sticky md:top-28" dir="rtl">
              {/* No more card box here - open layout */}
              <div className="space-y-10">
                <div className="space-y-3">
                  {creator.email && (
                    <a
                      href={`mailto:${creator.email}`}
                      className="w-full py-4 px-6 bg-accent-900 dark:bg-white text-white dark:text-accent-900 rounded-2xl text-center font-black text-[12px] uppercase tracking-[0.2em] shadow-soft hover:shadow-large transition-all flex items-center justify-center gap-2"
                    >
                      <Mail size={16} className="opacity-80" />
                      تواصل مع المبدع
                    </a>
                  )}

                  <FollowButton
                    creatorId={creator.id}
                    creatorName={creator.displayName || creator.name}
                    className="w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all"
                    onFollowChange={(isFollowing) => {
                      setCreator(prev => ({
                        ...prev,
                        followers: isFollowing ? (prev.followers || 0) + 1 : Math.max(0, (prev.followers || 0) - 1)
                      }));
                    }}
                  />

                  <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-foreground/40 dark:text-white/25 pt-1">
                    <Calendar size={14} className="text-zinc-400" />
                    <span>عضو منذ {formatDate(creator.createdAt)}</span>
                  </div>
                </div>

                {creator.specialties && creator.specialties.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 dark:text-white/25">أهم التصنيفات</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.specialties.slice(0, 6).map((s, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-card-border rounded-2xl text-[11px] font-black text-foreground/60 dark:text-white/50"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {creator.socialLinks && creator.socialLinks.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-foreground/40 dark:text-white/25">روابط التواصل</p>
                    <div className="flex flex-wrap gap-2.5">
                      {creator.socialLinks.slice(0, 8).map((link, idx) => {
                        const platform = detectPlatform(link.url);
                        const safeUrl = normalizeExternalUrl(link.url);
                        return (
                          <a
                            key={idx}
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-11 h-11 bg-white/50 dark:bg-white/5 border border-card-border rounded-2xl flex items-center justify-center hover:shadow-soft transition-all group"
                            title={platform?.name || 'رابط خارجي'}
                          >
                            <SocialIcon
                              platform={platform?.icon}
                              className="w-5 h-5 text-foreground/40 dark:text-white/30 group-hover:text-primary transition-colors"
                            />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-foreground/40 dark:text-white/25">
                    <span className="text-primary">{pagination.total || 0}</span> قالب
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        {/* Content Section (Templates) */}
        <div id="creator-content" className="container-custom max-w-7xl relative z-10 py-16 sm:py-20 space-y-10">
          
          {/* All Templates Grid */}
          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="space-y-1">
                   <h2 className="text-xl font-bold text-zinc-900 dark:text-white">الأعمال</h2>
                   <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">{pagination.total || 0} عمل منشور</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72 group">
                       <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-foreground/40 dark:text-white/25 group-focus-within:text-primary transition-colors">
                          <Search size={18} />
                       </div>
                       {searchInput && (
                         <button
                           type="button"
                           onClick={() => setSearchInput('')}
                           className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40 hover:text-primary dark:text-white/25 dark:hover:text-primary transition-colors"
                           aria-label="مسح البحث"
                         >
                           <XCircle size={18} />
                         </button>
                       )}
                       <input 
                         type="text" 
                         placeholder="ابحث في أعمال المبدع..." 
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border rounded-2xl py-3 pr-14 pl-12 text-sm font-bold text-foreground dark:text-white placeholder-foreground/30 dark:placeholder-white/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none shadow-soft"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                               setSearchQuery(e.target.value.trim());
                             setPagination(prev => ({ ...prev, current: 1 }));
                           }
                         }}
                       />
                    </div>

                    <div className="relative w-full md:w-52">
                      <button
                        ref={sortButtonRef}
                        type="button"
                        onClick={() => setIsSortOpen(v => !v)}
                        className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border rounded-2xl py-3 px-5 text-sm font-bold text-foreground dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all flex items-center justify-between shadow-soft group"
                      >
                        <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                          {sortBy === 'newest' ? 'الأحدث' : sortBy === 'popular' ? 'الأكثر تحميلاً' : 'الأعلى تقييماً'}
                        </span>
                        <ChevronDown
                          size={18}
                          className={cn("text-foreground/30 dark:text-white/20 transition-transform duration-300 group-hover:text-primary", isSortOpen ? "rotate-180" : "")}
                        />
                      </button>

                      {isSortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          ref={sortMenuRef}
                          className="absolute z-50 mt-3 w-full overflow-hidden rounded-[2rem] border border-card-border bg-white/80 dark:bg-black/60 backdrop-blur-2xl shadow-large p-1.5"
                        >
                          {[
                            { value: 'newest', label: 'الأحدث' },
                            { value: 'popular', label: 'الأكثر تحميلاً' },
                            { value: 'rating', label: 'الأعلى تقييماً' }
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSortBy(opt.value);
                                setPagination(prev => ({ ...prev, current: 1 }));
                                setIsSortOpen(false);
                              }}
                              className={cn(
                                "w-full text-right px-5 py-3.5 text-[13px] font-black rounded-2xl transition-all",
                                sortBy === opt.value
                                  ? "bg-primary text-white shadow-soft"
                                  : "text-foreground/60 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                </div>
            </div>
            
            {templatesLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                 {[1, 2, 3, 4, 5, 6].map((n) => (
                   <div key={n} className="space-y-4 animate-pulse">
                     <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl" />
                     <div className="space-y-2 px-1">
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-1/4" />
                        <div className="h-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-3/4" />
                     </div>
                   </div>
                 ))}
               </div>
            ) : creatorTemplates.length > 0 ? (
              <>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
                >
                  {creatorTemplates.map((template) => (
                    <motion.div 
                      key={template.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <TemplateCard template={template} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-20 flex justify-center">
                    <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#252525] p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={cn(
                            "w-10 h-10 rounded-xl text-sm font-bold transition-all",
                            pagination.current === i + 1
                              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-600 scale-105"
                              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/20 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-5">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-primary-500 shadow-sm border border-zinc-100 dark:border-zinc-700">
                   <Sparkles size={36} />
                </div>
                <div className="space-y-2">
                   <p className="text-zinc-900 dark:text-white font-bold text-lg">لا توجد قوالب متاحة</p>
                   <p className="text-zinc-500 dark:text-zinc-500 font-medium text-sm">لم يقم المبدع بنشر أي أعمال عامة حتى الآن.</p>
                </div>
              </div>
            )}
          </section>
        </div>

      </main>
      <Footer />
    </>
  );
}

