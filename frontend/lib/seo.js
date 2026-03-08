// SEO utility functions for عرب نوشن
import { getCategorySlug } from './categoryMapping';

export const siteConfig = {
  name: 'عرب نوشن',
  title: 'عرب نوشن | Notion Arabs - خدمات نوشن وأنظمة عمل مخصصة',
  description: 'عرب نوشن (Notion Arabs) هي المنصة الرائدة والأولى في العالم العربي لمتجر قوالب نوشن وتقديم استشارات بناء أنظمة عمل مخصصة للشركات والأفراد.',
  url: 'https://www.notionarabs.com',
  ogImage: '/images/og-image.png',
  creator: '@notionarabs',
  keywords: [
    'خدمات نوشن',
    'أنظمة نوشن',
    'استشارات نوشن',
    'تصميم قواعد بيانات نوشن',
    'أتمتة نوشن',
    'إدارة العمليات',
    'إنتاجية',
    'قوالب نوشن',
    'notion templates',
    'قوالب عربية',
    'notion arabic',
    'قوالب مجانية'
  ],
  locale: 'ar_EG',
  currency: 'EGP', // Egyptian Pound (used for pricing)
  currencySymbol: 'ج.م'
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
  canonical
}) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const fullDescription = description || siteConfig.description;
  const fullKeywords = [...siteConfig.keywords, ...keywords].join(', ');
  const fullImage = getAbsoluteImageUrl(image);
  const fullUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;

  const metadata = {
    title: fullTitle,
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
      type,
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
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.creator,
      creator: siteConfig.creator,
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: fullImage,
          alt: fullTitle,
        }
      ],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };

  return metadata;
}

// Template-specific SEO metadata
export function generateTemplateMetadata(template) {
  const isPaid = template.isPaid || false;
  const title = `${template.title} - قالب نوشن عربي ${isPaid ? 'مدفوع' : 'مجاني'}`;
  const description = template.description || `تحميل قالب ${template.title} باللغة العربية لـ Notion. ${template.category} ${isPaid ? 'مدفوع' : 'مجاني'} من ${template.creator?.name || 'مبدع'}.`;

  const keywords = [
    template.title,
    template.category,
    'قالب نوشن',
    'notion template',
    template.creator?.name,
    ...(template.tags || []),
    isPaid ? 'مدفوع' : 'مجاني',
    'عربي'
  ];

  // Enhanced metadata with additional SEO fields
  const metadata = generateMetadata({
    title,
    description,
    keywords,
    image: template.previewImage,
    url: `/templates/${template.slug || template._id}`,
    type: 'article',
    publishedTime: template.createdAt,
    modifiedTime: template.updatedAt,
    authors: template.creator?.name ? [template.creator.name] : undefined,
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
    rating: template.rating,
    reviewsCount: template.reviewsCount,
    // Add price information for e-commerce SEO
    price: isPaid && template.price ? `${template.price} ${siteConfig.currencySymbol}` : undefined,
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
  const displayName = creator.displayName || creator.name;
  const title = `${displayName} - مبدع قوالب نوشن`;
  const description = creator.bio || creator.experience || `تعرف على ${displayName}، مبدع قوالب Notion باللغة العربية. ${creator.templateCount || creator.templates || 0} قالب متاح.`;

  const keywords = [
    displayName,
    'مبدع',
    'creator',
    'قوالب نوشن',
    'notion templates',
    'عربي',
    ...(creator.specialties || []),
    creator.specialty || creator.bio?.split(' ').slice(0, 3).join(' ')
  ].filter(Boolean);

  return generateMetadata({
    title,
    description,
    keywords,
    image: creator.profilePicture,
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
