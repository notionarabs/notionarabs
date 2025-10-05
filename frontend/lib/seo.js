// SEO utility functions for عرب نوشن
export const siteConfig = {
  name: 'عرب نوشن',
  title: 'عرب نوشن - قوالب نوشن باللغة العربية',
  description: 'اكتشف وبيع قوالب نوشن باللغة العربية - منصة مخصصة للمبدعين والمشترين العرب',
  url: 'https://www.notionarabs.com',
  ogImage: '/og-image.jpg',
  creator: '@notionarabs',
  keywords: [
    'قوالب نوشن',
    'notion templates',
    'قوالب عربية',
    'منظمات',
    'إنتاجية',
    'دراسة',
    'أعمال',
    'templates arabic',
    'notion arabic',
    'قوالب مجانية'
  ],
  locale: 'ar_SA',
  alternateLocales: ['en_US']
};

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
  const fullImage = image || `${siteConfig.url}${siteConfig.ogImage}`;
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
        'ar-SA': fullUrl,
        'en-US': fullUrl,
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
      images: [fullImage],
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
  const title = `${template.title} - قالب نوشن عربي`;
  const description = template.description || `تحميل قالب ${template.title} باللغة العربية لـ Notion. ${template.category} مجاني من ${template.creator?.name || 'مبدع'}.`;

  const keywords = [
    template.title,
    template.category,
    'قالب نوشن',
    'notion template',
    template.creator?.name,
    ...(template.tags || []),
    'مجاني',
    'عربي'
  ];

  return generateMetadata({
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

  return generateMetadata({
    title,
    description,
    keywords,
    image: blog.featuredImage,
    url: `/blog/${blog.slug}`,
    type: 'article',
    publishedTime: blog.publishedAt,
    modifiedTime: blog.updatedAt,
    authors: blog.author?.name ? [blog.author.name] : undefined,
  });
}

// Creator-specific SEO metadata
export function generateCreatorMetadata(creator) {
  const title = `${creator.name} - مبدع قوالب نوشن`;
  const description = creator.bio || `تعرف على ${creator.name}، مبدع قوالب Notion باللغة العربية. ${creator.templates || 0} قالب متاح.`;

  const keywords = [
    creator.name,
    'مبدع',
    'creator',
    'قوالب نوشن',
    'notion templates',
    'عربي',
    creator.specialty || creator.bio?.split(' ').slice(0, 3).join(' ')
  ];

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
export function generateCategoryMetadata(category, count = 0) {
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

  return generateMetadata({
    title,
    description,
    keywords,
    url: `/categories/${encodeURIComponent(category)}`,
  });
}
