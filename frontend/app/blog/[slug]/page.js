'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
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
import Breadcrumb from '../../../components/Breadcrumb';
import { siteConfig } from '../../../lib/seo';

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

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();
  const { isAuthenticated, user } = useAuth();

  const [blog, setBlog] = useState(null);
  const [authorSlug, setAuthorSlug] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [blogRatings, setBlogRatings] = useState([]);
  const [blogComments, setBlogComments] = useState([]);
  const [ratingsSummary, setRatingsSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [userRating, setUserRating] = useState(null);
  const [userComment, setUserComment] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchBlogPost();
      incrementViewCount();
    }
  }, [params.slug]);

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
    if (!params.slug || !isAuthenticated) return;

    try {
      const [ratingsResponse, commentsResponse] = await Promise.all([
        api.get(`/ratings/blog/${blog?._id}`),
        api.get(`/comments/blog/${blog?._id}`)
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

  // Increment view count only once per session
  const incrementViewCount = async () => {
    if (!params.slug) return;

    const viewedBlogs = JSON.parse(localStorage.getItem('viewedBlogs') || '[]');

    if (!viewedBlogs.includes(params.slug)) {
      try {
        const response = await api.post(`/blogs/${params.slug}/increment-view`);
        if (response.data.success) {
          setViewCount(response.data.views);
          viewedBlogs.push(params.slug);
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
        setBlog(response.data.blog);
        setViewCount(response.data.blog.views || 0);
        setRelatedBlogs(response.data.relatedBlogs || []);
        // Precompute author slug - backend now populates username, slug, and email
        const a = response.data.blog?.author || {};
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
      {/* Dynamic Head Tags for SEO */}
      {blog && (
        <Head>
          <title>{`${blog.title} | ${siteConfig.name}`}</title>
          <meta name="description" content={blog.excerpt || blog.description || `اقرأ مقال ${blog.title} على ${siteConfig.name}`} />
          <meta name="keywords" content={`${blog.title}, ${blog.category}, مقال, مدونة, ${blog.author?.name || ''}, ${blog.tags?.join(', ') || ''}`} />
          <link rel="canonical" href={`${siteConfig.url}/blog/${blog.slug}`} />

          {/* Open Graph */}
          <meta property="og:title" content={blog.title} />
          <meta property="og:description" content={blog.excerpt || blog.description || ''} />
          <meta property="og:image" content={blog.featuredImage || `${siteConfig.url}${siteConfig.ogImage}`} />
          <meta property="og:url" content={`${siteConfig.url}/blog/${blog.slug}`} />
          <meta property="og:type" content="article" />
          {blog.publishedAt && <meta property="article:published_time" content={blog.publishedAt} />}
          {blog.updatedAt && <meta property="article:modified_time" content={blog.updatedAt} />}
          {blog.author?.name && <meta property="article:author" content={blog.author.name} />}

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={blog.title} />
          <meta name="twitter:description" content={blog.excerpt || blog.description || ''} />
          <meta name="twitter:image" content={blog.featuredImage || `${siteConfig.url}${siteConfig.ogImage}`} />
        </Head>
      )}

      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300">
        {blog && <BlogPostSchema blog={blog} />}
        {blog && (
          <BreadcrumbSchema
            items={[
              { name: 'الرئيسية', url: `${siteConfig.url}` },
              { name: 'المدونة', url: `${siteConfig.url}/blog` },
              { name: blog.category, url: `${siteConfig.url}/blog?category=${encodeURIComponent(blog.category)}` },
              { name: blog.title, url: `${siteConfig.url}/blog/${blog.slug}` }
            ]}
          />
        )}

        {/* Visible Breadcrumb Navigation */}
        {blog && (
          <section className="bg-white dark:bg-dark-secondary transition-colors duration-300 border-b border-gray-200 dark:border-dark-card-border">
            <div className="container-custom py-3">
              <Breadcrumb
                items={[
                  { name: 'المدونة', url: '/blog' },
                  ...(blog.category ? [{ name: blog.category, url: `/blog?category=${encodeURIComponent(blog.category)}` }] : []),
                  { name: blog.title, url: `/blog/${blog.slug}` }
                ]}
              />
            </div>
          </section>
        )}

        <div className="container-custom py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-accent-600 dark:text-dark-text-secondary hover:text-accent-800 dark:hover:text-dark-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium overflow-hidden">
                {/* Featured Image */}
                {blog.featuredImage && (
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                      {blog.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent-900 dark:text-dark-text-primary mb-4 leading-tight">
                    {blog.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-lg text-accent-600 dark:text-dark-text-secondary mb-6 leading-relaxed">
                    {blog.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-accent-500 dark:text-dark-text-secondary">
                    <div className="flex items-center gap-2">
                      <Link href={`/creators/${creatorSlug}`} className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        {blog.author?.profilePicture ? (
                          <Image
                            src={blog.author.profilePicture}
                            alt={blog.author.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {blog.author?.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </Link>
                      <Link href={`/creators/${creatorSlug}`} className="font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{blog.author?.name || 'مجهول'}</Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDate(blog.publishedAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{viewCount} مشاهدة</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{blog.readTime || calculateReadingTime(blog.content)}</span>
                    </div>
                  </div>


                  {/* Content */}
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <div
                      className="text-accent-700 dark:text-dark-text-primary leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                  </div>

                  {/* Author Bio */}
                  {blog.author?.bio && (
                    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-start gap-4">
                        <Link href={`/creators/${creatorSlug}`} className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
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
                          <p className="text-accent-600 dark:text-dark-text-secondary">
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
                  {(blogRatings.length > 0 || blogComments.length > 0) && (
                    <div className="mt-8 p-6 bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium">
                      <h3 className="text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-6">
                        تقييمات المستخدمين والتعليقات
                      </h3>

                      <div className="space-y-4">
                        {/* Combined Ratings and Comments */}
                        {(() => {
                          // Create a map of user reviews combining ratings and comments
                          const userReviews = new Map();

                          // Add ratings to the map
                          blogRatings.forEach(rating => {
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
                          blogComments.forEach(comment => {
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
                          const sortedReviews = Array.from(userReviews.values()).sort((a, b) => {
                            const aDate = new Date(a.ratingDate || a.commentDate);
                            const bDate = new Date(b.ratingDate || b.commentDate);
                            return bDate - aDate;
                          });

                          return sortedReviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                              <div className="flex items-start gap-3">
                                {/* User Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                  {review.user?.profilePicture ? (
                                    <img
                                      src={review.user.profilePicture}
                                      alt={review.user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                      {review.user?.name?.charAt(0) || 'م'}
                                    </span>
                                  )}
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-accent-900 dark:text-dark-text-primary">
                                      {review.user?.name || 'مستخدم'}
                                    </span>

                                    {/* Rating Stars */}
                                    {review.rating && (
                                      <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                          <svg
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                    )}

                                    <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                                      {formatDate(review.ratingDate || review.commentDate)}
                                    </span>
                                  </div>

                                  {/* Review Text */}
                                  {review.review && (
                                    <p className="text-sm text-accent-700 dark:text-dark-text-secondary mb-2">
                                      {review.review}
                                    </p>
                                  )}

                                  {/* Comment Text */}
                                  {review.comment && (
                                    <p className="text-sm text-accent-700 dark:text-dark-text-secondary">
                                      {review.comment}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
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
                          <div className="w-32 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex-shrink-0 relative">
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
