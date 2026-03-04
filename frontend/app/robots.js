import { siteConfig } from '../lib/seo'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/categories/',
          '/templates/',
          '/blog/',
          '/creators/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/profile/',
          '/settings/',
          '/purchases/',
          '/payment/',
          '/auth/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/categories/',
          '/templates/',
          '/blog/',
          '/creators/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/profile/',
          '/settings/',
          '/purchases/',
          '/payment/',
          '/auth/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/categories/',
          '/templates/',
          '/blog/',
          '/creators/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/profile/',
          '/settings/',
          '/purchases/',
          '/payment/',
          '/auth/',
        ],
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/image-sitemap.xml`
    ],
    host: siteConfig.url,
  }
}
