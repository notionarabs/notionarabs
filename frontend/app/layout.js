import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { LoadingProvider } from '../contexts/LoadingContext'
import { ToastProvider } from '../contexts/ToastContext'
import NavigationWrapper from '../components/NavigationWrapper'
import NavigationHandler from '../components/NavigationHandler'
import LoadingIndicator from '../components/LoadingIndicator'
import { initSmoothScroll } from '../lib/smoothScroll'
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData'
import { GoogleAnalytics } from '../components/SEOOptimizations'

import { generateMetadata as generateBaseMetadata } from '../lib/seo'

export const metadata = generateBaseMetadata({
  title: 'Notion Arabs - قوالب نوشن باللغة العربية',
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
})

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <GoogleAnalytics GA_TRACKING_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        <link rel="icon" href="/FaviconSvg.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" rel="stylesheet" />
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
              // Initialize smooth scrolling
              document.addEventListener('DOMContentLoaded', function() {
                // Enable smooth scrolling for all anchor links
                const anchors = document.querySelectorAll('a[href^="#"]');
                anchors.forEach(anchor => {
                  anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                      const offset = 80; // Account for fixed header
                      const elementPosition = targetElement.offsetTop - offset;
                      window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  });
                });
              });
            `,
          }}
        />
      </head>
      <body className="font-tajawal transition-colors duration-300 scrollbar-primary scrollbar-hover-effect" suppressHydrationWarning={true}>
        <ThemeProvider>
          <LoadingProvider>
            <AuthProvider>
              <ToastProvider>
                <NavigationWrapper />
                <NavigationHandler />
                <LoadingIndicator />
                {children}
              </ToastProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
