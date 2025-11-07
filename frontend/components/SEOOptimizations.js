import React from 'react';
import Image from 'next/image';

// SEO optimization components and utilities

import Script from 'next/script';

// Google Analytics component - optimized to prevent render blocking
export function GoogleAnalytics({ GA_TRACKING_ID }) {
  // Use the provided ID or fallback to the hardcoded one
  const trackingId = GA_TRACKING_ID || 'G-CE8V1ZYCC7';

  if (!trackingId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}', {
              page_path: window.location.pathname,
              // Use first-party cookies (GA4 default, but explicitly set)
              cookie_flags: 'SameSite=Lax;Secure',
              // Respect user privacy preferences
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              // Use first-party cookie domain (current domain)
              cookie_domain: 'auto',
              // Disable third-party cookie usage
              send_page_view: true,
            });
          `,
        }}
      />
    </>
  );
}

// Google Search Console verification
export function GoogleSearchConsole() {
  const verificationCode = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  if (!verificationCode) return null;

  return (
    <meta name="google-site-verification" content={verificationCode} />
  );
}

// Performance monitoring - deferred to prevent render blocking
export function PerformanceMonitoring() {
  return (
    <Script
      id="performance-monitoring"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          // Core Web Vitals monitoring
          function vitals(metric) {
            if (metric.delta < 0) return;
            if (typeof gtag !== 'undefined') {
              gtag('event', metric.name, {
                value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
                event_category: 'Web Vitals',
                event_label: metric.id,
                non_interaction: true,
              });
            }
          }
          
          // Load web-vitals library
          import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
            getCLS(vitals);
            getFID(vitals);
            getFCP(vitals);
            getLCP(vitals);
            getTTFB(vitals);
          });
        `,
      }}
    />
  );
}

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sizes
  generateSizes: (baseWidth) => {
    const sizes = [
      { width: 320, suffix: 'xs' },
      { width: 640, suffix: 'sm' },
      { width: 768, suffix: 'md' },
      { width: 1024, suffix: 'lg' },
      { width: 1280, suffix: 'xl' },
      { width: 1536, suffix: '2xl' }
    ];

    return sizes.filter(size => size.width <= baseWidth * 1.5);
  },

  // Generate srcSet for responsive images
  generateSrcSet: (imageUrl, sizes) => {
    return sizes
      .map(size => `${imageUrl}?w=${size.width} ${size.width}w`)
      .join(', ');
  },

  // Generate blur placeholder
  generateBlurDataURL: (width = 10, height = 10) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL();
  }
};

// Lazy loading utility
export function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// SEO-friendly image component
export function SEOImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}) {
  const imgRef = React.useRef();
  const { hasIntersected } = useIntersectionObserver(imgRef, { threshold: 0.1 });

  return (
    <div ref={imgRef} className={className}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={imageOptimization.generateBlurDataURL(width, height)}
        loading={priority ? 'eager' : 'lazy'}
        {...props}
      />
    </div>
  );
}

// Canonical URL component
export function CanonicalURL({ url }) {
  const canonicalUrl = url ? `${process.env.NEXT_PUBLIC_SITE_URL}${url}` : process.env.NEXT_PUBLIC_SITE_URL;

  return <link rel="canonical" href={canonicalUrl} />;
}

// Hreflang component for multilingual support
export function HreflangLinks({ currentPath = '' }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.notionarabs.com';

  return (
    <>
      <link rel="alternate" hrefLang="ar" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="ar-SA" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${currentPath}`} />
    </>
  );
}

// Schema.org markup helper
export function generateSchemaMarkup(type, data) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return JSON.stringify(baseSchema);
}

// Twitter Card meta tags for X.com
export function TwitterCardMeta({
  title,
  description,
  image,
  site = '@notionarabs',
  creator = '@notionarabs'
}) {
  const baseUrl = 'https://www.notionarabs.com';
  const imageUrl = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-image.png`;

  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={site} />
      <meta name="twitter:creator" content={creator} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={title} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
    </>
  );
}