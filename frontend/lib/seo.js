// SEO utility functions for عرب نوشن
import { getCategorySlug } from './categoryMapping';

export const siteConfig = {
  name: 'عرب نوشن',
  title: 'عرب نوشن | Notion Arabs - المجتمع والمنصة العربية الأولى لقوالب نوشن',
  description: 'عرب نوشن (Notion Arabs) هي الوجهة والمجتمع العربي الأول المتخصص في قوالب نوشن الإبداعية، وتمكين صناع المحتوى والمبدعين العرب من مشاركة أعمالهم وتطوير إنتاجيتهم باستخدام Notion.',
  url: 'https://www.notionarabs.com',
  ogImage: '/images/og-image.png',
  creator: '@notionarabs',
  keywords: [
    'مجتمع نوشن العربي',
    'نوشن العرب',
    'قوالب نوشن إبداعية',
    'متجر نوشن العربي',
    'أدوات إنتاجية',
    'تعلم نوشن بالعربي',
    'صناع القوالب العرب',
    'تحميل قوالب نوشن',
    'مبدعين عرب',
    'notion templates arabic',
    'قوالب عربية مجانية',
    'أفضل قوالب نوشن',
    'مبدعون نوشن'
  ],
  locale: 'ar_EG',
  currency: 'EGP',
  currencySymbol: 'ج.م',
  twitter: {
    handle: '@notionarabs',
    site: '@notionarabs',
    cardType: 'summary_large_image',
  }
};

// Utility function to get absolute image URL
export function getAbsoluteImageUrl(imageUrl) {
  if (!imageUrl) return `${siteConfig.url}/images/og-image.png`;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;

  const backendUrl = 'https://notion-arabs-fe5b3f214071.herokuapp.com';
  const trimmed = imageUrl.trim();
  const separator = trimmed.startsWith('/') ? '' : '/';

  // If it's an uploaded file (usually in /uploads or similar)
  if (trimmed.includes('uploads/')) {
    return `${backendUrl}${separator}${trimmed}`;
  }

  // Otherwise assume it's a public asset on the frontend
  return `${siteConfig.url}${separator}${trimmed}`;
}

