'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StarRating from '../../../components/StarRating';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
// Dynamic import for heavy component
const RatingCommentSystem = dynamic(() => import('../../../components/RatingCommentSystem'), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse space-y-4 p-6 bg-white dark:bg-dark-card-bg rounded-xl">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    )
});
import { BlogPostSchema, BreadcrumbSchema } from '../../../components/StructuredData';
import Breadcrumb, { BreadcrumbWrapper } from '../../../components/Breadcrumb';
import { siteConfig, extractFirstImage } from '../../../lib/seo';
import { getApiBaseUrl } from '../../../lib/apiConfig';


// Calculate reading time based on content
const calculateReadingTime = (content) => {
    if (!content) return '5 دقائق';

    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');

    // Count words (split by whitespace and filter out empty strings)
    const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Average reading speed: 200-250 words per minute for Arabic text
    // Using 200 words per minute for conservative estimate
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);

    // Minimum reading time is 1 minute
    const readingTime = Math.max(1, minutes);

    return `${readingTime} ${readingTime === 1 ? 'دقيقة' : 'دقائق'}`;
};

const normalizeProfilePictureUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();
    if (!trimmed) return null;

    const apiBase = getApiBaseUrl();
    const backendBase = apiBase.replace(/\/api\/?$/, '');

    if (trimmed.startsWith('http://localhost:5000') || trimmed.startsWith('http://127.0.0.1:5000')) {
        return trimmed.replace(/^http:\/\/(localhost|127\.0\.0\.1):5000/, backendBase);
    }

    if (/^(https?:)?\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
        return trimmed;
    }

    const absoluteBase = typeof window !== 'undefined' ? window.location.origin : backendBase;
    if (trimmed.startsWith('/')) {
        return `${absoluteBase}${trimmed}`;
    }

    return `${absoluteBase}/${trimmed}`;
};

