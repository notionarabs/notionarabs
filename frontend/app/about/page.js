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
      <section className="section-padding bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-6">من نحن</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              عرب نوشن هي المنصة العربية الأولى المتخصصة في قوالب نوشن المبتكرة.
              تم تطويرها لتلبية احتياجات المجتمع العربي في التنظيم والإنتاجية.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-6">قصتنا</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
              بدأت عرب نوشن كفكرة بسيطة عندما لاحظت الحاجة الماسة في السوق العربي لمنصة متخصصة في قوالب نوشن باللغة العربية. كمطور ويب ثلاثي الأبعاد، أدركت أن هناك فجوة كبيرة بين الأدوات المتاحة باللغة الإنجليزية واحتياجات المستخدمين العرب.
            </p>
            <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
              اليوم، نحن فخورون بأن نكون منصة عربية متخصصة في هذا المجال، ونعمل باستمرار على تطوير وتحسين تجربة المستخدمين والمبدعين على حد سواء.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-6">رؤيتنا ومهمتنا</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="heading-3 mb-4">مهمتنا</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  تمكين المبدعين العرب من مشاركة قوالب نوشن عالية الجودة، ومساعدة المستخدمين في العثور على الحلول المناسبة لاحتياجاتهم التنظيمية والإنتاجية.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="heading-3 mb-4">رؤيتنا</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  أن نكون المنصة العربية الرائدة في مجال قوالب نوشن، وأن نساهم في رفع مستوى التنظيم والإنتاجية في المجتمع العربي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">قيمنا الأساسية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.Icon className="w-6 h-6 text-primary-500 dark:text-orange-500" />
                </div>
                <h3 className="heading-3 mb-3">{value.title}</h3>
                <p className="body-small text-accent-600 dark:text-dark-text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            انضم إلى رحلتنا
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            سواء كنت مبدعاً تريد مشاركة قوالبك، أو مستخدماً تبحث عن حلول تنظيمية، نحن هنا لمساعدتك.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary px-8 py-3">
              ابدأ الآن
            </Link>
            <Link href="/contact" className="btn-secondary px-8 py-3 bg-white/90 dark:bg-dark-tertiary/90">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
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
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
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
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
