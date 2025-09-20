'use client';

import { formatDate } from '../../lib/dateUtils';

const pressReleases = [
  {
    id: 1,
    title: "عرب نوشن تطلق منصتها الجديدة لبيع وشراء قوالب نوتيون",
    date: "2024-01-15",
    summary: "أعلنت شركة عرب نوشن عن إطلاق منصتها الجديدة المتخصصة في بيع وشراء قوالب نوتيون باللغة العربية",
    category: "إطلاق المنتج",
    readTime: "3 دقائق"
  },
  {
    id: 2,
    title: "عرب نوشن تحقق نمواً بنسبة 300% في أول عام",
    date: "2024-01-10",
    summary: "حققت منصة عرب نوشن نمواً استثنائياً في عدد المستخدمين والمبدعين خلال عامها الأول",
    category: "أخبار الشركة",
    readTime: "4 دقائق"
  },
  {
    id: 3,
    title: "شراكة استراتيجية بين عرب نوشن وجامعة الملك سعود",
    date: "2024-01-05",
    summary: "أعلنت عرب نوشن عن شراكة استراتيجية مع جامعة الملك سعود لتطوير قوالب تعليمية متخصصة",
    category: "شراكات",
    readTime: "5 دقائق"
  },
  {
    id: 4,
    title: "عرب نوشن تفوز بجائزة أفضل منصة تقنية عربية",
    date: "2023-12-20",
    summary: "فازت منصة عرب نوشن بجائزة أفضل منصة تقنية عربية في حفل جوائز التقنية العربية",
    category: "جوائز",
    readTime: "3 دقائق"
  }
];

const mediaKit = {
  logo: {
    light: "/NavLogoLight.svg",
    dark: "/NavLogoDark.svg",
    description: "شعار عرب نوشن - النسخة الفاتحة"
  },
  screenshots: [
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
      description: "لقطة شاشة من صفحة القوالب"
    },
    {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center",
      description: "لقطة شاشة من لوحة التحكم"
    },
    {
      url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop&crop=center",
      description: "لقطة شاشة من صفحة المبدعين"
    }
  ]
};

const teamMembers = [
  {
    name: "أحمد المطيري",
    title: "المؤسس والرئيس التنفيذي",
    bio: "خبير في التقنية والإنتاجية، عمل في شركات التقنية الكبرى لأكثر من 10 سنوات",
    email: "ahmed@notion-arabs.com",
    phone: "+966 50 123 4567"
  },
  {
    name: "فاطمة نور",
    title: "مديرة التصميم",
    bio: "مصممة تجربة مستخدم متخصصة في أدوات الإنتاجية، حاصلة على جوائز في التصميم",
    email: "fatima@notion-arabs.com",
    phone: "+966 50 123 4568"
  },
  {
    name: "عمر خالد",
    title: "مدير التطوير",
    bio: "مطور برمجيات متخصص في تطبيقات الويب، خبرة 8 سنوات في تطوير المنصات",
    email: "omar@notion-arabs.com",
    phone: "+966 50 123 4569"
  }
];

const stats = [
  { number: "10,000+", label: "قالب متاح" },
  { number: "500+", label: "مبدع عربي" },
  { number: "50,000+", label: "تحميل شهري" },
  { number: "4.9", label: "تقييم المستخدمين" }
];

export default function PressPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">الصحافة والإعلام</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              موارد إعلامية شاملة عن عرب نوشن - الأخبار، البيانات الصحفية، والمواد الإعلامية
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

      {/* Press Releases */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">البيانات الصحفية</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              آخر الأخبار والتحديثات من عرب نوشن
            </p>
          </div>

          <div className="space-y-6">
            {pressReleases.map((release) => (
              <div key={release.id} className="card p-8 hover:shadow-large transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-sm rounded-full">
                        {release.category}
                      </span>
                      <span className="text-sm text-accent-500 dark:text-dark-text-secondary">
                        {formatDate(release.date)}
                      </span>
                      <span className="text-sm text-accent-400 dark:text-dark-text-quaternary">
                        {release.readTime}
                      </span>
                    </div>
                    <h3 className="heading-3 mb-3">{release.title}</h3>
                    <p className="text-accent-600 dark:text-dark-text-secondary mb-4">
                      {release.summary}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-4 lg:mt-0">
                    <button className="btn-primary">
                      اقرأ المزيد
                    </button>
                    <button className="btn-outline">
                      تحميل PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">الحقيبة الإعلامية</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              موارد إعلامية جاهزة للاستخدام - الشعارات، الصور، والمعلومات الأساسية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Logo Assets */}
            <div>
              <h3 className="heading-3 mb-6">الشعارات</h3>
              <div className="space-y-6">
                <div className="card p-6">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">الشعار الفاتح</h4>
                  <div className="bg-gray-100 dark:bg-dark-tertiary p-6 rounded-lg mb-4">
                    <Image
                      src={mediaKit.logo.light}
                      alt="شعار عرب نوشن - فاتح"
                      width={200}
                      height={60}
                      className="h-12 w-auto mx-auto"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-outline text-sm">
                      تحميل PNG
                    </button>
                    <button className="btn-outline text-sm">
                      تحميل SVG
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">الشعار الداكن</h4>
                  <div className="bg-gray-800 dark:bg-dark-primary p-6 rounded-lg mb-4">
                    <Image
                      src={mediaKit.logo.dark}
                      alt="شعار عرب نوشن - داكن"
                      width={200}
                      height={60}
                      className="h-12 w-auto mx-auto"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="btn-outline text-sm">
                      تحميل PNG
                    </button>
                    <button className="btn-outline text-sm">
                      تحميل SVG
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <h3 className="heading-3 mb-6">لقطات الشاشة</h3>
              <div className="space-y-6">
                {mediaKit.screenshots.map((screenshot, index) => (
                  <div key={index} className="card p-6">
                    <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">
                      {screenshot.description}
                    </h4>
                    <div className="bg-gray-100 dark:bg-dark-tertiary p-4 rounded-lg mb-4">
                      <Image
                        src={screenshot.url}
                        alt={screenshot.description}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button className="btn-outline text-sm">
                        تحميل عالي الجودة
                      </button>
                      <button className="btn-outline text-sm">
                        تحميل متوسط الجودة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Contacts */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">جهات الاتصال</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              تواصل مع فريقنا الإعلامي للحصول على المزيد من المعلومات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card p-6 text-center">
                <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-500 dark:text-orange-500 font-medium mb-3">
                  {member.title}
                </p>
                <p className="text-accent-600 dark:text-dark-text-secondary text-sm mb-4">
                  {member.bio}
                </p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${member.email}`}
                    className="block text-sm text-accent-500 dark:text-orange-500 hover:underline"
                  >
                    {member.email}
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="block text-sm text-accent-500 dark:text-orange-500 hover:underline"
                  >
                    {member.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            تحتاج إلى معلومات إضافية؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            تواصل معنا للحصول على المزيد من المعلومات أو المواد الإعلامية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-lg px-8 py-4">
              تواصل معنا
            </Link>
            <a href="mailto:press@notion-arabs.com" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
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
