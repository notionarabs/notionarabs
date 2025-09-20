'use client';

import { useState } from 'react';

const helpCategories = [
  {
    title: "البدء",
    description: "تعلم كيفية استخدام المنصة",
    icon: "🚀",
    articles: [
      { title: "كيفية إنشاء حساب جديد", slug: "create-account" },
      { title: "دليل المستخدم الأول", slug: "first-time-guide" },
      { title: "كيفية تصفح القوالب", slug: "browse-templates" },
      { title: "فهم أنواع الاشتراكات", slug: "subscription-types" }
    ]
  },
  {
    title: "القوالب",
    description: "كل شيء عن القوالب",
    icon: "📄",
    articles: [
      { title: "كيفية تحميل القوالب", slug: "download-templates" },
      { title: "استخدام القوالب في نوتيون", slug: "use-templates-notion" },
      { title: "تخصيص القوالب", slug: "customize-templates" },
      { title: "حل مشاكل القوالب", slug: "troubleshoot-templates" }
    ]
  },
  {
    title: "المبدعين",
    description: "للمبدعين والبائعين",
    icon: "👨‍💻",
    articles: [
      { title: "كيفية رفع قالب للبيع", slug: "upload-template" },
      { title: "إرشادات جودة القوالب", slug: "template-quality-guidelines" },
      { title: "إدارة المبيعات والأرباح", slug: "manage-sales-earnings" },
      { title: "تسويق قوالبك", slug: "market-templates" }
    ]
  },
  {
    title: "الدفع والفواتير",
    description: "معلومات الدفع والاشتراك",
    icon: "💳",
    articles: [
      { title: "طرق الدفع المتاحة", slug: "payment-methods" },
      { title: "كيفية إلغاء الاشتراك", slug: "cancel-subscription" },
      { title: "طلب استرداد", slug: "request-refund" },
      { title: "فهم الفواتير", slug: "understand-billing" }
    ]
  },
  {
    title: "الحساب",
    description: "إدارة حسابك الشخصي",
    icon: "👤",
    articles: [
      { title: "تحديث معلومات الحساب", slug: "update-account-info" },
      { title: "تغيير كلمة المرور", slug: "change-password" },
      { title: "إعدادات الخصوصية", slug: "privacy-settings" },
      { title: "حذف الحساب", slug: "delete-account" }
    ]
  },
  {
    title: "المشاكل التقنية",
    description: "حل المشاكل الشائعة",
    icon: "🔧",
    articles: [
      { title: "مشاكل في تسجيل الدخول", slug: "login-issues" },
      { title: "مشاكل في التحميل", slug: "download-issues" },
      { title: "مشاكل في الدفع", slug: "payment-issues" },
      { title: "مشاكل في التطبيق", slug: "app-issues" }
    ]
  }
];

const faqs = [
  {
    question: "كيف يمكنني تحميل قالب؟",
    answer: "بعد تسجيل الدخول، تصفح القوالب المتاحة واختر القالب الذي يعجبك. اضغط على 'تحميل' وستحصل على رابط القالب مباشرة."
  },
  {
    question: "هل يمكنني استخدام القوالب تجارياً؟",
    answer: "نعم، جميع القوالب تأتي مع رخصة للاستخدام التجاري. يمكنك استخدامها في مشاريعك الشخصية والتجارية."
  },
  {
    question: "كيف يمكنني رفع قالب للبيع؟",
    answer: "تحتاج أولاً إلى إنشاء حساب مبدع، ثم يمكنك رفع قوالبك من خلال لوحة التحكم. تأكد من اتباع إرشادات الجودة."
  },
  {
    question: "متى أحصل على أرباحي من بيع القوالب؟",
    answer: "يتم تحويل الأرباح إلى حسابك المصرفي في نهاية كل شهر، بشرط أن يكون المبلغ أكثر من 50 ريال."
  },
  {
    question: "هل يمكنني إلغاء الاشتراك في أي وقت؟",
    answer: "نعم، يمكنك إلغاء اشتراكك في أي وقت من إعدادات الحساب. ستحتفظ بجميع القوالب المحملة حتى نهاية فترة الاشتراك."
  },
  {
    question: "كيف يمكنني الحصول على دعم فني؟",
    answer: "يمكنك التواصل معنا عبر البريد الإلكتروني support@notion-arabs.com أو من خلال نموذج التواصل في الموقع."
  }
];

