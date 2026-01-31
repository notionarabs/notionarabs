
import { notFound } from 'next/navigation';
import { getApiBaseUrl } from '../../../lib/apiConfig';
import { generateBlogMetadata } from '../../../lib/seo';
import BlogPostClient from './BlogPostClient';

// Helper to normalize author image URL (server-side version)
const normalizeProfilePictureUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const apiBase = getApiBaseUrl();
  // API base might be .../api, we usually want the root for images if they are relative to root
  // taking a safer approach: checking if the original client logic replaced localhost ports

  // The client logic:
  // if (trimmed.startsWith('http://localhost:5000') ...) return trimmed.replace(...)

  // For server side, we just want to ensure we have an absolute URL if it is relative
  if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // If it's a relative path, prepend the backend URL (without /api if possible, but depends on how images are served)
  // Usually images are served from static folder or uploads. 
  // API_URL is .../api. Backend root is .../
  const backendRoot = apiBase.replace(/\/api\/?$/, '');

  if (trimmed.startsWith('/')) {
    return `${backendRoot}${trimmed}`;
  }

  return `${backendRoot}/${trimmed}`;
};

async function getBlog(slug) {
  const apiUrl = getApiBaseUrl();
  try {
    // We use fetch with revalidate to enable ISR/caching
    // Ensure slug is properly encoded
    const res = await fetch(`${apiUrl}/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch blog, status: ${res.status}`);
      return null;
    }

    const data = await res.json();

    // Check if success is true, sometimes 200 OK might return success: false
    if (!data.success || !data.blog) return null;

    // Normalize images server-side
    const blog = data.blog;
    if (blog.author) {
      blog.author.profilePicture = normalizeProfilePictureUrl(blog.author.profilePicture);
    }

    const relatedBlogs = (data.relatedBlogs || []).map(related => {
      if (related.author) {
        related.author.profilePicture = normalizeProfilePictureUrl(related.author.profilePicture);
      }
      return related;
    });

    return { blog, relatedBlogs };
  } catch (error) {
    console.error('[getBlog] Error fetching blog:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getBlog(slug);
  if (!data) {
    return {
      title: 'المقال غير موجود | عرب نوشن',
      description: 'المقال الذي تبحث عنه غير موجود'
    };
  }

  return generateBlogMetadata(data.blog);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const data = await getBlog(slug);

  if (!data) {
    notFound();
  }

  // Pass data to Client Component
  return <BlogPostClient initialBlog={data.blog} initialRelatedBlogs={data.relatedBlogs} />;
}
