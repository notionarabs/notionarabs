'use client';


const features = [
  {
    title: "قوالب عالية الجودة",
    description: "جميع القوالب مصممة بعناية من قبل مبدعين محترفين ومختبرة للتأكد من جودتها",
    icon: "⭐",
    details: [
      "تصميم احترافي ومتجاوب",
      "سهولة الاستخدام والتخصيص",
      "دعم كامل للغة العربية",
      "تحديثات مستمرة ومجانية"
    ]
  },
  {
    title: "منصة سهلة الاستخدام",
    description: "واجهة بسيطة وبديهية تجعل العثور على القوالب المناسبة أمراً سهلاً",
    icon: "🎯",
    details: [
      "بحث متقدم وفلترة ذكية",
      "تصفح سهل ومنظم",
      "معاينة مباشرة للقوالب",
      "تحميل فوري وآمن"
    ]
  },
  {
    title: "مجتمع مبدعين نشط",
    description: "انضم إلى مجتمع من المبدعين العرب الذين يشاركون معرفتهم وخبراتهم",
    icon: "👥",
    details: [
      "ملفات شخصية للمبدعين",
      "نظام تقييم ومراجعات",
      "دعم وتوجيه مستمر",
      "فرص للتعاون والتطوير"
    ]
  },
  {
    title: "نظام دفع آمن",
    description: "نظام دفع متقدم وآمن يدعم جميع طرق الدفع المحلية والدولية",
    icon: "🔒",
    details: [
      "تشفير SSL متقدم",
      "دعم البطاقات الائتمانية",
      "دفع آمن عبر Stripe",
      "حماية كاملة للبيانات"
    ]
  },
  {
    title: "دعم فني 24/7",
    description: "فريق دعم متخصص متاح على مدار الساعة لمساعدتك في أي وقت",
    icon: "🛠️",
    details: [
      "دعم عبر البريد الإلكتروني",
      "دردشة مباشرة",
      "مركز مساعدة شامل",
      "استجابة سريعة للاستفسارات"
    ]
  },
  {
    title: "تخصيص متقدم",
    description: "أدوات تخصيص قوية تتيح لك تعديل القوالب حسب احتياجاتك",
    icon: "⚙️",
    details: [
      "محرر مرئي سهل الاستخدام",
      "قوالب قابلة للتخصيص بالكامل",
      "أدوات تصميم متقدمة",
      "تصدير بجودة عالية"
    ]
  }
];

const stats = [
  { number: "10,000+", label: "قالب متاح" },
  { number: "500+", label: "مبدع عربي" },
  { number: "50,000+", label: "تحميل شهري" },
  { number: "4.9", label: "تقييم المستخدمين" }
];

const integrations = [
  {
    name: "نوتيون",
    description: "تكامل كامل مع منصة نوتيون",
    icon: "📝"
  },
  {
    name: "Google Drive",
    description: "مزامنة مع Google Drive",
    icon: "☁️"
  },
  {
    name: "Dropbox",
    description: "حفظ في Dropbox",
    icon: "📦"
  },
  {
    name: "OneDrive",
    description: "مزامنة مع OneDrive",
    icon: "💾"
  }
];

export default function FeaturesPage() {

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
            <h1 className="heading-1 mb-6">مميزات المنصة</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              اكتشف جميع المميزات التي تجعل عرب نوشن المنصة المثالية لاحتياجاتك التنظيمية والإنتاجية
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="card-featured p-6 text-center">
                <div className="text-3xl font-bold text-primary-500 dark:text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="body-small">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">المميزات الرئيسية</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              كل ما تحتاجه لتنظيم حياتك وزيادة إنتاجيتك في مكان واحد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 hover:shadow-large transition-all duration-300">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="heading-3 mb-4">{feature.title}</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3 text-sm text-accent-600 dark:text-dark-text-secondary">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">التكامل مع المنصات</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              قوالبنا متوافقة مع جميع المنصات الشائعة لضمان سهولة الاستخدام
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-large transition-all duration-300">
                <div className="text-4xl mb-4">{integration.icon}</div>
                <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                  {integration.name}
                </h3>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">كيف تعمل المنصة؟</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              خطوات بسيطة للحصول على القوالب التي تحتاجها
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="heading-3 mb-4">تصفح القوالب</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  استخدم أدوات البحث والفلترة للعثور على القوالب المناسبة لاحتياجاتك
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="heading-3 mb-4">اختر واشتر</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  اختر القالب المناسب وادفع بطريقة آمنة وسريعة
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 dark:bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="heading-3 mb-4">استخدم وخصص</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  حمّل القالب وخصصه حسب احتياجاتك في نوتيون
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            جاهز للبدء؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون بنا لتنظيم حياتهم وزيادة إنتاجيتهم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              ابدأ مجاناً
            </Link>
            <Link href="/templates" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              تصفح القوالب
            </Link>
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
