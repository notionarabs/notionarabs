'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import RatingSystem from '../../../components/RatingSystem';
import RatingCommentSystem from '../../../components/RatingCommentSystem';
import CommentsDisplay from '../../../components/CommentsDisplay';
import StarRating from '../../../components/StarRating';
import { useAuth } from '../../../contexts/AuthContext';
import { TemplateSchema, BreadcrumbSchema } from '../../../components/StructuredData';
import { Youtube, Facebook, Send, X, Users } from 'lucide-react';

// Fallback data for when API fails
const fallbackTemplate = {
  id: 1,
  title: "مخطط الدراسة الشامل",
  creator: {
    name: "علي حسن",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
  price: 0,
  description: "قالب شامل ومتقدم لتنظيم الدراسة والمذاكرة بكفاءة عالية. يتضمن جداول زمنية، تتبع التقدم، وأدوات تحليل الأداء.",
  longDescription: "هذا القالب مصمم خصيصاً للطلاب والدارسين الذين يريدون تنظيم دراستهم بطريقة علمية وفعالة. يحتوي على أكثر من 20 صفحة من الأدوات والجداول المختلفة التي تساعدك في:",
  features: [
    "جدول زمني مرن للدراسة",
    "تتبع التقدم اليومي والأسبوعي",
    "أدوات تحليل الأداء",
    "قوالب للامتحانات والاختبارات",
    "نظام تذكيرات ذكي",
    "تقارير إحصائية مفصلة"
  ],
  category: "التعليم",
  tags: ["دراسة", "تعليم", "إنتاجية", "تنظيم"],
  rating: 4.8,
  reviews: 156,
  downloads: 2100,
  imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
};

const relatedTemplates = [
  {
    id: 2,
    title: "منظم المشاريع الشخصية",
    creator: "سارة أحمد",
    price: 0,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "مخطط الميزانية الشهري",
    creator: "محمد علي",
    price: 0,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "منظم الروتين اليومي",
    creator: "فاطمة حسن",
    price: 0,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  }
];

export default function TemplateDetailPage() {
  const params = useParams();
  const templateIdentifier = params.id; // This can be either ID or slug
  const { isAuthenticated } = useAuth();

  const [template, setTemplate] = useState(null);
  const [relatedTemplates, setRelatedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [userComment, setUserComment] = useState(null);
  const [templateRatings, setTemplateRatings] = useState([]);
  const [templateComments, setTemplateComments] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userHasTemplate, setUserHasTemplate] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(false);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user already owns this template
  const checkUserOwnership = async (templateId) => {
    if (!isAuthenticated || !templateId) return;

    try {
      setCheckingOwnership(true);
      const response = await api.get('/orders/me');
      if (response?.data?.success && response.data.orders) {
        // Check if any order contains this template
        const hasTemplate = response.data.orders.some(order =>
          order.items && order.items.some(item =>
            item.templateId === templateId || item.id === templateId
          )
        );

        // Also check localStorage for immediate feedback
        try {
          const localOrdersRaw = typeof window !== 'undefined' ? localStorage.getItem('orders') : null;
          const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
          const hasTemplateLocally = localOrders.some(order =>
            order.items && order.items.some(item =>
              item.templateId === templateId || item.id === templateId
            )
          );
          setUserHasTemplate(hasTemplate || hasTemplateLocally);
        } catch (_) {
          setUserHasTemplate(hasTemplate);
        }
      }
    } catch (error) {
      // Check localStorage as fallback
      try {
        const localOrdersRaw = typeof window !== 'undefined' ? localStorage.getItem('orders') : null;
        const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
        const hasTemplate = localOrders.some(order =>
          order.items && order.items.some(item =>
            item.templateId === templateId || item.id === templateId
          )
        );
        setUserHasTemplate(hasTemplate);
      } catch (_) {
        setUserHasTemplate(false);
      }
    } finally {
      setCheckingOwnership(false);
    }
  };

  // Load ratings and comments for the template
  const loadRatings = async (templateId) => {
    try {
      // Load user's rating and comment if authenticated
      if (isAuthenticated) {
        const [userRatingResponse, userCommentResponse] = await Promise.all([
          api.get(`/ratings/user/template/${templateId}`),
          api.get(`/comments/user/template/${templateId}`)
        ]);

        if (userRatingResponse.data.success) {
          const ratingData = userRatingResponse.data.rating;
          setUserRating({ rating: ratingData?.rating || 0, review: ratingData?.review || '' });
          // If user has already rated, mark as submitted
          if (ratingData?.rating > 0) {
            setHasSubmittedRating(true);
          }
        }

        if (userCommentResponse.data.success) {
          const commentData = userCommentResponse.data.comment;
          setUserComment(commentData);
        }
      }

      // Load all ratings and comments for the template
      const [ratingsResponse, commentsResponse] = await Promise.all([
        api.get(`/ratings/template/${templateId}?limit=5`),
        api.get(`/comments/template/${templateId}?limit=10`)
      ]);

      if (ratingsResponse.data.success) {
        setTemplateRatings(ratingsResponse.data.ratings);
        if (typeof ratingsResponse.data.averageRating !== 'undefined' && typeof ratingsResponse.data.totalRatings !== 'undefined') {
          setRatingsSummary({
            averageRating: ratingsResponse.data.averageRating || 0,
            totalRatings: ratingsResponse.data.totalRatings || 0
          });
          setTemplate(prev => ({ ...prev, rating: ratingsResponse.data.averageRating || 0 }));
        }
      }

      if (commentsResponse.data.success) {
        setTemplateComments(commentsResponse.data.comments || []);
      }
    } catch (error) {
      // Error loading ratings
    }
  };

  // Get current user info
  const getCurrentUser = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        setCurrentUser(response.data.user);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  // Handle comment like
  const handleCommentLike = async (commentId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      if (response.data.success) {
        // Update the comment's like count and like status in the local state
        setTemplateComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            // Toggle the like for current user
            const currentUserId = currentUser?._id || currentUser?.id;
            const isLiked = comment.likes?.some(like =>
              like.user?._id === currentUserId || like.user === currentUserId
            );

            let newLikes;
            if (isLiked) {
              // Remove like
              newLikes = comment.likes.filter(like =>
                like.user?._id !== currentUserId && like.user !== currentUserId
              );
            } else {
              // Add like
              newLikes = [...(comment.likes || []), { user: currentUserId }];
            }

            return { ...comment, likes: newLikes };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  // Check if current user has liked a comment
  const isCommentLikedByUser = (comment) => {
    if (!currentUser || !comment.likes) return false;
    const currentUserId = currentUser._id || currentUser.id;
    return comment.likes.some(like =>
      like.user?._id === currentUserId || like.user === currentUserId
    );
  };

  // Lightbox keyboard controls
  useEffect(() => {
    const handler = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (template?.previewImages?.length > 1) {
        if (e.key === 'ArrowRight') {
          setSelectedImage((prev) => (prev + 1) % template.previewImages.length);
        } else if (e.key === 'ArrowLeft') {
          setSelectedImage((prev) => (prev - 1 + template.previewImages.length) % template.previewImages.length);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isLightboxOpen, template]);

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Helper function to get Vimeo embed URL
  const getVimeoEmbedUrl = (url) => {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
  };

  // Helper function to get video embed URL
  const getVideoEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return getYouTubeEmbedUrl(url);
    } else if (url.includes('vimeo.com')) {
      return getVimeoEmbedUrl(url);
    }
    return null;
  };

  // Fetch template data from API
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/templates/${templateIdentifier}`);

        if (response.data.success) {
          console.log('Template data:', response.data.template);
          console.log('Preview Image:', response.data.template.previewImage);
          console.log('Preview Images:', response.data.template.previewImages);
          console.log('Img Src:', response.data.template.imgSrc);
          setTemplate(response.data.template);

          // Load ratings
          await loadRatings(response.data.template._id);

          // Check if user already owns this template
          await checkUserOwnership(response.data.template._id);

          // Fetch related templates from same category
          const relatedResponse = await api.get(`/templates?category=${response.data.template.category}&limit=3&sortBy=downloads&sortOrder=desc`);
          if (relatedResponse.data.success) {
            setRelatedTemplates(relatedResponse.data.templates.filter(t => (t.slug || t._id) !== templateIdentifier));
          }
        } else {
          setError('القالب غير موجود');
          setTemplate(fallbackTemplate);
        }
      } catch (error) {
        setError('فشل في تحميل القالب');
        setTemplate(fallbackTemplate);
      } finally {
        setLoading(false);
      }
    };

    if (templateIdentifier) {
      fetchTemplate();
    }
  }, [templateIdentifier, isAuthenticated]);

  // Load current user info when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated]);

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };

  // Handle template download
  const handleDownload = async () => {
    if (!template) return;

    // Check authentication first
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // If user already has the template, just open it
    if (userHasTemplate) {
      window.open(template.notionLink, '_blank');
      return;
    }

    setIsDownloading(true);

    try {
      // Track download first (this now requires authentication)
      await api.post(`/templates/${template._id}/download`, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: window.location.href
      });

      // Create or upsert order entry for this user
      try {
        await api.post('/orders', {
          items: [
            {
              templateId: template._id,
              name: template.title,
              price: template.price || 0,
              quantity: 1,
              downloaded: true,
              previewImage: template.previewImage || template.previewImages?.[0] || '',
              notionLink: template.notionLink || '',
            },
          ],
          total: template.price || 0,
          status: 'completed',
          source: 'download',
          downloaded: true,
        });
      } catch (e) {
        // non-blocking – proceed even if order write fails
      }

      // Optimistic: store in localStorage so /orders shows immediately even if backend is unavailable
      try {
        const localOrdersRaw = typeof window !== 'undefined' ? localStorage.getItem('orders') : null;
        const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
        const newOrder = {
          id: `local-${Date.now()}`,
          date: new Date().toISOString(),
          status: 'completed',
          total: template.price || 0,
          items: [
            {
              id: template._id,
              templateId: template._id,
              name: template.title,
              price: template.price || 0,
              quantity: 1,
              downloaded: true,
              previewImage: template.previewImage || template.previewImages?.[0] || '',
              notionLink: template.notionLink || '',
            },
          ],
        };
        localOrders.unshift(newOrder);
        localStorage.setItem('orders', JSON.stringify(localOrders));
      } catch (_) { }

      // Open the Notion template link in a new tab
      window.open(template.notionLink, '_blank');

      // Show success state
      setIsDownloaded(true);
      setUserHasTemplate(true);

      // Reset download state after 8 seconds
      setTimeout(() => {
        setIsDownloaded(false);
      }, 8000);

    } catch (error) {
      if (error.response?.status === 401) {
        // Authentication error - redirect to login
        window.location.href = '/login';
      } else {
        // Other errors - could add a toast notification here
      }
      setIsDownloaded(false);
    } finally {
      setIsDownloading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-20">
          <div className="text-center">
            <LoadingIndicator />
            <p className="text-lg text-accent-600 dark:text-dark-text-secondary mt-4">جاري تحميل القالب...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error || !template) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-20">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-2">خطأ في تحميل القالب</h1>
            <p className="text-accent-600 dark:text-dark-text-secondary mb-6">{error || 'القالب غير موجود'}</p>
            <Link href="/templates" className="btn-primary">
              العودة إلى القوالب
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {template && <TemplateSchema template={template} />}
      {template && (
        <BreadcrumbSchema
          items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'القوالب', url: '/templates' },
            { name: template.category, url: `/templates?category=${encodeURIComponent(template.category)}` },
            { name: template.title, url: `/templates/${template.slug || template._id}` }
          ]}
        />
      )}

      {/* Template Details */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Images and Video */}
            <div className="lg:col-span-3">
              <div className="mb-4">
                <div className="w-full h-96 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
                  {/* Loading Overlay */}
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                      <div className="loading-spinner"></div>
                    </div>
                  )}

                  {/* Video Player */}
                  {showVideo && template.explanationVideo && getVideoEmbedUrl(template.explanationVideo) ? (
                    <iframe
                      src={getVideoEmbedUrl(template.explanationVideo)}
                      title={`فيديو توضيحي - ${template.title}`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute inset-0 flex items-center justify-center cursor-zoom-in"
                      title="عرض بملء الشاشة"
                    >
                      <Image
                        key={`${selectedImage}-${template.previewImages?.[selectedImage] || template.previewImage}`}
                        src={(() => {
                          let imageSrc;
                          if (selectedImage === -2) {
                            // Main image (previewImage)
                            imageSrc = template.previewImage || '/placeholder-template.jpg';
                          } else if (template.previewImages && template.previewImages.length > selectedImage && selectedImage >= 0) {
                            // Additional images (previewImages)
                            imageSrc = template.previewImages[selectedImage];
                          } else {
                            // Default fallback
                            imageSrc = template.previewImage || template.imgSrc || '/placeholder-template.jpg';
                          }
                          console.log('Image source:', imageSrc, 'Selected index:', selectedImage);
                          return imageSrc;
                        })()}
                        alt={template.title}
                        width={2400}
                        height={1800}
                        className="w-full h-full object-contain animate-fade-in"
                        quality={100}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail Images and Video - Show if we have multiple images or video */}
              {(template.previewImages && template.previewImages.length > 1) || template.explanationVideo ? (
                <div className="flex flex-wrap gap-2 justify-end" dir="ltr">
                  {/* Video Thumbnail */}
                  {template.explanationVideo && getVideoEmbedUrl(template.explanationVideo) && (
                    <button
                      onClick={() => {
                        setShowVideo(true);
                        setSelectedImage(-1); // Special index for video
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all duration-300 transform w-24 h-16 flex-shrink-0 ${showVideo
                        ? 'ring-2 ring-orange-500 scale-105 shadow-lg'
                        : 'hover:opacity-80 hover:scale-102 hover:shadow-md'
                        }`}
                    >
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                        {/* Video thumbnail placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
                          {/* Play button overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-gray-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>

                          {/* Video icon */}
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Additional Image Thumbnails (previewImages) */}
                  {template.previewImages && template.previewImages.map((imageSrc, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsImageLoading(true);
                        setSelectedImage(index);
                        setShowVideo(false);
                        setTimeout(() => setIsImageLoading(false), 300);
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all duration-300 transform w-24 h-16 flex-shrink-0 ${selectedImage === index && !showVideo
                        ? 'ring-2 ring-orange-500 scale-105 shadow-lg'
                        : 'hover:opacity-80 hover:scale-102 hover:shadow-md'
                        }`}
                    >
                      {imageSrc && imageSrc.trim() ? (
                        <Image
                          src={imageSrc}
                          alt={`${template.title} - ${index + 1}`}
                          width={96}
                          height={64}
                          className="w-full h-full object-cover"
                          quality={100}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Main Image Thumbnail (previewImage) */}
                  {template.previewImage && (
                    <button
                      onClick={() => {
                        setIsImageLoading(true);
                        setSelectedImage(-2); // Special index for main image
                        setShowVideo(false);
                        setTimeout(() => setIsImageLoading(false), 300);
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all duration-300 transform w-24 h-16 flex-shrink-0 ${selectedImage === -2 && !showVideo
                        ? 'ring-2 ring-orange-500 scale-105 shadow-lg'
                        : 'hover:opacity-80 hover:scale-102 hover:shadow-md'
                        }`}
                    >
                      <Image
                        src={template.previewImage}
                        alt={`${template.title} - Main`}
                        width={96}
                        height={64}
                        className="w-full h-full object-cover"
                        quality={100}
                      />
                    </button>
                  )}
                </div>
              ) : (
                /* Single image - show image info instead of thumbnails */
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 dark:bg-dark-tertiary rounded-lg">
                    <svg className="w-5 h-5 text-accent-600 dark:text-dark-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-accent-600 dark:text-dark-text-secondary">معاينة واحدة متاحة</span>
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-accent-600 dark:text-dark-text-secondary mb-4">
                <Link href="/templates" className="hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors">
                  القوالب
                </Link>
                <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">{template.category}</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">{template.title}</span>
              </nav>

              <h1 className="heading-1 mb-4">{template.title}</h1>

              {/* Creator Info */}
              {(() => {
                const c = template.creator || {};
                const creatorSlug = encodeURIComponent(
                  c.username || c.slug || c.handle || c.user?.username || c.creator?.username || (c.email ? c.email.split('@')[0] : '') || c._id || ''
                );
                return (
                  <div className="flex items-center gap-3 mb-4">
                    <Link href={`/creators/${creatorSlug}`} className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {template.creator?.profilePicture ? (
                        <Image
                          src={template.creator.profilePicture}
                          alt={template.creator?.name || 'مبدع'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initial letter if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}

                      {/* Fallback avatar with initial letter */}
                      <div className={`w-full h-full flex items-center justify-center ${template.creator?.profilePicture ? 'hidden' : 'flex'} bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30`}>
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                          {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                        </span>
                      </div>
                    </Link>
                    <div>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">بواسطة</p>
                      <Link
                        href={`/creators/${creatorSlug}`}
                        className="font-medium text-accent-700 dark:text-dark-text-primary hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        {template.creator?.name || 'مبدع غير معروف'}
                      </Link>
                    </div>
                  </div>
                );
              })()}

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={ratingsSummary.averageRating || template.rating || 0} />
                <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  ({ratingsSummary.totalRatings || 0} تقييم)
                </span>
                <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  {(template.downloads || 0).toLocaleString()} تحميل
                </span>
              </div>


              {/* Price - All templates are now free */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  مجاني
                </span>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || checkingOwnership}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 mb-6 ${isDownloaded
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : userHasTemplate
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : isDownloading || checkingOwnership
                      ? 'bg-green-400 text-white cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
              >
                {isDownloaded ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    تم فتح القالب في تبويب جديد
                  </span>
                ) : userHasTemplate ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    عرض القالب (لديك هذا القالب)
                  </span>
                ) : isDownloading || checkingOwnership ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {checkingOwnership ? 'جاري التحقق...' : 'جاري التحميل...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    تحميل
                  </span>
                )}
              </button>

              {/* Download Instructions */}
              {isDownloaded && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        كيفية استخدام القالب
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        تم فتح القالب في تبويب جديد. يمكنك الآن:
                      </p>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                        <li>• نسخ القالب إلى مساحة العمل الخاصة بك في Notion</li>
                        <li>• تخصيص القالب حسب احتياجاتك</li>
                        <li>• مشاركة القالب مع فريقك</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating and Comments Section */}
              {(isDownloaded || userHasTemplate) && !hasSubmittedRating && (
                <div className="mb-6">
                  <div className="p-6 bg-gray-50 dark:bg-dark-primary rounded-xl border border-gray-200 dark:border-dark-card-border">
                    <h3 className="text-lg font-semibold text-accent-700 dark:text-dark-text-primary mb-4">
                      قيم هذا القالب وشاركنا رأيك
                    </h3>
                    <RatingCommentSystem
                      targetType="template"
                      targetId={template._id}
                      initialRating={template.rating || 0}
                      initialUserRating={userRating ? { rating: userRating.rating, review: userRating.review } : null}
                      initialUserComment={userComment}
                      onRatingChange={(data) => {
                        // Update template rating
                        setTemplate(prev => ({
                          ...prev,
                          rating: data.averageRating,
                          reviews: data.totalRatings
                        }));
                        setRatingsSummary({ averageRating: data.averageRating || 0, totalRatings: data.totalRatings || 0 });
                        // Update user rating state
                        setUserRating({ rating: data?.rating || 0, review: data?.review || '' });
                        // Mark as submitted to hide the section
                        setHasSubmittedRating(true);
                        // Reload ratings
                        loadRatings(template._id);
                      }}
                      onCommentChange={(data) => {
                        // Update user comment state
                        setUserComment(data.comment);
                        // Reload ratings and comments
                        loadRatings(template._id);
                      }}
                      size="large"
                    />
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </section>

      {/* Description and Features */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Long Description */}
            <div className="lg:col-span-2">
              <h2 className="heading-2 mb-6">تفاصيل القالب</h2>
              <div className="prose prose-accent dark:prose-dark max-w-none">
                <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6">
                  {template.features || template.description || 'لا يوجد وصف مفصل متاح لهذا القالب.'}
                </p>

              </div>
            </div>

            {/* Template Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium">
                <h3 className="font-semibold text-accent-700 dark:text-dark-text-primary mb-4">إحصائيات القالب</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">التقييم</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={template.rating || 0} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">عدد التقييمات</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{ratingsSummary.totalRatings || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">التحميلات</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{(template.downloads || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">الفئة</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{template.category}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">تاريخ الإنشاء</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews and Comments Section */}
      {(templateRatings.length > 0 || templateComments.length > 0) && (
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">
            <h2 className="heading-2 mb-8">تقييمات المستخدمين والتعليقات</h2>

            <div className="space-y-4">
              {/* Combined Ratings and Comments */}
              {(() => {
                // Create a map of user reviews combining ratings and comments
                const userReviews = new Map();

                // Add ratings to the map
                templateRatings.forEach(rating => {
                  const userId = rating.user?._id || rating.user?.id;
                  if (userId) {
                    userReviews.set(userId, {
                      ...userReviews.get(userId),
                      user: rating.user,
                      rating: rating.rating,
                      ratingId: rating._id,
                      ratingDate: rating.createdAt,
                      review: rating.review
                    });
                  }
                });

                // Add comments to the map
                templateComments.forEach(comment => {
                  const userId = comment.user?._id || comment.user?.id;
                  if (userId) {
                    userReviews.set(userId, {
                      ...userReviews.get(userId),
                      user: comment.user,
                      comment: comment.content,
                      commentId: comment._id,
                      commentDate: comment.createdAt,
                      likes: comment.likes
                    });
                  }
                });

                // Convert map to array and sort by most recent activity
                const combinedReviews = Array.from(userReviews.values()).sort((a, b) => {
                  const aDate = new Date(Math.max(new Date(a.ratingDate || 0), new Date(a.commentDate || 0)));
                  const bDate = new Date(Math.max(new Date(b.ratingDate || 0), new Date(b.commentDate || 0)));
                  return bDate - aDate;
                });

                const reviewsToShow = showAllReviews ? combinedReviews : combinedReviews.slice(0, 5);

                return (
                  <div className="grid gap-4">
                    {reviewsToShow.map((review, index) => (
                      <div key={review.ratingId || review.commentId || index} className="p-4 bg-gray-50 dark:bg-dark-primary rounded-xl border border-gray-200 dark:border-dark-card-border">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                            {review.user?.profilePicture ? (
                              <Image
                                src={review.user.profilePicture}
                                alt={review.user?.name || 'مستخدم'}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}

                            {/* Fallback avatar with initial letter */}
                            <div className={`w-full h-full flex items-center justify-center ${review.user?.profilePicture ? 'hidden' : 'flex'}`}>
                              <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                {review.user?.name?.charAt(0)?.toUpperCase() || 'م'}
                              </span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-accent-700 dark:text-dark-text-primary">
                                {review.user?.name || review.user?.displayName || 'مستخدم'}
                              </span>
                              {review.rating && (
                                <StarRating rating={review.rating} size="small" showNumber={false} />
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(Math.max(new Date(review.ratingDate || 0), new Date(review.commentDate || 0)))}
                              </span>
                            </div>

                            {/* Rating Review */}
                            {review.review && (
                              <div className="mb-2">
                                <p className="text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                                  {review.review}
                                </p>
                              </div>
                            )}

                            {/* Comment */}
                            {review.comment && (
                              <div className={`${review.review ? 'mt-3 pt-3 border-t border-gray-200 dark:border-dark-card-border' : ''}`}>
                                <p className="text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 mt-2">
                              {review.commentId && (() => {
                                const comment = templateComments.find(c => c._id === review.commentId);
                                const isLiked = comment ? isCommentLikedByUser(comment) : false;

                                return (
                                  <button
                                    onClick={() => handleCommentLike(review.commentId)}
                                    className={`flex items-center gap-1 text-xs transition-colors ${isLiked
                                      ? 'text-red-500 dark:text-red-400'
                                      : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                                      }`}
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill={isLiked ? "currentColor" : "none"}
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                      />
                                    </svg>
                                    <span>{review.likes?.length || 0}</span>
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {combinedReviews.length > 5 && (
                      <div className="text-center">
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors duration-200 text-sm"
                        >
                          {showAllReviews ? 'عرض أقل' : `عرض جميع التقييمات والتعليقات (${combinedReviews.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}


      {/* Related Templates */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <h2 className="heading-2 mb-8">قوالب مشابهة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedTemplates.map((relatedTemplate) => (
              <div key={relatedTemplate._id || relatedTemplate.id} className="bg-white dark:bg-dark-primary rounded-xl shadow-medium dark:shadow-dark-medium overflow-hidden transition-all duration-200 hover:shadow-large dark:hover:shadow-dark-large hover:-translate-y-1">
                <Link href={`/templates/${relatedTemplate.slug || relatedTemplate._id || relatedTemplate.id}`}>
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg">
                    <Image
                      src={relatedTemplate.previewImage || relatedTemplate.imgSrc || '/placeholder-template.jpg'}
                      alt={relatedTemplate.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                      quality={100}
                    />
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                      مجاني
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-accent-700 dark:text-dark-text-primary mb-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {relatedTemplate.title}
                    </h3>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      بواسطة {relatedTemplate.creator?.name || 'مبدع غير معروف'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLightboxOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="إغلاق"
            className="absolute top-4 left-4 text-white/80 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {((template?.previewImage && template?.previewImages?.length > 0) || template?.previewImages?.length > 1) && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const totalItems = (template.previewImage ? 1 : 0) + (template.previewImages?.length || 0);
                  setSelectedImage((prev) => {
                    if (prev === -2) return template.previewImages?.length - 1 || -1; // From main image to last additional
                    if (prev === -1) return -2; // From video to main image
                    return prev > 0 ? prev - 1 : -2; // From additional images to main
                  });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                aria-label="السابق"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => {
                    if (prev === -2) return 0; // From main image to first additional
                    if (prev === -1) return -2; // From video to main image
                    return prev < (template.previewImages?.length - 1) ? prev + 1 : -1; // From additional images to video
                  });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                aria-label="التالي"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-7xl w-full h-full flex items-center justify-center">
            {showVideo && template.explanationVideo && getVideoEmbedUrl(template.explanationVideo) ? (
              <iframe
                src={getVideoEmbedUrl(template.explanationVideo)}
                title={`فيديو توضيحي - ${template.title}`}
                className="max-w-full max-h-full w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                src={(() => {
                  let imageSrc;
                  if (selectedImage === -2) {
                    // Main image (previewImage)
                    imageSrc = template?.previewImage || '/placeholder-template.jpg';
                  } else if (template?.previewImages && template.previewImages.length > selectedImage && selectedImage >= 0) {
                    // Additional images (previewImages)
                    imageSrc = template.previewImages[selectedImage];
                  } else {
                    // Default fallback
                    imageSrc = template?.previewImage || template?.imgSrc || '/placeholder-template.jpg';
                  }
                  return imageSrc;
                })()}
                alt={template?.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}