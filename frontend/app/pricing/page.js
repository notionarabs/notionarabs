'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const pricingPlans = [
  {
    name: "مجاني",
    price: "0",
    period: "شهرياً",
    description: "مثالي للبدء واستكشاف المنصة",
    features: [
      "تصفح جميع القوالب",
      "تحميل 3 قوالب شهرياً",
      "دعم المجتمع",
      "وصول إلى المدونة",
      "إنشاء حساب مبدع"
    ],
    limitations: [
      "حد أقصى 3 تحميلات شهرياً",
      "لا يمكن بيع القوالب",
      "دعم محدود"
    ],
    popular: false,
    cta: "ابدأ مجاناً",
    ctaLink: "/signup"
  },
  {
    name: "مبدع",
    price: "29",
    period: "شهرياً",
    description: "مثالي للمبدعين الذين يريدون بيع قوالبهم",
    features: [
      "تحميل غير محدود",
      "رفع وبيع القوالب",
      "إحصائيات مفصلة",
      "دعم أولوية",
      "أدوات التسويق",
      "إدارة الطلبات",
      "دفع آمن"
    ],
    limitations: [],
    popular: true,
    cta: "ابدأ ك مبدع",
    ctaLink: "/signup?plan=creator"
  },
  {
    name: "احترافي",
    price: "49",
    period: "شهرياً",
    description: "للمحترفين والشركات",
    features: [
      "جميع مميزات مبدع",
      "قوالب حصرية",
      "دعم مخصص",
      "أدوات متقدمة",
      "تحليلات مفصلة",
      "API مخصص",
      "تدريب شخصي"
    ],
    limitations: [],
    popular: false,
    cta: "ابدأ احترافياً",
    ctaLink: "/signup?plan=professional"
  }
];

const faqs = [
  {
    question: "هل يمكنني تغيير الخطة في أي وقت؟",
    answer: "نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. التغييرات ستطبق فوراً على حسابك."
  },
  {
    question: "ماذا يحدث للقوالب المحملة عند إلغاء الاشتراك؟",
    answer: "ستحتفظ بجميع القوالب التي حملتها أثناء فترة الاشتراك. لن تتمكن من تحميل قوالب جديدة إلا بعد تجديد الاشتراك."
  },
  {
    question: "هل يمكنني الحصول على استرداد؟",
    answer: "نعم، نقدم استرداد كامل خلال 30 يوماً من تاريخ الاشتراك إذا لم تكن راضياً عن الخدمة."
  },
  {
    question: "كيف يتم الدفع؟",
    answer: "نقبل جميع البطاقات الائتمانية الرئيسية، PayPal، والتحويل البنكي. جميع المعاملات محمية بتشفير SSL."
  },
  {
    question: "هل هناك خصومات للطلاب؟",
    answer: "نعم، نقدم خصم 50% للطلاب مع إثبات الهوية الطلابية. تواصل معنا للحصول على الخصم."
  },
  {
    question: "هل يمكنني استخدام القوالب تجارياً؟",
    answer: "نعم، جميع القوالب تأتي مع رخصة للاستخدام التجاري. يمكنك استخدامها في مشاريعك الشخصية والتجارية."
  }
];

const features = [
  {
    title: "قوالب عالية الجودة",
    description: "جميع القوالب مصممة بعناية من قبل مبدعين محترفين",
    icon: "⭐"
  },
  {
    title: "دعم فني 24/7",
    description: "فريق الدعم متاح لمساعدتك في أي وقت",
    icon: "🛠️"
  },
  {
    title: "تحديثات مستمرة",
    description: "نضيف قوالب جديدة ومميزات بانتظام",
    icon: "🔄"
  },
  {
    title: "مجتمع نشط",
    description: "انضم إلى مجتمع من المبدعين والمستخدمين",
    icon: "👥"
  },
  {
    title: "أمان عالي",
    description: "بياناتك محمية بأعلى معايير الأمان",
    icon: "🔒"
  },
  {
    title: "سهولة الاستخدام",
    description: "واجهة بسيطة وسهلة للاستخدام",
    icon: "✨"
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const toggleBillingPeriod = () => {
    setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly');
  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">خطط الأسعار</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto mb-8">
              اختر الخطة المناسبة لك واستمتع بجميع مميزات منصتنا
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-accent-500 dark:text-dark-text-primary' : 'text-accent-400 dark:text-dark-text-quaternary'}`}>
                شهري
              </span>
              <button
                onClick={toggleBillingPeriod}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-dark-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-accent-500 dark:text-dark-text-primary' : 'text-accent-400 dark:text-dark-text-quaternary'}`}>
                سنوي
                <span className="mr-1 px-2 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-xs rounded-full">
                  خصم 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative card p-8 ${plan.popular ? 'card-featured scale-105' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      الأكثر شعبية
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="heading-3 mb-2">{plan.name}</h3>
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-accent-500 dark:text-dark-text-primary">
                      {billingPeriod === 'yearly' ? Math.round(parseInt(plan.price) * 0.8) : plan.price}
                    </span>
                    <span className="text-accent-600 dark:text-dark-text-secondary mr-1">
                      ريال
                    </span>
                    <span className="text-accent-400 dark:text-dark-text-quaternary text-sm">
                      / {plan.period}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price !== '0' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      وفر {Math.round(parseInt(plan.price) * 0.2 * 12)} ريال سنوياً
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-accent-600 dark:text-dark-text-secondary text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-gray-400 dark:text-dark-text-quaternary text-sm">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                    ? 'btn-primary'
                    : 'btn-outline'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">لماذا تختار عرب نوشن؟</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نحن نقدم أفضل تجربة ممكنة للمستخدمين والمبدعين على حد سواء
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="heading-3 mb-3">{feature.title}</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  {feature.description}
                </p>
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
              إجابات على أكثر الأسئلة شيوعاً حول خططنا وخدماتنا
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card p-6">
                  <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-accent-600 dark:text-dark-text-secondary">
                    {faq.answer}
                  </p>
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
            ابدأ رحلتك معنا اليوم
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون بنا لتنظيم حياتهم وزيادة إنتاجيتهم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              ابدأ مجاناً
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
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
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
