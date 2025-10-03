'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import FollowButton from '../../../components/FollowButton';
import RatingSystem from '../../../components/RatingSystem';
import StarRating from '../../../components/StarRating';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [creator, setCreator] = useState(null);
  const [creatorTemplates, setCreatorTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [creatorRatings, setCreatorRatings] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (username) {
      fetchCreatorProfile();
    }
  }, [username]);

  // Pre-fill email and name when modal opens
  useEffect(() => {
    if (showMessageModal && user) {
      setMessageData(prev => ({
        ...prev,
        email: user.email || '',
        name: user.displayName || user.name || ''
      }));
    }
  }, [showMessageModal, user]);

  useEffect(() => {
    if (creator && isAuthenticated) {
      loadCreatorRatings();
    }
  }, [creator, isAuthenticated]);

  // Load ratings for the creator
  const loadCreatorRatings = async () => {
    if (!creator) return;

    try {
      // Load user's rating if authenticated
      if (isAuthenticated) {
        const userRatingResponse = await api.get(`/ratings/user/creator/${creator.id}`);
        if (userRatingResponse.data.success) {
          setUserRating(userRatingResponse.data.rating);
        }
      }

      // Load all ratings for the creator
      const ratingsResponse = await api.get(`/ratings/creator/${creator.id}?limit=5`);
      if (ratingsResponse.data.success) {
        setCreatorRatings(ratingsResponse.data.ratings);
      }
    } catch (error) {
      // Error loading creator ratings
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/creators/${username}`);
      setCreator(response.data.creator);

      // Fetch creator's templates
      try {
        const templatesResponse = await api.get(`/templates?creator=${response.data.creator.id}&limit=6`);
        if (templatesResponse.data.success) {
          setCreatorTemplates(templatesResponse.data.templates);
        }
      } catch (templatesError) {
        setCreatorTemplates([]);
      }
    } catch (error) {
      if (error.response?.status === 500) {
        setError('خطأ في الخادم - يرجى المحاولة لاحقاً');
      } else if (error.response?.status === 404) {
        setError('المبدع غير موجود');
      } else {
        setError('حدث خطأ في تحميل بيانات المبدع');
      }
    } finally {
      setLoading(false);
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
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };

  const detectPlatform = (url) => {
    if (!url) return null;

    const urlLower = url.toLowerCase();

    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
      return { name: 'twitter', icon: 'twitter', color: 'text-blue-400' };
    }
    if (urlLower.includes('instagram.com')) {
      return { name: 'instagram', icon: 'instagram', color: 'text-pink-500' };
    }
    if (urlLower.includes('linkedin.com')) {
      return { name: 'linkedin', icon: 'linkedin', color: 'text-blue-600' };
    }
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return { name: 'youtube', icon: 'youtube', color: 'text-red-500' };
    }
    if (urlLower.includes('facebook.com')) {
      return { name: 'facebook', icon: 'facebook', color: 'text-blue-600' };
    }
    if (urlLower.includes('tiktok.com')) {
      return { name: 'tiktok', icon: 'tiktok', color: 'text-black dark:text-white' };
    }
    if (urlLower.includes('snapchat.com')) {
      return { name: 'snapchat', icon: 'snapchat', color: 'text-yellow-500' };
    }
    if (urlLower.includes('telegram.org') || urlLower.includes('t.me')) {
      return { name: 'telegram', icon: 'telegram', color: 'text-blue-500' };
    }
    if (urlLower.includes('discord.com') || urlLower.includes('discord.gg')) {
      return { name: 'discord', icon: 'discord', color: 'text-indigo-500' };
    }
    if (urlLower.includes('github.com')) {
      return { name: 'github', icon: 'github', color: 'text-gray-800 dark:text-gray-200' };
    }
    if (urlLower.includes('behance.net')) {
      return { name: 'behance', icon: 'behance', color: 'text-blue-600' };
    }
    if (urlLower.includes('dribbble.com')) {
      return { name: 'dribbble', icon: 'dribbble', color: 'text-pink-500' };
    }

    return { name: 'website', icon: 'website', color: 'text-gray-400' };
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      linkedin: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      youtube: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      tiktok: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      website: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      )
    };

    return icons[platform] || icons.website;
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare message data with creator information
      const submissionData = {
        ...messageData,
        creatorId: creator.id
      };

      // Send message to creator via API
      const response = await api.post('/contact/creator', submissionData);

      if (response.data.success) {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setMessageData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        // Show success toast
        showSuccess('تم إرسال الرسالة بنجاح! سنقوم بإرسالها للمبدع وسيرد عليك قريباً');

        // Close modal after 3 seconds
        setTimeout(() => {
          setShowMessageModal(false);
          setSubmitStatus(null);
        }, 3000);
      } else {
        setIsSubmitting(false);
        setSubmitStatus('error');
        showError('حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى');
      }
    } catch (error) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      console.error('Message submission error:', error);

      // Handle different types of errors
      let errorMessage = 'حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى';

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    }
  };

  const handleInputChange = (field, value) => {
    setMessageData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !creator) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 py-20" dir="rtl">
        <div className="container-custom">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="heading-1 mb-4">المبدع غير موجود</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
              لم نتمكن من العثور على المبدع المطلوب
            </p>
            <Link href="/creators" className="btn-primary">
              تصفح المبدعين
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary shadow-soft dark:shadow-dark-soft border-b border-gray-200 dark:border-dark-card-border">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-3 text-sm text-accent-600 dark:text-dark-text-secondary">
            <Link href="/creators" className="hover:text-primary-500 dark:hover:text-orange-400 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              المبدعين
            </Link>
            <span className="text-gray-400 dark:text-dark-text-quaternary">/</span>
            <span className="text-accent-500 dark:text-dark-text-primary font-medium">{creator.displayName || creator.name}</span>
          </nav>
        </div>
      </div>

      {/* Profile Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="space-y-6 sm:space-y-8">

            {/* Profile Section */}
            <div className="relative text-center">
              {/* Action Buttons - Top Right */}
              <div className="absolute top-0 right-0 flex items-center gap-2 sm:gap-3">
                {/* Message Button */}
                {creator.allowMessages !== false && (
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 text-white rounded-lg hover:from-primary-600 hover:to-accent-600 dark:hover:from-orange-600 dark:hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-orange-300 transition-all duration-200 shadow-md hover:shadow-lg"
                    title="إرسال رسالة"
                  >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                )}

                {/* Follow Button */}
                <FollowButton
                  creatorId={creator.id}
                  creatorName={creator.displayName || creator.name}
                  onFollowChange={(isFollowing) => {
                    setCreator(prev => ({
                      ...prev,
                      followers: prev.followers + (isFollowing ? 1 : -1)
                    }));
                  }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
                  size="icon"
                  showText={false}
                />
              </div>

              {/* Profile Picture */}
              <div className="relative inline-block mb-6 sm:mb-8">
                {creator.profilePicture ? (
                  <Image
                    src={creator.profilePicture}
                    alt={`صورة ${creator.displayName || creator.name}`}
                    width={160}
                    height={160}
                    className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-white dark:border-dark-card-border shadow-xl"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center shadow-xl border-4 border-white dark:border-dark-card-border">
                    <span className="text-4xl sm:text-5xl font-bold text-primary-500 dark:text-orange-400">
                      {(creator.displayName || creator.name)?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Verified Badge */}
                {creator.creatorStatus === 'approved' && (
                  <div className="absolute -top-2 -right-2 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name & Status */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">
                {creator.displayName || creator.name}
              </h1>

              {creator.creatorStatus === 'approved' && (
                <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-full border border-yellow-300/30 mb-6 sm:mb-8">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="text-sm sm:text-base font-semibold text-yellow-700 dark:text-yellow-300">مبدع معتمد</span>
                </div>
              )}

              {/* Bio */}
              {(creator.bio || creator.experience) && (
                <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                  {creator.bio || creator.experience}
                </p>
              )}

              {/* Specialties */}
              {creator.specialties && creator.specialties.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <h3 className="text-lg sm:text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">المجالات المتخصصة</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {creator.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium bg-primary-100 dark:bg-orange-900/30 text-primary-800 dark:text-orange-300 border border-primary-200 dark:border-orange-500/30"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="flex justify-center items-center gap-8 sm:gap-12 py-6 sm:py-8">
              {creator.showTemplateCount !== false && (
                <>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-500 dark:text-orange-500 mb-2">{creator.templateCount || creatorTemplates.length || 0}</div>
                    <div className="text-base sm:text-lg text-gray-600 dark:text-dark-text-secondary">قوالب منشورة</div>
                  </div>
                  <div className="w-px h-12 sm:h-16 bg-gray-300 dark:bg-gray-600"></div>
                </>
              )}
              <div className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-500 dark:text-dark-text-primary mb-2">{creator.followers || 0}</div>
                <div className="text-base sm:text-lg text-gray-600 dark:text-dark-text-secondary">متابع</div>
              </div>
            </div>

            {/* Professional Information */}
            {(creator.portfolio || creator.experience || creator.motivation) && (
              <div className="max-w-3xl mx-auto py-6 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-accent-500 dark:text-dark-text-primary mb-6 sm:mb-8 text-center">المعلومات المهنية</h3>
                <div className="space-y-6 sm:space-y-8">
                  {/* Portfolio */}
                  {creator.portfolio && (
                    <div className="text-center">
                      <h4 className="text-lg sm:text-xl font-medium text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4">المعرض</h4>
                      <a
                        href={creator.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-orange-400 hover:text-primary-700 dark:hover:text-orange-300 transition-colors text-base sm:text-lg"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {creator.portfolio}
                      </a>
                    </div>
                  )}

                  {/* Experience */}
                  {creator.experience && (
                    <div>
                      <h4 className="text-lg sm:text-xl font-medium text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4">الخبرة</h4>
                      <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                        {creator.experience}
                      </p>
                    </div>
                  )}

                  {/* Motivation */}
                  {creator.motivation && (
                    <div>
                      <h4 className="text-lg sm:text-xl font-medium text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4">الدافع</h4>
                      <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                        {creator.motivation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {creator.socialLinks && creator.socialLinks.length > 0 && (
              <div className="max-w-3xl mx-auto py-6 sm:py-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-accent-500 dark:text-dark-text-primary mb-6 sm:mb-8 text-center">روابط التواصل</h3>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                  {creator.socialLinks.map((link, index) => {
                    if (!link.url) return null;

                    const platform = detectPlatform(link.url);

                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-dark-card-border hover:border-primary-300 dark:hover:border-orange-500/50 transition-all duration-200 hover:shadow-md group ${platform?.color || 'text-gray-600 dark:text-dark-text-secondary'}`}
                      >
                        {getPlatformIcon(platform?.icon || 'website')}
                        <span className="text-sm sm:text-base font-medium capitalize group-hover:text-primary-600 dark:group-hover:text-orange-400 transition-colors">
                          {platform?.name || 'موقع'}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">قوالب {creator.displayName || creator.name}</h2>
            <p className="body-large">اكتشف القوالب المبتكرة من هذا المبدع</p>
          </div>

          {creatorTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorTemplates.map((template) => (
                <Link key={template._id || template.id} href={`/templates/${template.slug || template._id || template.id}`}>
                  <div className="card-interactive overflow-hidden">
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg">
                      {template.previewImage ? (
                        <Image
                          src={template.previewImage}
                          alt={template.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-contain bg-white dark:bg-dark-secondary group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                          <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium bg-green-500 text-white">
                        مجاني
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2 group-hover:text-primary-500 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {template.title}
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <StarRating rating={template.rating || 0} />
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          مجاني
                        </span>
                      </div>
                      <button className="w-full btn-primary py-2 px-4 text-base">
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="heading-3 mb-4 text-accent-500 dark:text-dark-text-primary">لا توجد قوالب متاحة</h3>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                لم ينشر {creator.displayName || creator.name} أي قوالب بعد
              </p>
              <Link href="/templates" className="btn-primary">
                تصفح القوالب الأخرى
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      {creatorRatings.length > 0 && (
        <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom">
            <h2 className="heading-2 mb-8">تقييمات المبدع</h2>

            <div className="grid gap-6">
              {creatorRatings.slice(0, showAllReviews ? creatorRatings.length : 3).map((rating, index) => (
                <div key={rating._id || index} className="p-6 bg-white dark:bg-dark-secondary rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
                      {rating.user?.profilePicture ? (
                        <Image
                          src={rating.user.profilePicture}
                          alt={rating.user?.name || 'مستخدم'}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!rating.user?.profilePicture && (
                        <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                          {rating.user?.name?.charAt(0)?.toUpperCase() || 'م'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-accent-700 dark:text-dark-text-primary">
                          {rating.user?.name || 'مستخدم'}
                        </span>
                        <StarRating rating={rating.rating} size="small" showNumber={false} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                          {rating.review}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {creatorRatings.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="px-6 py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors duration-200"
                  >
                    {showAllReviews ? 'عرض أقل' : `عرض جميع التقييمات (${creatorRatings.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="text-center">
            <p className="body-medium text-gray-400 dark:text-dark-text-tertiary">
              © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                      إرسال رسالة لـ {creator.displayName || creator.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                      سنقوم بإرسال رسالتك للمبدع
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-primary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                    تم إرسال الرسالة بنجاح!
                  </h4>
                  <p className="text-gray-500 dark:text-dark-text-tertiary">
                    سنقوم بإرسال رسالتك للمبدع وسيرد عليك قريباً
                  </p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                    حدث خطأ في إرسال الرسالة
                  </h4>
                  <p className="text-gray-500 dark:text-dark-text-tertiary mb-4">
                    يرجى المحاولة مرة أخرى
                  </p>
                  <button
                    onClick={() => setSubmitStatus(null)}
                    className="btn-primary"
                  >
                    المحاولة مرة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMessageSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      required
                      value={messageData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="أدخل اسمك"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      required
                      value={messageData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      الموضوع *
                    </label>
                    <input
                      type="text"
                      required
                      value={messageData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200"
                      placeholder="أدخل موضوع الرسالة"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      الرسالة *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={messageData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-orange-500 focus:border-primary-500 dark:focus:border-orange-500 bg-white dark:bg-dark-primary text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-tertiary transition-colors duration-200 resize-none"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowMessageModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary rounded-xl hover:bg-gray-50 dark:hover:bg-dark-primary transition-colors duration-200"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-accent-600 dark:hover:from-orange-600 dark:hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الإرسال...
                        </div>
                      ) : (
                        'إرسال الرسالة'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
