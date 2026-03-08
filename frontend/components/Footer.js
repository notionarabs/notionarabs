'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Youtube, Facebook, Send, Users } from 'lucide-react';
import { useLoading } from '../contexts/LoadingContext';

export default function Footer() {
  const { setLoading } = useLoading();
  const pathname = usePathname();

  const handleNavigation = (href) => {
    // Check if relative path navigation
    if (href.startsWith('/')) {
      const targetPath = href.split('?')[0];
      const currentPath = pathname.split('?')[0];

      if (targetPath !== currentPath) {
        setLoading(true, 'navigation');
      }
    }
  };

  return (
    <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
      <div className="container-custom py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4 sm:mb-6">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={60}
                height={40}
                className="h-10 sm:h-12 w-auto"
                quality={100}
                unoptimized
              />
            </div>
            <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
              نُصمم لك أنظمة نوشن عربية مخصصة لتنظيم العمل والمشاريع والمعرفة، مع استشارة ودعم مستمر لفرقك.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة يوتيوب عرب نوشن">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
              <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="صفحة فيسبوك عرب نوشن">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
              <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="مجموعة فيسبوك عرب نوشن">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
              <Link href="https://t.me/Notion_Arabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة تيليجرام عرب نوشن">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
              <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="حساب تويتر عرب نوشن">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>


          {/* Company Section */}
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/about" onClick={() => handleNavigation('/about')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
              <li><Link href="/projects" onClick={() => handleNavigation('/projects')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مشاريعنا</Link></li>
              <li><Link href="/blog" onClick={() => handleNavigation('/blog')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
              <li><Link href="/careers" onClick={() => handleNavigation('/careers')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">انضم للفريق</Link></li>
              <li><Link href="/consultation" onClick={() => handleNavigation('/consultation')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">احجز استشارة</Link></li>
            </ul>
          </div>

          {/* Product Section */}
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المتجر</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link href="/store" onClick={() => handleNavigation('/store')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المتجر</Link></li>
              <li><Link href="/widgets" onClick={() => handleNavigation('/widgets')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأدوات</Link></li>
              <li><Link href="/templates" onClick={() => handleNavigation('/templates')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
              <li><Link href="/creators" onClick={() => handleNavigation('/creators')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
              <li><Link href="/creators/apply" onClick={() => handleNavigation('/creators/apply')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">انضم كمبدع</Link></li>
            </ul>
          </div>


          {/* Support Section */}
          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <li><Link href="/contact" onClick={() => handleNavigation('/contact')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
              <li><Link href="/privacy" onClick={() => handleNavigation('/privacy')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
              <li><Link href="/terms" onClick={() => handleNavigation('/terms')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
              <li><Link href="/cookies" onClick={() => handleNavigation('/cookies')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              <li><Link href="/refund-policy" onClick={() => handleNavigation('/refund-policy')} className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">سياسة الاسترجاع</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
              © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-end">
              <Link href="/privacy" onClick={() => handleNavigation('/privacy')} className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" onClick={() => handleNavigation('/terms')} className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
              <Link href="/cookies" onClick={() => handleNavigation('/cookies')} className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              <Link href="/refund-policy" onClick={() => handleNavigation('/refund-policy')} className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الاسترجاع</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
