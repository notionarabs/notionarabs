import api from '../../lib/api';
import BlogPageClient from './BlogPageClient';

// Server-side data fetching for blog posts
async function getBlogPosts() {
  try {
    const params = new URLSearchParams({
      page: '1',
      limit: '9',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    });

    const response = await api.get(`/blogs?${params.toString()}`);

    if (response.data.success) {
      return {
        blogs: response.data.blogs || [],
        pagination: response.data.pagination || { current: 1, pages: 1, total: 0, limit: 9 }
      };
    }
    return { blogs: [], pagination: { current: 1, pages: 1, total: 0, limit: 9 } };
  } catch (err) {
    console.error('Error fetching blog posts on server:', err.message);
    return { blogs: [], pagination: { current: 1, pages: 1, total: 0, limit: 9 } };
  }
}

export default async function BlogPage() {
  const { blogs, pagination } = await getBlogPosts();
  
  return <BlogPageClient initialBlogs={blogs} initialPagination={pagination} />;
}