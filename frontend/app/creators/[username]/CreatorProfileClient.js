'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Mail, UserPlus, Star, TrendingUp, Crown, Sparkles, Award, Trophy, Gem, Zap, Download, CheckCircle, Heart } from 'lucide-react';
import Footer from '../../../components/Footer';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import FollowButton from '../../../components/FollowButton';

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

export default function CreatorProfileClient({ initialCreator }) {
  const params = useParams();
  const username = params.username;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [creator, setCreator] = useState(initialCreator);
  const [creatorTemplates, setCreatorTemplates] = useState([]);
  const [loading, setLoading] = useState(!initialCreator);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [creatorRatings, setCreatorRatings] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [medianRating, setMedianRating] = useState(initialCreator?.rating || 0);
  const [profileImageError, setProfileImageError] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  useEffect(() => {
    if (initialCreator) {
        setCreator(initialCreator);
        setMedianRating(initialCreator.rating || 0);
    } else if (username) {
      fetchCreatorProfile();
    }
  }, [username, initialCreator]);

  // Reset pagination and fetch templates when creator changes
  useEffect(() => {
    if (creator) {
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  }, [creator?.id]);

  // Refetch templates when pagination changes
  useEffect(() => {
    if (creator) {
      fetchCreatorTemplates();
    }
  }, [pagination.current, creator?.id]);

  const fetchCreatorTemplates = async () => {
    if (!creator) return;

    try {
      setTemplatesLoading(true);
      const templatesResponse = await api.get(`/templates?creator=${creator.id}&page=${pagination.current}&limit=${pagination.limit}`);
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
      setCreatorTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (creator && isAuthenticated) {
      loadCreatorRatings();
    }
  }, [creator, isAuthenticated]);

  const loadCreatorRatings = async () => {
    if (!creator) return;

    try {
      if (isAuthenticated) {
        const userRatingResponse = await api.get(`/ratings/user/creator/${creator.id}`);
        if (userRatingResponse.data.success) {
          setUserRating(userRatingResponse.data.rating);
        }
      }

      const ratingsResponse = await api.get(`/ratings/creator/${creator.id}?limit=5`);
      if (ratingsResponse.data.success) {
        setCreatorRatings(ratingsResponse.data.ratings);
      }
    } catch (error) {
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      const creatorResponse = await api.get(`/creators/${username}`);
      if (creatorResponse.data.success) {
        const c = creatorResponse.data.creator;
        setCreator(c);
        setMedianRating(c.rating || 0);
      } else {
        setError('المبدع غير موجود');
      }
    } catch (error) {
      setError('حدث خطأ في تحميل بيانات المبدع');
    } finally {
      setLoading(false);
    }
  };

  const detectPlatform = (url) => {
    if (!url) return null;
    const urlLower = url.toLowerCase();
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return { name: 'twitter' };
    if (urlLower.includes('instagram.com')) return { name: 'instagram' };
    if (urlLower.includes('linkedin.com')) return { name: 'linkedin' };
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return { name: 'youtube' };
    if (urlLower.includes('facebook.com')) return { name: 'facebook' };
    if (urlLower.includes('tiktok.com')) return { name: 'tiktok' };
    if (urlLower.includes('telegram.org') || urlLower.includes('t.me')) return { name: 'telegram' };
    return { name: 'website' };
  };

  const getPlatformIcon = (platform) => {
    return <Globe className="w-5 h-5" />; // Simplified for brevity in this refactor
  };

  if (loading && !creator) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black" dir="rtl">
        <LoadingIndicator />
      </main>
    );
  }

  if (error || !creator) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-black py-20 text-center" dir="rtl">
        <h1 className="text-4xl font-bold mb-4">{error || 'المبدع غير موجود'}</h1>
        <Link href="/creators" className="btn-primary inline-block">تصفح المبدعين</Link>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black text-accent-500 dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden" dir="rtl">
        {/* Ambient Background Mesh */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        </div>

        {/* Header - Glass Effect */}
        <div className="sticky top-0 z-30 bg-white/70 dark:bg-black/60 backdrop-blur-md border-none shadow-sm">
          <div className="container-custom px-4 sm:px-6 py-3 sm:py-4">
            <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <Link href="/creators" className="hover:text-primary-600 font-medium whitespace-nowrap flex-shrink-0">المبدعين</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-semibold truncate">{creator.displayName || creator.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-20 relative z-10">
          <div className="container-custom px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative group">
                    {creator.profilePicture && !profileImageError ? (
                      <Image
                        src={creator.profilePicture}
                        alt={creator.name}
                        width={140}
                        height={140}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center text-5xl font-black text-primary">
                        {(creator.displayName || creator.name)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                    <div className="text-center sm:text-right">
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-2 sm:mb-4">
                      <h1 className="text-4xl md:text-5xl font-black text-accent-500 dark:text-white line-clamp-2">
                          {creator.displayName || creator.name}
                      </h1>
                      {creator.badges?.some(b => b.type === 'verified') && (
                        <div className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-full" title="مبدع معتمد">
                          <CheckCircle className="w-6 h-6 md:w-8 md:h-8 fill-emerald-500/10" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-6">
                      {creator.badges?.filter(b => b.type !== 'verified').map((badge, idx) => {
                        const Icon = getBadgeIcon(badge.type);
                        return (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 shadow-sm" title={badge.label}>
                            <Icon size={14} />
                            <span>{badge.label}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                       <span className="px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full text-sm font-bold shadow-soft">
                          {creator.followers || 0} متابع
                       </span>
                       <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm font-bold text-blue-600 shadow-soft">
                          {pagination.total || 0} قالب
                       </span>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-accent-600 dark:text-gray-300 leading-relaxed text-center sm:text-right whitespace-pre-wrap">
                    {creator.bio || creator.experience}
                </p>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  <FollowButton creatorId={creator.id} creatorName={creator.name} />
                  {creator.email && (
                     <a href={`mailto:${creator.email}`} className="btn-secondary px-8 py-3 rounded-xl flex items-center gap-2">
                        <Mail size={18} /> تواصل
                     </a>
                  )}
                </div>
              </div>

              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-large border-none">
                 <h3 className="text-xl font-bold mb-6">التخصصات</h3>
                 <div className="flex flex-wrap gap-2">
                    {creator.specialties?.map((s, i) => (
                       <span key={i} className="px-4 py-2 bg-white/50 dark:bg-white/10 rounded-xl text-sm font-bold shadow-soft">
                          {s}
                       </span>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl">
           <div className="container-custom px-4 sm:px-6">
              <h2 className="text-3xl font-black mb-12">قوالب {creator.displayName || creator.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {creatorTemplates.map((template) => (
                    <Link key={template.id} href={`/templates/${template.slug || template.id}`} className="group card border-none overflow-hidden hover:scale-[1.02] transition-all">
                       <div className="aspect-video relative overflow-hidden">
                          <Image src={template.previewImage} alt={template.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-4 left-4">
                             <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold ring-1 ring-white/20">
                                {template.isPaid ? `${template.price} ج.م` : 'مجاني'}
                             </span>
                          </div>
                       </div>
                       <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                             <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                                {template.categories?.[0] || template.category || 'عام'}
                             </span>
                          </div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{template.title}</h3>
                          <div className="flex items-center justify-between mt-4">
                             <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Download size={14} /> {template.downloads || 0}
                             </div>
                             <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <Star size={14} fill="currentColor" /> {template.rating || 0}
                             </div>
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
