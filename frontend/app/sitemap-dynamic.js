import { siteConfig } from '../lib/seo'
import { getApiBaseUrl } from '../lib/apiConfig'

// This is an alternative sitemap that includes dynamic content
// Use this when your API is stable and available during build time
export default async function sitemapDynamic() {
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
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
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
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Category pages - using English slugs that match the routing
  const categorySlugs = [
    'productivity', 'study', 'business', 'personal', 'creativity', 'technology', 'health', 'finance',
    'organization', 'planning', 'religious', 'marketing', 'design', 'development', 'education',
    'travel', 'food', 'sports', 'entertainment', 'fashion', 'beauty', 'home', 'garden', 'pets',
    'cars', 'programming', 'database', 'cybersecurity', 'ai', 'blockchain', 'ecommerce', 'sales',
    'customer-service', 'hr', 'accounting', 'investment', 'real-estate', 'insurance', 'law', 'medicine',
    'nursing', 'physical-therapy', 'nutrition', 'cooking', 'desserts', 'beverages', 'restaurants',
    'arts', 'music', 'drawing', 'sculpture', 'photography', 'video', 'writing', 'translation',
    'languages', 'history', 'geography', 'science', 'mathematics', 'physics', 'chemistry', 'biology',
    'psychology', 'sociology', 'philosophy', 'literature', 'poetry', 'theater', 'cinema', 'gaming',
    'esports', 'tourism', 'hospitality', 'transportation', 'aviation', 'maritime', 'agriculture',
    'environment', 'energy', 'construction', 'engineering', 'architecture', 'decoration', 'furniture',
    'tools', 'devices', 'software', 'applications', 'websites', 'web-development', 'app-development',
    'e-learning', 'meetings', 'social-networks', 'content', 'advertising', 'public-relations',
    'branding', 'strategy', 'leadership', 'management', 'projects', 'operations', 'quality',
    'innovation', 'research-development', 'analysis', 'statistics', 'data', 'reports', 'presentations',
    'training', 'professional-development', 'consulting', 'services', 'products', 'manufacturing',
    'distribution', 'warehouses', 'logistics'
  ]
  const categoryPages = categorySlugs.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  try {
    // Try to fetch dynamic content
    const apiUrl = getApiBaseUrl()

    const [templatesRes, blogsRes, creatorsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/templates?limit=500`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      }),
      fetch(`${apiUrl}/blogs?limit=500`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${apiUrl}/creators?limit=500`, {
        next: { revalidate: 3600 }
      })
    ])

    let dynamicPages = []

    // Process templates
    if (templatesRes.status === 'fulfilled') {
      const templatesData = await templatesRes.value.json()
      if (templatesData.success && templatesData.templates) {
        const templatePages = templatesData.templates.map((template) => ({
          url: `${baseUrl}/templates/${template.slug || template._id}`,
          lastModified: new Date(template.updatedAt || template.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
        dynamicPages = [...dynamicPages, ...templatePages]
      }
    }

    // Process blogs
    if (blogsRes.status === 'fulfilled') {
      const blogsData = await blogsRes.value.json()
      if (blogsData.success && blogsData.blogs) {
        const blogPages = blogsData.blogs.map((blog) => ({
          url: `${baseUrl}/blog/${blog.slug}`,
          lastModified: new Date(blog.updatedAt || blog.publishedAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        }))
        dynamicPages = [...dynamicPages, ...blogPages]
      }
    }

    // Process creators
    if (creatorsRes.status === 'fulfilled') {
      const creatorsData = await creatorsRes.value.json()
      if (creatorsData.success && creatorsData.creators) {
        const creatorPages = creatorsData.creators.map((creator) => ({
          url: `${baseUrl}/creators/${creator.username || creator._id}`,
          lastModified: new Date(creator.updatedAt || creator.createdAt),
          changeFrequency: 'weekly',
          priority: 0.6,
        }))
        dynamicPages = [...dynamicPages, ...creatorPages]
      }
    }

    return [
      ...staticPages,
      ...categoryPages,
      ...dynamicPages,
    ]
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    // Fallback to static pages only
    return [
      ...staticPages,
      ...categoryPages,
    ]
  }
}
