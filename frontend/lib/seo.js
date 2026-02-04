// SEO utility functions for عرب نوشن
import { getCategorySlug } from './categoryMapping';

export const siteConfig = {
  name: 'عرب نوشن',
  title: 'عرب نوشن - خدمات نوشن وأنظمة عمل مخصصة',
  description: 'نصمم أنظمة نوشن عربية مخصصة للشركات والفرق، مع متجر قوالب ومبدعين لمساعدتك على التنظيم والأتمتة والنمو.',
  url: 'https://www.notionarabs.com',
  ogImage: '/og-image.png',
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
  currency: 'SAR', // Saudi Riyal (used for pricing)
  currencySymbol: 'ر.س'
};

// Utility function to add cache-busting parameter to image URLs
function addCacheBuster(imageUrl, timestamp) {
  if (!imageUrl) return imageUrl;

  const cacheBuster = timestamp || Date.now();
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}v=${cacheBuster}`;
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
  const fullImage = image || `${siteConfig.url}/og-image.png`;
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
      images: {
        url: fullImage,
        alt: fullTitle,
      },
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

  // Ensure image URL is absolute for templates and add cache-busting
  let imageUrl = template.previewImage;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${siteConfig.url}${imageUrl}`;
  }

  // Add cache-busting parameter to force social media refresh when template is updated
  if (imageUrl) {
    imageUrl = addCacheBuster(imageUrl, template.updatedAt || template._id);
  }

  // Enhanced metadata with additional SEO fields
  const metadata = generateMetadata({
    title,
    description,
    keywords,
    image: imageUrl || `${siteConfig.url}${siteConfig.ogImage}`,
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

  // Ensure image URL is absolute for blogs and add cache-busting
  let imageUrl = blog.featuredImage;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('https')) {
    // If it starts with /, it's relative to root, otherwise we might need to add it
    const separator = imageUrl.startsWith('/') ? '' : '/';
    imageUrl = `${siteConfig.url}${separator}${imageUrl}`;
  }

  // Add cache-busting parameter to force social media refresh when blog is updated
  if (imageUrl) {
    imageUrl = addCacheBuster(imageUrl, blog.updatedAt || blog._id);
  }

  return generateMetadata({
    title,
    description,
    keywords,
    image: imageUrl || `${siteConfig.url}${siteConfig.ogImage}`,
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

  // Ensure image URL is absolute for creators and add cache-busting
  let imageUrl = creator.profilePicture;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `${siteConfig.url}${imageUrl}`;
  }

  // Add cache-busting parameter to force social media refresh when profile is updated
  if (imageUrl) {
    imageUrl = addCacheBuster(imageUrl, creator.updatedAt || creator._id);
  }

  return generateMetadata({
    title,
    description,
    keywords,
    image: imageUrl || `${siteConfig.url}${siteConfig.ogImage}`,
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
