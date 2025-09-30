import { generateBlogMetadata } from '../../../lib/seo'
import api from '../../../lib/api'

export async function generateMetadata({ params }) {
  try {
    // Try to fetch blog data for metadata
    const response = await api.get(`/blogs/${params.slug}`)

    if (response.data.success && response.data.blog) {
      return generateBlogMetadata(response.data.blog)
    }
  } catch (error) {
    console.error('Error fetching blog metadata:', error)
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
  })
}
