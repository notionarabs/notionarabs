'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FolderTree, Target, Zap } from 'lucide-react';
import Footer from '../components/Footer';
import { processSteps, services, testimonials } from '../lib/marketingContent';

export default function HomePage() {
  const [animationsPlayed, setAnimationsPlayed] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [inViewSteps, setInViewSteps] = useState([]);
  const [lineHeight, setLineHeight] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);

  // Respect reduced motion and stop replaying animations.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationsPlayed(true);
      return undefined;
    }

    const timer = setTimeout(() => {
      setAnimationsPlayed(true);
    }, 2000); // After all animations complete (0.9s + 1s)

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }
    const elements = Array.from(document.querySelectorAll('[data-draw-icon]'));
    if (elements.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('icon-draw-animate');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const targets = stepRefs.current.filter(Boolean);
    if (targets.length === 0) {
      return undefined;
    }

    const triggerStep = (index) => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setInViewSteps((prev) => {
            if (prev.includes(index)) {
              return prev;
            }
            return [...prev, index];
          });
        }, 120);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.intersectionRatio === 0) {
            return;
          }
          const index = Number(entry.target.dataset.stepIndex);
          if (!Number.isNaN(index)) {
            triggerStep(index);
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -20% 0px' }
    );

    targets.forEach((target) => {
      observer.observe(target);
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        triggerStep(Number(target.dataset.stepIndex));
        observer.unobserve(target);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const sections = Array.from(document.querySelectorAll('[data-reveal-section]'));
    if (sections.length === 0) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sections.forEach((section, index) => {
      section.classList.add('reveal-on-scroll');
      section.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 80}ms`);
    });

    if (prefersReducedMotion) {
      sections.forEach((section) => section.classList.add('is-revealed'));
      return undefined;
    }

    requestAnimationFrame(() => {
      document.documentElement.classList.add('reveal-ready');
    });

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-revealed');
          observerInstance.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -15% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);

  const timelineRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const steps = stepRefs.current;
      const container = timelineRef.current;

      if (!steps.length || !steps[0] || !container) return;

      const containerRect = container.getBoundingClientRect();
      const triggerPoint = window.innerHeight / 2;

      const relativeScrollPos = triggerPoint - containerRect.top;

      const firstStepTop = steps[0].offsetTop + (steps[0].offsetHeight / 2);
      const lastStepTop = steps[steps.length - 1].offsetTop + (steps[steps.length - 1].offsetHeight / 2);

      const totalDistance = lastStepTop - firstStepTop;
      const currentProgress = relativeScrollPos - firstStepTop;

      setLineHeight(Math.max(0, Math.min(currentProgress, totalDistance)));

      let currentActive = 0;
      steps.forEach((step, idx) => {
        const stepCenter = step.offsetTop + (step.offsetHeight / 2);
        if (relativeScrollPos > stepCenter - 100) {
          currentActive = idx;
        }
      });
      setActiveStep(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Enhanced Hero Section with Notion-inspired Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-14 xl:py-16 transition-colors duration-300 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-72px)] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Floating Notion-style Blocks */}
          <div className="hidden sm:block absolute top-20 left-10 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 rounded-lg shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden sm:block absolute top-40 right-20 w-12 h-12 bg-gray-100/70 dark:bg-dark-quaternary/70 rounded-md shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-32 left-1/4 w-20 h-20 bg-white/50 dark:bg-dark-tertiary/50 rounded-xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden lg:block absolute top-1/3 right-1/3 w-14 h-14 bg-gray-50/80 dark:bg-dark-quaternary/80 rounded-lg shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-20 right-10 w-18 h-18 bg-white/40 dark:bg-dark-tertiary/40 rounded-2xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>

          {/* Gradient Orbs */}
          <div className="hidden sm:block absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-orange-500/10 dark:to-orange-600/10 rounded-full blur-3xl motion-safe:animate-pulse"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-100/40 to-black/20 dark:from-dark-tertiary/20 dark:to-dark-primary/40 rounded-full blur-3xl motion-safe:animate-pulse"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Well-Separated Animated Template Squares */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Large Blue Template - Top Left */}
          <div className="hidden lg:block absolute top-16 left-16 w-32 h-32 bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl mb-3 shadow-lg"></div>
              <div className="w-16 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Green Template - Top Right */}
          <div className="hidden lg:block absolute top-24 right-24 w-20 h-20 bg-white/70 dark:bg-dark-tertiary/70 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Small Purple Template - Middle Left */}
          <div className="hidden md:block absolute top-1/2 left-8 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 backdrop-blur-sm rounded-lg shadow-md dark:shadow-dark-soft floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-3">
              <div className="w-6 h-6 bg-purple-500 rounded-md mb-1"></div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Extra Large Orange Template - Bottom Right */}
          <div className="hidden xl:block absolute bottom-16 right-16 w-36 h-36 bg-white/50 dark:bg-dark-tertiary/50 backdrop-blur-sm rounded-3xl shadow-2xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-xl"></div>
              <div className="w-20 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-16 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-12 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Red Template - Bottom Left */}
          <div className="hidden lg:block absolute bottom-24 left-12 w-24 h-24 bg-white/65 dark:bg-dark-tertiary/65 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-14 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-10 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>
        </div>

        <div className="container-custom relative z-10">
          {/* Hero Content */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              {/* Enhanced Badge with Better Contrast */}
              <div className={`inline-flex items-center px-4 py-2 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-full text-sm font-semibold mb-6 ${!animationsPlayed ? 'text-reveal' : ''} shadow-lg dark:shadow-dark-medium border border-primary-300 dark:border-orange-400/50 transition-colors duration-300`}>
                <span className="w-2 h-2 bg-primary-600 dark:bg-orange-400 rounded-full ml-2 pulse-glow"></span>
                خدمات وأنظمة نوشن احترافية
              </div>

              {/* Main Heading */}
              <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-accent-900 dark:text-white mb-4 sm:mb-6 ${!animationsPlayed ? 'text-reveal-delayed' : ''} leading-tight tracking-tighter`}>
                <div className="block">
                  <div className="block">خدمات نوشن</div>
                  <div className="block mt-2 md:mt-3 lg:mt-4"><span className="">وأنظمة مخصصة لأعمالك</span></div>
                </div>
              </h1>

              {/* Enhanced Description with Better Typography */}
              <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayed ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                نبني لك أنظمة نوشن ذكية لإدارة العمل والمشاريع والمعرفة — من التخطيط إلى التنفيذ والأتمتة، بتصميم عربي واضح وتجربة سهلة.
              </p>

              {/* Enhanced CTA Buttons with Better Animations */}
              <div className={`flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 ${!animationsPlayed ? 'text-reveal-delayed-3' : ''}`}>
                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  اطلب خدمتك الآن
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-xl border-2 border-primary-300 dark:border-orange-400/50 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  تصفح القوالب
                </Link>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
            <div className="text-center lg:text-right">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                المشكلات التي نحلها
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                نحول الفوضى إلى نظام واضح يساعد فريقك على التنفيذ بثقة وسرعة.
              </p>
            </div>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
              {[
                {
                  title: 'أدوات كثيرة بلا رؤية موحدة',
                  description: 'المهام والملفات موزعة بين تطبيقات متعددة بدون لوحة تحكم واحدة.',
                  size: 'lg',
                  tone: 'from-blue-50/80 to-blue-100/40 dark:from-blue-500/10 dark:to-blue-500/5',
                  badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-200'
                },
                {
                  title: 'غياب أولوية واضحة للعمل',
                  description: 'الفرق تعمل بلا مسارات أو أولويات واضحة مما يبطّئ الإنجاز.',
                  size: 'sm',
                  tone: 'from-amber-50/80 to-orange-100/40 dark:from-orange-500/10 dark:to-orange-500/5',
                  badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
                },
                {
                  title: 'عمليات يدوية متكررة',
                  description: 'وقت ضائع في تحديثات وأعمال روتينية يمكن أتمتتها بسهولة.',
                  size: 'md',
                  tone: 'from-emerald-50/80 to-emerald-100/40 dark:from-emerald-500/10 dark:to-emerald-500/5',
                  badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                },
                {
                  title: 'معرفة مؤسسية مشتتة',
                  description: 'المعلومات المهمة غير منظمة ولا يمكن الوصول لها بسرعة.',
                  size: 'lg',
                  tone: 'from-purple-50/80 to-purple-100/40 dark:from-purple-500/10 dark:to-purple-500/5',
                  badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-200'
                }
              ].map((item, idx) => {
                const isLarge = item.size === 'lg';
                const isSmall = item.size === 'sm';
                return (
                  <div
                    key={idx}
                    className={`group card-interactive cursor-default mb-4 sm:mb-6 break-inside-avoid rounded-2xl border border-white/60 dark:border-dark-card-border/60 bg-gradient-to-br ${item.tone} ${isLarge ? 'p-6 sm:p-7' : isSmall ? 'p-5' : 'p-5 sm:p-6'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${item.badge}`}>
                        المشكلة {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <h3 className={`${isLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} font-semibold text-accent-900 dark:text-dark-text-primary mb-2`}>
                      {item.title}
                    </h3>
                    <p className={`${isLarge ? 'text-sm sm:text-base' : 'text-sm'} text-accent-600 dark:text-dark-text-secondary leading-relaxed`}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-black transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
            <div className="order-1 lg:order-1 lg:sticky lg:top-24 self-start">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 lg:mb-6 text-center lg:text-right">
                خدمات نوشن المصممة لعملك
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0 text-center lg:text-right">
                نبني لك نظامًا متكاملاً يغطي التخطيط، التنفيذ، المتابعة، والتحسين المستمر.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 justify-center lg:justify-start"></div>
            </div>
            <div className="order-2 lg:order-2">
              <div className="space-y-4 sm:space-y-5">
                {services.map((service, idx) => (
                  <div key={idx} className="group card-interactive cursor-default p-5 sm:p-6 h-full flex gap-4 sm:gap-5 items-start">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white dark:bg-dark-tertiary flex items-center justify-center shadow-sm">
                      <service.Icon className="w-6 h-6 text-primary-600 dark:text-orange-400 fill-none icon-draw icon-draw-hover" data-draw-icon />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                        {service.title}
                      </h3>
                      <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Do It Section */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              كيف ننفّذ العمل؟
            </h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              خطوات واضحة من التشخيص وحتى التسليم لضمان نظام فعّال وقابل للتطوير.
            </p>
          </div>
          <div className="relative">
            {/* Central Timeline Axis */}
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-300/60 via-primary-300/30 to-transparent dark:from-orange-400/60 dark:via-orange-400/30"></div>

            {/* Dynamic Progress Line */}
            <div
              className="hidden sm:block absolute left-1/2 -translate-x-1/2 w-0.5 bg-primary-500 dark:bg-orange-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              style={{
                top: stepRefs.current[0] ? (stepRefs.current[0].offsetHeight / 2) : 0,
                height: `${lineHeight}px`,
                maxHeight: '100%' // Safety cap
              }}
            ></div>

            <div className="space-y-8 sm:space-y-0">
              {processSteps.map((step, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  data-step-index={idx}
                  className="grid gap-4 items-center sm:grid-cols-[1fr_auto_1fr] sm:gap-0 relative"
                >
                  {/* Left Side Content */}
                  <div className={`sm:col-start-1 sm:pr-8 sm:text-right ${idx % 2 === 0 ? 'block' : 'hidden sm:invisible sm:block'}`}>
                    {idx % 2 === 0 && (
                      <div
                        className={`card-interactive cursor-default p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary step-card w-full ml-auto ${inViewSteps.includes(idx) ? 'is-visible' : ''
                          } from-right`}
                      >
                        <div className="step-card-shine absolute inset-0 pointer-events-none"></div>
                        <div
                          className={`text-xs sm:text-sm mb-2 text-accent-500 dark:text-dark-text-tertiary ${inViewSteps.includes(idx) ? 'step-highlight' : ''}`}
                          style={{
                            animationDelay: `${150 + idx * 180}ms`,
                            animationDuration: `${600 + idx * 120}ms`
                          }}
                        >
                          الخطوة {idx + 1}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center Dot - The Timeline Column */}
                  <div className="hidden sm:flex sm:col-start-2 justify-center items-center h-full relative" style={{ width: '40px' }}>
                    <span
                      className={`block w-3.5 h-3.5 rounded-full bg-primary-500 dark:bg-orange-400 shadow-[0_0_0_6px_rgba(249,115,22,0.12)] step-dot ${inViewSteps.includes(idx) ? 'is-active' : ''
                        }`}
                    ></span>
                  </div>

                  {/* Right Side Content */}
                  <div className={`sm:col-start-3 sm:pl-8 sm:text-left ${idx % 2 !== 0 ? 'block' : 'hidden sm:invisible sm:block'}`}>
                    {idx % 2 !== 0 && (
                      <div
                        className={`card-interactive cursor-default p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary step-card w-full mr-auto ${inViewSteps.includes(idx) ? 'is-visible' : ''
                          } from-left`}
                      >
                        <div className="step-card-shine absolute inset-0 pointer-events-none"></div>
                        <div
                          className={`text-xs sm:text-sm mb-2 text-accent-500 dark:text-dark-text-tertiary ${inViewSteps.includes(idx) ? 'step-highlight' : ''}`}
                          style={{
                            animationDelay: `${150 + idx * 180}ms`,
                            animationDuration: `${600 + idx * 120}ms`
                          }}
                        >
                          الخطوة {idx + 1}
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              ما الذي يميز عرب نوشن؟
            </h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نركز على النتائج، ونبني نظم واضحة قابلة للتطبيق من أول يوم.
            </p>
          </div>
          <div className="space-y-6 sm:space-y-8">
            {[
              {
                title: 'فهم عميق لاحتياجك',
                description: 'لا نقدّم قالباً جاهزاً، بل نحلل عملك ونبني نظاماً مناسباً لك.'
              },
              {
                title: 'تصميم عربي واضح',
                description: 'واجهة وتجربة مهيأة للغة العربية لتقليل اللبس وزيادة الاعتماد.'
              },
              {
                title: 'تطبيق عملي سريع',
                description: 'ننجز نسخاً قابلة للاستخدام خلال وقت قصير مع تدريب واضح.'
              },
              {
                title: 'أتمتة تقلل العمل اليدوي',
                description: 'نبني مسارات عمل تقلل التكرار وتزيد سرعة التنفيذ.'
              },
              {
                title: 'قياس وتحسين مستمر',
                description: 'نطور النظام بعد الإطلاق بناءً على نتائج واقعية.'
              },
              {
                title: 'فريق متخصص في نوشن',
                description: 'خبرات عملية في بناء قواعد البيانات والأتمتة للشركات.'
              }
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className={`flex flex-row items-stretch gap-3 sm:gap-6 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}>
                  <div className="flex-1 lg:w-auto w-full">
                    <div className="card-interactive h-full cursor-default p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary">
                      <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="w-fit">
                    <div className="inline-flex w-fit h-full rounded-3xl border border-dashed border-primary-200/70 dark:border-orange-500/30 bg-gradient-to-br from-primary-50/70 via-white to-secondary-50/80 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary p-3 sm:p-8 flex items-center justify-center">
                      <div className="w-fit text-3xl sm:text-5xl font-bold text-accent-500/60 dark:text-dark-text-tertiary">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies We Worked With */}
      {/* <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-dark-card-border bg-gradient-to-br from-white via-secondary-50 to-primary-50/60 dark:from-dark-secondary dark:via-dark-secondary dark:to-dark-primary p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-100/40 dark:bg-orange-500/10 blur-3xl"></div>
            <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full bg-secondary-100/60 dark:bg-dark-tertiary/30 blur-3xl"></div>
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
              <div className="text-center lg:text-right">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                  شركات عملنا معها
                </h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto lg:mx-0">
                  خبرات عملية مع فرق وشركات مختلفة لبناء نظم نوشن قابلة للاعتماد.
                </p>
                <div className="relative mt-8 text-center lg:text-right">
                  <Link href="/success-stories" className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                    شاهد قصص النجاح
                    <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'مشروع مكتمل', value: '+100' },
                  { label: 'فرق اعتمدت نوشن', value: '+30' },
                  { label: 'تحسين كفاءة العمل', value: '40%' },
                  { label: 'نظم مخصصة', value: '+70' }
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-2xl bg-white/90 dark:bg-dark-tertiary/80 border border-white/70 dark:border-dark-card-border/70 p-4 sm:p-5 text-center shadow-sm">
                    <div className="text-lg sm:text-xl font-bold text-accent-500 dark:text-dark-text-primary">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section> */}

      {/* Testimonials */}
      {/* <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
            <div className="text-center lg:text-right">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                آراء العملاء
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                تجارب حقيقية من فرق اعتمدت نظم نوشن لتطوير عملها.
              </p>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {testimonials.slice(0, 3).map((testimonial, idx) => (
                <div key={idx} className="group card-interactive cursor-default p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                      “{testimonial.quote}”
                    </div>
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-dark-tertiary text-accent-500 dark:text-dark-text-tertiary text-lg font-semibold">
                      {testimonial.name?.[0] || '؟'}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-accent-900 dark:text-dark-text-primary">
                      {testimonial.name}
                    </span>
                    <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center lg:text-right">
                <Link href="/success-stories" className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                  شاهد المزيد من الآراء
                  <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
            <div className="text-center lg:text-right lg:sticky lg:top-24 self-start">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                الأسئلة الشائعة
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                إجابات سريعة على أكثر الأسئلة تكراراً قبل حجز الاستشارة.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 justify-center lg:justify-start"></div>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {[
                {
                  question: 'هل نوشن مناسب للفِرق أم للأفراد فقط؟',
                  answer: 'نوشن مناسب للجميع. نصمم النظام حسب حجم الفريق وطبيعة العمل.'
                },
                {
                  question: 'لماذا أعتمد على نوشن لشركتي أو فريقي؟',
                  answer: 'نوشن ليس مجرد أداة، بل نظام متكامل لإدارة العمل. يتيح لك توحيد المشاريع، تنظيم الملفات، تسهيل التعاون بين الفرق، وأتمتة المهام الروتينية، كل ذلك بتصميم عربي سهل الاستخدام يساعد فريقك على إنجاز العمل أسرع وبكفاءة أعلى.'
                },
                {
                  question: 'هل أحتاج لاستشارة في نوشن؟',
                  answer: 'كل شركة تستخدم نوشن يمكن أن تستفيد من خبرة متخصصة. حتى لو كان لديك فريق كفء، فإن نظرة خارجية من خبرائنا تساعد على الاستفادة القصوى من إمكانيات نوشن، مع تقديم رؤية شاملة لعملياتك وفرصك.'
                },
                {
                  question: 'أخطط للانتقال إلى نوشن، كيف يمكنكم المساعدة؟',
                  answer: 'نساعدك على الانتقال من أدوات مثل Asana أو Monday أو Linear بطريقة منظمة، مع الحفاظ على جميع البيانات الحيوية لشركتك.'
                },
                {
                  question: 'هل تقدّمون خدمات برمجية؟',
                  answer: 'نعم، نقدم خدمات برمجية متكاملة، بما في ذلك ربط أنظمتك ومواقعك بنوشن لتسهيل إدارة البيانات والأتمتة بسلاسة داخل النظام.'
                },
                {
                  question: 'كم يستغرق بناء النظام؟',
                  answer: 'مدة تختلف حسب حجم المشروع، وغالباً تبدأ من اسبوع وقد تتجاوز الشهر'
                },
                {
                  question: 'هل يمكن ربط نوشن بأدواتنا الحالية؟',
                  answer: 'نعم، ندعم التكاملات والأتمتة مع الأدوات الشائعة لتسريع العمل.'
                },
                {
                  question: 'كيف أبدأ؟',
                  answer: 'احجز استشارة أولية وسنقترح عليك أفضل خطة حسب احتياجك.'
                }
              ].map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.question}
                    className="card-interactive cursor-pointer p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <div
                      className="w-full flex items-center justify-between gap-4 text-right"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-50 dark:bg-dark-tertiary text-xs font-semibold text-accent-500 dark:text-dark-text-tertiary">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-accent-500 dark:text-dark-text-primary">
                          {item.question}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-accent-500 dark:text-dark-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    {isOpen && (
                      <div
                        id={`faq-answer-${idx}`}
                        className="pt-4 pr-11 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
        <div className="container-custom">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-dark-card-border bg-gradient-to-br from-primary-500 via-accent-500 to-accent-600 dark:from-orange-500/10 dark:to-orange-500/5 p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 dark:bg-orange-500/10 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-16 w-64 h-64 rounded-full bg-black/10 blur-3xl"></div>
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
              backgroundSize: '22px 22px'
            }}></div>
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
              <div className="text-center lg:text-right">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/80 dark:text-dark-text-tertiary mb-3">
                  الخطوة التالية
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-4">
                  جاهز لبناء نظام نوشن يواكب نموك؟
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/80 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                  احجز استشارة أولية ودعنا نصمم لك نظامًا يسهّل العمل ويزيد الإنتاجية.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link href="/consultation" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
                    احجز استشارتك
                  </Link>
                  <Link href="/store" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 border-white/30 w-full sm:w-auto text-center">
                    استكشف المتجر
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'مدة البداية', value: 'أسبوع' },
                  { label: 'جلسة اكتشاف', value: '15 دقيقة' },
                  { label: 'خطة تنفيذ', value: 'واضحة' },
                  { label: 'دعم مستمر', value: 'مباشر' }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/25 dark:border-dark-card-border/30 bg-white/10 dark:bg-white/5 p-4 text-center">
                    <div className="text-base sm:text-lg font-semibold text-white dark:text-dark-text-primary">{item.value}</div>
                    <div className="text-xs sm:text-sm text-white/80 dark:text-dark-text-secondary mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
