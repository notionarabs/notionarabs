'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import {
  Target,
  Lightbulb,
  Trophy,
  GraduationCap,
  Puzzle,
  Settings,
  BookOpen,
  Rocket,
  Star,
  MessageSquare,
  Youtube,
  Facebook,
  Send,
  Users,
  ChevronLeft,
  Zap,
  TrendingUp
} from 'lucide-react';
import Footer from '../../components/Footer';

const features = [
  {
    title: "حلول نوشن مخصصة",
    description: "نبني أنظمة عمل ولوحات تحكم تناسب الأفراد والفرق.",
    Icon: Settings
  },
  {
    title: "متجر قوالب عربي",
    description: "قوالب جاهزة وعملية تساعدك تبدأ بسرعة وتحقق نتائج واضحة.",
    Icon: Puzzle
  },
  {
    title: "مجتمع المبدعين العرب",
    description: "نُمكّن صُنّاع القوالب من البيع والانتشار والتعاون.",
    Icon: Users
  },
  {
    title: "تعليم وتدريب عملي",
    description: "محتوى تطبيقي يقرّب نوشن لكل مستخدم بطريقة بسيطة.",
    Icon: GraduationCap
  },
  {
    title: "أتمتة وتكاملات",
    description: "نربط نوشن بالأدوات التي تعتمد عليها لتقليل التشتت.",
    Icon: Zap
  }
];

const steps = [
  {
    number: "01",
    title: "نستمع ونحلل",
    description: "نحدد أهدافك ونفهم طريقة عملك قبل بناء أي حل.",
    Icon: Target
  },
  {
    number: "02",
    title: "نصمم ونبني",
    description: "نطوّر النظام أو القالب بما يتناسب مع احتياجك الفعلي.",
    Icon: Settings
  },
  {
    number: "03",
    title: "نطلق وندعم",
    description: "نقدّم تدريبًا ودعمًا لضمان اعتماد الحل واستمراريته.",
    Icon: Rocket
  }
];

const futureGoals = [
  {
    title: "توسيع مكتبة القوالب العربية لتشمل كل المجالات",
    Icon: BookOpen
  },
  {
    title: "تمكين المبدعين العرب من بيع قوالبهم عالميًا",
    Icon: TrendingUp
  },
  {
    title: "تطوير خدمات الأتمتة والتكاملات للشركات والفرق",
    Icon: Zap
  },
  {
    title: "أن نصبح المرجع العربي الأول لكل ما يتعلق بنوشن",
    Icon: Star
  }
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'من نحن | عرب نوشن - خدمات نوشن ومتجر قوالب ومجتمع مبدعين';
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 via-primary-50/30 to-accent-100 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">من نحن | عرب نوشن</h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-accent-700 dark:text-dark-text-secondary font-semibold max-w-3xl mx-auto px-4 mb-4">
              خدمات نوشن احترافية، متجر قوالب، ومجتمع عربي للمبدعين
            </p>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-4xl mx-auto px-4 leading-relaxed">
              نحن في عرب نوشن نؤمن أن نوشن مش مجرد أداة لتنظيم المهام —
              بل نظام عمل متكامل يساعدك تبني عمليات واضحة، وتتعلم أسرع، وتكبر شغلك بثقة.
            </p>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed px-4">
              من هنا، وُلدت فكرتنا: منصة تجمع الخدمات المخصصة، القوالب العملية،
              والمحتوى التطبيقي في مكان واحد يخدم العرب أينما كانوا.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 justify-center mb-6 sm:mb-8">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">رؤيتنا</h2>
            </div>
            <div className="card p-6 sm:p-8 md:p-10">
              <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center">
                أن نصبح الوجهة العربية الأولى لكل ما يتعلق بنوشن —
                خدمات مخصصة، قوالب عالية الجودة، ومجتمع يتبادل الخبرات.
                نريد أن نكون الجسر بين الفكرة والتطبيق داخل بيئة منظمة وسهلة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 justify-center mb-6 sm:mb-8">
              <Lightbulb className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">رسالتنا</h2>
            </div>
            <div className="card p-6 sm:p-8 md:p-10">
              <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center mb-4">
                نحوّل احتياجك إلى نظام عمل عملي ومفهوم باللغة العربية.
              </p>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center">
                نساعد الأفراد والفرق على بناء أنظمة نوشن فعّالة، ونُمكّن المبدعين العرب من نشر وبيع قوالبهم،
                مع توفير موارد تعليمية تساعد الجميع على الاستخدام الصحيح والمستمر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Special Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">ما الذي يميز عرب نوشن؟</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="card p-5 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500 dark:text-orange-500" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">كيف نعمل؟</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card p-6 sm:p-8 h-full hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl sm:text-6xl font-bold text-primary-500/20 dark:text-orange-500/20">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-xl flex items-center justify-center shrink-0">
                      <step.Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-500 dark:text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -left-4 transform -translate-y-1/2">
                    <ChevronLeft className="w-8 h-8 text-primary-500 dark:text-orange-500" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-8 sm:mt-10">
            <div className="card p-6 sm:p-8 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-orange-500/10 dark:to-orange-600/10">
              <p className="text-base sm:text-lg text-accent-700 dark:text-dark-text-secondary text-center leading-relaxed">
                بهذه الطريقة، يصبح نوشن أداة للتعلم، والإنتاجية، والإبداع في آنٍ واحد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 justify-center mb-6 sm:mb-8">
              <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">رحلتنا</h2>
            </div>
            <div className="card p-6 sm:p-8 md:p-10">
              <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center mb-4">
                بدأت عرب نوشن كمجتمع صغير يؤمن بأن نوشن يحتاج مساحة عربية واضحة وعملية.
              </p>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center">
                واليوم، نبني نظامًا متكاملًا يجمع الخدمات والاستشارات، متجر القوالب،
                ودعم المبدعين في مكان واحد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Vision Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500 dark:text-orange-500 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">رؤيتنا للمستقبل</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {futureGoals.map((goal, index) => (
              <div key={index} className="card p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-orange-500/20 dark:to-orange-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <goal.Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-500 dark:text-orange-500" />
                  </div>
                  <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed pt-2">
                    {goal.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-600 dark:to-orange-700 transition-colors duration-300">
        <div className="container-custom text-center">
          <div className="flex items-center gap-3 justify-center mb-6">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              انضم إلينا
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
            نبحث عن مواهب شغوفة بالنظم، الأتمتة، وبناء تجارب عربية احترافية في نوشن.
          </p>
          <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            لو تحب تشتغل على مشاريع حقيقية وتأثير ملموس — انضم لفريقنا وشاركنا رحلتنا.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-6 sm:mb-8">
            شاركنا التأثير. ابنِ معنا.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link href="/careers" className="btn-secondary px-8 sm:px-10 py-3 sm:py-4 bg-white text-primary-500 hover:bg-gray-100 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              انضم للفريق
            </Link>
            <Link href="/contact" className="px-8 sm:px-10 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl border-2 border-white/30 transition-all duration-300">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
