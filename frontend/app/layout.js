import './globals.css'
import Script from 'next/script'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LoadingProvider } from '../contexts/LoadingContext'
import { ToastProvider } from '../contexts/ToastContext'
import { MaintenanceProvider } from '../contexts/MaintenanceContext'
import NavigationWrapper from '../components/NavigationWrapper'
import NavigationHandler from '../components/NavigationHandler'
import ReferralHandler from '../components/ReferralHandler'
import LoadingIndicator from '../components/LoadingIndicator'
import { Suspense, lazy } from 'react'
import { Almarai, Tajawal, Cairo } from 'next/font/google'
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData'
import { GoogleAnalytics } from '../components/SEOOptimizations'
import { QueryProvider } from '../components/QueryProvider'
import MaintenanceMode from '../components/MaintenanceMode'
import TelegramPopupWrapper from '../components/TelegramPopupWrapper'
import ScrollToTop from '../components/ScrollToTop'

// Lazy load heavy components
const AIChat = lazy(() => import('../components/AIChat'))

import { generateMetadata as generateBaseMetadata } from '../lib/seo'

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata = {
  ...generateBaseMetadata({
    description: 'عرب نوشن (Notion Arabs) هي الوجهة والمجتمع العربي الأول المتخصص في قوالب نوشن الإبداعية، وتمكين المبدعين العرب من تطوير إنتاجيتهم.',
    keywords: [
      'مجتمع نوشن العربي',
      'قوالب نوشن',
      'notion templates',
      'قوالب عربية',
      'صناع القوالب العرب',
      'إنتاجية رقمية',
      'نوشن العرب',
      'تعلم نوشن'
    ]
  }),
  icons: {
    icon: [
      { url: '/icons/favicon.png', type: 'image/png' }
    ],
    shortcut: [
      { url: '/icons/favicon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/favicon.png', sizes: '180x180', type: 'image/png' }
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
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${almarai.variable} ${tajawal.variable} ${cairo.variable}`}>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />


        {/* Favicon - PNG */}
        <link rel="icon" type="image/png" href="/icons/favicon.png" />
        <link rel="shortcut icon" href="/icons/favicon.png" />
        {/* Resource hints for critical resources */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://notion-arabs-fe5b3f214071.herokuapp.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://notion-arabs-fe5b3f214071.herokuapp.com" />

        {/* Apple Touch Icon for iOS devices */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="عرب نوشن" />
        <meta name="application-name" content="عرب نوشن" />

        {/* Web App Manifest - PWA Support */}
        <link rel="manifest" href="/metadata/manifest.json" />
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

                  // Force transparent background for Notion embeds
                  if (window.location.pathname.includes('/embed')) {
                    document.documentElement.style.backgroundColor = 'transparent';
                    const style = document.createElement('style');
                    style.textContent = 'body { background-color: transparent !important; }';
                    document.head.appendChild(style);
                  }
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
      <body className="font-almarai transition-colors duration-300 scrollbar-primary scrollbar-hover-effect" suppressHydrationWarning={true}>
        <QueryProvider>
          <ThemeProvider>
            <LoadingProvider>
              <MaintenanceProvider>
                <AuthProvider>
                  <ToastProvider>
                    <MaintenanceMode />
                    <NavigationWrapper />
                    <NavigationHandler />
                    <Suspense fallback={null}>
                      <ReferralHandler />
                    </Suspense>
                    <LoadingIndicator />
                    <TelegramPopupWrapper />
                    <ScrollToTop />
                    {children}
                    <Suspense fallback={null}>
                      <AIChat />
                    </Suspense>
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
