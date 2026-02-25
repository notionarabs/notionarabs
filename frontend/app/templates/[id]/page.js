'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StarRating from '../../../components/StarRating';
import { useAuth } from '../../../contexts/AuthContext';
import { TemplateSchema, BreadcrumbSchema } from '../../../components/StructuredData';
import Breadcrumb, { BreadcrumbWrapper } from '../../../components/Breadcrumb';
import { ShoppingCart, Star, Share2, Download, Heart, Globe, Calendar, Folder, MessageCircle } from 'lucide-react';
import Footer from '../../../components/Footer';
import { siteConfig } from '../../../lib/seo';
import RatingPopup from '../../../components/RatingPopup';
import { useRatingPopup } from '../../../hooks/useRatingPopup';
import { getCategorySlug } from '../../../lib/categoryMapping';
import ReviewsList from '../../../components/ReviewsList';

// Dynamically import heavy components to reduce initial bundle size
const RatingCommentSystem = dynamic(() => import('../../../components/RatingCommentSystem'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-dark-card-bg rounded-xl">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  )
});

export default function TemplateDetailPage() {
  const params = useParams();
  const templateIdentifier = params.id; // This can be either ID or slug
  const { isAuthenticated, user } = useAuth();

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
  const [isPurchasing, setIsPurchasing] = useState(false);
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
  const [hasSeenCreatorWarning, setHasSeenCreatorWarning] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);

  // Rating popup hook
  const { showPopup, closePopup, markAsRated } = useRatingPopup(template, user, isAuthenticated);

  // Helper: check if the currently authenticated user is the creator of this template
  const isTemplateCreator = (u, t) => {
    if (!u || !t) return false;
    const userId = u._id || u.id;
    const creatorId = t.creator?._id || t.creator?.id;
    return Boolean(userId && creatorId && userId === creatorId);
  };

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
      // Prepare all API calls
      const apiCalls = [
        api.get(`/ratings/template/${templateId}?limit=5`),
        api.get(`/comments/template/${templateId}?limit=10`)
      ];

      // Add user-specific calls if authenticated
      if (isAuthenticated) {
        apiCalls.push(
          api.get(`/ratings/user/template/${templateId}`),
          api.get(`/comments/user/template/${templateId}`)
        );
      }

      // Execute all calls in parallel
      const results = await Promise.allSettled(apiCalls);

      // Process results
      const [ratingsResult, commentsResult, userRatingResult, userCommentResult] = results;

      // Handle template ratings
      if (ratingsResult.status === 'fulfilled' && ratingsResult.value.data.success) {
        const ratingsData = ratingsResult.value.data;
        setTemplateRatings(ratingsData.ratings);
        updateRatingMetrics({
          averageRating: ratingsData.averageRating,
          totalRatings: ratingsData.totalRatings
        }, { isNewRating: false });
      }

      // Handle template comments
      if (commentsResult.status === 'fulfilled' && commentsResult.value.data.success) {
        setTemplateComments(commentsResult.value.data.comments || []);
      }

      // Handle user rating (if authenticated)
      if (isAuthenticated && userRatingResult.status === 'fulfilled' && userRatingResult.value.data.success) {
        const ratingData = userRatingResult.value.data.rating;
        if (ratingData && ratingData.rating > 0) {
          setUserRating({ rating: ratingData.rating, review: ratingData.review || '' });
          setHasSubmittedRating(true);
        }
      }

      // Handle user comment (if authenticated)
      if (isAuthenticated && userCommentResult.status === 'fulfilled' && userCommentResult.value.data.success) {
        const commentData = userCommentResult.value.data.comment;
        if (commentData && commentData.content) {
          setUserComment(commentData);
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
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

  const updateRatingMetrics = (data = {}, options = {}) => {
    const { isNewRating } = options;

    const currentAverage = ratingsSummary?.averageRating ?? template?.rating ?? 0;
    const currentTotal = ratingsSummary?.totalRatings ?? template?.reviews ?? 0;
    const treatAsNewRating = typeof isNewRating === 'boolean' ? isNewRating : !hasSubmittedRating;

    let nextTotal = currentTotal;
    if (typeof data?.totalRatings === 'number') {
      nextTotal = data.totalRatings;
    } else if (typeof data?.rating === 'number' && treatAsNewRating) {
      nextTotal = currentTotal + 1;
    }

    let nextAverage = currentAverage;
    if (typeof data?.averageRating === 'number') {
      nextAverage = data.averageRating;
    } else if (typeof data?.rating === 'number') {
      if (treatAsNewRating) {
        nextAverage = currentTotal === 0
          ? data.rating
          : ((currentAverage * currentTotal) + data.rating) / (currentTotal + 1);
      } else if (currentTotal > 0) {
        nextAverage = data.rating;
      }
    }

    nextAverage = Number.isFinite(nextAverage) ? parseFloat(nextAverage.toFixed(2)) : 0;

    setRatingsSummary({
      averageRating: nextAverage,
      totalRatings: nextTotal
    });

    setTemplate(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rating: nextAverage,
        reviews: nextTotal
      };
    });

    return {
      averageRating: nextAverage,
      totalRatings: nextTotal
    };
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
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?]*)/,
      /youtube\.com\/watch\?.*v=([^#&?]*)/,
      /youtube\.com\/embed\/([^#&?]*)/,
      /youtu\.be\/([^#&?]*)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
    return null;
  };

  // Helper function to get Vimeo embed URL
  const getVimeoEmbedUrl = (url) => {
    // Handle various Vimeo URL formats
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
      /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    return null;
  };

  // Helper function to get video thumbnail URL
  const getVideoThumbnailUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return null;
    }

    const cleanUrl = url.trim();

    // YouTube thumbnail
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(cleanUrl);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    // Vimeo thumbnail (requires API call, using placeholder for now)
    if (cleanUrl.includes('vimeo.com')) {
      const videoId = getVimeoVideoId(cleanUrl);
      if (videoId) {
        // For Vimeo, we'd need to make an API call to get the thumbnail
        // For now, return null to use the fallback design
        return null;
      }
    }

    return null;
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^#&?]*)/,
      /youtube\.com\/watch\?.*v=([^#&?]*)/,
      /youtube\.com\/embed\/([^#&?]*)/,
      /youtu\.be\/([^#&?]*)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  // Helper function to extract Vimeo video ID
  const getVimeoVideoId = (url) => {
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
      /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Helper function to get video embed URL
  const getVideoEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Clean the URL
    const cleanUrl = url.trim();

    // Check for YouTube URLs
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      return getYouTubeEmbedUrl(cleanUrl);
    }

    // Check for Vimeo URLs
    if (cleanUrl.includes('vimeo.com')) {
      return getVimeoEmbedUrl(cleanUrl);
    }

    // Check for other video platforms
    if (cleanUrl.includes('dailymotion.com')) {
      const match = cleanUrl.match(/dailymotion\.com\/video\/([^\/\?]+)/);
      if (match) {
        return `https://www.dailymotion.com/embed/video/${match[1]}`;
      }
    }

    if (cleanUrl.includes('twitch.tv')) {
      const match = cleanUrl.match(/twitch\.tv\/videos\/(\d+)/);
      if (match) {
        return `https://player.twitch.tv/?video=${match[1]}&parent=${window.location.hostname}`;
      }
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
          setTemplate(response.data.template);

          // Set main image as default selected image
          if (response.data.template.previewImage) {
            setSelectedImage(-2); // -2 is the special index for main image
          } else {
            setSelectedImage(0); // Default to first additional image
          }

          // Show page immediately after template data loads
          setLoading(false);

          // Load secondary data asynchronously after initial render (non-blocking)
          const templateId = response.data.template._id;

          // Use setTimeout to defer secondary API calls until after initial render
          setTimeout(() => {
            Promise.allSettled([
              loadRatings(templateId),
              checkUserOwnership(templateId),
              api.get(`/templates/similar/${templateId}?limit=3`)
            ]).then(([ratingsResult, ownershipResult, relatedResult]) => {
              // Handle similar templates result
              if (relatedResult.status === 'fulfilled' && relatedResult.value.data.success) {
                setRelatedTemplates(relatedResult.value.data.templates);
              } else {
                setRelatedTemplates([]);
              }

              // Ratings and ownership are handled by their respective functions
            }).catch((error) => {
              console.error('Parallel API calls error:', error);
              setRelatedTemplates([]);
            });
          }, 0);
        } else {
          setError('القالب غير موجود');
          setLoading(false);
        }
      } catch (error) {
        console.error('Template loading error:', error);
        setError('فشل في تحميل القالب');
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

  // Check if creator has seen the warning message
  useEffect(() => {
    if (template && user && isTemplateCreator(user, template)) {
      const warningKey = `creatorWarning_${template._id}_${user._id}`;
      const hasSeen = localStorage.getItem(warningKey);
      setHasSeenCreatorWarning(hasSeen === 'true');
    }
  }, [template, user]);

  // Memoized combined reviews with optimized calculations
  const combinedReviews = useMemo(() => {
    if (templateRatings.length === 0 && templateComments.length === 0) return [];

    const userReviews = new Map();

    // Process comments
    templateComments.forEach(comment => {
      const userId = comment.user?._id || comment.user?.id;
      if (userId) {
        const existing = userReviews.get(userId) || {};
        userReviews.set(userId, {
          ...existing,
          user: comment.user,
          comment: comment.content,
          commentId: comment._id,
          commentDate: comment.createdAt,
          likes: comment.likes
        });
      }
    });

    // Add ratings to the map
    templateRatings.forEach(rating => {
      const userId = rating.user?._id || rating.user?.id;
      if (userId) {
        const existing = userReviews.get(userId) || {};
        userReviews.set(userId, {
          ...existing,
          user: rating.user,
          rating: rating.rating,
          ratingId: rating._id,
          ratingDate: rating.createdAt,
          review: rating.review
        });
      }
    });

    // Convert to array, calculate dates once, and sort
    return Array.from(userReviews.values())
      .map(review => ({
        ...review,
        // Pre-calculate the latest date for sorting and display
        latestDate: Math.max(
          new Date(review.ratingDate || 0).getTime(),
          new Date(review.commentDate || 0).getTime()
        )
      }))
      .sort((a, b) => b.latestDate - a.latestDate);
  }, [templateRatings, templateComments]);

  // Memoized comment lookup map for O(1) access
  const commentLookupMap = useMemo(() => {
    const map = new Map();
    templateComments.forEach(comment => {
      map.set(comment._id, comment);
    });
    return map;
  }, [templateComments]);

  // Memoized reviews to show based on showAllReviews state
  const reviewsToShow = useMemo(() => {
    return showAllReviews ? combinedReviews : combinedReviews.slice(0, 5);
  }, [combinedReviews, showAllReviews]);

  // Optimized like handler with useCallback
  const handleLikeClick = useCallback((commentId) => {
    handleCommentLike(commentId);
  }, [handleCommentLike]);

  // Function to dismiss creator warning permanently
  const dismissCreatorWarning = () => {
    if (template && user) {
      const warningKey = `creatorWarning_${template._id}_${user._id}`;
      localStorage.setItem(warningKey, 'true');
      setHasSeenCreatorWarning(true);
    }
  };

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
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating.toFixed(1)}</span>
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

      // Trigger notifications refresh for the creator immediately (best effort)
      try {
        window.dispatchEvent(new Event('notifications:refresh'));
      } catch { }

      // Create or upsert order entry for this user
      try {
        await api.post('/orders', {
          items: [
            {
              templateId: template._id,
              name: template.title,
              price: template.isPaid ? template.price : 0,
              quantity: 1,
              downloaded: true,
              previewImage: template.previewImage || template.previewImages?.[0] || '',
              notionLink: template.notionLink || '',
            },
          ],
          total: template.isPaid ? template.price : 0,
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
          total: template.isPaid ? template.price : 0,
          items: [
            {
              id: template._id,
              templateId: template._id,
              name: template.title,
              price: template.isPaid ? template.price : 0,
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

      // Open the template link in a new tab
      window.open(template.notionLink, '_blank');

      // Show success state
      setIsDownloaded(true);
      setUserHasTemplate(true);
      setTemplate(prev => {
        if (!prev) return prev;
        const currentDownloads = typeof prev.downloads === 'number' ? prev.downloads : 0;
        return {
          ...prev,
          downloads: currentDownloads + 1
        };
      });

      // Dispatch event for popup system
      window.dispatchEvent(new CustomEvent('templateDownloaded', {
        detail: { templateId: template._id }
      }));

      // Reset download state after 8 seconds
      setTimeout(() => {
        setIsDownloaded(false);
      }, 8000);

    } catch (error) {
      console.error('Download error:', error);

      if (error.response?.status === 401) {
        // Authentication error - redirect to login
        window.location.href = '/login';
      } else {
        // Other errors - show user-friendly message
        alert(`خطأ في التحميل: ${error.response?.data?.message || 'حدث خطأ غير متوقع'}`);
      }
      setIsDownloaded(false);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle template purchase
  const handlePurchase = async () => {
    if (!template) return;

    // Check authentication first
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/templates/${template.slug || template._id}`;
      return;
    }

    // If user already has the template, just open it
    if (userHasTemplate) {
      window.open(template.notionLink, '_blank');
      return;
    }

    setIsPurchasing(true);

    try {
      const response = await api.post('/payments/create-checkout-session', {
        templateId: template._id
      });

      if (response.data.success && response.data.checkoutUrl) {
        // Redirect to Paymob checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error) {
      console.error('Full Purchase Error Object:', error);
      console.error('Error Response Data:', error.response?.data);
      alert(`خطأ في عملية الشراء: ${error.response?.data?.details?.message || error.response?.data?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}`);
    } finally {

      setIsPurchasing(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {/* Breadcrumb Skeleton */}
        <section className="bg-white dark:bg-dark-secondary transition-colors duration-300 border-b border-gray-200 dark:border-dark-card-border">
          <div className="container-custom py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </section>

        {/* Template Details Skeleton */}
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">

              {/* Images and Video Skeleton */}
              <div className="lg:col-span-3">
                <div className="mb-4">
                  <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </div>

                {/* Image Thumbnails Skeleton */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  ))}
                </div>

                {/* Video Button Skeleton */}
                <div className="mt-4">
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-32 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </div>
              </div>

              {/* Template Info Skeleton */}
              <div className="lg:col-span-2">
                <div className="sticky top-6 space-y-6">

                  {/* Title and Category Skeleton */}
                  <div className="space-y-4">
                    <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-32 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  {/* Rating Skeleton */}
                  <div className="flex items-center gap-4">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-24 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-20 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  {/* Description Skeleton */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  {/* Creator Info Skeleton */}
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-48 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />

                  {/* Action Section Skeleton */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="flex-shrink-0 w-24 h-[52px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="flex-1 h-[52px] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Templates Skeleton */}
        <section className="py-8 sm:py-12 md:py-16 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-40 mb-6 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-dark-tertiary rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border h-full flex flex-col overflow-hidden">
                  {/* Template Image Skeleton */}
                  <div className="relative overflow-hidden rounded-lg h-48 mb-4">
                    <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  {/* Template Info Skeleton */}
                  <div className="space-y-3">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-12 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
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
    <>
      {/* Dynamic Head Tags for SEO */}
      {template && (
        <Head>
          <title>{`${template.title} - قالب نوشن عربي | ${siteConfig.name}`}</title>
          <meta name="description" content={template.description || template.features || `تحميل قالب ${template.title} باللغة العربية لـ Notion. ${template.categories && template.categories.length > 0 ? template.categories[0] : 'عام'} من ${template.creator?.name || 'مبدع'}.`} />
          <meta name="keywords" content={`${template.title}, ${template.categories && template.categories.length > 0 ? template.categories[0] : 'عام'}, قالب نوشن, notion template, ${template.creator?.name || ''}, قوالب عربية, مجاني, ${template.tags?.join(', ') || ''}`} />
          <link rel="canonical" href={`${siteConfig.url}/templates/${template.slug || template._id}`} />

          {/* Open Graph */}
          <meta property="og:title" content={`${template.title} - قالب نوشن عربي`} />
          <meta property="og:description" content={template.description || template.features || `تحميل قالب ${template.title} باللغة العربية`} />
          <meta property="og:image" content={template.previewImage || `${siteConfig.url}${siteConfig.ogImage}`} />
          <meta property="og:url" content={`${siteConfig.url}/templates/${template.slug || template._id}`} />
          <meta property="og:type" content="article" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${template.title} - قالب نوشن عربي`} />
          <meta name="twitter:description" content={template.description || template.features || `تحميل قالب ${template.title}`} />
          <meta name="twitter:image" content={template.previewImage || `${siteConfig.url}${siteConfig.ogImage}`} />
        </Head>
      )}

      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {template && <TemplateSchema template={template} />}
        {template && (
          <BreadcrumbSchema
            items={[
              { name: 'الرئيسية', url: `${siteConfig.url}` },
              { name: 'القوالب', url: `${siteConfig.url}/templates` },
              { name: template.categories && template.categories.length > 0 ? template.categories[0] : 'عام', url: `${siteConfig.url}/categories/${getCategorySlug(template.categories && template.categories.length > 0 ? template.categories[0] : 'عام')}` },
              { name: template.title, url: `${siteConfig.url}/templates/${template.slug || template._id}` }
            ]}
          />
        )}

        {/* Visible Breadcrumb Navigation */}
        {template && (
          <BreadcrumbWrapper
            items={[
              { name: 'القوالب', url: '/templates' },
              { name: template.categories && template.categories.length > 0 ? template.categories[0] : 'عام', url: `/categories/${getCategorySlug(template.categories && template.categories.length > 0 ? template.categories[0] : 'عام')}` },
              { name: template.title, url: `/templates/${template.slug || template._id}` }
            ]}
          />
        )}

        {/* Template Details */}
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
              {/* Images and Video */}
              <div className="lg:col-span-3">
                <div className="mb-4">
                  <div className="w-full h-64 sm:h-80 md:h-96 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative">
                    {/* Loading Overlay */}
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
                        <div className="loading-spinner"></div>
                      </div>
                    )}

                    {/* Video Player */}
                    {showVideo && template.explanationVideo ? (
                      (() => {
                        const embedUrl = getVideoEmbedUrl(template.explanationVideo);
                        if (embedUrl && !videoLoadError) {
                          return (
                            <div className="relative w-full h-full">
                              <iframe
                                src={embedUrl}
                                title={`فيديو توضيحي - ${template.title}`}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                onError={(e) => {
                                  console.error('Video iframe failed to load:', e);
                                  setVideoLoadError(true);
                                }}
                                onLoad={(e) => {
                                  console.log('Video iframe loaded successfully');
                                  setVideoLoadError(false);
                                }}
                              />
                            </div>
                          );
                        } else {
                          // Fallback: show link to original video
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <div className="text-center p-6">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                  {videoLoadError ? 'تم حظر عرض الفيديو هنا' : 'لا يمكن عرض الفيديو هنا'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                  {videoLoadError ? 'يرجى النقر على الرابط أدناه لمشاهدة الفيديو' : 'يرجى النقر على الرابط أدناه لمشاهدة الفيديو'}
                                </p>
                                <a
                                  href={template.explanationVideo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                  مشاهدة الفيديو
                                </a>
                              </div>
                            </div>
                          );
                        }
                      })()
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="absolute inset-0 flex items-center justify-center cursor-zoom-in"
                        title="عرض بملء الشاشة"
                      >
                        {(() => {
                          let imageSrc;
                          if (selectedImage === -2) {
                            imageSrc = template.previewImage || '/placeholder-template.jpg';
                          } else if (template.previewImages && template.previewImages.length > selectedImage && selectedImage >= 0) {
                            imageSrc = template.previewImages[selectedImage];
                          } else {
                            imageSrc = template.previewImage || template.imgSrc || '/placeholder-template.jpg';
                          }

                          if (imageSrc.includes('res.cloudinary.com')) {
                            return (
                              <img
                                src={imageSrc}
                                alt={template.title}
                                className="w-full h-full object-contain animate-fade-in"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Image failed to load:', imageSrc);
                                  if (e.target) {
                                    e.target.style.display = 'none';
                                  }
                                }}
                              />
                            );
                          }

                          return (
                            <Image
                              key={`${selectedImage}-${imageSrc}`}
                              src={imageSrc}
                              alt={template.title}
                              width={2400}
                              height={1800}
                              className="w-full h-full object-contain animate-fade-in"
                              quality={85}
                              priority={selectedImage === -2}
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              onError={(e) => {
                                console.error('Image failed to load:', imageSrc);
                                if (e.target) {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
                          );
                        })()}
                      </button>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images and Video - Show if we have multiple images or video */}
                {(template.previewImages && template.previewImages.length > 1) || template.explanationVideo ? (
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-end" dir="ltr">
                    {/* Video Thumbnail */}
                    {template.explanationVideo && (
                      <button
                        onClick={() => {
                          setShowVideo(true);
                          setSelectedImage(-1); // Special index for video
                          setVideoLoadError(false); // Reset error state
                        }}
                        className={`relative overflow-hidden rounded-xl transition-all duration-300 transform w-24 h-16 flex-shrink-0 group ${showVideo
                          ? 'ring-2 ring-orange-500 scale-105 shadow-lg'
                          : 'hover:opacity-90 hover:scale-105 hover:shadow-lg'
                          }`}
                      >
                        {(() => {
                          const thumbnailUrl = getVideoThumbnailUrl(template.explanationVideo);

                          if (thumbnailUrl) {
                            // Show actual video thumbnail
                            return (
                              <div className="relative w-full h-full">
                                <Image
                                  src={thumbnailUrl}
                                  alt={`فيديو توضيحي - ${template.title}`}
                                  width={96}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  quality={100}
                                  onError={(e) => {
                                    // Fallback to design if thumbnail fails to load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />

                                {/* Play button overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 flex items-center justify-center group-hover:from-black/20 group-hover:to-black/40 transition-all duration-300">
                                  <div className="w-10 h-10 bg-white/95 dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Fallback design (hidden by default) */}
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 items-center justify-center hidden">
                                  <div className="w-10 h-10 bg-white/95 dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                  </div>
                                </div>



                              </div>
                            );
                          } else {
                            // Fallback design for non-YouTube videos or when thumbnail fails
                            return (
                              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center relative">
                                {/* Play button overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30 flex items-center justify-center group-hover:from-black/20 group-hover:to-black/40 transition-all duration-300">
                                  <div className="w-10 h-10 bg-white/95 dark:bg-gray-100 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-500 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        })()}
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
                          setVideoLoadError(false); // Reset error state
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
                          setVideoLoadError(false); // Reset error state
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
              <div className="lg:col-span-2 flex flex-col justify-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-900 dark:text-dark-text-primary mb-6 tracking-tight leading-tight">
                  {template.title}
                </h1>

                {/* Creator Info - Chip Style */}
                {(() => {
                  const c = template.creator || {};
                  const creatorSlug = encodeURIComponent(
                    c.username || c.slug || c.handle || c.user?.username || c.creator?.username || (c.email ? c.email.split('@')[0] : '') || c._id || ''
                  );
                  return (
                    <div className="mb-6">
                      <Link
                        href={`/creators/${creatorSlug}`}
                        className="inline-flex items-center gap-3 p-1 pr-4 pl-1 rounded-full bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 group"
                      >
                        <span className="text-sm text-accent-500 dark:text-dark-text-secondary font-medium">بواسطة</span>
                        <span className="font-bold text-accent-800 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {template.creator?.name || 'مبدع غير معروف'}
                        </span>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white ring-2 ring-white dark:ring-dark-secondary shadow-sm">
                          {template.creator?.profilePicture ? (
                            <Image
                              src={template.creator.profilePicture}
                              alt={template.creator?.name || 'مبدع'}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${template.creator?.profilePicture ? 'hidden' : 'flex'} bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50`}>
                            <span className="text-primary-600 dark:text-primary-400 font-bold text-xs">
                              {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })()}


                {/* Rating and Stats - Modern Row */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 text-yellow-700 dark:text-yellow-500 font-medium">
                    <StarRating rating={ratingsSummary.averageRating || template.rating || 0} showNumber={false} size="small" />

                    <span className="opacity-75">({ratingsSummary.totalRatings || 0})</span>
                  </div>

                  <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary font-medium px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border">
                    <Download className="w-4 h-4" />
                    <span>{(template.downloads || 0).toLocaleString()} تحميل</span>
                  </div>
                </div>


                {/* Price & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-6">
                  {/* Price Tag */}
                  <div className="flex-shrink-0 flex">
                    {template.isPaid ? (
                      <div className="flex flex-col items-start justify-center h-full p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium leading-none mb-1">السعر</span>
                        <span className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary tracking-tight">
                          {template.price} <span className="text-sm font-normal text-accent-500">ر.س</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start justify-center h-full p-2.5 px-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium leading-none mb-1">السعر</span>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-500 tracking-tight">
                          مجاني
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex-1 min-w-0 w-full">
                    {template.isPaid ? (
                      <button
                        onClick={handlePurchase}
                        disabled={isPurchasing || checkingOwnership || userHasTemplate}
                        className="w-full h-full min-h-[52px] rounded-xl font-bold text-base transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none"
                      >
                        {isPurchasing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            جاري التحويل للدفع...
                          </>
                        ) : userHasTemplate ? (
                          <>
                            <Folder className="w-5 h-5" />
                            فتح القالب
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            <span>شراء القالب الآن</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading || checkingOwnership}
                        className={`w-full h-full min-h-[52px] rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${isDownloaded
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30'
                          : userHasTemplate
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                            : isDownloading || checkingOwnership
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none transform-none'
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30'
                          }`}
                      >
                        {isDownloaded ? (
                          <>
                            <div className="bg-green-500 text-white p-1 rounded-full">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            تم الفتح في نافذة جديدة
                          </>
                        ) : userHasTemplate ? (
                          <>
                            <Folder className="w-5 h-5" />
                            عرض القالب (تم الامتلاك)
                          </>
                        ) : isDownloading || checkingOwnership ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            {checkingOwnership ? 'جاري التحقق...' : 'جاري التحميل...'}
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            تحميل مجاني
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Download Instructions */}
                {isDownloaded && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          كيفية استخدام القالب
                        </h4>
                        <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          تم فتح القالب في تبويب جديد. يمكنك الآن:
                        </p>
                        <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                          <li>• نسخ القالب إلى مساحة العمل الخاصة بك في Notion</li>
                          <li>• تخصيص القالب حسب احتياجاتك</li>
                          <li>• مشاركة القالب مع فريقك</li>
                        </ul>
                      </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {/* Long Description */}
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-900 dark:text-dark-text-primary mb-4 sm:mb-6">الوصف التفصيلي</h2>
                <div className="prose prose-accent dark:prose-dark max-w-none">
                  <div className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-4 sm:mb-6 whitespace-pre-line">
                    {template.features || template.description || 'لا يوجد وصف مفصل متاح لهذا القالب.'}
                  </div>
                </div>
              </div>

              {/* Template Stats */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-dark-secondary rounded-xl p-4 sm:p-6 shadow-medium dark:shadow-dark-medium">
                  <h3 className="text-base sm:text-lg font-semibold text-accent-700 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    إحصائيات القالب
                  </h3>

                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary">
                        <Star className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">التقييم</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-accent-700 dark:text-dark-text-primary">

                        <StarRating rating={ratingsSummary.averageRating || template.rating || 0} showNumber={false} size="small" />
                      </div>
                    </div>

                    {/* Downloads */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary">
                        <Download className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">التحميلات</span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-accent-700 dark:text-dark-text-primary">
                        {(template.downloads || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="flex justify-between items-start p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary mt-1">
                        <Folder className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">الفئة</span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[180px]">
                        {(template.categories && template.categories.length > 0 ? template.categories : ['عام']).map((category, index) => (
                          <Link
                            key={index}
                            href={`/categories/${getCategorySlug(category)}`}
                            className="inline-block px-2 py-1 text-xs font-medium bg-white dark:bg-dark-secondary text-accent-600 dark:text-dark-text-secondary rounded border border-gray-200 dark:border-dark-card-border hover:border-primary-500 transition-colors"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Language */}
                    {template.language && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg">
                        <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary">
                          <Globe className="w-4 h-4" />
                          <span className="text-xs sm:text-sm">اللغة</span>
                        </div>
                        <span className="text-sm font-medium text-accent-800 dark:text-dark-text-primary">
                          {template.language === 'ar' && 'العربية 🇸🇦'}
                          {template.language === 'en' && 'الإنجليزية 🇬🇧'}
                          {template.language === 'fr' && 'الفرنسية 🇫🇷'}
                          {template.language === 'ar-en' && 'عربي / إنجليزي'}
                          {template.language === 'ar-fr' && 'عربي / فرنسي'}
                        </span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg">
                      <div className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs sm:text-sm">نشر في</span>
                      </div>
                      <span className="text-sm font-medium text-accent-700 dark:text-dark-text-primary">
                        {formatDate(new Date(template.createdAt || new Date()))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rating and Comments Section */}
        {(isDownloaded || userHasTemplate) && !hasSubmittedRating && !isTemplateCreator(user, template) && (
          <section className="container-custom mb-8">
            <div className="p-5 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-dark-secondary dark:to-dark-card-bg rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-accent-900 dark:text-dark-text-primary">
                    قيم هذا القالب
                  </h3>
                  <p className="text-sm text-accent-500 dark:text-dark-text-secondary">
                    شاركنا رأيك وساعد الآخرين في اختياراتهم
                  </p>
                </div>
              </div>

              <RatingCommentSystem
                targetType="template"
                targetId={template._id}
                initialRating={template.rating || 0}
                initialUserRating={userRating ? { rating: userRating.rating, review: userRating.review } : null}
                initialUserComment={userComment}
                onRatingChange={(data) => {
                  updateRatingMetrics(data, { isNewRating: !hasSubmittedRating });
                  setUserRating({ rating: data?.rating || 0, review: data?.review || '' });
                  setHasSubmittedRating(true);
                  markAsRated();
                  if (template?._id) {
                    loadRatings(template._id);
                  }
                }}
                onCommentChange={(data) => {
                  setUserComment(data.comment);
                  loadRatings(template._id);
                }}
                size="large"
                readOnly={isTemplateCreator(user, template)}
              />
            </div>
          </section>
        )}

        {/* Reviews and Comments Section */}
        {combinedReviews.length > 0 && (
          <ReviewsList
            reviews={combinedReviews}
            currentUser={currentUser}
            onLike={handleLikeClick}
          />
        )}


        {/* Related Templates */}
        <section className="section-padding bg-gray-50 dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-900 dark:text-dark-text-primary mb-8 px-1">قوالب قد تعجبك أيضاً</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedTemplates.map((relatedTemplate) => (
                <div key={relatedTemplate._id || relatedTemplate.id} className="group bg-white dark:bg-dark-primary rounded-2xl border border-gray-100 dark:border-dark-card-border overflow-hidden hover:shadow-xl dark:hover:shadow-primary-900/10 hover:-translate-y-1 transition-all duration-300 isolate">
                  <Link href={`/templates/${relatedTemplate.slug || relatedTemplate._id || relatedTemplate.id}`} className="block h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={relatedTemplate.previewImage || relatedTemplate.imgSrc || '/placeholder-template.jpg'}
                        alt={relatedTemplate.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        quality={90}
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity duration-300" />

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {relatedTemplate.isPaid ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-accent-900 dark:text-white shadow-sm">
                            {relatedTemplate.price} ر.س
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 dark:bg-black/80 backdrop-blur-md text-xs font-bold text-accent-900 dark:text-white shadow-sm">
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
                          {relatedTemplate.categories?.[0] || 'عام'}
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-accent-700 dark:text-dark-text-primary">
                            {(relatedTemplate.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-accent-900 dark:text-dark-text-primary mb-4 line-clamp-1 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {relatedTemplate.title}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-dark-card-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            {relatedTemplate.creator?.profilePicture ? (
                              <Image
                                src={relatedTemplate.creator.profilePicture}
                                alt={relatedTemplate.creator.name}
                                width={24}
                                height={24}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                                {relatedTemplate.creator?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-accent-600 dark:text-dark-text-secondary truncate max-w-[100px]">
                            {relatedTemplate.creator?.name || 'مبدع'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-accent-500 dark:text-dark-text-quaternary">
                          <Download className="w-3.5 h-3.5" />
                          <span>{(relatedTemplate.downloads || 0).toLocaleString()}</span>
                        </div>
                      </div>
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
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsLightboxOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="إغلاق"
              className="absolute top-2 sm:top-4 left-2 sm:left-4 text-white/80 hover:text-white z-10"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
                  aria-label="السابق"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10"
                  aria-label="التالي"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="max-w-7xl w-full h-full flex items-center justify-center">
              {showVideo && template.explanationVideo ? (
                (() => {
                  const embedUrl = getVideoEmbedUrl(template.explanationVideo);
                  if (embedUrl && !videoLoadError) {
                    return (
                      <div className="relative max-w-full max-h-full w-full h-full">
                        <iframe
                          src={embedUrl}
                          title={`فيديو توضيحي - ${template.title}`}
                          className="max-w-full max-h-full w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          onError={(e) => {
                            console.error('Video iframe failed to load in lightbox:', e);
                            setVideoLoadError(true);
                          }}
                          onLoad={(e) => {
                            console.log('Video iframe loaded successfully in lightbox');
                            setVideoLoadError(false);
                          }}
                        />
                      </div>
                    );
                  } else {
                    // Fallback: show link to original video
                    return (
                      <div className="max-w-full max-h-full w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="text-center p-6">
                          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {videoLoadError ? 'تم حظر عرض الفيديو هنا' : 'لا يمكن عرض الفيديو هنا'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            {videoLoadError ? 'يرجى النقر على الرابط أدناه لمشاهدة الفيديو' : 'يرجى النقر على الرابط أدناه لمشاهدة الفيديو'}
                          </p>
                          <a
                            href={template.explanationVideo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            مشاهدة الفيديو
                          </a>
                        </div>
                      </div>
                    );
                  }
                })()
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

        <Footer />

        {/* Rating Popup */}
        {showPopup && template && (
          <RatingPopup
            template={template}
            userRating={userRating}
            userComment={userComment}
            onRatingChange={(data) => {
              updateRatingMetrics(data, { isNewRating: !hasSubmittedRating });
              setUserRating({ rating: data?.rating || 0, review: data?.review || '' });
              setHasSubmittedRating(true);
              markAsRated();
              if (typeof window !== 'undefined' && template?._id) {
                const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
                if (!dismissedPopups.includes(template._id)) {
                  dismissedPopups.push(template._id);
                  localStorage.setItem('dismissedRatingPopups', JSON.stringify(dismissedPopups));
                }
              }
              if (template?._id) {
                loadRatings(template._id);
              }
            }}
            onCommentChange={(data) => {
              // Update user comment state
              setUserComment(data.comment);
              // Reload ratings and comments
              loadRatings(template._id);
            }}
            onClose={() => {
              closePopup();
              // Mark popup as seen when closed
              if (typeof window !== 'undefined' && template?._id) {
                const dismissedPopups = JSON.parse(localStorage.getItem('dismissedRatingPopups') || '[]');
                if (!dismissedPopups.includes(template._id)) {
                  dismissedPopups.push(template._id);
                  localStorage.setItem('dismissedRatingPopups', JSON.stringify(dismissedPopups));
                }
              }
            }}
            isTemplateCreator={isTemplateCreator(user, template)}
          />
        )}
      </main>
    </>
  );
}