export default function BlogPostClient({ initialBlog, initialRelatedBlogs }) {
    const params = useParams();
    const router = useRouter();
    const { showError } = useToast();
    const { isAuthenticated, user } = useAuth();

    const [blog, setBlog] = useState(initialBlog || null);
    const [authorSlug, setAuthorSlug] = useState('');
    const [relatedBlogs, setRelatedBlogs] = useState(initialRelatedBlogs || []);
    const [loading, setLoading] = useState(!initialBlog);
    const [error, setError] = useState(null);
    const [viewCount, setViewCount] = useState(initialBlog?.views || 0);
    const [blogRatings, setBlogRatings] = useState([]);
    const [blogComments, setBlogComments] = useState([]);
    const [ratingsSummary, setRatingsSummary] = useState({ averageRating: 0, totalRatings: 0 });
    const [userRating, setUserRating] = useState(null);
    const [userComment, setUserComment] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Set author slug from initial data if available
    useEffect(() => {
        if (initialBlog) {
            const a = initialBlog?.author || {};
            const immediateSlug = a.username || a.slug || a.handle || a.user?.username || a.creator?.username || (a.email ? a.email.split('@')[0] : '');
            if (immediateSlug) {
                setAuthorSlug(encodeURIComponent(immediateSlug));
            } else if (a._id) {
                setAuthorSlug(encodeURIComponent(a._id));
            }
        }
    }, [initialBlog]);

    useEffect(() => {
        if (params.slug && !initialBlog) {
            fetchBlogPost();
        }
        if (params.slug) {
            incrementViewCount();
        }
    }, [params.slug, initialBlog]);

    // Fetch ratings and comments when blog is loaded and user is authenticated
    useEffect(() => {
        if (blog && isAuthenticated && user) {
            fetchRatingsAndComments();
        }
    }, [blog, isAuthenticated, user]);

    // Handle rating change
    const handleRatingChange = (ratingData) => {
        setUserRating(ratingData.rating);
        // Refresh ratings summary
        fetchRatingsAndComments();
    };

    // Handle comment change
    const handleCommentChange = (commentData) => {
        setUserComment(commentData.comment);
        // Refresh comments
        fetchRatingsAndComments();
    };

    // Fetch ratings and comments for the blog
    const fetchRatingsAndComments = async () => {
        if (!params?.slug && !blog?._id || !isAuthenticated) return;
        const blogId = blog?._id;
        if (!blogId) return;

        try {
            const [ratingsResponse, commentsResponse] = await Promise.all([
                api.get(`/ratings/blog/${blogId}`),
                api.get(`/comments/blog/${blogId}`)
            ]);

            if (ratingsResponse.data.success) {
                setBlogRatings(ratingsResponse.data.ratings || []);
                setRatingsSummary(ratingsResponse.data.summary || { averageRating: 0, totalRatings: 0 });

                // Find user's rating
                const userRatingData = ratingsResponse.data.ratings?.find(rating => rating.user._id === user?._id);
                setUserRating(userRatingData || null);
            }

            if (commentsResponse.data.success) {
                setBlogComments(commentsResponse.data.comments || []);

                // Find user's comment
                const userCommentData = commentsResponse.data.comments?.find(comment => comment.user._id === user?._id);
                setUserComment(userCommentData || null);
            }
        } catch (error) {
            console.error('Error fetching ratings and comments:', error);
        }
    };

    // Handle comment like
    const handleCommentLike = useCallback(async (commentId) => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await api.post(`/comments/${commentId}/like`);
            if (response.data.success) {
                // Update the comment's like count and like status in the local state
                setBlogComments(prev => prev.map(comment => {
                    if (comment._id === commentId) {
                        // Toggle the like for current user
                        const currentUserId = user?._id || user?.id;
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
    }, [isAuthenticated, user]);

    // Check if current user has liked a comment
    const isCommentLikedByUser = (comment) => {
        if (!user || !comment.likes) return false;
        const currentUserId = user._id || user.id;
        return comment.likes.some(like =>
            like.user?._id === currentUserId || like.user === currentUserId
        );
    };

    // Increment view count only once per session
    const incrementViewCount = async () => {
        if (!params?.slug && !blog?.slug) return;
        const slug = params?.slug || blog?.slug;

        const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs') || '[]');

        if (!viewedBlogs.includes(slug)) {
            try {
                const response = await api.post(`/blogs/${slug}/increment-view`);
                if (response.data.success) {
                    setViewCount(response.data.views);
                    viewedBlogs.push(slug);
                    localStorage.setItem('viewedBlogs', JSON.stringify(viewedBlogs));
                }
            } catch (error) {
                console.error('Error incrementing view count:', error);
            }
        }
    };


    const fetchBlogPost = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/blogs/${params.slug}`);

            if (response.data.success) {
                const normalizedBlog = { ...response.data.blog };
                if (normalizedBlog.author) {
                    normalizedBlog.author = {
                        ...normalizedBlog.author,
                        profilePicture: normalizeProfilePictureUrl(normalizedBlog.author.profilePicture)
                    };
                }

                const normalizedRelatedBlogs = (response.data.relatedBlogs || []).map((related) => {
                    if (!related?.author) return related;
                    return {
                        ...related,
                        author: {
                            ...related.author,
                            profilePicture: normalizeProfilePictureUrl(related.author.profilePicture)
                        }
                    };
                });

                setBlog(normalizedBlog);
                setViewCount(normalizedBlog.views || 0);
                setRelatedBlogs(normalizedRelatedBlogs);
                // Precompute author slug - backend now populates username, slug, and email
                const a = normalizedBlog?.author || {};
                const immediateSlug = a.username || a.slug || a.handle || a.user?.username || a.creator?.username || (a.email ? a.email.split('@')[0] : '');
                if (immediateSlug) {
                    setAuthorSlug(encodeURIComponent(immediateSlug));
                } else if (a._id) {
                    // Fallback to _id if no username available
                    setAuthorSlug(encodeURIComponent(a._id));
                }
            } else {
                setError('المقال غير موجود');
                showError('المقال غير موجود');
            }
        } catch (err) {
            console.error('Error fetching blog post:', err);
            if (err.response?.status === 404) {
                setError('المقال غير موجود');
                showError('المقال غير موجود');
            } else {
                setError('فشل في تحميل المقال');
                showError('فشل في تحميل المقال');
            }
        } finally {
            setLoading(false);
        }
    };

    // Memoized combined reviews with optimized calculations
    const combinedReviews = useMemo(() => {
        if (blogRatings.length === 0 && blogComments.length === 0) return [];

        const userReviews = new Map();

        // Process comments
        blogComments.forEach(comment => {
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
        blogRatings.forEach(rating => {
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
    }, [blogRatings, blogComments]);

    // Memoized comment lookup map for O(1) access
    const commentLookupMap = useMemo(() => {
        const map = new Map();
        blogComments.forEach(comment => {
            map.set(comment._id, comment);
        });
        return map;
    }, [blogComments]);

    // Memoized reviews to show based on showAllReviews state
    const reviewsToShow = useMemo(() => {
        return showAllReviews ? combinedReviews : combinedReviews.slice(0, 5);
    }, [combinedReviews, showAllReviews]);

    // Optimized like handler with useCallback
    const handleLikeClick = useCallback((commentId) => {
        handleCommentLike(commentId);
    }, [handleCommentLike]);

    if (loading) {
        return (
            <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
                <div className="container-custom py-8 sm:py-12">
                    {/* Header Skeleton */}
                    <div className="mb-8 sm:mb-12">
                        <div className="animate-pulse">
                            {/* Breadcrumb Skeleton */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>

                            {/* Title Skeleton */}
                            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/2"></div>

                            {/* Meta Info Skeleton */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                                </div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                            </div>

                            {/* Featured Image Skeleton */}
                            <div className="h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
                        </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-6">
                            {/* Article Content Skeleton */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>

                            {/* Paragraph Spacing */}
                            <div className="h-8"></div>

                            {/* More Content Skeleton */}
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                            </div>

                            {/* Call to Action Skeleton */}
                            <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-primary">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-4">
                        {error || 'المقال غير موجود'}
                    </h1>
                    <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
                        يبدو أن المقال الذي تبحث عنه غير موجود أو تم حذفه
                    </p>
                    <Link
                        href="/blog"
                        className="btn-primary"
                    >
                        العودة للمدونة
                    </Link>
                </div>
            </div>
        );
    }

    const creatorSlug = authorSlug || encodeURIComponent(
        blog.author?.username ||
        blog.author?.user?.username ||
        blog.author?.creator?.username ||
        blog.author?.handle ||
        blog.author?.slug ||
        blog.author?.email?.split('@')[0] ||
        blog.author?._id || ''
    );

    return (
        <>
            <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300">
                {blog && <BlogPostSchema blog={blog} />}
                {blog && (
                    <BreadcrumbSchema
                        items={[
                            { name: 'الرئيسية', url: `${siteConfig.url}` },
                            { name: 'المدونة', url: `${siteConfig.url}/blog` },
                            { name: blog.title, url: `${siteConfig.url}/blog/${blog.slug}` }
                        ]}
                    />
                )}

                {/* Visible Breadcrumb Navigation */}
                {blog && (
                    <BreadcrumbWrapper
                        items={[
                            { name: 'المدونة', url: '/blog' },
                            { name: blog.title, url: `/blog/${blog.slug}` }
                        ]}
                    />
                )}

                <div className="container-custom py-4 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <article className="bg-white dark:bg-dark-secondary rounded-2xl shadow-medium dark:shadow-dark-medium overflow-hidden border border-gray-200/70 dark:border-dark-card-border">
                                {(() => {
                                    const effectiveImage = blog.featuredImage || extractFirstImage(blog.content) || '/images/blog-fallback.png';
                                    return (
                                        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                                            <Image
                                                src={effectiveImage}
                                                alt={blog.title}
                                                width={800}
                                                height={400}
                                                className="w-full h-full object-cover"
                                                priority
                                                quality={85}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        </div>
                                    );
                                })()}

                                <div className="p-4 sm:p-7 md:p-10">
                                    {/* Category Badge */}
                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                                            {blog.category}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-accent-900 dark:text-dark-text-primary mb-4 leading-snug">
                                        {blog.title}
                                    </h1>

                                    {/* Excerpt */}
                                    {blog.excerpt && (
                                        <div className="mb-6 border-r-4 border-primary-200 dark:border-primary-900/50 pr-4">
                                            <p className="text-sm sm:text-base md:text-lg text-accent-700 dark:text-dark-text-secondary leading-relaxed">
                                                {blog.excerpt}
                                            </p>
                                        </div>
                                    )}

                                    {/* Meta Information */}
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mb-8 text-[11px] sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                                        <Link
                                            href={`/creators/${creatorSlug}`}
                                            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gray-50 dark:bg-dark-primary/60 border border-gray-200 dark:border-dark-card-border rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                {blog.author?.profilePicture ? (
                                                    <Image
                                                        src={blog.author.profilePicture}
                                                        alt={blog.author.name}
                                                        width={28}
                                                        height={28}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                                        {blog.author?.name?.charAt(0) || '?'}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-medium">{blog.author?.name || 'مجهول'}</span>
                                        </Link>

                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-dark-primary/60 border border-gray-200 dark:border-dark-card-border rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(blog.publishedAt)}</span>
                                        </span>

                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-dark-primary/60 border border-gray-200 dark:border-dark-card-border rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>{viewCount} مشاهدة</span>
                                        </span>

                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-gray-50 dark:bg-dark-primary/60 border border-gray-200 dark:border-dark-card-border rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5">
                                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{blog.readTime || calculateReadingTime(blog.content)}</span>
                                        </span>
                                    </div>


                                    {/* Content */}
                                    <div className="prose prose-sm sm:prose-lg lg:prose-xl max-w-none dark:prose-invert prose-headings:text-accent-900 dark:prose-headings:text-dark-text-primary prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-accent-900 dark:prose-strong:text-dark-text-primary prose-p:leading-normal prose-p:my-2">
                                        <div
                                            className="text-accent-700 dark:text-dark-text-primary leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: blog.content }}
                                        />
                                    </div>

                                    {/* Author Bio */}
                                    {blog.author?.bio && (
                                        <div className="mt-10 p-5 sm:p-6 bg-gradient-to-br from-gray-50 to-white dark:from-dark-primary/60 dark:to-dark-secondary rounded-xl border border-gray-200/70 dark:border-dark-card-border">
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-start">
                                                <Link href={`/creators/${creatorSlug}`} className="w-16 h-16 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 ring-4 sm:ring-2 ring-primary-100 dark:ring-primary-900/40">
                                                    {blog.author.profilePicture ? (
                                                        <Image
                                                            src={blog.author.profilePicture}
                                                            alt={blog.author.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-primary-600 dark:text-primary-400 font-medium text-lg">
                                                            {blog.author.name?.charAt(0) || '?'}
                                                        </span>
                                                    )}
                                                </Link>
                                                <div>
                                                    <Link href={`/creators/${creatorSlug}`} className="font-semibold text-accent-900 dark:text-dark-text-primary mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-block">
                                                        عن {blog.author.name}
                                                    </Link>
                                                    <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                                                        {blog.author.bio}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Ratings and Comments Section */}
                                    <div className="mt-8 p-6 bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium">

                                        {/* Ratings Summary */}
                                        {ratingsSummary.totalRatings > 0 && (
                                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-accent-900 dark:text-dark-text-primary">
                                                            {ratingsSummary.averageRating.toFixed(1)}
                                                        </div>
                                                        <div className="text-sm text-accent-600 dark:text-dark-text-secondary">
                                                            من 5 نجوم
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {[...Array(5)].map((_, index) => (
                                                                <svg
                                                                    key={index}
                                                                    className={`w-5 h-5 ${index < Math.round(ratingsSummary.averageRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <div className="text-sm text-accent-600 dark:text-dark-text-secondary">
                                                            بناءً على {ratingsSummary.totalRatings} تقييم
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Only show rating system if user is not the blog author and hasn't submitted a rating yet */}
                                        {user?._id !== blog.author?._id && !userRating && !userComment && (
                                            <div className="mb-6 p-6 bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium">
                                                <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-6">
                                                    تقييم المقال
                                                </h3>
                                                <RatingCommentSystem
                                                    targetType="blog"
                                                    targetId={blog._id}
                                                    initialRating={ratingsSummary.averageRating}
                                                    initialUserRating={userRating}
                                                    initialUserComment={userComment}
                                                    onRatingChange={handleRatingChange}
                                                    onCommentChange={handleCommentChange}
                                                />
                                            </div>
                                        )}

                                    </div>

                                    {/* Reviews and Comments Display Section */}
                                    {combinedReviews.length > 0 && (
                                        <div className="mt-8">
                                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-900 dark:text-dark-text-primary mb-6 sm:mb-8">
                                                تقييمات المستخدمين والتعليقات
                                            </h2>

                                            <div className="space-y-3 sm:space-y-4">
                                                <div className="grid gap-3 sm:gap-4">
                                                    {reviewsToShow.map((review) => {
                                                        const isRatingOnly = review.rating && !review.review && !review.comment;
                                                        const displayDate = formatDate(new Date(review.latestDate));
                                                        const userName = review.user?.name || review.user?.displayName || 'مستخدم';
                                                        const userInitial = userName.charAt(0).toUpperCase() || 'م';
                                                        const hasProfilePicture = !!review.user?.profilePicture;

                                                        // Optimized comment lookup
                                                        const comment = review.commentId ? commentLookupMap.get(review.commentId) : null;
                                                        const isLiked = comment ? isCommentLikedByUser(comment) : false;
                                                        const likeCount = review.likes?.length || 0;

                                                        return (
                                                            <div
                                                                key={review.ratingId || review.commentId}
                                                                className={`h-auto w-full rounded-xl border bg-gray-50 dark:bg-dark-primary border-gray-200 dark:border-dark-card-border ${isRatingOnly ? 'p-2 sm:p-3' : 'p-3 sm:p-4'
                                                                    }`}
                                                            >
                                                                <div className={`flex ${isRatingOnly ? 'items-center' : 'items-start'} gap-2 sm:gap-3 w-full`}>
                                                                    {/* Avatar */}
                                                                    <div
                                                                        className={`${isRatingOnly ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'
                                                                            } rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center`}
                                                                    >
                                                                        {hasProfilePicture ? (
                                                                            <Image
                                                                                src={review.user.profilePicture}
                                                                                alt={userName}
                                                                                width={40}
                                                                                height={40}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none';
                                                                                    e.target.nextSibling.style.display = 'flex';
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        <div className={`w-full h-full flex items-center justify-center ${hasProfilePicture ? 'hidden' : 'flex'}`}>
                                                                            <span className={`${isRatingOnly ? 'text-xs' : 'text-sm'} text-primary-600 dark:text-primary-400 font-medium`}>
                                                                                {userInitial}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className={`flex-1 min-w-0 ${isRatingOnly ? 'flex items-center' : ''}`}>
                                                                        {/* Header: Name, Rating, Date */}
                                                                        <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${isRatingOnly ? '' : 'mb-2'}`}>
                                                                            <span className={`${isRatingOnly ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-medium text-accent-700 dark:text-dark-text-primary truncate`}>
                                                                                {userName}
                                                                            </span>
                                                                            {review.rating && (
                                                                                <StarRating rating={review.rating} size="small" showNumber={false} />
                                                                            )}
                                                                            <span className={`${isRatingOnly ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-500 dark:text-gray-400 whitespace-nowrap`}>
                                                                                {displayDate}
                                                                            </span>
                                                                        </div>

                                                                        {/* Rating Review */}
                                                                        {review.review && (
                                                                            <div className="mb-2">
                                                                                <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed break-words">
                                                                                    {review.review}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Comment */}
                                                                        {review.comment && (
                                                                            <div className={review.review ? 'mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-dark-card-border' : ''}>
                                                                                <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed break-words">
                                                                                    {review.comment}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Actions - Like Button */}
                                                                        {!isRatingOnly && review.commentId && (
                                                                            <div className="flex items-center gap-3 mt-2">
                                                                                <button
                                                                                    onClick={() => handleLikeClick(review.commentId)}
                                                                                    className={`flex items-center gap-1 text-xs transition-colors ${isLiked
                                                                                        ? 'text-red-500 dark:text-red-400'
                                                                                        : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
                                                                                        }`}
                                                                                    aria-label={isLiked ? 'إلغاء الإعجاب' : 'إعجاب'}
                                                                                >
                                                                                    <svg
                                                                                        className="w-3 h-3"
                                                                                        fill={isLiked ? "currentColor" : "none"}
                                                                                        stroke="currentColor"
                                                                                        viewBox="0 0 24 24"
                                                                                        aria-hidden="true"
                                                                                    >
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            strokeWidth={2}
                                                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                                                        />
                                                                                    </svg>
                                                                                    <span>{likeCount}</span>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Show More/Less Button */}
                                                {combinedReviews.length > 5 && (
                                                    <div className="text-center mt-4 sm:mt-6">
                                                        <button
                                                            onClick={() => setShowAllReviews(!showAllReviews)}
                                                            className="px-3 sm:px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors duration-200 text-xs sm:text-sm"
                                                            aria-expanded={showAllReviews}
                                                        >
                                                            {showAllReviews ? 'عرض أقل' : `عرض جميع التقييمات والتعليقات (${combinedReviews.length})`}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Related Posts */}
                            {relatedBlogs.length > 0 && (
                                <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-6 mb-6">
                                    <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-4">
                                        مقالات ذات صلة
                                    </h3>
                                    <div className="space-y-4">
                                        {relatedBlogs.map((relatedBlog) => (
                                            <Link
                                                key={relatedBlog._id}
                                                href={`/blog/${relatedBlog.slug}`}
                                                className="block group"
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-24 sm:w-32 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex-shrink-0 relative">
                                                        {/* Background Pattern */}
                                                        <div className="absolute inset-0 opacity-20">
                                                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full opacity-30"></div>
                                                            <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-20"></div>
                                                            <div className="absolute bottom-2 left-3 w-3 h-3 bg-white rounded-full opacity-25"></div>
                                                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full opacity-30"></div>
                                                        </div>

                                                        {/* Content Overlay */}
                                                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                                                        {/* Blog Icon and Title */}
                                                        <div className="absolute inset-0 flex flex-col justify-center items-center p-1 text-center">
                                                            {/* Blog Icon */}
                                                            <div className="mb-1">
                                                                <div className="w-3 h-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white border-opacity-30">
                                                                    <svg className="w-1.5 h-1.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                                                                    </svg>
                                                                </div>
                                                            </div>

                                                            {/* Auto-generated Title */}
                                                            <h5 className="text-white text-xs font-bold leading-tight drop-shadow-lg max-w-full line-clamp-2">
                                                                {relatedBlog.title.length > 20 ? relatedBlog.title.substring(0, 20) + '...' : relatedBlog.title}
                                                            </h5>
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-accent-900 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                            {relatedBlog.title}
                                                        </h4>
                                                        <p className="text-sm text-accent-500 dark:text-dark-text-secondary mt-1">
                                                            {relatedBlog.author?.name || 'كاتب غير معروف'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Back to Blog */}
                            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-6">
                                <Link
                                    href="/blog"
                                    className="flex items-center justify-center gap-2 w-full btn-outline"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                    جميع المقالات
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
