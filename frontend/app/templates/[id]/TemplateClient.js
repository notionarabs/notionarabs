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
    
    const ultimateClean = (val) => {
      if (!val) return '';
      if (Array.isArray(val)) return val.map(v => ultimateClean(v)).flat().filter(Boolean);
      if (typeof val !== 'string') return val;

      let cleaned = val;

      // 1. Target and remove complex artifact patterns like ." . , "
      cleaned = cleaned.replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, '\n');
      
      // 2. Wipe out sequences of JSON/Escape noise characters
      cleaned = cleaned.replace(/[\\[\]"\/]{2,}/g, ' ');
      
      // 3. Try to unwrap if it still looks like a JSON string
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        try {
          const parsed = JSON.parse(cleaned);
          if (typeof parsed === 'string' || Array.isArray(parsed)) {
            cleaned = Array.isArray(parsed) ? parsed.join('\n') : parsed;
          }
        } catch (e) {}
      }

      // 4. Split by newline and perform deep per-item cleaning
      return cleaned.split('\n')
        .map(item => item.trim())
        .map(item => item.replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '').trim())
        .filter(item => item && item.length > 2 && !/^[\\\/\[\]" \t\n\r,.]+$/.test(item));
    };

    // Clean and normalize features using the ultimate cleaner
    if (t.features) {
      t.features = ultimateClean(t.features);
    }
    
    // Clean description and title with basic slash removal
    if (t.description && typeof t.description === 'string') {
      t.description = t.description.replace(/[\\[\]"\/]{2,}/g, ' ').trim();
    }
    if (t.title && typeof t.title === 'string') {
      t.title = t.title.replace(/[\\[\]"\/]{2,}/g, '').trim();
    }

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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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
        
        if (t.features) {
          const ultimateClean = (val) => {
            if (!val) return '';
            if (Array.isArray(val)) return val.map(v => ultimateClean(v)).flat().filter(Boolean);
            if (typeof val !== 'string') return val;

            let cleaned = val;
            cleaned = cleaned.replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, '\n');
            cleaned = cleaned.replace(/[\\[\]"\/]{2,}/g, ' ');
            
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
              try { cleaned = JSON.parse(cleaned); } catch (e) {}
            }

            return cleaned.split('\n')
              .map(item => item.trim())
              .map(item => item.replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '').trim())
              .filter(item => item && item.length > 2 && !/^[\\\/\[\]" \t\n\r,.]+$/.test(item));
          };
          t.features = ultimateClean(t.features);
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

  const handleReplySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !replyingTo) return;

    try {
      setIsSubmittingReply(true);
      const ratingId = replyingTo.ratingId || replyingTo.id || replyingTo._id;
      const response = await api.post(`/ratings/${ratingId}/reply`, { reply: replyText });
      
      if (response.data.success) {
        showSuccess('تم إضافة الرد بنجاح');
        setReplyingTo(null);
        setReplyText('');
        // Refresh ratings
        loadRatings(template._id || template.id);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'فشل في إضافة الرد');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const isCreator = useMemo(() => {
    if (!user || !template || !template.creator) return false;
    const creatorId = typeof template.creator === 'object' ? (template.creator._id || template.creator.id) : template.creator;
    return user._id === creatorId || user.id === creatorId;
  }, [user, template]);

  const handleLikeClick = async (commentId) => {
    if (!isAuthenticated) return (window.location.href = '/login');
    const tid = template._id || template.id;
    api.post(`/comments/${commentId}/like`).then(() => loadRatings(tid));
  };

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

                  <Link 
                    href={`/creators/${template.creator?.username}`}
                    className="flex items-center gap-4 mb-10 group bg-gray-50/50 dark:bg-dark-tertiary/30 p-3 rounded-2xl border border-gray-100/50 dark:border-dark-card-border w-fit hover:bg-gray-100 dark:hover:bg-dark-tertiary/50 transition-all active:scale-[0.98]"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                      <Image 
                        src={template.creator?.profilePicture || '/default-avatar.png'} 
                        alt={template.creator?.name || 'Creator'} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 group-hover:text-primary transition-colors">صمم بواسطة</div>
                      <div className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {template.creator?.name || 'مبدع مستقل'}
                      </div>
                    </div>
                  </Link>
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
                  if (!template.features || (Array.isArray(template.features) && template.features.length === 0)) return null;
                  
                  // Ensure features is an array and filter out any last-second noise
                  const featuresToRender = Array.isArray(template.features) ? template.features : [template.features];

                  return (
                    <div className="pt-10 border-t border-gray-100 dark:border-dark-card-border">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">المميزات الرئيسية</h3>
                      <div className="space-y-6">
                        {featuresToRender.map((feature, i) => (
                          <p key={i} className="text-lg font-bold text-gray-700 dark:text-dark-text-primary leading-relaxed">
                            {feature}
                          </p>
                        ))}
                      </div>
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

                <ReviewsList 
                  reviews={templateRatings} 
                  currentUser={user} 
                  onLike={handleLikeClick} 
                  onReply={isCreator ? (review) => {
                    setReplyingTo(review);
                    setReplyText(review.creatorReply || '');
                  } : null}
                  simple={true} 
                />
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

      {/* Creator Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setReplyingTo(null)} />
           <div className="bg-white dark:bg-dark-secondary w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-gray-100 dark:border-dark-card-border">
              <div className="p-8 sm:p-10">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">الرد على التقييم</h3>
                    <button onClick={() => setReplyingTo(null)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="mb-8 p-6 bg-gray-50 dark:bg-dark-tertiary/30 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">تعليق المستخدم</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
                       "{replyingTo.review || replyingTo.comment}"
                    </p>
                 </div>

                 <form onSubmit={handleReplySubmit} className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">ردك كمبدع للنظام</label>
                       <textarea
                         value={replyText}
                         onChange={(e) => setReplyText(e.target.value)}
                         placeholder="اكتب ردك هنا..."
                         className="w-full h-40 bg-gray-50 dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border rounded-2xl p-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none font-medium"
                         required
                       />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      {isSubmittingReply ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          حفظ الرد
                        </>
                      )}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
