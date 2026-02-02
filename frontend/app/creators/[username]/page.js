'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { MessageCircle, Mail, UserPlus, Star, TrendingUp, Crown, Sparkles, Award, Trophy, Gem, Zap, Download, CheckCircle, Heart } from 'lucide-react';
import Footer from '../../../components/Footer';
import { generateCreatorMetadata } from '../../../lib/seo';

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
import LoadingIndicator from '../../../components/LoadingIndicator';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import FollowButton from '../../../components/FollowButton';
import StarRating from '../../../components/StarRating';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [creator, setCreator] = useState(null);
  const [creatorTemplates, setCreatorTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [creatorRatings, setCreatorRatings] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [medianRating, setMedianRating] = useState(0);
  const [profileImageError, setProfileImageError] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  useEffect(() => {
    if (username) {
      fetchCreatorProfile();
    }
  }, [username]);

  // Reset pagination and fetch templates when creator changes
  useEffect(() => {
    if (creator) {
      setPagination(prev => ({ ...prev, current: 1 }));
      // Fetch templates will be triggered by pagination.current change
    }
  }, [creator?.id]);

  // Refetch templates when pagination changes
  useEffect(() => {
    if (creator) {
      fetchCreatorTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, creator?.id]);

  const fetchCreatorTemplates = async () => {
    if (!creator) return;

    try {
      setTemplatesLoading(true);
      const templatesResponse = await api.get(`/templates?creator=${creator.id}&page=${pagination.current}&limit=${pagination.limit}`);
      if (templatesResponse.data.success) {
        setCreatorTemplates(templatesResponse.data.templates);
        // Update pagination from server response
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

  // Reset profile image error when creator changes
  useEffect(() => {
    if (creator) {
      setProfileImageError(false);
    }
  }, [creator?.id, creator?.profilePicture]);


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
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);

      // Fetch creator profile and templates in parallel
      const [creatorResponse, templatesResponse] = await Promise.allSettled([
        api.get(`/creators/${username}`),
        // We'll fetch templates after getting creator ID
        Promise.resolve({ data: { success: false } })
      ]);

      if (creatorResponse.status === 'fulfilled') {
        const creator = creatorResponse.value.data.creator;
        // Ensure profile picture is a valid URL if it exists
        if (creator.profilePicture && typeof creator.profilePicture === 'string' && creator.profilePicture.trim() !== '') {
          // If it's a relative URL, make it absolute (assuming it's from the same domain)
          if (typeof window !== 'undefined' && creator.profilePicture.startsWith('/')) {
            creator.profilePicture = `${window.location.origin}${creator.profilePicture}`;
          }
        } else {
          // Clear invalid profile picture
          creator.profilePicture = null;
        }
        setCreator(creator);
        setMedianRating(creator.rating || 0);
        // Templates will be fetched by the useEffect when creator is set
      } else {
        const error = creatorResponse.reason;
        if (error.response?.status === 500) {
          setError('خطأ في الخادم - يرجى المحاولة لاحقاً');
        } else if (error.response?.status === 404) {
          setError('المبدع غير موجود');
        } else {
          setError('حدث خطأ في تحميل بيانات المبدع');
        }
      }
    } catch (error) {
      setError('حدث خطأ في تحميل بيانات المبدع');
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
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{(rating || 0).toFixed(1)}</span>
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
    if (urlLower.includes('facebook.com/groups/')) {
      return { name: 'facebook-group', icon: 'facebook-group', color: 'text-blue-600' };
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
      'facebook-group': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
        </svg>
      ),
      tiktok: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
      ),
      telegram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      snapchat: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.149-.052-.223 0-.255.18-.479.435-.524 3.264-.539 4.73-3.879 4.791-4.019l.016-.015c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
        </svg>
      ),
      discord: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      behance: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.84-3.08.84-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.7-1.14-.464-.49-.823-1.08-1.077-1.76-.253-.68-.382-1.42-.382-2.19 0-.768.12-1.485.36-2.153.24-.668.594-1.252 1.065-1.752.47-.5 1.04-.893 1.712-1.178.67-.284 1.43-.428 2.272-.428.902 0 1.684.175 2.378.52.695.348 1.264.817 1.714 1.41.453.595.78 1.277.988 2.046.21.77.29 1.574.256 2.426h-7.69c.036.98.343 1.674.923 2.078l.002.003zm-10.84-9.077c-.615 0-1.14.06-1.528.179-.385.12-.687.294-.906.53-.22.24-.364.515-.434.83-.07.31-.12.65-.12 1.01 0 .388.07.733.18 1.046.11.31.29.574.54.79.25.215.58.38.99.495.41.12.89.165 1.46.165H9.48V7.588H6.1zm13.607-2.179V3.226h-5.622v2.183h5.622zm-5.62 10.05c0-.586.14-1.04.425-1.37.285-.336.692-.5 1.223-.5.344 0 .628.062.853.185.225.125.413.29.562.5.15.21.257.45.323.72.066.27.098.55.098.84h-3.484zm-7.874-2.98c.463 0 .854-.09 1.17-.27.318-.18.477-.525.477-1.034 0-.3-.063-.55-.19-.747-.126-.198-.3-.35-.522-.46-.223-.11-.473-.185-.75-.224-.28-.04-.563-.06-.853-.06H2.58v2.795h3.633z" />
        </svg>
      ),
      dribbble: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
        </svg>
      ),
      snapchat: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.149-.052-.223 0-.255.18-.479.435-.524 3.264-.539 4.73-3.879 4.791-4.019l.016-.015c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
        </svg>
      ),
      discord: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
      behance: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.84-3.08.84-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.7-1.14-.464-.49-.823-1.08-1.077-1.76-.253-.68-.382-1.42-.382-2.19 0-.768.12-1.485.36-2.153.24-.668.594-1.252 1.065-1.752.47-.5 1.04-.893 1.712-1.178.67-.284 1.43-.428 2.272-.428.902 0 1.684.175 2.378.52.695.348 1.264.817 1.714 1.41.453.595.78 1.277.988 2.046.21.77.29 1.574.256 2.426h-7.69c.036.98.343 1.674.923 2.078l.002.003zm-10.84-9.077c-.615 0-1.14.06-1.528.179-.385.12-.687.294-.906.53-.22.24-.364.515-.434.83-.07.31-.12.65-.12 1.01 0 .388.07.733.18 1.046.11.31.29.574.54.79.25.215.58.38.99.495.41.12.89.165 1.46.165H9.48V7.588H6.1zm13.607-2.179V3.226h-5.622v2.183h5.622zm-5.62 10.05c0-.586.14-1.04.425-1.37.285-.336.692-.5 1.223-.5.344 0 .628.062.853.185.225.125.413.29.562.5.15.21.257.45.323.72.066.27.098.55.098.84h-3.484zm-7.874-2.98c.463 0 .854-.09 1.17-.27.318-.18.477-.525.477-1.034 0-.3-.063-.55-.19-.747-.126-.198-.3-.35-.522-.46-.223-.11-.473-.185-.75-.224-.28-.04-.563-.06-.853-.06H2.58v2.795h3.633z" />
        </svg>
      ),
      dribbble: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
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


  if (loading && !creator) {


































    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-dark-secondary shadow-soft dark:shadow-dark-soft border-b border-gray-200 dark:border-dark-card-border">
          <div className="container-custom px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start">

              {/* Left Column - Creator Identity Skeleton */}
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Picture and Name Skeleton */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Profile Picture Skeleton */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>

                  {/* Creator Name and Stats Skeleton */}
                  <div className="flex-1 text-center sm:text-right w-full">
                    <div className="flex items-center gap-4 justify-center sm:justify-start flex-wrap mb-3">
                      <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 sm:w-48 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>

                {/* Bio Skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-24 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg w-24 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                </div>
              </div>

              {/* Right Column - Metadata Skeleton */}
              <div className="space-y-6 sm:space-y-8">
                {/* Professional Information Skeleton */}
                <div className="bg-white dark:bg-dark-secondary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 mb-4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-16 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-20 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full w-18 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                </div>

                {/* Social Links Skeleton */}
                <div className="bg-white dark:bg-dark-secondary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 mb-4 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section Skeleton */}
        <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom px-4 sm:px-6">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 mb-6 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, idx) => (
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

  if (error || !creator) {
    return (
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 py-12 sm:py-16 md:py-20" dir="rtl">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">المبدع غير موجود</h1>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
              لم نتمكن من العثور على المبدع المطلوب
            </p>
            <Link href="/creators" className="btn-primary inline-block">
              تصفح المبدعين
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Dynamic Head Tags for SEO */}
      {creator && (
        <Head>
          <title>{`${creator.displayName || creator.name} - مبدع قوالب نوشن | عرب نوشن`}</title>
          <meta name="description" content={`تعرف على ${creator.displayName || creator.name}، مبدع قوالب Notion باللغة العربية. ${pagination.total || creator.templateCount || creatorTemplates.length || 0} قالب متاح للتحميل المجاني. ${creator.bio || creator.experience || 'مبدع موهوب في إنشاء قوالب إنتاجية احترافية.'}`} />
          <meta name="keywords" content={`${creator.displayName || creator.name}, مبدع قوالب, notion creator, قوالب عربية, ${creator.specialties?.join(', ') || ''}, مبدعون عرب, قوالب مجانية, إنتاجية, تنظيم`} />
          <link rel="canonical" href={`https://www.notionarabs.com/creators/${creator.username}`} />

          {/* Open Graph */}
          <meta property="og:title" content={`${creator.displayName || creator.name} - مبدع قوالب نوشن`} />
          <meta property="og:description" content={`تعرف على ${creator.displayName || creator.name}، مبدع قوالب Notion باللغة العربية. ${pagination.total || creator.templateCount || creatorTemplates.length || 0} قالب متاح.`} />
          <meta property="og:image" content={creator.profilePicture || 'https://www.notionarabs.com/og-image.png'} />
          <meta property="og:url" content={`https://www.notionarabs.com/creators/${creator.username}`} />
          <meta property="og:type" content="profile" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${creator.displayName || creator.name} - مبدع قوالب نوشن`} />
          <meta name="twitter:description" content={`تعرف على ${creator.displayName || creator.name}، مبدع قوالب Notion باللغة العربية.`} />
          <meta name="twitter:image" content={creator.profilePicture || 'https://www.notionarabs.com/og-image.png'} />
        </Head>
      )}

      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

        {/* Header */}
        <div className="bg-white dark:bg-dark-secondary shadow-soft dark:shadow-dark-soft border-b border-gray-200 dark:border-dark-card-border">
          <div className="container-custom px-4 sm:px-6 py-3 sm:py-4">
            <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary overflow-x-auto">
              <Link href="/creators" className="hover:text-primary-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                المبدعين
              </Link>
              <span className="text-gray-400 dark:text-dark-text-quaternary flex-shrink-0">/</span>
              <span className="text-accent-500 dark:text-dark-text-primary font-medium truncate max-w-[200px] sm:max-w-none">{creator.displayName || creator.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start">

              {/* Left Column - Creator Identity */}
              <div className="space-y-4 sm:space-y-6">
                {/* Profile Picture and Name */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    {creator.profilePicture && creator.profilePicture.trim() !== '' && !profileImageError ? (
                      <Image
                        src={creator.profilePicture}
                        alt={`صورة ${creator.displayName || creator.name}`}
                        width={120}
                        height={120}
                        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-dark-card-border shadow-lg"
                        unoptimized
                        onError={() => setProfileImageError(true)}
                        onLoad={() => setProfileImageError(false)}
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center shadow-lg border-4 border-white dark:border-dark-card-border">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-500 dark:text-orange-400">
                          {(creator.displayName || creator.name || 'م')?.charAt(0)?.toUpperCase() || 'م'}
                        </span>
                      </div>
                    )}

                    {/* Verified Badge */}
                    {creator.creatorStatus === 'approved' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Creator Name and Stats */}
                  <div className="flex-1 text-center sm:text-right w-full">
                    <div className="flex items-center gap-4 justify-center sm:justify-start flex-wrap">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary">
                        {creator.displayName || creator.name}
                      </h1>
                      {/* Creator Badges */}
                      {creator.badges && creator.badges.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {creator.badges.map((badge) => {
                            const BadgeIcon = getBadgeIcon(badge.type);
                            return (
                              <div
                                key={badge._id}
                                className="group/badge relative"
                              >
                                <div className="flex items-center p-1 bg-primary-50 dark:bg-orange-500/10 border border-primary-200 dark:border-orange-500/20 rounded transition-all duration-200 hover:shadow-md">
                                  <BadgeIcon
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400"
                                    strokeWidth={2}
                                  />
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none z-10">
                                  {badge.label}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Stats inline under name */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-3">
                      <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-full">
                        <span className="text-xs font-medium text-gray-700 dark:text-dark-text-primary">{creator.followers || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-dark-text-secondary">متابع</span>
                      </div>
                      {creator.showTemplateCount !== false && (
                        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{pagination.total || creator.templateCount || creatorTemplates.length || 0}</span>
                          <span className="text-xs text-blue-500 dark:text-blue-300">قالب</span>
                        </div>
                      )}
                      {medianRating > 0 && (
                        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{medianRating.toFixed(1)}</span>
                          <span className="text-xs text-amber-500 dark:text-amber-300">تقييم</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {(creator.bio || creator.experience) && (
                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center sm:text-right">
                    {creator.bio || creator.experience}
                  </p>
                )}

                {/* Recommended Creator Badge */}
                {creator.creatorStatus === 'approved' && (
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-700 mx-auto sm:mx-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-medium">مبدع موصى به</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  {/* Contact Creator Button */}
                  {creator.allowMessages !== false && creator.email && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(`/login?redirect=/creators/${username}`);
                          return;
                        }
                        window.location.href = `mailto:${creator.email}`;
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 dark:bg-orange-500 hover:bg-primary-600 dark:hover:bg-orange-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-soft hover:shadow-medium"
                      title="تواصل مع المبدع"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">تواصل</span>
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
                    showText={true}
                    className="shadow-soft hover:shadow-medium"
                  />
                </div>
              </div>

              {/* Right Column - Metadata */}
              <div className="space-y-6 sm:space-y-8">


                {/* Professional Information */}
                {(creator.portfolio || creator.experience || creator.motivation || (creator.specialties && creator.specialties.length > 0)) && (
                  <div className="bg-white dark:bg-dark-secondary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-dark-text-primary mb-3 sm:mb-4">المجالات التي يختص بها</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Specialties */}
                      {creator.specialties && creator.specialties.length > 0 && (
                        <div className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-dark-card-border last:border-b-0 last:pb-0">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {creator.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 dark:bg-orange-900/30 text-primary-800 dark:text-orange-300 border border-primary-200 dark:border-orange-700"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio */}
                      {creator.portfolio && (
                        <div className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-dark-card-border last:border-b-0 last:pb-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-quaternary mb-2">المعرض</h4>
                          <a
                            href={creator.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary-600 dark:text-orange-400 hover:text-primary-700 dark:hover:text-orange-300 transition-colors text-xs sm:text-sm md:text-base break-all"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="truncate">{creator.portfolio}</span>
                          </a>
                        </div>
                      )}

                      {/* Experience */}
                      {creator.experience && (
                        <div className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-dark-card-border last:border-b-0 last:pb-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-quaternary mb-2">الخبرة</h4>
                          <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                            {creator.experience}
                          </p>
                        </div>
                      )}

                      {/* Motivation */}
                      {creator.motivation && (
                        <div className="pb-3 sm:pb-4 border-b border-gray-100 dark:border-dark-card-border last:border-b-0 last:pb-0">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-text-quaternary mb-2">الدافع</h4>
                          <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                            {creator.motivation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Social Links */}
                {creator.socialLinks && creator.socialLinks.length > 0 && (
                  <div className="bg-white dark:bg-dark-secondary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-dark-text-primary mb-3 sm:mb-4">الروابط الاجتماعية</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {creator.socialLinks.map((link, index) => {
                        if (!link.url) return null;
                        const platform = detectPlatform(link.url);
                        return (
                          <a
                            key={index}
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-quaternary rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-110 transform border border-gray-200 dark:border-dark-card-border"
                            aria-label={(() => {
                              try {
                                return platform?.name === 'website' ? `زيارة ${new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname.replace('www.', '')}` : platform?.name === 'facebook-group' ? 'مجموعة فيسبوك' : `زيارة ${platform?.name || 'الرابط'}`;
                              } catch (e) {
                                return `زيارة ${link.url}`;
                              }
                            })()}
                          >
                            <span className={platform?.color} aria-hidden="true">
                              {getPlatformIcon(platform?.icon || 'website')}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>


        {/* Templates Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-500 dark:text-dark-text-primary mb-6 sm:mb-8 md:mb-10">قوالب المبدع</h2>

            {templatesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, idx) => (
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
            ) : creatorTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {creatorTemplates.map((template) => (
                  <Link key={template._id || template.id} href={`/templates/${template.slug || template._id || template.id}`} className="block w-full h-full">
                    <div className="card-interactive overflow-hidden h-full flex flex-col">
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg flex-shrink-0">
                        {template.previewImage && typeof template.previewImage === 'string' && template.previewImage.trim() ? (
                          // Skip Next.js optimization for Cloudinary images to avoid 402 errors
                          template.previewImage.includes('res.cloudinary.com') ? (
                            <img
                              src={template.previewImage}
                              alt={template.title}
                              className="w-full h-full object-cover object-[50%_50%] bg-white dark:bg-dark-secondary group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                console.error('Image failed to load:', template.previewImage);
                                if (e.target) {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
                          ) : (
                            <Image
                              src={template.previewImage}
                              alt={template.title}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover object-[50%_50%] bg-white dark:bg-dark-secondary group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                console.error('Image failed to load:', template.previewImage);
                                if (e.target) {
                                  e.target.style.display = 'none';
                                }
                              }}
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="p-4 sm:p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-1 group-hover:text-primary-500 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                          {template.title}
                        </h3>
                        {/* Short Description */}
                        <p className="text-xs text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2 min-h-[2rem]">
                          {template.description || 'وصف مختصر للقالب غير متوفر حالياً.'}
                        </p>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <StarRating rating={template.rating || 0} />
                          {template.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {template.price} ر.س
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              مجاني
                            </span>
                          )}
                        </div>
                        <button className="w-full btn-primary py-2 px-3 sm:px-4 text-sm sm:text-base mt-auto">
                          عرض التفاصيل
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">لا توجد قوالب متاحة</h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8 px-4">
                  لم ينشر {creator.displayName || creator.name} أي قوالب بعد
                </p>
                <Link href="/templates" className="btn-primary inline-block">
                  تصفح القوالب الأخرى
                </Link>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && !templatesLoading && creatorTemplates.length > 0 && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => {
                      setPagination(prev => ({ ...prev, current: prev.current - 1 }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={pagination.current <= 1 || templatesLoading}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    السابق
                  </button>

                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.current;
                    const isNearCurrent = Math.abs(page - pagination.current) <= 2;

                    if (!isNearCurrent && page !== 1 && page !== pagination.pages) {
                      if (page === 2 || page === pagination.pages - 1) {
                        return <span key={page} className="px-1 sm:px-2 text-accent-500 text-xs sm:text-sm">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setPagination(prev => ({ ...prev, current: page }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        disabled={templatesLoading}
                        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${isCurrentPage
                          ? 'bg-primary-600 text-white'
                          : 'text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      setPagination(prev => ({ ...prev, current: prev.current + 1 }));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={pagination.current >= pagination.pages || templatesLoading}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary border border-accent-300 dark:border-dark-card-border rounded-lg hover:bg-accent-50 dark:hover:bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Results Count */}
            {!templatesLoading && creatorTemplates.length > 0 && (
              <div className="text-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                  عرض {creatorTemplates.length} من {pagination.total} قالب
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        {creatorRatings.length > 0 && (
          <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
            <div className="container-custom px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 md:mb-10 text-accent-500 dark:text-dark-text-primary">تقييمات المبدع</h2>

              <div className="grid gap-4 sm:gap-6">
                {creatorRatings.slice(0, showAllReviews ? creatorRatings.length : 3).map((rating, index) => (
                  <div key={rating._id || index} className="p-4 sm:p-6 bg-white dark:bg-dark-secondary rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
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
                          <span className="text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm">
                            {rating.user?.name?.charAt(0)?.toUpperCase() || 'م'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <span className="font-medium text-sm sm:text-base text-accent-700 dark:text-dark-text-primary">
                            {rating.user?.name || 'مستخدم'}
                          </span>
                          <div className="flex items-center gap-2">
                            <StarRating rating={rating.rating} size="small" showNumber={false} />
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(rating.createdAt)}
                            </span>
                          </div>
                        </div>
                        {rating.review && (
                          <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed break-words">
                            {rating.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {creatorRatings.length > 3 && (
                  <div className="text-center mt-2 sm:mt-4">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg sm:rounded-xl hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors duration-200 text-sm sm:text-base font-medium"
                    >
                      {showAllReviews ? 'عرض أقل' : `عرض جميع التقييمات (${creatorRatings.length})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <Footer />

      </main>
    </>
  );
}
