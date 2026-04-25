'use client';

import { processSteps } from '../../lib/marketingContent';

export default function HowWeDoIt({ timelineRef, stepRefs, inViewSteps, lineHeight }) {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="text-center mb-12 sm:mb-16 md:mb-20">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground dark:text-white mb-6">
                        رحلتك في <span className="inline-block text-gradient pt-2 pb-2 -mt-2 -mb-2">مجتمع عرب نوشن</span>
                    </h2>
                    <p className="text-lg sm:text-xl text-foreground/70 dark:text-white/70 max-w-3xl mx-auto leading-relaxed font-medium">
                        خطوات بسيطة لتبدأ رحلتك معنا، من الانضمام وحتى تصبح مبدعاً ومؤثراً في مجتمع نوشن العربي.
                    </p>
                </div>
                <div className="relative" ref={timelineRef}>
                    {/* Central Timeline Axis */}
                    <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-foreground/5 dark:bg-white/5"></div>

                    {/* Dynamic Progress Line */}
                    <div
                        className="hidden sm:block absolute left-1/2 -translate-x-1/2 w-0.5 bg-primary dark:bg-primary transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(245,99,30,0.4)]"
                        style={{
                            top: stepRefs.current[0] ? (stepRefs.current[0].offsetHeight / 2) : 0,
                            height: `${lineHeight}px`,
                            maxHeight: '100%' // Safety cap
                        }}
                    ></div>

                    <div className="space-y-8 sm:space-y-0 text-right">
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
                                            className={`p-6 sm:p-8 card border-none step-card w-full ml-auto transition-all duration-700 ${inViewSteps.includes(idx) ? 'is-visible' : ''
                                                } from-right`}
                                        >
                                            <div className="step-card-shine absolute inset-0 pointer-events-none opacity-20"></div>
                                            <div
                                                className={`text-sm mb-3 text-primary font-black ${inViewSteps.includes(idx) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} transition-all duration-500`}
                                                style={{
                                                    transitionDelay: `${150 + idx * 100}ms`
                                                }}
                                            >
                                                الخطوة {idx + 1}
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-base sm:text-lg text-foreground/60 dark:text-white/60 leading-relaxed font-medium">
                                                {step.detail}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Center Dot - The Timeline Column */}
                                <div className="hidden sm:flex sm:col-start-2 justify-center items-center h-full relative" style={{ width: '40px' }}>
                                    <span
                                        className={`block w-4 h-4 rounded-full bg-primary shadow-[0_0_0_8px_rgba(245,99,30,0.1)] transition-all duration-500 ${inViewSteps.includes(idx) ? 'scale-125 shadow-[0_0_20px_rgba(245,99,30,0.4)]' : 'scale-100'
                                            }`}
                                    ></span>
                                </div>

                                {/* Right Side Content */}
                                <div className={`sm:col-start-3 sm:pl-8 sm:text-right ${idx % 2 !== 0 ? 'block' : 'hidden sm:invisible sm:block'}`}>
                                    {idx % 2 !== 0 && (
                                        <div
                                            className={`p-6 sm:p-8 card border-none step-card w-full mr-auto transition-all duration-700 ${inViewSteps.includes(idx) ? 'is-visible' : ''
                                                } from-left`}
                                        >
                                            <div className="step-card-shine absolute inset-0 pointer-events-none opacity-20"></div>
                                            <div
                                                className={`text-sm mb-3 text-primary font-black ${inViewSteps.includes(idx) ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} transition-all duration-500`}
                                                style={{
                                                    transitionDelay: `${150 + idx * 100}ms`
                                                }}
                                            >
                                                الخطوة {idx + 1}
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-foreground dark:text-white mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-base sm:text-lg text-foreground/60 dark:text-white/60 leading-relaxed font-medium">
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
