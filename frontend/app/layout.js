import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LoadingProvider } from '../contexts/LoadingContext'
import { ToastProvider } from '../contexts/ToastContext'
import { MaintenanceProvider } from '../contexts/MaintenanceContext'
import NavigationWrapper from '../components/NavigationWrapper'
import NavigationHandler from '../components/NavigationHandler'
import LoadingIndicator from '../components/LoadingIndicator'
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData'
import { GoogleAnalytics } from '../components/SEOOptimizations'
import { QueryProvider } from '../components/QueryProvider'
import MaintenanceMode from '../components/MaintenanceMode'
import TelegramPopupWrapper from '../components/TelegramPopupWrapper'

import { generateMetadata as generateBaseMetadata } from '../lib/seo'

export const metadata = {
  ...generateBaseMetadata({
    description: 'نصمم أنظمة نوشن عربية مخصصة للشركات والفرق، مع متجر قوالب ومبدعين لمساعدتك على التنظيم والأتمتة والنمو.',
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
    ]
  }),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
}

export const viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />


        {/* Favicon - Using SVG for best quality on all devices */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        {/* Resource hints for critical resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Apple Touch Icon for iOS devices */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="عرب نوشن" />

        {/* Web App Manifest - PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        {/* Font preconnect for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Font loading with font-display: swap to prevent render blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
            rel="stylesheet"
          />
        </noscript>
        {/* Critical blocking script for theme - runs synchronously before any rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const initialTheme = savedTheme || systemTheme;
                  
                  // Apply theme immediately before any rendering
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Store the theme in a data attribute for React to read
                  document.documentElement.setAttribute('data-theme', initialTheme);
                } catch (e) {
                  // Fallback to light theme if there's any error
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
        {/* Non-critical script for smooth scroll - deferred */}
        <Script
          id="smooth-scroll"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if ('scrollBehavior' in document.documentElement.style) {
                  document.documentElement.style.scrollBehavior = 'smooth';
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-tajawal transition-colors duration-300 scrollbar-primary scrollbar-hover-effect" suppressHydrationWarning={true}>
        <QueryProvider>
          <ThemeProvider>
            <LoadingProvider>
              <MaintenanceProvider>
                <AuthProvider>
                  <ToastProvider>
                    <MaintenanceMode />
                    <NavigationWrapper />
                    <NavigationHandler />
                    <LoadingIndicator />
                    <TelegramPopupWrapper />
                    {children}
                  </ToastProvider>
                </AuthProvider>
              </MaintenanceProvider>
            </LoadingProvider>
          </ThemeProvider>
        </QueryProvider>
        {/* Defer Google Analytics to prevent render blocking */}
        <GoogleAnalytics GA_TRACKING_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  )
}
