'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb, ShieldCheck, Users, Code, Youtube, Facebook, Send } from 'lucide-react';

const values = [
  {
    title: "الابتكار",
    description: "نؤمن بقوة الابتكار في تطوير حلول جديدة",
    Icon: Lightbulb
  },
  {
    title: "الجودة",
    description: "نلتزم بتقديم أعلى مستويات الجودة",
    Icon: ShieldCheck
  },
  {
    title: "المجتمع",
    description: "نبني مجتمعاً قوياً من المبدعين والمستخدمين",
    Icon: Users
  }
];

export default function AboutPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">من نحن</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              عرب نوشن هي المنصة العربية الأولى المتخصصة في قوالب نوشن المبتكرة.
              تم تطويرها لتلبية احتياجات المجتمع العربي في التنظيم والإنتاجية.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">قصتنا</h2>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8 px-4 leading-relaxed">
              بدأت عرب نوشن كفكرة بسيطة عندما لاحظت الحاجة الماسة في السوق العربي لمنصة متخصصة في قوالب نوشن باللغة العربية. كمطور ويب ثلاثي الأبعاد، أدركت أن هناك فجوة كبيرة بين الأدوات المتاحة باللغة الإنجليزية واحتياجات المستخدمين العرب.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary px-4 leading-relaxed">
              اليوم، نحن فخورون بأن نكون منصة عربية متخصصة في هذا المجال، ونعمل باستمرار على تطوير وتحسين تجربة المستخدمين والمبدعين على حد سواء.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-10">رؤيتنا ومهمتنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="card p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">مهمتنا</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  تمكين المبدعين العرب من مشاركة قوالب نوشن عالية الجودة، ومساعدة المستخدمين في العثور على الحلول المناسبة لاحتياجاتهم التنظيمية والإنتاجية.
                </p>
              </div>
              <div className="card p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">رؤيتنا</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  أن نكون المنصة العربية الرائدة في مجال قوالب نوشن، وأن نساهم في رفع مستوى التنظيم والإنتاجية في المجتمع العربي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">قيمنا الأساسية</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="card p-5 sm:p-6 md:p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <value.Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500 dark:text-orange-500" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">{value.title}</h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white dark:text-dark-text-primary mb-4 sm:mb-6">
            انضم إلى رحلتنا
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            سواء كنت مبدعاً تريد مشاركة قوالبك، أو مستخدماً تبحث عن حلول تنظيمية، نحن هنا لمساعدتك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link href="/signup" className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto text-center">
              ابدأ الآن
            </Link>
            <Link href="/contact" className="btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 bg-white/90 dark:bg-dark-tertiary/90 w-full sm:w-auto text-center">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed max-w-md">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="sm:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="sm:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center md:text-right">
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
