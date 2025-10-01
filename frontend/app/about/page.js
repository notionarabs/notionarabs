'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb, ShieldCheck, Users, Search, Code, Youtube, Facebook, Send, X } from 'lucide-react';

const teamMembers = [
  {
    name: "مطور الويب",
    role: "مطور ثلاثي الأبعاد ومطور الويب",
    bio: "متخصص في تطوير الويب ثلاثي الأبعاد، قام ببناء هذه المنصة من الصفر",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    website: "https://hazem.vip",
    email: "hazemyasser911@gmail.com"
  }
];

const values = [
  {
    title: "الابتكار",
    description: "نؤمن بقوة الابتكار في تحسين تجربة المستخدمين وتطوير حلول جديدة",
    Icon: Lightbulb
  },
  {
    title: "الجودة",
    description: "نلتزم بتقديم أعلى مستويات الجودة في جميع منتجاتنا وخدماتنا",
    Icon: ShieldCheck
  },
  {
    title: "المجتمع",
    description: "نبني مجتمعاً قوياً من المبدعين والمستخدمين الذين يدعمون بعضهم البعض",
    Icon: Users
  },
  {
    title: "الشفافية",
    description: "نؤمن بالشفافية في جميع تعاملاتنا مع المستخدمين والشركاء",
    Icon: Search
  }
];

const stats = [
  { number: "1", label: "مؤسس" },
  { number: "100%", label: "عربي" },
  { number: "2025", label: "سنة التأسيس" }
];

export default function AboutPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">من نحن</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-4xl mx-auto">
              عرب نوشن هي منصة عربية متخصصة في بيع وشراء قوالب نوشن المبتكرة.
              تم تطويرها من قبل مطور ويب ثلاثي الأبعاد بهدف جعل أدوات التنظيم والإنتاجية متاحة ومفهومة للجمهور العربي.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
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

      {/* Our Story Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-6">قصتنا</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                رحلة من الفكرة إلى الواقع
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-6">
                  بدأت عرب نوشن كفكرة بسيطة عندما لاحظت الحاجة الماسة في السوق العربي
                  لمنصة متخصصة في قوالب نوشن باللغة العربية.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-6">
                  كمطور ويب ثلاثي الأبعاد، أدركت أن هناك فجوة كبيرة بين الأدوات المتاحة
                  باللغة الإنجليزية واحتياجات المستخدمين العرب. لذلك قررت إنشاء منصة تجمع
                  بين أفضل قوالب نوشن مع الترجمة والتوطين المناسب للثقافة العربية.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  اليوم، نحن فخورون بأن نكون منصة عربية متخصصة في هذا المجال، ونعمل باستمرار
                  على تطوير وتحسين تجربة المستخدمين والمبدعين على حد سواء.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary-500 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">رؤيتنا ومهمتنا</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
                نسعى لبناء مستقبل أفضل للتنظيم والإنتاجية في العالم العربي
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Mission */}
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4">مهمتنا</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  تمكين المبدعين العرب من مشاركة معرفتهم وخبراتهم من خلال
                  قوالب نوشن عالية الجودة، ومساعدة المستخدمين في العثور على الحلول
                  المناسبة لاحتياجاتهم التنظيمية والإنتاجية.
                </p>
              </div>

              {/* Vision */}
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 dark:from-orange-600 dark:to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4">رؤيتنا</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  أن نكون المنصة العربية الرائدة في مجال قوالب نوشن، وأن نساهم في
                  رفع مستوى التنظيم والإنتاجية في المجتمع العربي من خلال أدوات
                  مبتكرة وسهلة الاستخدام.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">قيمنا الأساسية</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              القيم التي نؤمن بها ونتخذها كمرشد في جميع قراراتنا وأعمالنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
                <div className="mb-6 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <value.Icon className="w-8 h-8 text-primary-500 dark:text-orange-500" />
                  </div>
                </div>
                <h3 className="heading-3 mb-4">{value.title}</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">فريقنا</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              يقود المنصة مطور ويب ثلاثي الأبعاد يعمل بجهد لتحقيق رؤيتنا
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              {teamMembers.map((member, index) => (
                <div key={index} className="card p-8 text-center group hover:shadow-xl transition-all duration-300">
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Code className="w-10 h-10 text-primary-500 dark:text-orange-500" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 dark:text-orange-500 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-6">
                    {member.bio}
                  </p>
                  <div className="flex justify-center gap-3">
                    <a href={member.website} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 group/link">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/link:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    </a>
                    <a href={`mailto:${member.email}`} className="w-10 h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 group/link">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover/link:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
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
            سواء كنت مبدعاً تريد مشاركة قوالبك، أو مستخدماً تبحث عن حلول تنظيمية،
            نحن هنا لمساعدتك في رحلتك نحو الإنتاجية والتنظيم.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              ابدأ الآن
            </Link>
            <Link href="/contact" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
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
