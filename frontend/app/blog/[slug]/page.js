'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../../lib/dateUtils';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useToast } from '../../../contexts/ToastContext';
import { BlogPostSchema, BreadcrumbSchema } from '../../../components/StructuredData';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { showError } = useToast();

  const [blog, setBlog] = useState(null);
  const [authorSlug, setAuthorSlug] = useState('');
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchBlogPost();
    }
  }, [params.slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/blogs/${params.slug}`);

      if (response.data.success) {
        setBlog(response.data.blog);
        setRelatedBlogs(response.data.relatedBlogs || []);
        // Precompute author slug
        const a = response.data.blog?.author || {};
        const immediateSlug = a.username || a.slug || a.handle || a.user?.username || a.creator?.username || (a.email ? a.email.split('@')[0] : '');
        if (immediateSlug) {
          setAuthorSlug(encodeURIComponent(immediateSlug));
        } else if (a._id) {
          // Attempt to resolve username by id
          try {
            const creatorRes = await api.get(`/creators/${a._id}`);
            const c = creatorRes?.data?.creator || {};
            const resolved = c.username || c.slug || (c.email ? c.email.split('@')[0] : '');
            setAuthorSlug(encodeURIComponent(resolved || a._id));
          } catch (_) {
            setAuthorSlug(encodeURIComponent(a._id));
          }
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
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-primary">
        <LoadingIndicator />
      </div>
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
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300">
      {blog && <BlogPostSchema blog={blog} />}
      {blog && (
        <BreadcrumbSchema
          items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'المدونة', url: '/blog' },
            { name: blog.category, url: `/blog?category=${encodeURIComponent(blog.category)}` },
            { name: blog.title, url: `/blog/${blog.slug}` }
          ]}
        />
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
                    <span>{blog.views || 0} مشاهدة</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{blog.readTime || '5 دقائق'}</span>
                  </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {relatedBlog.featuredImage ? (
                            <Image
                              src={relatedBlog.featuredImage}
                              alt={relatedBlog.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-accent-900 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-sm text-accent-500 dark:text-dark-text-secondary mt-1">
                            {formatDate(relatedBlog.publishedAt)}
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
  );
}
