import { siteConfig } from '../../lib/seo'

export async function GET() {
  const baseUrl = siteConfig.url
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

  let images = []

  try {
    // Fetch templates with images
    const templatesRes = await fetch(`${apiUrl}/templates?limit=1000`, {
      next: { revalidate: 3600 }
    })

    if (templatesRes.ok) {
      const templatesData = await templatesRes.json()
      if (templatesData.success && templatesData.templates) {
        const templateImages = templatesData.templates
          .filter(t => t.previewImage)
          .map(template => {
            const imageUrl = template.previewImage.startsWith('http')
              ? template.previewImage
              : `${baseUrl}${template.previewImage}`

            return `
    <url>
      <loc>${baseUrl}/templates/${template.slug || template._id}</loc>
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:caption>${template.title} - قالب نوشن عربي</image:caption>
        <image:title>${template.title}</image:title>
        <image:geo_location>Saudi Arabia</image:geo_location>
      </image:image>
    </url>`
          })
        images = [...images, ...templateImages]
      }
    }

    // Fetch creators with profile pictures
    const creatorsRes = await fetch(`${apiUrl}/auth/creators?limit=1000`, {
      next: { revalidate: 3600 }
    })

    if (creatorsRes.ok) {
      const creatorsData = await creatorsRes.json()
      if (creatorsData.success && creatorsData.creators) {
        const creatorImages = creatorsData.creators
          .filter(c => c.profilePicture)
          .map(creator => {
            const imageUrl = creator.profilePicture.startsWith('http')
              ? creator.profilePicture
              : `${baseUrl}${creator.profilePicture}`

            const displayName = creator.displayName || creator.name

            return `
    <url>
      <loc>${baseUrl}/creators/${creator.username || creator._id}</loc>
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:caption>${displayName} - مبدع قوالب نوشن</image:caption>
        <image:title>${displayName}</image:title>
        <image:geo_location>Saudi Arabia</image:geo_location>
      </image:image>
    </url>`
          })
        images = [...images, ...creatorImages]
      }
    }

    // Fetch blogs with featured images
    const blogsRes = await fetch(`${apiUrl}/blogs?limit=1000`, {
      next: { revalidate: 3600 }
    })

    if (blogsRes.ok) {
      const blogsData = await blogsRes.json()
      if (blogsData.success && blogsData.blogs) {
        const blogImages = blogsData.blogs
          .filter(b => b.featuredImage)
          .map(blog => {
            const imageUrl = blog.featuredImage.startsWith('http')
              ? blog.featuredImage
              : `${baseUrl}${blog.featuredImage}`

            return `
    <url>
      <loc>${baseUrl}/blog/${blog.slug}</loc>
      <image:image>
        <image:loc>${imageUrl}</image:loc>
        <image:caption>${blog.title}</image:caption>
        <image:title>${blog.title}</image:title>
        <image:geo_location>Saudi Arabia</image:geo_location>
      </image:image>
    </url>`
          })
        images = [...images, ...blogImages]
      }
    }
  } catch (error) {
    console.error('Error generating image sitemap:', error)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${images.join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

