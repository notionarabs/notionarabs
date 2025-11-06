import Image from 'next/image';
import Link from 'next/link';
import { Youtube, Facebook, Send, Users, Mail } from 'lucide-react';

export const metadata = {
  title: 'اتصل بنا | عرب نوشن',
  description: 'تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها. راسلنا وسنرد عليك خلال 24 ساعة.',
  alternates: {
    canonical: 'https://www.notionarabs.com/contact',
  },
  keywords: ['اتصل بنا', 'الدعم', 'خدمة العملاء', 'notionarabs', 'contact'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'اتصل بنا | عرب نوشن',
    description: 'تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها.',
    url: 'https://www.notionarabs.com/contact',
    type: 'website',
  },
};

const contactMethods = [
  {
    title: "البريد الإلكتروني",
    description: "راسلنا وسنرد عليك خلال 24 ساعة",
    contact: "support@notionarabs.com",
    Icon: Mail,
    bg: "from-primary-100 to-primary-200 dark:from-orange-900/30 dark:to-orange-800/30"
  }
];

const faqs = [
  {
    question: "كيف يمكنني استخدام القوالب؟",
    answer: "بعد شراء القالب، ستحصل على رابط للوصول إليه في حسابك. يمكنك نسخ القالب إلى حساب نوشن الخاص بك."
  },
  {
    question: "هل القوالب متوافقة مع جميع أجهزة نوشن؟",
    answer: "نعم، جميع القوالب متوافقة مع تطبيق نوشن على جميع المنصات (الويب، الهاتف، التابلت)."
  }
];

export default function ContactPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "اتصل بنا | عرب نوشن",
    "description": "تواصل مع عرب نوشن - نحن هنا لمساعدتك في أي استفسار أو مساعدة تحتاجها. راسلنا وسنرد عليك خلال 24 ساعة.",
    "url": "https://www.notionarabs.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "عرب نوشن",
      "url": "https://www.notionarabs.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@notionarabs.com",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "ar"]
      }
    }
  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">
              تواصل معنا
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو مساعدة تحتاجها
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary text-center">طرق التواصل</h2>
              <div className="space-y-3 sm:space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="card p-4 sm:p-5 md:p-6 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${method.bg} flex-shrink-0`}>
                        <method.Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-1.5 sm:mb-2">
                          {method.title}
                        </h3>
                        <p className="text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3 text-xs sm:text-sm">
                          {method.description}
                        </p>
                        <a
                          href={`mailto:${method.contact}`}
                          className="text-primary-500 dark:text-orange-500 font-medium hover:underline text-xs sm:text-sm break-all"
                        >
                          {method.contact}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-4 sm:p-5 md:p-6 mt-6">
                <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                  أوقات العمل
                </h3>
                <div className="text-accent-600 dark:text-dark-text-secondary">
                  <p className="mb-1.5 sm:mb-2 text-sm sm:text-base">24 ساعة يومياً، 7 أيام في الأسبوع</p>
                  <p className="text-xs sm:text-sm">خدمة متاحة على مدار الساعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">الأسئلة الشائعة</h2>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              إجابات سريعة على أكثر الأسئلة شيوعاً
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card p-4 sm:p-5 md:p-6 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary-100 dark:bg-orange-500/20 flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-500 to-primary-500 dark:from-dark-secondary dark:to-dark-tertiary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-3 sm:mb-4">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 dark:text-dark-text-secondary mb-6 sm:mb-8 px-4">
            اكتشف المزيد من الخيارات المتاحة لك
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-4xl mx-auto">
            <Link href="/templates" className="btn-primary text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white text-primary-600 hover:bg-gray-50 dark:bg-dark-primary dark:text-orange-400 dark:hover:bg-dark-tertiary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[180px] md:max-w-[200px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              تصفح القوالب
            </Link>
            <Link href="/creators" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              المبدعين
            </Link>
            <Link href="/blog" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              المدونة
            </Link>
            <Link href="/about" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              من نحن
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <li><Link href="/templates" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <li><Link href="/about" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-4 sm:mb-6 md:mb-8">
                <li><Link href="/contact" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