// Utility function to add cache-busting (LEGACY)
function addCacheBuster(imageUrl) {
  return imageUrl;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  noindex = false,
  canonical,
  ogType,
  section
}) {
  const fullTitle = title 
    ? (title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`) 
    : siteConfig.title;
  const fullDescription = description || siteConfig.description;
  const fullKeywords = Array.isArray(keywords) 
    ? [...siteConfig.keywords, ...keywords].join(', ')
    : `${siteConfig.keywords.join(', ')}, ${keywords}`;
  const fullImage = image 
    ? getAbsoluteImageUrl(image)
    : getAbsoluteImageUrl(siteConfig.ogImage);
  const fullUrl = url ? (url.startsWith('http') ? url : `${siteConfig.url}${url}`) : siteConfig.url;

  const metadata = {
    title: title ? title : siteConfig.title,
    description: fullDescription,
    keywords: fullKeywords,
    authors: authors ? authors.map(author => ({ name: author })) : [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonical || fullUrl,
      languages: {
        'ar-EG': fullUrl,
        'ar': fullUrl,
        'x-default': fullUrl,
      },
    },
    openGraph: {
      type: ogType || type,
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: fullImage.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
      ...(section && { section }),
    },
    twitter: {
      card: siteConfig.twitter.cardType,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.handle,
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      nocache: true,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    other: {
      'apple-mobile-web-app-title': siteConfig.name,
    }
  };

  // Only add template in root layout or if explicitly needed
  if (!title) {
    metadata.title = {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    };
  }

  return metadata;
}

// Template-specific SEO metadata
export function generateTemplateMetadata(template) {
  const isPaid = template.isPaid || false;
  const isVerified = template.creator?.badges?.some(b => b.type === 'verified');
  const creatorName = template.creator?.name || 'مبدع';

  const cleanNoise = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return String(str);
    return str
      .replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, ' ')
      .replace(/[\\[\]"\/]{2,}/g, ' ')
      .replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '')
      .trim();
  };

  const title = `${cleanNoise(template.title)} - قالب نوشن عربي ${isPaid ? 'مدفوع' : 'مجاني'}${isVerified ? ' (من مبدع معتمد)' : ''}`;
  const description = cleanNoise(template.description) || `تحميل قالب ${cleanNoise(template.title)} باللغة العربية لـ Notion. ${template.category} ${isPaid ? 'مدفوع' : 'مجاني'} من ${creatorName}${isVerified ? ' المعتمد' : ''}.`;

  const keywords = [
    template.title,
    template.category,
    'قالب نوشن',
    'notion template',
    creatorName,
    ...(template.tags || []),
    isPaid ? 'مدفوع' : 'مجاني',
    'عربي'
  ];

  if (isVerified) keywords.push('مبدع معتمد');

  // Enhanced metadata with additional SEO fields
  const metadata = generateMetadata({
    title,
    description,
    keywords,
    image: getAbsoluteImageUrl(template.previewImage),
    url: `/templates/${template.slug || template._id}`,
    type: 'article',
    publishedTime: template.createdAt,
    modifiedTime: template.updatedAt,
    authors: creatorName ? [creatorName] : undefined,
  });

  // Add additional structured metadata for better SEO
  return {
    ...metadata,
    // Add breadcrumb structured data support
    breadcrumbs: [
      { label: 'الرئيسية', url: '/' },
      { label: 'القوالب', url: '/templates' },
      { label: template.category || 'عام', url: `/categories/${getCategorySlug(template.category || 'عام')}` },
      { label: template.title },
    ],
    // Add rating information for rich results
    price: isPaid && template.price ? `${template.price} ${siteConfig.currencySymbol}` : undefined,
  };
}

// Generate JSON-LD Structured Data for Template (Product)
export function generateTemplateSchema(template) {
  const isPaid = template.isPaid || false;
  const creatorName = template.creator?.name || 'مبدع';
  const fullImage = getAbsoluteImageUrl(template.previewImage);
  const url = `${siteConfig.url}/templates/${template.slug || template._id}`;
  
  // Clean the description to remove database artifacts
  const cleanNoise = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return String(str);
    return str
      .replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, ' ')
      .replace(/[\\[\]"\/]{2,}/g, ' ')
      .replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '')
      .trim();
  };

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': cleanNoise(template.title),
    'image': [fullImage],
    'description': cleanNoise(template.description || template.title),
    'sku': template._id || template.id,
    'mpn': template._id || template.id,
    'brand': {
      '@type': 'Brand',
      'name': 'عرب نوشن',
    },
    'offers': {
      '@type': 'Offer',
      'url': url,
      'priceCurrency': siteConfig.currency,
      'price': isPaid ? (template.price || 0) : 0,
      'availability': 'https://schema.org/InStock',
    },
    'category': template.category || 'Notion Templates',
  };

  // Add Aggregate Rating if available
  if (template.rating && template.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': template.rating,
      'reviewCount': template.reviewsCount || 1,
      'bestRating': '5',
      'worstRating': '1',
    };
  }

  // Add Creator as Performer/Author
  schema.author = {
    '@type': 'Person',
    'name': creatorName,
    'url': template.creator?.username ? `${siteConfig.url}/creators/${template.creator.username}` : undefined
  };

  return schema;
}

// Generate JSON-LD Structured Data for Creator Profile
export function generateCreatorSchema(creator) {
  const displayName = creator.displayName || creator.name;
  const fullImage = getAbsoluteImageUrl(creator.profilePicture);
  const url = `${siteConfig.url}/creators/${creator.username || creator._id}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    'mainEntity': {
      '@type': 'Person',
      'name': displayName,
      'description': creator.bio || creator.experience || siteConfig.description,
      'image': fullImage,
      'url': url,
      'jobTitle': 'مبدع قوالب نوشن / Notion Creator',
      'knowsAbout': ['Notion', 'Productivity', 'Digital Organization', ...(creator.specialties || [])],
      'sameAs': [
        creator.twitter && (creator.twitter.startsWith('http') ? creator.twitter : `https://twitter.com/${creator.twitter}`),
        creator.youtube && (creator.youtube.startsWith('http') ? creator.youtube : `https://youtube.com/@${creator.youtube}`),
        creator.linkedin && (creator.linkedin.startsWith('http') ? creator.linkedin : `https://linkedin.com/in/${creator.linkedin}`),
        creator.website
      ].filter(Boolean)
    }
  };
}

