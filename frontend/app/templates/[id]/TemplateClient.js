'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import Breadcrumb from '../../../components/Breadcrumb';
import { ShoppingCart, Star, Download, Globe, Calendar, Zap } from 'lucide-react';
import Footer from '../../../components/Footer';
import RatingPopup from '../../../components/RatingPopup';
import { useRatingPopup } from '../../../hooks/useRatingPopup';
import { getCategorySlug } from '../../../lib/categoryMapping';
import ReviewsList from '../../../components/ReviewsList';

// Dynamically import heavy components
const RatingCommentSystem = dynamic(() => import('../../../components/RatingCommentSystem'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4 p-6 bg-white/50 dark:bg-white/5 rounded-3xl">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  )
});

export default function TemplateClient({ initialTemplate }) {
  const params = useParams();
  const templateIdentifier = params.id;
  const { isAuthenticated, user } = useAuth();

  const [template, setTemplate] = useState(initialTemplate);
  const [relatedTemplates, setRelatedTemplates] = useState([]);
  const [loading, setLoading] = useState(!initialTemplate);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [templateRatings, setTemplateRatings] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState({ 
    averageRating: initialTemplate?.rating || 0, 
    totalRatings: initialTemplate?.reviewsCount || 0 
  });
  const [userHasTemplate, setUserHasTemplate] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [videoLoadError, setVideoLoadError] = useState(false);

  const { showPopup, closePopup, markAsRated } = useRatingPopup(template, user, isAuthenticated);

  const checkUserOwnership = async (templateId) => {
    if (!isAuthenticated || !templateId) return;
    try {
      setCheckingOwnership(true);
      const response = await api.get('/orders/me');
      if (response?.data?.success && response.data.orders) {
        const hasTemplate = response.data.orders.some(order =>
          order.items && order.items.some(item => item.templateId === templateId || item.id === templateId)
        );
        setUserHasTemplate(hasTemplate);
      }
    } catch (_) {
      setUserHasTemplate(false);
    } finally {
      setCheckingOwnership(false);
    }
  };

  const loadRatings = async (templateId) => {
    try {
      const [ratingsRes, commentsRes] = await Promise.all([
        api.get(`/ratings/template/${templateId}?limit=5`),
        api.get(`/comments/template/${templateId}?limit=10`)
      ]);

      if (ratingsRes.data.success) {
        setTemplateRatings(ratingsRes.data.ratings);
        setRatingsSummary({
          averageRating: ratingsRes.data.averageRating,
          totalRatings: ratingsRes.data.totalRatings
        });
      }
    } catch (err) {
      console.error('Error loading ratings:', err);
    }
  };

  useEffect(() => {
    if (template) {
      loadRatings(template._id);
      checkUserOwnership(template._id);
      api.get(`/templates/similar/${template._id}?limit=3`).then(res => {
        if (res.data?.success) setRelatedTemplates(res.data.templates);
      });
    } else if (templateIdentifier) {
        fetchTemplate();
    }
  }, [templateIdentifier, isAuthenticated]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates/${templateIdentifier}`);
      if (response.data.success) {
        const t = response.data.template;
        setTemplate(t);
        setSelectedImage(t.previewImage ? -2 : 0);
        setLoading(false);
        loadRatings(t._id);
        checkUserOwnership(t._id);
      } else {
        setError('القالب غير موجود');
        setLoading(false);
      }
    } catch (err) {
      setError('فشل في تحميل القالب');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!template || !isAuthenticated) {
      if (!isAuthenticated) window.location.href = '/login';
      return;
    }
    if (userHasTemplate) {
      window.open(template.notionLink, '_blank');
      return;
    }
    setIsDownloading(true);
    try {
      await api.post(`/templates/${template._id}/download`);
      window.open(template.notionLink, '_blank');
      setUserHasTemplate(true);
    } catch (err) {
      alert('خطأ في التحميل');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePurchase = async () => {
    if (!template || !isAuthenticated) {
      if (!isAuthenticated) window.location.href = `/login?redirect=/templates/${templateIdentifier}`;
      return;
    }
    setIsPurchasing(true);
    try {
      const res = await api.post('/payments/create-checkout-session', { templateId: template._id });
      if (res.data.success && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      alert('خطأ في عملية الشراء');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^#&?]*)/);
      return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
    }
    return null;
  };

  const handleLikeClick = useCallback((commentId) => {
    if (!isAuthenticated) return (window.location.href = '/login');
    api.post(`/comments/${commentId}/like`).then(() => loadRatings(template._id));
  }, [isAuthenticated, template]);

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} className={i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-700'} />
      ))}
    </div>
  );

  const reviewsToShow = useMemo(() => {
    return templateRatings.map(r => ({
      user: r.user,
      rating: r.rating,
      review: r.review,
      date: r.createdAt
    }));
  }, [templateRatings]);

  if (loading && !template) {
    return (
      <main className="min-h-screen bg-transparent relative overflow-x-hidden" dir="rtl">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="container-custom py-32 relative z-10 animate-pulse">
           <div className="h-12 w-48 bg-white/50 dark:bg-white/5 rounded-full mb-12" />
           <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
             <div className="lg:col-span-3 aspect-video bg-white/50 dark:bg-white/5 rounded-[4rem]" />
             <div className="lg:col-span-2 space-y-12">
               <div className="h-20 bg-white/50 dark:bg-white/5 rounded-[2rem]" />
               <div className="h-64 bg-white/50 dark:bg-white/5 rounded-[3rem]" />
             </div>
           </div>
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-transparent" dir="rtl">
        <div className="text-center p-12 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] shadow-large">
          <h2 className="text-3xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter uppercase">{error || 'النظام غير متوفر'}</h2>
          <Link href="/templates" className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-glow hover:scale-105 transition-all">العودة للمتجر</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="container-custom">
            {/* Breadcrumb Glass */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-full px-8 py-4 shadow-soft inline-flex border-none mb-12 animate-fade-in-up">
              <Breadcrumb
                items={[
                  { name: 'الرئيسية', href: '/' },
                  { name: 'المتجر', href: '/templates' },
                  { name: template.categories?.[0] || 'عام', href: `/categories/${getCategorySlug(template.categories?.[0] || 'عام')}` },
                  { name: template.title }
                ]}
              />
            </div>

            {/* Main Showcase Container */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] shadow-large border-none overflow-hidden relative group">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 p-10 sm:p-20 relative z-10">
                <div className="lg:col-span-3">
                  <div className="mb-10 group/showcase shadow-large rounded-[3rem] overflow-hidden bg-white/20 dark:bg-black/20 backdrop-blur-xl">
                    <div className="w-full aspect-video flex items-center justify-center relative">
                      {showVideo ? (
                        <iframe
                          src={getVideoEmbedUrl(template.explanationVideo)}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                        />
                      ) : (
                        <button onClick={() => setIsLightboxOpen(true)} className="w-full h-full relative cursor-zoom-in group/img">
                          <Image
                            src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)}
                            alt={template.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover/img:scale-105"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {(template.previewImages?.length > 1 || template.explanationVideo) && (
                    <div className="flex flex-wrap gap-4 justify-center" dir="ltr">
                      {template.explanationVideo && (
                        <button onClick={() => setShowVideo(true)} className={`w-28 h-20 rounded-2xl overflow-hidden shadow-soft transition-all ${showVideo ? 'ring-4 ring-primary shadow-glow' : 'opacity-60'}`}>
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center"><Zap className="text-primary" /></div>
                        </button>
                      )}
                      {(template.previewImages || []).map((img, i) => (
                        <button key={i} onClick={() => { setShowVideo(false); setSelectedImage(i); }} className={`w-28 h-20 rounded-2xl overflow-hidden shadow-soft transition-all ${!showVideo && selectedImage === i ? 'ring-4 ring-primary shadow-glow' : 'opacity-60'}`}>
                          <Image src={img} alt={`Preview ${i}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 flex flex-col justify-center gap-12">
                   <div className="space-y-6">
                      <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white leading-[1.1] tracking-tighter">{template.title}</h1>
                      <Link href={`/creators/${template.creator?.username}`} className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-soft hover:shadow-large transition-all">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 relative">
                          {template.creator?.profilePicture && <Image src={template.creator.profilePicture} alt="Creator" fill className="object-cover" />}
                          {template.creator?.badges?.some(b => b.type === 'verified') && (
                             <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-dark-secondary rounded-full p-0.5 shadow-sm z-10 border border-emerald-500/10">
                               <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                             </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="text-sm font-black text-accent-900 dark:text-white">{template.creator?.name || 'مبدع مستقل'}</div>
                        </div>
                      </Link>
                   </div>

                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-soft text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-accent-500 mb-2">القيمة</div>
                            <div className="text-3xl font-black text-accent-900 dark:text-white">{template.isPaid ? `${template.price} ج.م` : 'مجاني'}</div>
                         </div>
                         <div className="p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/5 backdrop-blur-2xl shadow-soft text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-accent-500 mb-2">التقييم</div>
                            <div className="flex items-center justify-center gap-2 text-2xl font-black text-accent-900 dark:text-white">
                               <Star className="text-yellow-500 fill-yellow-500" size={24} />
                               {ratingsSummary.averageRating || 0}
                            </div>
                         </div>
                      </div>

                      <button
                        onClick={template.isPaid ? handlePurchase : handleDownload}
                        disabled={isPurchasing || isDownloading}
                        className="w-full py-8 rounded-[2rem] bg-primary text-white font-black text-2xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                        {isPurchasing || isDownloading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : (
                          <>
                            {template.isPaid ? <ShoppingCart /> : <Download />}
                            {userHasTemplate ? 'فتح النظام' : (template.isPaid ? 'شراء الآن' : 'تحميل مجاني')}
                          </>
                        )}
                      </button>
                   </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-24">
               <div className="lg:col-span-2 space-y-16">
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] p-12 sm:p-20 shadow-large">
                     <h2 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-12 tracking-tighter">هندسة <span className="text-primary">التجربة</span></h2>
                     <div className="text-2xl text-accent-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">{template.description}</div>
                  </div>

                  {/* Reviews Section */}
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[4rem] p-12 sm:p-20 shadow-large">
                     <div className="flex items-center justify-between mb-16">
                        <h2 className="text-4xl font-black text-accent-900 dark:text-white tracking-tighter">آراء المجتمع</h2>
                        <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/10 shadow-soft">
                           <span className="text-5xl font-black text-primary">{ratingsSummary.averageRating || 0}</span>
                           <StarRating rating={ratingsSummary.averageRating || 0} />
                        </div>
                     </div>
                     <ReviewsList reviews={reviewsToShow} currentUser={currentUser} onLike={handleLikeClick} />
                  </div>
               </div>

               <div className="lg:col-span-1 space-y-12">
                  <div className="bg-black/90 dark:bg-white/5 backdrop-blur-[60px] rounded-[3.5rem] p-12 shadow-large text-white sticky top-24">
                     <h3 className="text-2xl font-black mb-12 tracking-tight flex items-center gap-4 border-b border-white/10 pb-8"><Globe className="text-primary" /> المواصفات</h3>
                     <div className="space-y-8">
                        {[
                           { label: 'اللغة', value: template.language === 'ar' ? 'العربية' : 'عربي / إنجليزي', icon: Globe },
                           { label: 'تاريخ النشر', value: formatDate(template.createdAt), icon: Calendar },
                           { label: 'المستخدمين', value: `${template.downloads || 0}`, icon: Download },
                        ].map((item, i) => (
                           <div key={i} className="space-y-2">
                              <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">{item.label}</div>
                              <div className="text-lg font-black">{item.value}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 active:scale-95 transition-transform" onClick={() => setIsLightboxOpen(false)}>
           <div className="max-w-7xl aspect-video w-full relative shadow-glow rounded-[4rem] overflow-hidden">
              <Image src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)} alt="Preview" fill className="object-contain" />
           </div>
        </div>
      )}

      {/* Rating Popup */}
      {showPopup && template && (
        <RatingPopup
          template={template}
          onClose={closePopup}
          onSuccess={() => {
            loadRatings(template._id);
          }}
        />
      )}
    </>
  );
}
