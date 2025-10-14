import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LoadingProvider } from '../contexts/LoadingContext'
import { ToastProvider } from '../contexts/ToastContext'
import { MaintenanceProvider } from '../contexts/MaintenanceContext'
import NavigationWrapper from '../components/NavigationWrapper'
import NavigationHandler from '../components/NavigationHandler'
import LoadingIndicator from '../components/LoadingIndicator'
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData'
import { GoogleAnalytics, HreflangLinks, TwitterCardMeta } from '../components/SEOOptimizations'
import { QueryProvider } from '../components/QueryProvider'
import MaintenanceMode from '../components/MaintenanceMode'

import { generateMetadata as generateBaseMetadata } from '../lib/seo'

export const metadata = {
  ...generateBaseMetadata({
    description: 'اكتشف وبيع قوالب نوشن باللغة العربية - منصة مخصصة للمبدعين والمشترين العرب',
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
    ]
  }),
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' }
    ]
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <HreflangLinks currentPath="" />
        <TwitterCardMeta
          title="عرب نوشن - قوالب نوشن باللغة العربية"
          description="اكتشف وبيع قوالب نوشن باللغة العربية - منصة مخصصة للمبدعين والمشترين العرب"
          image="/og-image.png"
        />
        <GoogleAnalytics GA_TRACKING_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const initialTheme = savedTheme || systemTheme;
                  
                  if (initialTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to system theme if there's any error
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  if (systemTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }
              })();
            `,
          }}
        />
        <script
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
                    {children}
                  </ToastProvider>
                </AuthProvider>
              </MaintenanceProvider>
            </LoadingProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
