import { siteConfig } from '../lib/seo'
import api from '../lib/api'

export default async function sitemap() {
  const baseUrl = siteConfig.url

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    // Fetch dynamic pages
    const [templatesRes, blogsRes, creatorsRes] = await Promise.allSettled([
      api.get('/templates?limit=1000'),
      api.get('/blogs?limit=1000'),
      api.get('/creators?limit=1000')
    ])

    // Template pages
    const templatePages = templatesRes.status === 'fulfilled' && templatesRes.value.data.success
      ? templatesRes.value.data.templates.map((template) => ({
        url: `${baseUrl}/templates/${template.slug || template._id}`,
        lastModified: new Date(template.updatedAt || template.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
      : []

    // Blog pages
    const blogPages = blogsRes.status === 'fulfilled' && blogsRes.value.data.success
      ? blogsRes.value.data.blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: new Date(blog.updatedAt || blog.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      }))
      : []

    // Creator pages
    const creatorPages = creatorsRes.status === 'fulfilled' && creatorsRes.value.data.success
      ? creatorsRes.value.data.creators.map((creator) => ({
        url: `${baseUrl}/creators/${creator.username || creator._id}`,
        lastModified: new Date(creator.updatedAt || creator.createdAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      }))
      : []

    // Category pages
    const categories = [
      'الإنتاجية', 'الدراسة', 'الأعمال', 'الحياة الشخصية',
      'الإبداع', 'التقنية', 'الصحة', 'المالية', 'التنظيم', 'التخطيط'
    ]
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(category)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [
      ...staticPages,
      ...templatePages,
      ...blogPages,
      ...creatorPages,
      ...categoryPages,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
