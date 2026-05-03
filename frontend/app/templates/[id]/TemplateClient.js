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
import { ShoppingCart, Star, Download, Globe, Calendar, Zap, CheckCircle, ExternalLink, ShieldCheck, Clock, Layers, Rocket, Users } from 'lucide-react';
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
      alert('خطأ في التحميل');
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
        alert(`عذراً: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Purchase Error:', err);
      const serverMsg = err.response?.data?.message || err.message;
      alert(`خطأ في عملية الشراء: ${serverMsg}`);
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

          <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-[2.5rem] shadow-xl overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 min-h-[500px]">
              
              {/* Media Section - Should be on one side */}
              <div className="lg:col-span-3 p-4 sm:p-6 bg-gray-50/30 dark:bg-black/10 flex flex-col justify-center">
                <div className="relative w-full rounded-[2rem] overflow-hidden bg-white dark:bg-dark-tertiary shadow-2xl border border-gray-100 dark:border-dark-card-border group">
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
                    <div className="w-full h-auto relative">
                      <Image
                        src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)}
                        alt={template.title}
                        width={1200}
                        height={800}
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                        onClick={() => setIsLightboxOpen(true)}
                        priority
                        unoptimized={template.previewImage?.includes('notion.so')}
                      />
                    </div>
                  )}
                  
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-gray-900 dark:text-white border border-white/20 shadow-lg uppercase tracking-widest">
                    {template.isPaid ? 'نظام متميز' : 'نظام مجاني'}
                  </div>
                </div>

                {(template.previewImages?.length > 0 || template.explanationVideo) && (
                  <div className="flex flex-wrap gap-4 mt-8 justify-center px-4">
                    {template.explanationVideo && (
                      <button 
                        onClick={() => setShowVideo(true)} 
                        className={`group relative w-24 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${showVideo ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 dark:border-dark-card-border hover:border-primary/50'}`}
                      >
                        <div className="w-full h-full bg-gray-100 dark:bg-dark-tertiary flex flex-col items-center justify-center">
                          <Zap size={18} className={`${showVideo ? 'text-primary' : 'text-gray-400'}`} />
                          <span className="text-[8px] font-black mt-1">فيديو</span>
                        </div>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { setShowVideo(false); setSelectedImage(-2); }} 
                      className={`group relative w-24 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${!showVideo && selectedImage === -2 ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-gray-200 dark:border-dark-card-border hover:border-primary/50'}`}
                    >
                      <Image src={template.previewImage} alt="Cover" fill className="object-cover" />
                    </button>

                    {(template.previewImages || []).map((img, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setShowVideo(false); setSelectedImage(i); }} 
                        className={`group relative w-24 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${!showVideo && selectedImage === i ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-gray-200 dark:border-dark-card-border hover:border-primary/50'}`}
                      >
                        <Image src={img} alt={`Preview ${i+1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section - Border should be on the inside (left side in RTL) */}
              <div className="lg:col-span-2 p-8 sm:p-12 flex flex-col bg-white dark:bg-dark-secondary border-r lg:border-r-0 lg:border-l border-gray-100 dark:border-dark-card-border">
                <div className="mb-auto">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.categories?.map((cat, i) => (
                      <span key={i} className="text-[10px] font-black uppercase tracking-[0.1em] text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg border border-primary-100/50 dark:border-primary-800/30">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-[1.2] tracking-tight">
                    {template.title}
                  </h1>

                  <div className="flex items-center gap-4 mb-10 group bg-gray-50/50 dark:bg-dark-tertiary/30 p-3 rounded-2xl border border-gray-100/50 dark:border-dark-card-border w-fit">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shadow-sm">
                      <Image 
                        src={template.creator?.profilePicture || '/default-avatar.png'} 
                        alt={template.creator?.name || 'Creator'} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">صمم بواسطة</div>
                      <Link 
                        href={`/creators/${template.creator?.username}`} 
                        className="text-sm font-black text-gray-900 dark:text-white hover:text-primary transition-colors block"
                      >
                        {template.creator?.name || 'مبدع مستقل'}
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 mt-4">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-50 to-white dark:from-dark-tertiary dark:to-dark-secondary rounded-3xl border border-gray-200 dark:border-dark-card-border shadow-inner">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">السعر النهائي</div>
                      <div className="text-3xl font-black text-primary flex items-baseline gap-1">
                        {template.price > 0 ? (
                          <>
                            <span>{template.price}</span>
                            <span className="text-sm font-bold opacity-80">ج.م</span>
                          </>
                        ) : 'مجاني'}
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">متوسط التقييم</div>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                             <Star 
                               key={i} 
                               size={16} 
                               className={i < Math.floor(ratingsSummary.averageRating) ? 'fill-current' : 'opacity-20'} 
                             />
                          ))}
                        </div>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {ratingsSummary.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={userHasTemplate ? () => window.open(template.notionLink, '_blank') : (template.isPaid ? null : handleDownload)}
                      disabled={isPurchasing || isDownloading || (template.isPaid && !userHasTemplate)}
                      className="group relative w-full overflow-hidden rounded-2xl bg-primary py-5 text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="flex items-center justify-center gap-3 relative z-10">
                        {isPurchasing || isDownloading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="text-sm font-bold">{isPurchasing ? 'جاري تحويلك للدفع...' : 'جاري التحميل...'}</span>
                          </div>
                        ) : (
                          <>
                            <span>{userHasTemplate ? 'فتح في نوشن' : (template.isPaid ? 'قريباً - تفعيل الدفع' : 'تحميل مجاني')}</span>
                            {userHasTemplate ? <ExternalLink size={22} /> : (template.isPaid ? <Clock size={22} /> : <Download size={22} />)}
                          </>
                        )}
                      </div>
                    </button>
                    
                    <div className="flex items-center justify-between px-2">
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                          <Users size={14} className="text-primary-500" />
                          <span>{(template.downloads || 0).toLocaleString()} مستخدم</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <span>دفع آمن 100%</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              
              {/* Description & Features */}
              <div className="bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] border border-gray-200 dark:border-dark-card-border shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Rocket size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">حول هذا النظام</h2>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                    {template.description}
                  </p>
                </div>

                {(() => {
                  if (!template.features) return null;
                  
                  let features = [];
                  const raw = Array.isArray(template.features) ? template.features.join('\n') : String(template.features);
                  
                  const parseRecursive = (str) => {
                    try {
                      const trimmed = str.trim();
                      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"['))) {
                        const toParse = trimmed.startsWith('"') ? JSON.parse(trimmed) : trimmed;
                        const parsed = typeof toParse === 'string' ? JSON.parse(toParse) : toParse;
                        if (Array.isArray(parsed)) {
                          if (parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].includes('["')) {
                            return parseRecursive(parsed[0]);
                          }
                          return parsed.map(f => String(f).trim().replace(/^[\-\*\u2022]\s*/, ''));
                        }
                      }
                    } catch (e) {}
                    return null;
                  };

                  const parsedResult = parseRecursive(raw);
                  if (parsedResult) {
                    features = parsedResult.filter(Boolean);
                  } else if (raw.includes('","') || raw.includes('", "')) {
                    features = raw
                      .replace(/[\[\]"']/g, '')
                      .split(/[\n,]/)
                      .map(f => f.trim().replace(/^[\-\*\u2022]\s*/, ''))
                      .filter(Boolean);
                  } else {
                    features = raw.split('\n').map(f => f.trim().replace(/^[\-\*\u2022]\s*/, '')).filter(Boolean);
                  }

                  if (features.length === 0) return null;

                  return (
                    <div className="pt-10 border-t border-gray-100 dark:border-dark-card-border">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">المميزات الرئيسية</h3>
                      <p className="text-lg font-bold text-gray-700 dark:text-dark-text-primary leading-relaxed whitespace-pre-wrap">
                        {features.join('\n')}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] border border-gray-200 dark:border-dark-card-border shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                      <Star size={24} className="fill-current" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">آراء المجتمع</h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary">{ratingsSummary.totalRatings || 0}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مراجعة مكتوبة</span>
                  </div>
                </div>

                {/* Rating Breakdown */}
                {ratingsSummary.totalRatings > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12 p-8 bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-3xl border border-gray-100 dark:border-dark-card-border">
                    <div className="md:col-span-2 flex flex-col items-center justify-center border-l border-gray-100 dark:border-dark-card-border">
                      <div className="text-6xl font-black text-gray-900 dark:text-white mb-2">
                        {ratingsSummary.averageRating?.toFixed(1) || '0.0'}
                      </div>
                      <div className="flex text-yellow-500 mb-2">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} size={20} className={i < Math.floor(ratingsSummary.averageRating) ? 'fill-current' : 'opacity-20'} />
                         ))}
                      </div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">متوسط التقييم العام</div>
                    </div>
                    
                    <div className="md:col-span-3 space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = templateRatings.filter(r => r.rating === star).length;
                        const percentage = (count / ratingsSummary.totalRatings) * 100;
                        return (
                          <div key={star} className="flex items-center gap-4 group">
                            <div className="flex items-center gap-1.5 w-12 shrink-0">
                               <span className="text-xs font-black text-gray-600 dark:text-gray-400">{star}</span>
                               <Star size={12} className="text-yellow-500 fill-current" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-card-border rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-yellow-500 rounded-full transition-all duration-1000" 
                                 style={{ width: `${percentage}%` }}
                               />
                            </div>
                            <div className="w-8 text-right">
                               <span className="text-[10px] font-bold text-gray-400">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <ReviewsList reviews={reviewsToShow} currentUser={currentUser} onLike={handleLikeClick} simple={true} />
              </div>

              {/* Discussion */}
              <div className="bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] border border-gray-200 dark:border-dark-card-border shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Users size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">أسئلة ونقاشات</h2>
                </div>
                <RatingCommentSystem 
                  targetType="template" 
                  targetId={template._id || template.id} 
                  onRatingChange={() => loadRatings(template._id || template.id)}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] border border-gray-200 dark:border-dark-card-border shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-10 flex items-center gap-3 relative z-10">
                    <Layers size={22} className="text-primary" /> 
                    المواصفات الفنية
                  </h3>
                  
                  <div className="space-y-8 relative z-10">
                    {[
                      { label: 'اللغة المعتمدة', value: template.language === 'ar' ? 'اللغة العربية' : 'ثنائي (عربي / إنجليزي)', icon: Globe },
                      { label: 'تاريخ التحديث', value: formatDate(template.updatedAt || template.createdAt), icon: Clock },
                      { label: 'فئة النظام', value: template.categories?.[0] || 'عام', icon: Rocket },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-tertiary flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                           <item.icon size={18} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{item.label}</div>
                          <div className="text-sm font-black text-gray-900 dark:text-white">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                       <CheckCircle size={18} />
                       <span className="text-xs font-black uppercase tracking-widest">جودة مضمونة</span>
                    </div>
                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 leading-relaxed font-bold italic">
                      "تم فحص هذا القالب تقنياً لضمان خلوه من الأخطاء وتوافقه التام مع نوشن."
                    </p>
                  </div>
                </div>

                {/* Social Share (Placeholder) */}
                <div className="p-4 text-center">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">شارك مع المجتمع</p>
                   <div className="flex items-center justify-center gap-4">
                      {/* We could add social buttons here */}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-fadeIn" 
          onClick={() => setIsLightboxOpen(false)}
        >
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <Zap size={32} />
           </button>
           <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
              <Image 
                src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)} 
                alt="Fullscreen Preview" 
                fill 
                className="object-contain" 
              />
           </div>
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