const popularArticles = [
  { title: "دليل المبتدئين الشامل", category: "البدء", readTime: "10 دقائق" },
  { title: "كيفية تخصيص قوالب نوتيون", category: "القوالب", readTime: "5 دقائق" },
  { title: "أفضل الممارسات لرفع القوالب", category: "المبدعين", readTime: "8 دقائق" },
  { title: "حل مشاكل التحميل الشائعة", category: "المشاكل التقنية", readTime: "3 دقائق" }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="w-full bg-accent-500 dark:bg-dark-secondary sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-accent-500/95 dark:bg-dark-secondary/95 transition-colors duration-300">
        <div className="container-custom flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/NavLogoLight.svg"
              alt="عرب نوشن"
              width={240}
              height={80}
              className="h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 lg:gap-2 xl:gap-3">
            <a href="/templates" className="nav-link">القوالب</a>
            <a href="/creators" className="nav-link">المبدعين</a>
            <a href="/blog" className="nav-link">المدونة</a>
            <a href="/about" className="nav-link">من نحن</a>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 dark:text-dark-text-tertiary">مرحباً، {user?.name}</span>
                <Link href="/profile" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  الملف الشخصي
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" className="btn-primary">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 transition-all duration-300 border border-gray-600 dark:border-dark-card-border rounded-xl hover:bg-white/10 dark:hover:bg-dark-tertiary hover:border-gray-500 dark:hover:border-dark-text-tertiary flex-shrink-0"
              aria-label="فتح القائمة"
            >
              <svg className="w-5 h-5 text-gray-300 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-accent-500 dark:bg-dark-secondary border-b border-gray-700 dark:border-dark-card-border shadow-large dark:shadow-dark-large backdrop-blur-sm transition-colors duration-300">
          <div className="container-custom py-6 space-y-6">
            <nav className="space-y-2">
              <a href="/templates" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">القوالب</a>
              <a href="/creators" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المبدعين</a>
              <a href="/blog" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المدونة</a>
              <a href="/about" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">من نحن</a>
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-600 dark:border-dark-card-border pt-6">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 text-gray-300 dark:text-dark-text-tertiary bg-white/5 dark:bg-dark-tertiary rounded-xl">
                    مرحباً، {user?.name}
                  </div>
                  <a href="/profile" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    الملف الشخصي
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-right py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block py-3 px-4 btn-primary text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">مركز المساعدة</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto mb-8">
              ابحث عن الإجابات التي تحتاجها أو تواصل معنا للحصول على المساعدة
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="ابحث في مركز المساعدة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pl-12 pr-4 py-4 text-lg"
                dir="rtl"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Popular Articles */}
          <div className="mb-16">
            <h2 className="heading-2 mb-6">المقالات الشائعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularArticles.map((article, index) => (
                <div key={index} className="card p-6 hover:shadow-large transition-all duration-300 cursor-pointer">
                  <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3">
                    {article.category}
                  </p>
                  <p className="text-xs text-accent-400 dark:text-dark-text-quaternary">
                    {article.readTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">تصفح حسب الموضوع</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              اختر الموضوع الذي تريد المساعدة فيه
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="card p-8 hover:shadow-large transition-all duration-300 cursor-pointer">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="heading-3 mb-3">{category.title}</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary mb-6">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-sm text-accent-500 dark:text-dark-text-primary hover:text-primary-500 dark:hover:text-orange-500 transition-colors cursor-pointer">
                      • {article.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">الأسئلة الشائعة</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              إجابات سريعة على أكثر الأسئلة شيوعاً
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-right flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
                  >
                    <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-accent-400 dark:text-dark-text-quaternary transition-transform ${expandedFaq === index ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-accent-600 dark:text-dark-text-secondary">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            فريق الدعم لدينا متاح لمساعدتك في أي وقت. تواصل معنا وسنرد عليك خلال 24 ساعة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              تواصل معنا
            </Link>
            <a href="mailto:support@notion-arabs.com" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              إرسال بريد إلكتروني
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوتيون المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><a href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</a></li>
                <li><a href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</a></li>
                <li><a href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</a></li>
                <li><a href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</a></li>
                <li><a href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</a></li>
                <li><a href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</a></li>
                <li><a href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</a></li>
                <li><a href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</a></li>
                <li><a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</a></li>
                <li><a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</a>
                <a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</a>
                <a href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
