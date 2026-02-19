const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^.*\/api\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10 // fall back to cache if api does not response within 10 seconds
      }
    }
  ]
});

const isDev = process.env.NODE_ENV !== 'production';

// Extra connect-src origins allowed in development (local backend)
const devConnectSrc = isDev
  ? ' http://127.0.0.1:5000 http://localhost:5000'
  : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'framer-motion'],
    // Enable modern bundling optimizations
    esmExternals: true,
  },
  turbopack: {},
  // Enable modern JavaScript output
  outputFileTracingIncludes: {
    '/': ['./public/**/*'],
  },
  // External packages for server components
  serverExternalPackages: ['mongoose', 'bcryptjs'],
  // Source maps configuration
  // Disable source maps in production for security and performance
  // Enable in development for better debugging
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Enable image optimization
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable lazy loading by default for offscreen images
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notionarabs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'notionarabs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      // Backend server domains
      {
        protocol: 'https',
        hostname: 'notion-arabs.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'notion-arabs.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'notion-arabs-fe5b3f214071.herokuapp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'notion-arabs-fe5b3f214071.herokuapp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.notionarabs.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'api.notionarabs.com',
        port: '',
        pathname: '/**',
      },
      // Development/localhost support
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // Remove React properties in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  // SWC minify is now default in Next.js, no need to specify
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  trailingSlash: false,
  // Generate ETags for better caching
  generateEtags: true,
  // Optimize page loading
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Enable static optimization
  staticPageGenerationTimeout: 1000,
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    // Note: Next.js handles devtool automatically in development mode
    // Manually setting it causes performance regressions

    // Optimize bundle splitting for better code splitting and tree shaking
    if (!dev && !isServer) {
      // Enable tree shaking and minification
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.providedExports = true;
      config.optimization.concatenateModules = true;

      // Enable CSS minification
      config.optimization.minimize = true;

      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            enforce: true,
          },
          // Separate large libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-dom-server)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
            enforce: true,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react)[\\/]/,
            name: 'ui',
            priority: 15,
            chunks: 'all',
            enforce: true,
          },
          // Form libraries
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|@hookform)[\\/]/,
            name: 'forms',
            priority: 12,
            chunks: 'all',
            enforce: true,
          },
          // Query libraries
          query: {
            test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
            name: 'query',
            priority: 12,
            chunks: 'all',
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
      };

      // Enable modern JavaScript output (ES2020+)
      config.output.environment = {
        ...config.output.environment,
        arrowFunction: true,
        bigIntLiteral: true,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true,
      };

      // Set target to modern browsers to avoid legacy JS
      config.target = ['web', 'es2020'];

      // Optimize module resolution for better tree shaking
      config.resolve.mainFields = ['module', 'main'];
    }

    return config;
  },
  async headers() {
    const cspNonEmbed = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      `connect-src 'self' https://api.notionarabs.com https://notionarabs.com https://notion-arabs-fe5b3f214071.herokuapp.com https://api.brevo.com https://www.google-analytics.com https://www.googletagmanager.com https://api.alquran.cloud https://cdn.islamic.network https://cdn.alquran.cloud https://server8.mp3quran.net https://server6.mp3quran.net https://server7.mp3quran.net https://server10.mp3quran.net https://server12.mp3quran.net https://download.quranicaudio.com https://cdn.jsdelivr.net${devConnectSrc}`,
      "media-src 'self' https://cdn.islamic.network https://cdn.alquran.cloud https://server8.mp3quran.net https://server6.mp3quran.net https://server7.mp3quran.net https://server10.mp3quran.net https://server12.mp3quran.net https://download.quranicaudio.com",
      "frame-src 'self' https://notionarabs.com https://www.notionarabs.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join('; ');

    const cspEmbed = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      `connect-src 'self' https://api.notionarabs.com https://notionarabs.com https://notion-arabs-fe5b3f214071.herokuapp.com https://api.brevo.com https://www.google-analytics.com https://www.googletagmanager.com https://api.alquran.cloud https://cdn.islamic.network https://cdn.alquran.cloud https://server8.mp3quran.net https://server6.mp3quran.net https://server7.mp3quran.net https://server10.mp3quran.net https://server12.mp3quran.net https://download.quranicaudio.com https://cdn.jsdelivr.net https://api.aladhan.com https://nominatim.openstreetmap.org${devConnectSrc}`,
      "media-src 'self' https://cdn.islamic.network https://cdn.alquran.cloud https://server8.mp3quran.net https://server6.mp3quran.net https://server7.mp3quran.net https://server10.mp3quran.net https://server12.mp3quran.net https://download.quranicaudio.com",
      "worker-src 'self' blob:",
      "frame-ancestors *",
    ].join('; ');

    return [
      // ─── All routes: base security headers ───────────────────────────────
      // Next.js path-to-regexp does NOT support lookaheads, so we use a simple
      // catch-all here and override embed routes below. Next.js applies all
      // matching rules in order, with later rules overwriting the same header key.
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: cspNonEmbed },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // ─── Widget embed routes: override CSP + framing for Notion iframing ──
      // Later rules overwrite matching header keys from the catch-all above.
      // frame-ancestors * in cspEmbed takes precedence over X-Frame-Options
      // per the CSP spec — all modern browsers (including Notion's Chromium)
      // ignore X-Frame-Options when frame-ancestors is present in CSP.
      {
        source: '/widgets/:widget/embed',
        headers: [
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=*' },
          { key: 'Content-Security-Policy', value: cspEmbed },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/widgets/:widget/:sub/embed',
        headers: [
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=*' },
          { key: 'Content-Security-Policy', value: cspEmbed },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);