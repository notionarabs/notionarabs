'use client';

import Link from 'next/link';
import { testimonials } from '../../lib/marketingContent';

export default function Testimonials() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-start">
                    <div className="text-center lg:text-right">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            آراء عملائنا
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                            قصص نجاح حقيقية من مؤسسات وفرق اعتمدت نظم عرب نوشن لتطوير وتوسعة أعمالها.
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-5">
                        {testimonials.slice(0, 3).map((testimonial, idx) => (
                            <div key={idx} className="group card-interactive cursor-default p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                                        “{testimonial.quote}”
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <span className="font-semibold text-accent-900 dark:text-dark-text-primary">
                                        {testimonial.name}
                                    </span>
                                    <span className="text-xs text-accent-500 dark:text-dark-text-tertiary font-medium">
                                        {testimonial.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="text-center lg:text-right pt-4">
                            <Link href="/projects" className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                                تصفح جميع أعمالنا
                                <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
