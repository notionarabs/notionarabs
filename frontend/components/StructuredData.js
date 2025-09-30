import { siteConfig } from '../lib/seo'

// Organization structured data
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/logo.png`,
    "description": siteConfig.description,
    "sameAs": [
      "https://twitter.com/notionarabs",
      "https://github.com/notionarabs",
      "https://youtube.com/@notionarabs"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@notionarabs.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SA",
      "addressRegion": "Riyadh"
    },
    "founder": {
      "@type": "Person",
      "name": "Hazem Yasser"
    },
    "foundingDate": "2024",
    "inLanguage": ["ar", "en"]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Website structured data
export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "inLanguage": "ar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/templates?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "url": siteConfig.url
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Template structured data
export function TemplateSchema({ template }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": template.title,
    "description": template.description,
    "url": `${siteConfig.url}/templates/${template.slug || template._id}`,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": template.price || 0,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Person",
      "name": template.creator?.name || "Unknown Creator",
      "url": template.creator?.username ? `${siteConfig.url}/creators/${template.creator.username}` : undefined
    },
    "datePublished": template.createdAt,
    "dateModified": template.updatedAt,
    "aggregateRating": template.rating ? {
      "@type": "AggregateRating",
      "ratingValue": template.rating,
      "ratingCount": template.reviews || template.downloads || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "downloadUrl": template.notionLink,
    "screenshot": template.previewImage,
    "keywords": template.tags?.join(", ") || template.category,
    "inLanguage": "ar"
  }

  // Remove undefined values
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key]
    }
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Blog post structured data
export function BlogPostSchema({ blog }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.description,
    "url": `${siteConfig.url}/blog/${blog.slug}`,
    "datePublished": blog.publishedAt,
    "dateModified": blog.updatedAt || blog.publishedAt,
    "author": {
      "@type": "Person",
      "name": blog.author?.name || "Unknown Author",
      "url": blog.author?.username ? `${siteConfig.url}/creators/${blog.author.username}` : undefined
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "url": siteConfig.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/logo.png`
      }
    },
    "image": blog.featuredImage,
    "keywords": blog.tags?.join(", ") || blog.category,
    "articleSection": blog.category,
    "wordCount": blog.content?.length || 0,
    "inLanguage": "ar"
  }

  // Remove undefined values
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined) {
      delete schema[key]
    }
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Creator structured data
export function CreatorSchema({ creator }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": creator.name,
    "description": creator.bio,
    "url": `${siteConfig.url}/creators/${creator.username || creator._id}`,
    "image": creator.profilePicture,
    "jobTitle": "Notion Template Creator",
    "worksFor": {
      "@type": "Organization",
      "name": siteConfig.name
    },
    "sameAs": [
      creator.socialLinks?.twitter,
      creator.socialLinks?.linkedin,
      creator.socialLinks?.github
    ].filter(Boolean),
    "knowsAbout": creator.specialty || creator.bio?.split(' ').slice(0, 5).join(' '),
    "inLanguage": "ar"
  }

  // Remove undefined values
  Object.keys(schema).forEach(key => {
    if (schema[key] === undefined || (Array.isArray(schema[key]) && schema[key].length === 0)) {
      delete schema[key]
    }
  })

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Breadcrumb structured data
export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
