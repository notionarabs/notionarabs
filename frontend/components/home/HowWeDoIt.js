'use client';

import { processSteps } from '../../lib/marketingContent';

export default function HowWeDoIt({ timelineRef, stepRefs, inViewSteps, lineHeight }) {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                        رحلتك في المجتمع
                    </h2>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
                        خطوات بسيطة لتبدأ رحلتك معنا، من الانضمام وحتى تصبح مبدعاً ومؤثراً في مجتمع نوشن العربي.
                    </p>
                </div>
                <div className="relative" ref={timelineRef}>
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
    );
}
