'use client';

import { useState } from 'react';

export default function FAQ() {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const faqItems = [
        {
            question: 'ما هو مجتمع عرب نوشن؟',
            answer: 'هو أكبر تجمع عربي لمستخدمي ومبدعي نوشن، نهدف لإثراء المحتوى العربي وتوفير الأدوات والخبرات اللازمة للإنتاجية.'
        },
        {
            question: 'كيف يمكنني تحميل القوالب؟',
            answer: 'يمكنك تصفح متجرنا واختيار القالب المناسب لك، ثم الضغط على زر التحميل وسيتم توجيهك لصفحة القالب في نوشن لعمل نسخة خاصة بك.'
        },
        {
            question: 'هل يمكنني الانضمام كمبدع ونشر قوالبي؟',
            answer: 'نعم بكل تأكيد! نحن ندعم المبدعين العرب. يمكنك التقديم عبر صفحة الانضمام كمبدع، وبعد مراجعة أعمالك ستحصل على صفحة خاصة بك لنشر قوالبك.'
        },
        {
            question: 'هل القوالب المتوفرة تدعم اللغة العربية؟',
            answer: 'نعم، جميع القوالب التي نقدمها أو ينشرها المبدعون في المجتمع صممت من الصفر لتناسب اللغة العربية واتجاه الكتابة (RTL).'
        },
        {
            question: 'هل التسجيل في المجتمع مجاني؟',
            answer: 'نعم، الانضمام للمجتمع وتصفح المدونة والعروض العامة مجاني تماماً. توجد بعض القوالب المميزة (Premium) التي تتطلب الشراء لدعم المبدعين.'
        },
        {
            question: 'كيف يمكنني تعلم نوشن بشكل احترافي؟',
            answer: 'نوفر قسماً خاصاً بالمدونة والمصادر التعليمية التي تشرح كل شيء من الصفر حتى الاحتراف باللغة العربية.'
        },
        {
            question: 'ماذا أفعل إذا واجهت مشكلة في استخدام قالب؟',
            answer: 'يمكنك دائماً التواصل معنا عبر صفحة "اتصل بنا" أو مراسلة المبدع صاحب القالب مباشرة للحصول على المساعدة.'
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
                            إجابات سريعة على تساؤلات المبدعين والمستخدمين في المجتمع.
                        </p>
                    </div>
                    <div className="space-y-4 sm:space-y-5">
                        {faqItems.map((item, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
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
