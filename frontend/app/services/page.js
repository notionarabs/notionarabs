import Link from 'next/link';
import { LayoutDashboard, Zap, Users, Briefcase, BookOpen, Settings, CheckCircle } from 'lucide-react';

const services = [
  {
    title: "مساحات عمل مخصصة",
    description: "تصميم قواعد بيانات ولوحات تحكم تتناسب مع فريقك وأهدافك.",
    Icon: LayoutDashboard
  },
  {
    title: "أتمتة وتكاملات",
    description: "أتمتة العمليات وربط نوشن مع الأدوات التي تعتمد عليها.",
    Icon: Zap
  },
  {
    title: "تدريب وتبنّي الفريق",
    description: "جلسات تدريب وخطط تبنّي لضمان استخدام فعال للنظام.",
    Icon: Users
  },
  {
    title: "بوابات عملاء ومشاريع",
    description: "تجارب عملاء احترافية مبنية على بيانات نوشن الحية.",
    Icon: Briefcase
  },
  {
    title: "حوكمة المعرفة",
    description: "تنظيم السياسات والوثائق والمراجع في مصدر موحد.",
    Icon: BookOpen
  },
  {
    title: "تحسين العمليات",
    description: "تحليل مسارات العمل وبناء نظام قابل للتوسع.",
    Icon: Settings
  }
];

const steps = [
  "الاستماع والتحليل",
  "تصميم الهيكل",
  "البناء والتنفيذ",
  "الأتمتة والتكامل",
  "التدريب والتسليم",
  "دعم وتحسين مستمر"
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">
              خدمات عرب نوشن
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-0">
              حلول احترافية لنوشن تساعدك على تنظيم العمل، تقليل التشتت، وزيادة الإنتاجية.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="card-interactive p-5 sm:p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-tertiary flex items-center justify-center shadow-sm mb-4">
                  <service.Icon className="w-6 h-6 text-primary-600 dark:text-orange-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              منهجية عمل واضحة
            </h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نعمل وفق خطوات منظمة تضمن بناء نظام عملي وقابل للتطور.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, idx) => (
              <div key={step} className="rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm text-accent-500 dark:text-dark-text-tertiary mb-2">
                  <CheckCircle className="w-4 h-4" />
                  المرحلة {idx + 1}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">احجز استشارة أولية</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto">
            دعنا نفهم احتياجاتك ونقترح أفضل نظام نوشن لفريقك.
          </p>
          <Link href="/contact" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
            تواصل معنا الآن
          </Link>
        </div>
      </section>
    </main>
  );
}
