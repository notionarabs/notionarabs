'use client';

import { useState } from 'react';

export default function FAQ() {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const faqItems = [
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
            answer: 'نعم، نقدم خدمات برمجية متكاملة وبناء تطبيقات ويب مخصصة تعتمد على نوشن كقاعدة بيانات قوية، مع كتابة أكواد متقدمة لكسر حدود النظام التقليدية وتوسيع إمكانياته لتطابق احتياجاتك بدقة.'
        },
        {
            question: 'كم يستغرق بناء النظام؟',
            answer: 'المدة تختلف حسب حجم المشروع وعدد أعضاء الفريق، وتبدأ عادةً من أربعة أسابيع وقد تمتد أكثر بحسب متطلبات المشروع.'
        },
        {
            question: 'هل يمكن ربط نوشن بأدواتنا الحالية؟',
            answer: 'نعم، ندعم التكاملات والأتمتة مع الأدوات الشائعة لتسريع العمل.'
        },
        {
            question: 'كيف أبدأ؟',
            answer: 'احجز استشارة أولية وسنقترح عليك أفضل خطة حسب احتياجك.'
        }
    ];

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start">
                    <div className="text-center lg:text-right lg:sticky lg:top-24 self-start">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            الأسئلة الشائعة
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0">
                            إجابات سريعة على أكثر الأسئلة تكراراً قبل حجز الاستشارة.
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-5">
                        {faqItems.map((item, idx) => {
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
    );
}
