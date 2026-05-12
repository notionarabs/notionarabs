'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import Footer from '../../components/Footer';
import { 
  Star, 
  Quote, 
  Sparkles, 
  MessageSquare, 
  Plus, 
  ChevronLeft, 
  User, 
  AlertCircle,
  ThumbsUp,
  Layout,
  ExternalLink
} from 'lucide-react';

export default function TestimonialsClient() {
  const { isAuthenticated, user } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('platform'); // 'platform' or 'templates'
  
  // Data States
  const [platformReviews, setPlatformReviews] = useState([]);
  const [templateReviews, setTemplateReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submission Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch Reviews on mount
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        // 1. Fetch platform-wide reviews
        const platformRes = await api.get('/ratings/platform/platform');
        if (platformRes.data?.success) {
          setPlatformReviews(platformRes.data.ratings || []);
        }

        // 2. Fetch all public featured reviews (across templates)
        const templateRes = await api.get('/ratings/public/featured');
        if (templateRes.data?.success) {
          setTemplateReviews(templateRes.data.ratings || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  // Handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (userRating === 0) {
      alert('يرجى تحديد تقييم بالنجوم أولاً');
      return;
    }

    if (!userComment.trim()) {
      alert('يرجى كتابة رأيك أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/ratings', {
        targetType: 'platform',
        targetId: 'platform',
        rating: userRating,
        review: userComment.trim()
      });

      if (res.data?.success) {
        setFormSuccess(true);
        // Refresh platform reviews
        const refreshRes = await api.get('/ratings/platform/platform');
        if (refreshRes.data?.success) {
          setPlatformReviews(refreshRes.data.ratings || []);
        }
        // Reset form
        setTimeout(() => {
          setShowFormModal(false);
          setFormSuccess(false);
          setUserRating(0);
          setUserComment('');
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting platform feedback:', err);
      alert(err.response?.data?.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-20">
        {/* Header Hero Section */}
        <section className="py-24 md:py-32 relative overflow-hidden text-center">
          <div className="container-custom">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold text-sm mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>قصص نجاح ومجتمع عرب نوشن</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-foreground dark:text-white mb-6 tracking-tight leading-tight">
              آراء <span className="text-gradient">مجتمعنا</span> وقصص نجاحهم
            </h1>

            <p className="text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
              انضم إلى آلاف المستخدمين والمبدعين العرب الذين طوروا مساحات عملهم ومشاريعهم الرقمية معنا. اقرأ تجربتهم وشاركنا قصتك!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 w-full max-w-lg mx-auto sm:max-w-none">
              <button 
                onClick={() => setShowFormModal(true)}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-primary text-white font-black rounded-2xl shadow-large hover:scale-105 transition-all text-base sm:text-lg flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>أضف تجربتك للمجتمع</span>
              </button>
              <Link href="/templates" className="w-full sm:w-auto text-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white dark:bg-dark-secondary text-foreground dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-soft hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-all text-base sm:text-lg">
                تصفح القوالب
              </Link>
            </div>
          </div>
        </section>

        {/* Tab Filters */}
        <section className="pb-8">
          <div className="container-custom">
            <div className="flex justify-center border-b border-gray-200 dark:border-dark-card-border max-w-md mx-auto mb-8 md:mb-12 p-1 bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-md rounded-2xl gap-1">
              <button
                onClick={() => setActiveTab('platform')}
                className={`flex-1 py-2.5 sm:py-3 md:py-4 text-center font-bold text-sm sm:text-base md:text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'platform'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>رأي في المنصة</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-2.5 sm:py-3 md:py-4 text-center font-bold text-sm sm:text-base md:text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === 'templates'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-white'
                }`}
              >
                <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>تقييمات القوالب</span>
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-accent-500 dark:text-dark-text-secondary font-medium">جاري تحميل التجارب والتقييمات...</p>
              </div>
            ) : (
              <>
                {/* Platform Tab Content */}
                {activeTab === 'platform' && (
                  <div>
                    {platformReviews.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-200 dark:border-dark-card-border shadow-soft p-8 max-w-xl mx-auto">
                        <AlertCircle className="w-16 h-16 text-primary/30 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black text-foreground dark:text-white mb-2">كن الأول في مشاركة قصته!</h3>
                        <p className="text-accent-500 dark:text-dark-text-secondary mb-8">
                          لا توجد مراجعات عامة بعد. هل ساعدك مجتمع عرب نوشن في تنظيم عملك؟ شاركنا رأيك الآن!
                        </p>
                        <button
                          onClick={() => setShowFormModal(true)}
                          className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          كتابة مراجعة
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {platformReviews.map((review) => (
                          <div 
                            key={review.id || review._id}
                            className="bg-white dark:bg-dark-secondary border border-gray-200/50 dark:border-dark-card-border p-8 rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 group relative flex flex-col justify-between"
                          >
                            <Quote size={40} className="absolute top-6 left-6 text-primary/5 group-hover:text-primary/10 transition-colors" />
                            
                            <div>
                              {/* Rating stars */}
                              <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    size={16} 
                                    className={idx < review.rating ? "fill-orange-400 text-orange-400" : "text-gray-300 dark:text-gray-700"} 
                                  />
                                ))}
                              </div>

                              <p className="text-accent-800 dark:text-dark-text-primary text-lg leading-relaxed mb-6 font-medium">
                                "{review.review}"
                              </p>
                            </div>

                            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-dark-card-border/50">
                              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-dark-primary p-0.5 shadow-inner flex-shrink-0 flex items-center justify-center">
                                {review.user?.profilePicture ? (
                                  <img 
                                    src={review.user.profilePicture} 
                                    alt={review.user.displayName || review.user.name} 
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-primary" />
                                )}
                              </div>
                              <div className="text-right">
                                <h4 className="font-bold text-foreground dark:text-white">
                                  {review.user?.displayName || review.user?.name || 'مستخدم عرب نوشن'}
                                </h4>
                                <p className="text-sm text-accent-500 dark:text-dark-text-secondary">
                                  {formatDate(review.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Templates Tab Content */}
                {activeTab === 'templates' && (
                  <div>
                    {templateReviews.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-200 dark:border-dark-card-border shadow-soft p-8 max-w-xl mx-auto">
                        <AlertCircle className="w-16 h-16 text-primary/30 mx-auto mb-6 animate-bounce" />
                        <h3 className="text-2xl font-black text-foreground dark:text-white mb-2">لا توجد تقييمات حالياً</h3>
                        <p className="text-accent-500 dark:text-dark-text-secondary mb-8">
                          لم يتم العثور على تقييمات عامة للقوالب حتى الآن. يمكنك تصفح وتحميل قوالبنا وتقييمها من صفحتها الخاصة!
                        </p>
                        <Link
                          href="/templates"
                          className="px-6 py-3 bg-primary hover:bg-primary-600 text-white font-bold rounded-xl shadow-md transition-all inline-block"
                        >
                          تصفح القوالب
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templateReviews.map((review) => (
                          <div 
                            key={review.id || review._id}
                            className="bg-white dark:bg-dark-secondary border border-gray-200/50 dark:border-dark-card-border p-8 rounded-3xl shadow-soft hover:shadow-medium transition-all duration-300 group relative flex flex-col justify-between"
                          >
                            <Quote size={40} className="absolute top-6 left-6 text-primary/5 group-hover:text-primary/10 transition-colors" />
                            
                            <div>
                              {/* Rating & User stars */}
                              <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    size={16} 
                                    className={idx < review.rating ? "fill-orange-400 text-orange-400" : "text-gray-300 dark:text-gray-700"} 
                                  />
                                ))}
                              </div>

                              <p className="text-accent-800 dark:text-dark-text-primary text-lg leading-relaxed mb-6 font-medium">
                                "{review.review}"
                              </p>
                            </div>

                            <div>
                              {/* Connected Template details card */}
                              {review.targetDetails && (
                                <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-dark-card-border/50 flex items-center gap-3">
                                  {review.targetDetails.previewImage && (
                                    <img 
                                      src={review.targetDetails.previewImage} 
                                      alt={review.targetDetails.title}
                                      className="w-12 h-12 rounded-xl object-cover"
                                    />
                                  )}
                                  <div className="text-right flex-1 min-w-0">
                                    <h5 className="font-bold text-sm text-foreground dark:text-white truncate">
                                      {review.targetDetails.title}
                                    </h5>
                                    <Link 
                                      href={`/templates/${review.targetDetails.slug || review.targetId}`}
                                      className="text-xs text-primary-500 hover:underline font-bold flex items-center gap-1 mt-0.5"
                                    >
                                      <span>مشاهدة القالب</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-dark-card-border/50">
                                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-dark-primary p-0.5 shadow-inner flex-shrink-0 flex items-center justify-center">
                                  {review.user?.profilePicture ? (
                                    <img 
                                      src={review.user.profilePicture} 
                                      alt={review.user.displayName || review.user.name} 
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-primary" />
                                  )}
                                </div>
                                <div className="text-right">
                                  <h4 className="font-bold text-foreground dark:text-white">
                                    {review.user?.displayName || review.user?.name || 'مستخدم عرب نوشن'}
                                  </h4>
                                  <p className="text-sm text-accent-500 dark:text-dark-text-secondary">
                                    {formatDate(review.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Floating Modal for submitting general review */}
      {showFormModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => !isSubmitting && setShowFormModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-xl bg-white dark:bg-dark-secondary rounded-3xl shadow-large border border-gray-200 dark:border-dark-card-border p-6 sm:p-8 md:p-10 z-10 animate-scale-up" dir="rtl">
            
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground dark:text-white mb-2">أضف رأيك للمجتمع</h3>
              <p className="text-accent-500 dark:text-dark-text-secondary text-xs sm:text-sm">
                شارك الآخرين كيف ساعدتك منصة ومجتمع عرب نوشن في إدارة وتنظيم مهامك الرقمية!
              </p>
            </div>

            {formSuccess ? (
              <div className="py-8 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-6">
                  <ThumbsUp className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-foreground dark:text-white mb-2">تم استلام تقييمك بنجاح!</h4>
                <p className="text-accent-500 dark:text-dark-text-secondary text-sm sm:text-base">
                  شكراً جزيلاً لثقتك ودعمك المستمر لمجتمعنا. سيظهر تقييمك في الصفحة فوراً!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-5 sm:space-y-6">
                {/* Rating Stars Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-accent-700 dark:text-dark-text-primary mb-2 sm:mb-3 text-right">
                    ما هو تقييمك لتجربتك الإجمالية معنا؟
                  </label>
                  <div className="flex items-center gap-1.5 sm:gap-2 justify-center py-3 sm:py-4 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-dark-card-border/50">
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1;
                      const isActive = ratingValue <= (hoverRating || userRating);

                      return (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setUserRating(ratingValue)}
                          onMouseEnter={() => setHoverRating(ratingValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-200 cursor-pointer ${
                            isActive ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'
                          }`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Written Feedback Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-accent-700 dark:text-dark-text-primary mb-2 sm:mb-3 text-right">
                    اكتب رأيك وتجربتك بالتفصيل
                  </label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="كيف ساعدك موقع عرب نوشن؟ ما الذي يعجبك في منتجاتنا أو مجتمعنا؟"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-tertiary text-accent-700 dark:text-dark-text-primary placeholder-accent-400 dark:placeholder-dark-text-quaternary resize-none text-right text-sm sm:text-base"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-accent-500 dark:text-dark-text-quaternary">
                      {userComment.length}/1000 حرف
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:gap-4 pt-2">
                  {isAuthenticated ? (
                    <button
                      type="submit"
                      disabled={isSubmitting || userRating === 0 || !userComment.trim()}
                      className="w-full py-3 sm:py-4 bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl sm:rounded-2xl shadow-large transition-all flex items-center justify-center gap-2 cursor-pointer text-base sm:text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>جاري إرسال تقييمك...</span>
                        </>
                      ) : (
                        <span>إرسال التقييم والمشاركة</span>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        يرجى تسجيل الدخول لتتمكن من مشاركة تجربتك مع مجتمع عرب نوشن.
                      </p>
                      <Link 
                        href="/login"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md inline-block text-sm"
                      >
                        سجل دخولك الآن
                      </Link>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowFormModal(false)}
                    className="w-full py-3 sm:py-4 bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-tertiary/70 text-accent-700 dark:text-white font-bold rounded-xl sm:rounded-2xl transition-all cursor-pointer text-base sm:text-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