// Generate JSON-LD Structured Data for Blog Post
export function generateBlogSchema(blog) {
  const fullImage = getAbsoluteImageUrl(blog.featuredImage);
  const url = `${siteConfig.url}/blog/${blog.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'description': blog.excerpt || blog.description,
    'image': [fullImage],
    'datePublished': blog.publishedAt || blog.createdAt,
    'dateModified': blog.updatedAt || blog.publishedAt || blog.createdAt,
    'author': {
      '@type': 'Person',
      'name': blog.author?.name || 'عرب نوشن',
      'url': blog.author?.username ? `${siteConfig.url}/creators/${blog.author.username}` : siteConfig.url
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'عرب نوشن',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteConfig.url}/brand/NotionLogo.png`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

// Blog-specific SEO metadata
export function generateBlogMetadata(blog) {
  const title = blog.title;
  const description = blog.excerpt || blog.description || `اقرأ مقال ${blog.title} من ${blog.author?.name || 'مبدع'} على عرب نوشن.`;

  const keywords = [
    blog.title,
    blog.category,
    'مقال',
    'blog',
    'نصائح',
    blog.author?.name,
    ...(blog.tags || []),
    'notion',
    'إنتاجية'
  ];

  // Try to find an image in the content if featuredImage is missing
  let seoImage = blog.featuredImage || extractFirstImage(blog.content);

  return generateMetadata({
    title,
    description,
    keywords,
    image: seoImage || '/images/blog-fallback.png',
    url: `/blog/${blog.slug}`,
    type: 'article',
    publishedTime: blog.publishedAt,
    modifiedTime: blog.updatedAt,
    authors: blog.author?.name ? [blog.author.name] : undefined,
  });
}

// Creator-specific SEO metadata
export function generateCreatorMetadata(creator) {
  const isVerified = creator.badges?.some(b => b.type === 'verified');
  const displayName = creator.displayName || creator.name;
  const title = `${displayName}${isVerified ? ' ✔️' : ''} - مبدع قوالب نوشن${isVerified ? ' معتمد' : ''}`;
  const description = creator.bio || creator.experience || `تعرف على ${displayName}، مبدع قوالب Notion باللغة العربية${isVerified ? ' المعتمد' : ''}. ${creator.templateCount || creator.templates || 0} قالب متاح.`;

  const keywords = [
    displayName,
    'مبدع',
    'creator',
    'قوالب نوشن',
    'notion templates',
    'عربي',
    isVerified && 'مبدع معتمد',
    ...(creator.specialties || []),
    creator.specialty || creator.bio?.split(' ').slice(0, 3).join(' ')
  ].filter(Boolean);

  return generateMetadata({
    title,
    description,
    keywords,
    image: getAbsoluteImageUrl(creator.profilePicture),
    url: `/creators/${creator.username || creator._id}`,
    type: 'profile',
  });
}

// Category-specific SEO metadata
export function generateCategoryMetadata(category, count = 0, englishSlug = null) {
  const title = `${category} - قوالب نوشن`;
  const description = `اكتشف أفضل قوالب ${category} باللغة العربية لـ Notion. ${count} قالب متاح للتحميل المجاني.`;

  const keywords = [
    category,
    'قوالب',
    'templates',
    'notion',
    'عربي',
    'مجاني',
    'تحميل'
  ];

  // Use provided English slug, or get it from category name
  // This ensures canonical URLs always use English slugs
  const categorySlug = englishSlug || getCategorySlug(category);
  const canonicalUrl = `/categories/${categorySlug}`;

  return generateMetadata({
    title,
    description,
    keywords,
    url: canonicalUrl,
    canonical: canonicalUrl, // Explicitly set canonical to ensure it's always the English version
  });
}
// Utility to extract the first image from HTML content
export function extractFirstImage(content) {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch && imgMatch[1] ? imgMatch[1] : null;
}
