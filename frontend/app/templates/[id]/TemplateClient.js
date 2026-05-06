'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import Breadcrumb from '../../../components/Breadcrumb';
import { ShoppingCart, Star, Download, Globe, Calendar, Zap, CheckCircle, ExternalLink, ShieldCheck, Clock, Layers, Rocket, Users, X } from 'lucide-react';
import Footer from '../../../components/Footer';
import RatingPopup from '../../../components/RatingPopup';
import { useRatingPopup } from '../../../hooks/useRatingPopup';
import { getCategorySlug } from '../../../lib/categoryMapping';
import Counter from '../../../components/Counter';
import ReviewsList from '../../../components/ReviewsList';

// Dynamically import heavy components
const RatingCommentSystem = dynamic(() => import('../../../components/RatingCommentSystem'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border">
      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
    </div>
  )
});

export default function TemplateClient({ initialTemplate }) {
  const params = useParams();
  const templateIdentifier = params.id;
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const processedInitialTemplate = useMemo(() => {
    if (!initialTemplate) return null;
    const t = { ...initialTemplate };
    
    const cleanData = (val) => {
      if (!val || typeof val !== 'string') return val;
      if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('"') && val.endsWith('"'))) {
        try {
          const parsed = JSON.parse(val);
          return cleanData(parsed);
        } catch (e) { return val; }
      }
      return val;
    };

    if (t.features) {
      const raw = cleanData(t.features);
      t.features = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split('\n') : []);
      t.features = t.features.map(f => cleanData(f)).map(f => typeof f === 'string' ? f.trim() : f).filter(Boolean);
    }
    
    // Also clean description if it's double encoded
    if (t.description) t.description = cleanData(t.description);
    if (t.title) t.title = cleanData(t.title);

    return t;
  }, [initialTemplate]);

  const [template, setTemplate] = useState(processedInitialTemplate);
  const [loading, setLoading] = useState(!processedInitialTemplate);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(template?.previewImage ? -2 : 0);
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
  const [currentUser, setCurrentUser] = useState(null);

  const { showPopup, closePopup } = useRatingPopup(template, user, isAuthenticated);

  const checkUserOwnership = async (templateId) => {
    if (!isAuthenticated || !templateId) return;
    try {
      const response = await api.get('/orders/me');
      if (response?.data?.success && response.data.orders) {
        const hasTemplate = response.data.orders.some(order =>
          order.items && order.items.some(item => {
            const itemTid = (item.templateId && typeof item.templateId === 'object') 
              ? (item.templateId._id || item.templateId.id) 
              : item.templateId;
            return itemTid === templateId || item.id === templateId;
          })
        );
        setUserHasTemplate(hasTemplate);
      }
    } catch (_) {
      setUserHasTemplate(false);
    }
  };

  const loadRatings = async (templateId) => {
    try {
      const ratingsRes = await api.get(`/ratings/template/${templateId}?limit=5`);
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
      const tid = template._id || template.id;
      loadRatings(tid);
      checkUserOwnership(tid);
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
        
        // Robust cleaning for double-encoded strings (e.g. ["[\"...\"]"])
        const cleanData = (val) => {
          if (!val || typeof val !== 'string') return val;
          if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('"') && val.endsWith('"'))) {
            try {
              const parsed = JSON.parse(val);
              return cleanData(parsed); // Recursive cleaning
            } catch (e) { return val; }
          }
          return val;
        };

        if (t.features) {
          const raw = cleanData(t.features);
          t.features = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split('\n') : []);
          t.features = t.features.map(f => cleanData(f)).map(f => typeof f === 'string' ? f.trim() : f).filter(Boolean);
        }
        
        setTemplate(t);
        setSelectedImage(t.previewImage ? -2 : 0);
        setLoading(false);
        const tid = t._id || t.id;
        loadRatings(tid);
        checkUserOwnership(tid);
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
      if (!isAuthenticated) window.location.href = `/login?redirect=/templates/${templateIdentifier}`;
      return;
    }
    const tid = template._id || template.id;
    if (userHasTemplate) {
      window.open(template.notionLink, '_blank');
      window.dispatchEvent(new CustomEvent('templateDownloaded', { detail: { templateId: tid } }));
      return;
    }
    setIsDownloading(true);
    try {
      await api.post(`/templates/${tid}/download`);
      window.open(template.notionLink, '_blank');
      setUserHasTemplate(true);
      window.dispatchEvent(new CustomEvent('templateDownloaded', { detail: { templateId: tid } }));
    } catch (err) {
      showError('خطأ في التحميل');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePurchase = async () => {
    if (!template || !isAuthenticated) {
      if (!isAuthenticated) {
        console.log('Redirecting to login first...');
        window.location.href = `/login?redirect=/templates/${templateIdentifier}`;
      }
      return;
    }
    const tid = template._id || template.id;
    setIsPurchasing(true);
    try {
      console.log('Creating checkout session for:', tid);
      const res = await api.post('/payments/create-checkout-session', { templateId: tid });
      
      if (res.data.success && res.data.checkoutUrl) {
        console.log('Redirecting to Paymob:', res.data.checkoutUrl);
        // Direct assignment to window.location.href for maximum reliability
        window.location.href = res.data.checkoutUrl;
      } else {
        console.error('Payment failed to initialize:', res.data);
        const errorMsg = res.data.message || 'فشل في بدء عملية الدفع';
        showError(`عذراً: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Purchase Error:', err);
      const serverMsg = err.response?.data?.message || err.message;
      showError(`خطأ في عملية الشراء: ${serverMsg}`);
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
    const tid = template._id || template.id;
    api.post(`/comments/${commentId}/like`).then(() => loadRatings(tid));
  }, [isAuthenticated, template]);

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200 dark:text-gray-800'} />
      ))}
    </div>
  );

  const reviewsToShow = useMemo(() => {
    return templateRatings.map(r => ({ 
      ...r, 
      ratingId: r._id || r.id,
      date: r.createdAt 
    }));
  }, [templateRatings]);

  if (loading && !template) {
    return (
      <main className="min-h-screen bg-white dark:bg-dark-primary pt-12 pb-24" dir="rtl">
        <div className="container-custom">
          <Breadcrumb items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'القوالب', url: '/templates' },
            { name: 'جاري التحميل...' }
          ]} className="mb-10" />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 animate-pulse">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/3"></div>
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 animate-pulse">
            <div className="lg:col-span-3 aspect-video bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]"></div>
            <div className="lg:col-span-2 space-y-6">
                <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl w-3/4"></div>
                <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !template) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-primary" dir="rtl">
        <div className="text-center p-12 bg-gray-50 dark:bg-dark-secondary rounded-[2.5rem] border border-gray-100 dark:border-dark-card-border">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
             <Rocket size={40} className="rotate-180" />
          </div>
          <h2 className="text-2xl font-black mb-4">{error || 'القالب غير موجود'}</h2>
          <Link href="/templates" className="btn-primary inline-flex">العودة للمتجر</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50/50 dark:bg-dark-primary pt-12 pb-24" dir="rtl">
        <div className="container-custom">
          
          <Breadcrumb 
            items={[
              { name: 'الرئيسية', url: '/' },
              { name: 'القوالب', url: '/templates' },
              { name: template.categories?.[0] || 'عام', url: `/categories/${getCategorySlug(template.categories?.[0] || 'عام')}` },
              { name: template.title }
            ]} 
            className="mb-10" 
          />

          {/* Minimalist Header & Buy Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            
            {/* Left Column: Media Showcase */}
            <div className="lg:col-span-7 xl:col-span-8">
               <div className="relative w-full rounded-[3rem] overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-3xl shadow-large border border-black/5 dark:border-white/5 group">
                  {showVideo ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={getVideoEmbedUrl(template.explanationVideo)}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full h-auto relative overflow-hidden cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                      <Image
                        src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)}
                        alt={template.title}
                        width={1200}
                        height={800}
                        className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                        priority
                        unoptimized={template.previewImage?.includes('notion.so')}
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  )}
                  
                  <div className="absolute top-8 right-8 px-5 py-2 bg-black/40 backdrop-blur-xl rounded-2xl text-[10px] font-black text-white border border-white/20 shadow-xl uppercase tracking-widest z-10">
                    {template.isPaid ? 'نظام متميز' : 'نظام مجاني'}
                  </div>
               </div>

               {(template.previewImages?.length > 0 || template.explanationVideo) && (
                  <div className="flex flex-wrap gap-4 mt-8 justify-start">
                    {template.explanationVideo && (
                      <button 
                        onClick={() => setShowVideo(true)} 
                        className={`group relative w-20 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${showVideo ? 'border-primary ring-4 ring-primary/5 scale-110' : 'border-black/5 dark:border-white/5 hover:border-primary/50'}`}
                      >
                        <div className="w-full h-full bg-primary/5 flex flex-col items-center justify-center">
                          <Zap size={18} className={`${showVideo ? 'text-primary fill-primary' : 'text-gray-400'}`} />
                        </div>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { setShowVideo(false); setSelectedImage(-2); }} 
                      className={`group relative w-20 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${!showVideo && selectedImage === -2 ? 'border-primary ring-4 ring-primary/5 scale-110 shadow-soft' : 'border-black/5 dark:border-white/5 hover:border-primary/50'}`}
                    >
                      <Image src={template.previewImage} alt="Cover" fill className="object-cover" />
                    </button>

                    {(template.previewImages || []).map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setShowVideo(false); setSelectedImage(i); }} 
                        className={`group relative w-20 h-14 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${!showVideo && selectedImage === i ? 'border-primary ring-4 ring-primary/5 scale-110 shadow-soft' : 'border-black/5 dark:border-white/5 hover:border-primary/50'}`}
                      >
                        <Image src={img} alt={`Preview ${i+1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
               )}
            </div>

            {/* Right Column: Key Info & Purchase */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                <div className="mb-auto">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {template.categories?.map((cat, i) => (
                        <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/10">
                            {cat}
                        </span>
                        ))}
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-black text-accent-900 dark:text-white mb-6 leading-tight tracking-tighter">
                        {template.title}
                    </h1>

                    <Link 
                        href={`/creators/${template.creator?.username}`}
                        className="flex items-center gap-4 mb-12 group w-fit"
                    >
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gray-200 shadow-soft transition-all duration-500">
                        <Image 
                            src={template.creator?.profilePicture || '/default-avatar.png'} 
                            alt={template.creator?.name || 'Creator'} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-[0.25em] mb-0.5">بواسطة</span>
                            <span className="text-base font-black text-accent-900 dark:text-white group-hover:text-primary transition-colors">{template.creator?.name || 'مبدع مستقل'}</span>
                        </div>
                    </Link>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-8 bg-white/30 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-large">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-[0.2em] mb-1">السعر</span>
                            <span className="text-4xl font-black text-primary">
                                {template.price > 0 ? (
                                <>
                                    <span>{template.price}</span>
                                    <span className="text-base font-black opacity-60 mr-1">ج.م</span>
                                </>
                                ) : 'مجاني'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex text-yellow-500 gap-0.5 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className={i < Math.floor(ratingsSummary.averageRating) ? 'fill-current' : 'opacity-20'} />
                                ))}
                            </div>
                            <span className="text-[11px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-[0.2em]">{ratingsSummary.totalRatings} تقييم</span>
                        </div>
                    </div>

                    <button
                      onClick={userHasTemplate ? () => window.open(template.notionLink, '_blank') : (template.isPaid ? handlePurchase : handleDownload)}
                      disabled={isPurchasing || isDownloading}
                      className="group relative w-full overflow-hidden rounded-3xl bg-accent-900 dark:bg-white py-6 text-xl font-black text-white dark:text-accent-900 shadow-large hover:shadow-glow hover:-translate-y-1 transition-all duration-500 disabled:opacity-70"
                    >
                      <div className="flex items-center justify-center gap-4 relative z-10">
                        {isPurchasing || isDownloading ? (
                          <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{userHasTemplate ? 'فتح في نوشن' : (template.isPaid ? 'شراء الآن' : 'تحميل مجاني')}</span>
                            {userHasTemplate ? <ExternalLink size={24} /> : <Download size={24} />}
                          </>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center justify-between px-4 text-[11px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-primary" />
                            <span>{(template.downloads || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span>دفع آمن</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Description Details */}
            <div className="lg:col-span-8 space-y-16">
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Rocket size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-accent-900 dark:text-white">حول هذا النظام</h2>
                    </div>
                    <div className="prose prose-xl dark:prose-invert max-w-none text-accent-900/60 dark:text-white/40 font-medium leading-relaxed whitespace-pre-wrap">
                        {template.description}
                    </div>

                    {template.features && template.features.length > 0 && (
                        <div className="mt-12 text-lg font-bold text-accent-900/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap">
                            {template.features.join('\n')}
                        </div>
                    )}
                </section>

                <section id="reviews" className="pt-16 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-500/5 rounded-2xl flex items-center justify-center text-yellow-500">
                                <Star size={24} className="fill-current" />
                            </div>
                            <h2 className="text-3xl font-black text-accent-900 dark:text-white">آراء المستخدمين</h2>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-black text-primary">{ratingsSummary.averageRating?.toFixed(1) || '0.0'}</div>
                             <div className="text-[10px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-widest">من 5 نجوم</div>
                        </div>
                    </div>
                    <ReviewsList reviews={reviewsToShow} currentUser={currentUser} onLike={handleLikeClick} simple={true} />
                </section>

                <section id="discussion" className="pt-16 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500">
                            <Users size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-accent-900 dark:text-white">الأسئلة والنقاش</h2>
                    </div>
                    <RatingCommentSystem 
                        targetType="template" 
                        targetId={template._id || template.id} 
                        onRatingChange={() => loadRatings(template._id || template.id)}
                    />
                </section>
            </div>

            {/* Technical Sidebar */}
            <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-8">
                    <div className="p-10 bg-white/30 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-black/5 dark:border-white/5 shadow-large">
                        <h3 className="text-xl font-black text-accent-900 dark:text-white mb-10 flex items-center gap-3">
                            <Layers size={22} className="text-primary" /> 
                            التفاصيل التقنية
                        </h3>
                        <div className="space-y-8">
                            {[
                                { label: 'اللغة المعتمدة', value: template.language === 'ar' ? 'اللغة العربية' : 'ثنائي (عربي / إنجليزي)', icon: Globe },
                                { label: 'تاريخ التحديث', value: formatDate(template.updatedAt || template.createdAt), icon: Clock },
                                { label: 'فئة النظام', value: template.categories?.[0] || 'عام', icon: Rocket },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-accent-900/5 dark:bg-white/5 flex items-center justify-center text-accent-900/30 dark:text-white/20 group-hover:text-primary transition-all">
                                        <item.icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-[10px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-[0.2em] mb-0.5">{item.label}</div>
                                        <div className="text-sm font-black text-accent-900 dark:text-white">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </div>

                {/* Social Share */}
                <div className="p-4 text-center py-20 border-t border-black/5 dark:border-white/5">
                   <p className="text-[10px] font-black text-accent-900/30 dark:text-white/20 uppercase tracking-[0.4em] mb-8">نشر هذا النظام مع المجتمع</p>
                   <div className="flex items-center justify-center gap-6">
                      {['twitter', 'instagram', 'link'].map((social) => (
                        <button key={social} className="w-12 h-12 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/5 flex items-center justify-center text-accent-900/30 dark:text-white/20 hover:text-primary hover:border-primary/20 hover:-translate-y-1 transition-all duration-500">
                          {social === 'twitter' && <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                          {social === 'instagram' && <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>}
                          {social === 'link' && <ExternalLink size={20} />}
                        </button>
                      ))}
                   </div>
                </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-20 animate-fadeIn cursor-pointer" 
          onClick={() => setIsLightboxOpen(false)}
        >
           {/* Image Container - Restricted size to allow clicking outside */}
           <div 
             className="relative max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center cursor-default z-[105]" 
             onClick={(e) => e.stopPropagation()}
           >
              <Image 
                src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)} 
                alt="Fullscreen Preview" 
                fill 
                className="object-contain select-none pointer-events-auto" 
                priority
              />
           </div>

           {/* Close Button - Defined last to ensure it's on top */}
           <button 
             className="absolute top-4 right-4 sm:top-8 sm:right-8 p-4 text-white/70 hover:text-white transition-all hover:rotate-90 z-[120] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 shadow-2xl"
             onClick={(e) => {
               e.stopPropagation();
               setIsLightboxOpen(false);
             }}
             aria-label="Close"
           >
              <X size={32} strokeWidth={3} />
           </button>
        </div>
      )}

      {/* Rating Popup */}
      {showPopup && template && (
        <RatingPopup
          template={template}
          onClose={closePopup}
          onRatingChange={() => loadRatings(template._id || template.id)}
        />
      )}
    </>
  );
}
