import { generateBlogMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }) {
  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;

  try {
    // Fetch blog data from API for metadata
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/blogs/${resolvedParams.slug}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.blog) {
        return generateBlogMetadata(data.blog);
      }
    }
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
  }

  // Fallback metadata
  return generateBlogMetadata({
    title: 'مقال عن نوشن',
    excerpt: 'مقال مفيد عن استخدام قوالب Notion باللغة العربية',
    category: 'مقالات',
    author: { name: 'مؤلف' },
    featuredImage: null,
    tags: ['مقال', 'نوشن', 'عربي'],
    publishedAt: new Date().toISOString()
  });
}

export default function BlogLayout({ children }) {
  return children;
}

