'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const teamMembers = [
  {
    name: "أحمد المطيري",
    role: "المؤسس والرئيس التنفيذي",
    bio: "خبير في التقنية والإنتاجية، عمل في شركات التقنية الكبرى لأكثر من 10 سنوات",
    imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "فاطمة نور",
    role: "مديرة التصميم",
    bio: "مصممة تجربة مستخدم متخصصة في أدوات الإنتاجية، حاصلة على جوائز في التصميم",
    imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "عمر خالد",
    role: "مدير التطوير",
    bio: "مطور برمجيات متخصص في تطبيقات الويب، خبرة 8 سنوات في تطوير المنصات",
    imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  },
  {
    name: "ليلى أحمد",
    role: "مديرة التسويق",
    bio: "خبيرة في التسويق الرقمي وبناء المجتمعات، ساعدت في نمو العديد من الشركات الناشئة",
    imgSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    linkedin: "#",
    twitter: "#"
  }
];

const values = [
  {
    title: "الابتكار",
    description: "نؤمن بقوة الابتكار في تحسين تجربة المستخدمين وتطوير حلول جديدة",
    icon: "💡"
  },
  {
    title: "الجودة",
    description: "نلتزم بتقديم أعلى مستويات الجودة في جميع منتجاتنا وخدماتنا",
    icon: "⭐"
  },
  {
    title: "المجتمع",
    description: "نبني مجتمعاً قوياً من المبدعين والمستخدمين الذين يدعمون بعضهم البعض",
    icon: "🤝"
  },
  {
    title: "الشفافية",
    description: "نؤمن بالشفافية في جميع تعاملاتنا مع المستخدمين والشركاء",
    icon: "🔍"
  }
];

const stats = [
  { number: "10,000+", label: "قالب متاح" },
  { number: "500+", label: "مبدع عربي" },
  { number: "50,000+", label: "تحميل شهري" },
  { number: "4.9", label: "تقييم المستخدمين" }
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
              عرب نوشن هي منصة عربية متخصصة في بيع وشراء قوالب نوتيون المبتكرة.
              نحن نؤمن بقوة التنظيم والإنتاجية في تحسين حياة الناس، ونسعى لجعل هذه الأدوات
              متاحة ومفهومة للجمهور العربي.
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

      {/* Mission Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="heading-2 mb-6">مهمتنا</h2>
                <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-6">
                  مهمتنا هي تمكين المبدعين العرب من مشاركة معرفتهم وخبراتهم من خلال
                  قوالب نوتيون عالية الجودة، ومساعدة المستخدمين في العثور على الحلول
                  المناسبة لاحتياجاتهم التنظيمية والإنتاجية.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  نؤمن أن التنظيم والإنتاجية يجب أن يكونا متاحين للجميع، بغض النظر عن
                  الخلفية التقنية أو مستوى الخبرة. لذلك نعمل على جعل قوالب نوتيون
                  سهلة الفهم والاستخدام للجمهور العربي.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary-500 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">قيمنا</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              القيم التي نؤمن بها ونتخذها كمرشد في جميع قراراتنا وأعمالنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="card p-8 text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
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
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">فريقنا</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              فريق من الخبراء والمبدعين الذين يعملون بجد لتحقيق رؤيتنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="relative mb-6">
                  <Image
                    src={member.imgSrc}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="w-24 h-24 rounded-full object-cover mx-auto"
                  />
                </div>
                <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-500 dark:text-orange-500 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-4">
                  {member.bio}
                </p>
                <div className="flex justify-center gap-3">
                  <a href={member.linkedin} className="w-8 h-8 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a href={member.twitter} className="w-8 h-8 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-accent-100 to-primary-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-32 h-32 text-accent-500 dark:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="heading-2 mb-6">قصتنا</h2>
                <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-6">
                  بدأت عرب نوشن كفكرة بسيطة عندما لاحظنا الحاجة الماسة في السوق العربي
                  لمنصة متخصصة في قوالب نوتيون باللغة العربية.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-6">
                  بعد سنوات من العمل في مجال التقنية والإنتاجية، أدركنا أن هناك فجوة
                  كبيرة بين الأدوات المتاحة باللغة الإنجليزية واحتياجات المستخدمين العرب.
                  لذلك قررنا إنشاء منصة تجمع بين أفضل قوالب نوتيون مع الترجمة والتوطين
                  المناسب للثقافة العربية.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  اليوم، نحن فخورون بأن نكون المنصة الرائدة في هذا المجال، ونعمل باستمرار
                  على تطوير وتحسين تجربة المستخدمين والمبدعين على حد سواء.
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
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
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
