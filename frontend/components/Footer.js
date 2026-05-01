'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Youtube, Facebook, Send, Users, Twitter, Mail, ExternalLink, ArrowUpRight } from 'lucide-react';
import { useLoading } from '../contexts/LoadingContext';
import { useTheme } from '../contexts/ThemeContext';

const FOOTER_LINKS = {
  community: [
    { href: '/templates', label: 'قوالب نوشن' },
    { href: '/creators', label: 'المبدعين' },
    { href: '/blog', label: 'المدونة' },
    { href: '/widgets', label: 'الأدوات' },
  ],
  support: [
    { href: '/contact', label: 'اتصل بنا' },
    { href: '/creators/apply', label: 'انضم كمبدع' },
  ],
  legal: [
    { href: '/privacy', label: 'الخصوصية' },
    { href: '/terms', label: 'الشروط' },
    { href: '/refund-policy', label: 'سياسة الاسترجاع' },
  ]
};

export default function Footer() {
  const { setLoading } = useLoading();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (href) => {
    if (href.startsWith('/')) {
      const targetPath = href.split('?')[0];
      const currentPath = pathname.split('?')[0];

      if (targetPath !== currentPath) {
        setLoading(true, 'navigation');
      }
    }
  };

  return (
    <footer className="relative mt-20 md:mt-32">
      {/* Signature Hardware Silhouette */}
      <div className="absolute inset-x-0 -top-12 h-12 bg-card rounded-t-[3rem]" />
      
      <div className="bg-card relative overflow-hidden">
        {/* Atmospheric Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="container-custom relative z-10 pt-20 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
            {/* Brand Identity Section */}
            <div className="lg:col-span-5 space-y-8">
              <Link href="/" className="inline-block" onClick={() => handleNavigation('/')}>
              <div className="flex items-center relative">
                {/* Light Logo (for dark theme) */}
                <Image
                  src="/brand/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={220}
                  height={66}
                  className="h-12 w-auto drop-shadow-sm hidden dark:block"
                  quality={100}
                  unoptimized
                />
                {/* Dark Logo (for light theme) */}
                <Image
                  src="/brand/NavLogoDark.svg"
                  alt="عرب نوشن"
                  width={220}
                  height={66}
                  className="h-12 w-auto drop-shadow-sm block dark:hidden"
                  quality={100}
                  unoptimized
                />
              </div>
              </Link>
              
              <p className="text-foreground/70 dark:text-white/60 text-lg leading-relaxed max-w-md font-medium">
                مجتمعك العربي الأول لاحتراف نوشن، نوفر لك أرقى القوالب الرقمية والأدوات المبتكرة لتمكينك من تنظيم حياتك وإدارة مشاريعك بإبداع.
              </p>

              <div className="pt-8 border-t border-foreground/5 dark:border-white/5">
                <Link 
                  href="https://arab-os.com" 
                  target="_blank" 
                  className="group block space-y-3"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/20 dark:text-white/10 block">
                    إحدى مبادرات
                  </span>
                  <div className="flex items-center gap-4">
                    <Image 
                      src="/ArabOS.svg" 
                      alt="Arab-OS" 
                      width={90} 
                      height={22} 
                      className="h-5 w-auto opacity-50 group-hover:opacity-100 transition-all"
                      unoptimized
                    />
                    <div className="h-4 w-px bg-foreground/10 dark:bg-white/10" />
                    <span className="text-[11px] text-foreground/40 dark:text-white/30 font-medium">
                      نحو بناء بيئة رقمية عربية ذكية
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <h4 className="font-black text-foreground dark:text-white uppercase tracking-wider text-sm">المحتوى</h4>
                <ul className="space-y-4">
                  {FOOTER_LINKS.community.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        onClick={() => handleNavigation(link.href)}
                        className="text-foreground/60 dark:text-white/50 hover:text-primary transition-all flex items-center group gap-2"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="font-black text-foreground dark:text-white uppercase tracking-wider text-sm">الدعم</h4>
                <ul className="space-y-4">
                  {FOOTER_LINKS.support.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        onClick={() => handleNavigation(link.href)}
                        className="text-foreground/60 dark:text-white/50 hover:text-primary transition-all flex items-center group gap-2"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 col-span-2 md:col-span-1">
                <h4 className="font-black text-foreground dark:text-white uppercase tracking-wider text-sm">تواصل معنا</h4>
                <div className="flex items-center gap-3">
                  {[
                    { Icon: Youtube, href: 'https://youtube.com/@notionarabs', css: 'social-youtube' },
                    { Icon: Twitter, href: 'https://twitter.com/notionarabs', css: 'social-twitter' },
                    { Icon: Send, href: 'https://t.me/Notion_Arabs', css: 'social-telegram' },
                    { Icon: Facebook, href: 'https://facebook.com/notionarabs', css: 'social-facebook' },
                  ].map((social, idx) => (
                    <Link
                      key={idx}
                      href={social.href}
                      target="_blank"
                      className={`w-12 h-12 rounded-2xl bg-foreground/5 dark:bg-white/5 border-none flex items-center justify-center hover:text-white hover:shadow-xl transition-all duration-300 group ${social.css}`}
                    >
                      <social.Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                  ))}
                </div>
                <Link 
                  href="mailto:support@notionarabs.com" 
                  className="inline-flex items-center gap-4 p-4 rounded-2xl bg-foreground/5 dark:bg-white/5 border-none group transition-all w-full md:w-auto shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-foreground/70 dark:text-white/70">support@notionarabs.com</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-none flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-foreground/40 dark:text-white/30 text-sm font-medium">
              © {mounted ? new Date().getFullYear() : '2026'} عرب نوشن. جميع الحقوق محفوظة.
            </p>

            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-foreground/[0.03] dark:bg-white/[0.03] border border-foreground/5 dark:border-white/5" dir="ltr">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30 dark:text-white/20">Powered by</span>
              <Link 
                href="https://arab-os.com" 
                target="_blank" 
                className="opacity-50 hover:opacity-100 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <Image 
                  src="/ArabOS.svg" 
                  alt="Arab OS" 
                  width={80} 
                  height={20} 
                  className="h-4 w-auto"
                  unoptimized
                />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {FOOTER_LINKS.legal.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => handleNavigation(link.href)}
                  className="text-foreground/30 dark:text-white/20 hover:text-foreground dark:hover:text-white text-xs font-bold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
