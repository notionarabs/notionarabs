import React from 'react';
import Image from 'next/image';

// SEO optimization components and utilities

// Google Analytics component
export function GoogleAnalytics({ GA_TRACKING_ID }) {
  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}');
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

// Performance monitoring
export function PerformanceMonitoring() {
  return (
    <script
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <link rel="alternate" hrefLang="ar" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="ar-SA" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${currentPath}`} />
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
