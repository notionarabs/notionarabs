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

  const [template, setTemplate] = useState(initialTemplate);
  const [loading, setLoading] = useState(!initialTemplate);
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
          order.items && order.items.some(item => item.templateId === templateId || item.id === templateId)
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
      return;
    }
    setIsDownloading(true);
    try {
      await api.post(`/templates/${tid}/download`);
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
    return templateRatings.map(r => ({ ...r, date: r.createdAt }));
  }, [templateRatings]);

  if (loading && !template) {
    return (
      <main className="min-h-screen bg-white dark:bg-dark-primary py-20" dir="rtl">
        <div className="container-custom animate-pulse space-y-12">
           <div className="h-8 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
           <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
             <div className="lg:col-span-3 aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
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
      <main className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || 'القالب غير موجود'}</h2>
          <Link href="/templates" className="btn-primary">العودة للمتجر</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50/50 dark:bg-dark-primary pt-12 pb-24" dir="rtl">
        <div className="container-custom">
          
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { name: 'الرئيسية', url: '/' },
                { name: 'المتجر', url: '/templates' },
                { name: template.title }
              ]}
            />
          </div>

          <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-3xl shadow-sm overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              
              {/* Media Section */}
              <div className="lg:col-span-3 p-6 sm:p-8 bg-gray-50/50 dark:bg-black/20 border-l border-gray-100 dark:border-dark-card-border">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-tertiary shadow-inner">
                  {showVideo ? (
                    <iframe
                      src={getVideoEmbedUrl(template.explanationVideo)}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <Image
                      src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)}
                      alt={template.title}
                      fill
                      className="object-cover"
                      onClick={() => setIsLightboxOpen(true)}
                    />
                  )}
                </div>

                {(template.previewImages?.length > 1 || template.explanationVideo) && (
                  <div className="flex flex-wrap gap-3 mt-6 justify-center">
                    {template.explanationVideo && (
                      <button onClick={() => setShowVideo(true)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${showVideo ? 'border-primary' : 'border-transparent opacity-60'}`}>
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center"><Zap size={18} className="text-primary" /></div>
                      </button>
                    )}
                    {(template.previewImages || []).map((img, i) => (
                      <button key={i} onClick={() => { setShowVideo(false); setSelectedImage(i); }} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${!showVideo && selectedImage === i ? 'border-primary' : 'border-transparent opacity-60'}`}>
                        <Image src={img} alt="Preview" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="lg:col-span-2 p-8 sm:p-10 flex flex-col">
                <div className="mb-auto">
                  <div className="flex items-center gap-3 mb-4">
                    {template.categories?.map((cat, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-md">{cat}</span>
                    ))}
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">{template.title}</h1>

                  <Link href={`/creators/${template.creator?.username}`} className="flex items-center gap-3 mb-8 group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 relative border border-gray-100 dark:border-dark-card-border">
                      <Image src={template.creator?.profilePicture || '/default-avatar.png'} alt="Creator" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">بواسطة المبدع</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{template.creator?.name || 'مبدع مستقل'}</div>
                    </div>
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-dark-card-border">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">السعر</div>
                      <div className="text-2xl font-black text-primary">{template.price > 0 ? `${template.price} ج.م` : 'مجاني'}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">التقييم</div>
                      <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        {ratingsSummary.averageRating?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={template.isPaid ? handlePurchase : handleDownload}
                    disabled={isPurchasing || isDownloading}
                    className="w-full py-5 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isPurchasing || isDownloading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {userHasTemplate ? 'فتح النظام' : (template.isPaid ? 'اقتنِ النظام الآن' : 'بدء التحميل المجاني')}
                        {template.isPaid ? <ShoppingCart size={20} /> : <Download size={20} />}
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 justify-center">
                    <div className="flex items-center gap-1.5"><Users size={14} /> {(template.downloads || 0).toLocaleString()} مستخدم</div>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> موثوق وآمن</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              
              {/* Description */}
              <div className="bg-white dark:bg-dark-secondary p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-dark-card-border">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 border-r-4 border-primary pr-4">حول هذا النظام</h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line text-lg">{template.description}</div>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-dark-secondary p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-dark-card-border overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white border-r-4 border-primary pr-4">آراء المجتمع</h2>
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <span className="text-primary text-2xl">{ratingsSummary.totalRatings || 0}</span>
                    <span className="text-gray-400">مراجعة</span>
                  </div>
                </div>
                <ReviewsList reviews={reviewsToShow} currentUser={currentUser} onLike={handleLikeClick} simple={true} />
              </div>

              {/* Discussion */}
              <div className="bg-white dark:bg-dark-secondary p-8 sm:p-10 rounded-3xl border border-gray-100 dark:border-dark-card-border">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 border-r-4 border-primary pr-4">ناقش المبدع</h2>
                <RatingCommentSystem templateId={template._id || template.id} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-dark-secondary p-8 rounded-3xl border border-gray-100 dark:border-dark-card-border sticky top-24">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3"><Layers size={20} className="text-primary" /> المواصفات الفنية</h3>
                <div className="space-y-6">
                  {[
                    { label: 'اللغة', value: template.language === 'ar' ? 'العربية' : 'عربي / إنجليزي', icon: Globe },
                    { label: 'تاريخ النشر', value: formatDate(template.createdAt), icon: Calendar },
                    { label: 'نوع المسار', value: template.categories?.[0] || 'عام', icon: Rocket },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-dark-card-border">
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    "تمت مراجعة هذا القالب من قبل خبراء عرب نوشن لضمان جودة التصميم والوظائف."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setIsLightboxOpen(false)}>
           <div className="max-w-6xl w-full aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
              <Image src={selectedImage === -2 ? template.previewImage : (template.previewImages?.[selectedImage] || template.previewImage)} alt="Preview" fill className="object-contain" />
           </div>
        </div>
      )}

      {/* Rating Popup */}
      {showPopup && template && (
        <RatingPopup
          template={template}
          onClose={closePopup}
          onSuccess={() => loadRatings(template._id || template.id)}
        />
      )}
    </>
  );
}
