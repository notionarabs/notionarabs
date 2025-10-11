import { siteConfig } from '../lib/seo'

export default async function sitemap() {
  const baseUrl = siteConfig.url
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

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

  // Fetch dynamic content with timeout and error handling
  let dynamicPages = []

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const [templatesRes, blogsRes, creatorsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/templates?limit=1000`, {
        signal: controller.signal,
        next: { revalidate: 3600 } // Cache for 1 hour
      }),
      fetch(`${apiUrl}/blogs?limit=1000`, {
        signal: controller.signal,
        next: { revalidate: 3600 }
      }),
      fetch(`${apiUrl}/auth/creators?limit=1000`, {
        signal: controller.signal,
        next: { revalidate: 3600 }
      })
    ])

    clearTimeout(timeoutId)

    // Process templates
    if (templatesRes.status === 'fulfilled' && templatesRes.value.ok) {
      try {
        const templatesData = await templatesRes.value.json()
        if (templatesData.success && templatesData.templates) {
          const templatePages = templatesData.templates.map((template) => ({
            url: `${baseUrl}/templates/${template.slug || template._id}`,
            lastModified: new Date(template.updatedAt || template.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7,
          }))
          dynamicPages = [...dynamicPages, ...templatePages]
        }
      } catch (e) {
        console.error('Error parsing templates:', e)
      }
    }

    // Process blogs
    if (blogsRes.status === 'fulfilled' && blogsRes.value.ok) {
      try {
        const blogsData = await blogsRes.value.json()
        if (blogsData.success && blogsData.blogs) {
          const blogPages = blogsData.blogs.map((blog) => ({
            url: `${baseUrl}/blog/${blog.slug}`,
            lastModified: new Date(blog.updatedAt || blog.publishedAt || Date.now()),
            changeFrequency: 'monthly',
            priority: 0.6,
          }))
          dynamicPages = [...dynamicPages, ...blogPages]
        }
      } catch (e) {
        console.error('Error parsing blogs:', e)
      }
    }

    // Process creators
    if (creatorsRes.status === 'fulfilled' && creatorsRes.value.ok) {
      try {
        const creatorsData = await creatorsRes.value.json()
        if (creatorsData.success && creatorsData.creators) {
          const creatorPages = creatorsData.creators.map((creator) => ({
            url: `${baseUrl}/creators/${creator.username || creator._id}`,
            lastModified: new Date(creator.updatedAt || creator.createdAt || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.6,
          }))
          dynamicPages = [...dynamicPages, ...creatorPages]
        }
      } catch (e) {
        console.error('Error parsing creators:', e)
      }
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    // Continue with static pages only if API fails
  }

  return [
    ...staticPages,
    ...categoryPages,
    ...dynamicPages,
  ]
}
