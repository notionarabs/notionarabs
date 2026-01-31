import Link from 'next/link';
import { Quote, Star } from 'lucide-react';
import Footer from '../../components/Footer';
import { caseStudies, testimonials } from '../../lib/marketingContent';

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">
              قصص النجاح وآراء العملاء
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-0">
              نتائج حقيقية وتجارب مثبتة من فرق استخدمت نظم نوشن احترافية.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary">
              آراء العملاء
            </h2>
            {/* TODO: Replace with real testimonials */}
            <span className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-tertiary">سيتم تحديثها قريبًا</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="card-interactive cursor-default p-5 sm:p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <Quote className="w-5 h-5 text-primary-600 dark:text-orange-400" />
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-4">
                  “{testimonial.quote}”
                </p>
                <div className="text-sm font-semibold text-accent-900 dark:text-dark-text-primary">
                  {testimonial.name}
                </div>
                <div className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                  {testimonial.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary">
              قصص نجاح مختصرة
            </h2>
            {/* TODO: Replace with real case studies */}
            <span className="text-xs sm:text-sm text-accent-500 dark:text-dark-text-tertiary">سيتم تحديثها قريبًا</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="card-interactive cursor-default p-5 sm:p-6 h-full">
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  {study.title}
                </h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {study.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            دعنا نصنع قصة نجاح جديدة
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto">
            احجز استشارة أولية ونبني لك نظام نوشن يناسب فريقك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/consultation" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              احجز استشارتك
            </Link>
            <Link href="/store" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 border-primary-200 dark:border-orange-500/30 w-full sm:w-auto text-center">
              استكشف المتجر
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
