'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import {
  Globe,
  Target,
  Lightbulb,
  Trophy,
  GraduationCap,
  Puzzle,
  Handshake,
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

const features = [
  {
    title: "التركيز على التعليم العملي",
    description: "التعلم عندنا قائم على التطبيق من خلال القوالب",
    Icon: GraduationCap
  },
  {
    title: "نوشن في كل المجالات",
    description: "تعليم، إنتاجية، إدارة، تخطيط، تطوير ذات، تصميم... والمزيد",
    Icon: Puzzle
  },
  {
    title: "مجتمع عربي من المبدعين",
    description: "نحتفي بكل من يصنع قوالب أو يشارك أدواته على نوشن",
    Icon: Users
  },
  {
    title: "مرونة وابتكار",
    description: "القوالب عندنا قابلة للتخصيص لتناسب كل مستخدم وكل هدف",
    Icon: Settings
  },
  {
    title: "منصة تعليمية وتجارية",
    description: "مكان واحد للتعلم، البيع، والانتشار",
    Icon: Zap
  }
];

const steps = [
  {
    number: "01",
    title: "المبدع يصمم",
    description: "المبدع أو الخبير يصمم قالبًا تفاعليًا يعكس خبرته أو فكرته",
    Icon: Lightbulb
  },
  {
    number: "02",
    title: "المنصة تنشر",
    description: "المنصة تنشر القالب وتعرضه ضمن تصنيفاته المناسبة",
    Icon: Globe
  },
  {
    number: "03",
    title: "المستخدم يتعلم",
    description: "المتعلم أو المستخدم يحمّله ويبدأ تجربته التعليمية أو الإنتاجية على الفور",
    Icon: GraduationCap
  }
];

const futureGoals = [
  {
    title: "بناء أكبر مكتبة تعليمية عربية من قوالب نوشن",
    Icon: BookOpen
  },
  {
    title: "دعم صُنّاع القوالب العرب للوصول إلى جمهور عالمي",
    Icon: TrendingUp
  },
  {
    title: "إطلاق مبادرات تعليمية وتفاعلية شهرية داخل المجتمع",
    Icon: Handshake
  },
  {
    title: "أن نصبح مرجع العرب الأول في كل ما يتعلق بنوشن",
    Icon: Star
  }
];

export default function AboutPage() {
  useEffect(() => {
    document.title = 'من نحن | عرب نوشن - منصة تعليمية ومجتمع متكامل لعشّاق نوشن';
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
              منصة تعليمية.. ومجتمع متكامل لعشّاق نوشن
            </p>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-4xl mx-auto px-4 leading-relaxed">
              نحن في عرب نوشن نؤمن أن نوشن مش مجرد أداة لتنظيم المهام —
              بل مساحة إبداع غير محدودة يمكن من خلالها التعلّم، الإلهام، والبناء.
            </p>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed px-4">
              من هنا، وُلدت فكرتنا: أن نجعل التعليم العملي والتطبيقي هو جوهر المنصة،
              مع الحفاظ على اهتمامنا بكل ما يخص نوشن من قوالب، وأفكار، ومجتمع مبدعين عربي متكامل.
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
                من التعليم التفاعلي إلى الإلهام والإبداع.
                نريد أن نكون الجسر بين الخبراء والمتعلمين، وبين الفكرة والتطبيق، داخل بيئة منظمة وسهلة.
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
                نحوّل كل خبرة إلى تجربة تعليمية تفاعلية من خلال قوالب نوشن.
              </p>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center">
                نساعد الخبراء والمعلمين والمبدعين العرب على مشاركة معارفهم في شكل قوالب عملية،
                وفي الوقت نفسه، نوفّر مساحة لعشّاق نوشن لاستكشاف، تحميل، ومشاركة أفكارهم وأعمالهم بحرية.
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
                بدأت عرب نوشن من مجتمع بسيط من صُنّاع المحتوى العرب المؤمنين بأن نوشن يستحق مساحة عربية تجمعنا.
              </p>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed text-center">
                واليوم، نعمل على بناء أول نظام بيئي عربي حول نوشن —
                يجمع القوالب التعليمية، المجتمعات التفاعلية، وأدوات المبدعين في مكان واحد.
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
            سواء كنت خبيرًا، طالبًا، أو عاشقًا للتنظيم والإنتاجية —
            هتلاقي مكانك في عرب نوشن.
          </p>
          <p className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed">
            ابدأ رحلتك معنا وشارك خبرتك أو اكتشف قوالب جديدة تساعدك تطور نفسك وشغلك.
          </p>
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-6 sm:mb-8">
            شارك. تعلّم. ابتكر. مع عرب نوشن.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link href="/signup" className="btn-secondary px-8 sm:px-10 py-3 sm:py-4 bg-white text-primary-500 hover:bg-gray-100 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              انضم الآن
            </Link>
            <Link href="/templates" className="px-8 sm:px-10 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto text-center text-base sm:text-lg font-semibold rounded-xl border-2 border-white/30 transition-all duration-300">
              استكشف القوالب
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
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة يوتيوب عرب نوشن">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="صفحة فيسبوك عرب نوشن">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="مجموعة فيسبوك عرب نوشن">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة تيليجرام عرب نوشن">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="حساب تويتر عرب نوشن">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
