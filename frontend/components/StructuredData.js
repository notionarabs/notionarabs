import { siteConfig } from '../lib/seo'

// Organization structured data
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "alternateName": ["Notion Arabs", "Notion Arabia", "عرب نوشن", "نوشن العرب"],
    "url": siteConfig.url,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteConfig.url}/icons/icon-512x512.png`,
      "width": 512,
      "height": 512
    },
    "image": `${siteConfig.url}/images/og-image.png`,
    "description": "عرب نوشن (Notion Arabs) هي المنصة والمجتمع العربي الرائد لتبادل قوالب نوشن الإبداعية، ودعم المبدعين العرب في تطوير أدواتهم الإنتاجية.",
    "sameAs": [
      "https://twitter.com/notionarabs",
      "https://github.com/notionarabs",
      "https://youtube.com/@notionarabs",
      "https://facebook.com/notionarabs",
      "https://instagram.com/notionarabs"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@notionarabs.com",
      "availableLanguage": ["Arabic", "English"]
    },
    "founder": {
      "@type": "Person",
      "name": "Hazem Yasser"
    },
    "foundingDate": "2024-01-01",
    "knowsAbout": ["Notion", "Productivity", "Community Building", "Creative Templates"],
    "areaServed": "Arab World"
  }

  return (
    <script
      type="application/ld+json"
      id="organization-schema"
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
    }
  }

  return (
    <script
      type="application/ld+json"
      id="website-schema"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Template structured data (for paid templates, uses Product schema; for free, uses SoftwareApplication)
export function TemplateSchema({ template }) {
  const isPaid = template.isPaid || false;
  const baseUrl = siteConfig.url;
  const templateId = template.slug || template._id;
  const templatePath = `/templates/${templateId}`;
  const fullUrl = `${baseUrl}${templatePath}`;
  
  // Use Product schema for paid templates for better e-commerce SEO
  const schema = isPaid ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": template.title,
    "description": template.description || template.features || `قالب ${template.title} - قالب نوشن احترافي`,
    "image": [template.previewImage ? (template.previewImage.startsWith('http') ? template.previewImage : `${baseUrl}${template.previewImage}`) : `${baseUrl}/images/og-image.png`],
    "brand": {
      "@type": "Brand",
      "name": siteConfig.name
    },
    "offers": {
      "@type": "Offer",
      "price": template.price || 0,
      "priceCurrency": siteConfig.currency || "EGP",
      "availability": "https://schema.org/InStock",
      "url": fullUrl,
      "seller": {
        "@type": "Organization",
        "name": siteConfig.name
      },
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    },
    "aggregateRating": template.rating ? {
      "@type": "AggregateRating",
      "ratingValue": template.rating,
      "reviewCount": template.reviewsCount || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "category": template.category,
    "sku": template._id,
    "url": fullUrl,
    "inLanguage": "ar"
  } : {
    // SoftwareApplication schema for free templates
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": template.title,
    "description": template.description || template.features || `قالب ${template.title} - قالب نوشن مجاني`,
    "url": fullUrl,
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": siteConfig.currency || "EGP",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Person",
      "name": template.creator?.name || "مبدع",
      "url": template.creator?.username ? `${baseUrl}/creators/${template.creator.username}` : undefined
    },
    "datePublished": template.createdAt,
    "dateModified": template.updatedAt,
    "aggregateRating": template.rating ? {
      "@type": "AggregateRating",
      "ratingValue": template.rating,
      "reviewCount": template.reviewsCount || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "inLanguage": "ar"
  }

  return (
    <script
      type="application/ld+json"
      id={`template-schema-${template._id}`}
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

// FAQ structured data for support/help pages
export function FAQSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Collection/ItemList structured data for template listings
export function ItemListSchema({ items, listName = 'قوالب نوشن' }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": item.isPaid ? "Product" : "SoftwareApplication",
        "name": item.title,
        "url": `${siteConfig.url}/templates/${item.slug || item._id}`,
        "image": item.previewImage,
        "description": item.description,
        ...(item.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": item.rating,
            "bestRating": 5
          }
        })
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
// Video structured data
export function VideoSchema({ video }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": [video.thumbnailUrl],
    "uploadDate": video.uploadDate || "2024-01-01T08:00:00+08:00",
    "embedUrl": video.embedUrl,
    "contentUrl": video.contentUrl,
    "duration": video.duration,
    "interactionStatistic": video.views ? {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views
    } : undefined,
    "regionsAllowed": "ALL"
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
