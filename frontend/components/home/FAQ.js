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
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] items-start">
                    <div className="text-center lg:text-right lg:sticky lg:top-24 self-start">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground dark:text-white mb-6">
                            الأسئلة <span className="inline-block text-gradient pt-2 pb-2 -mt-2 -mb-2">الشائعة</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-foreground/70 dark:text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            إجابات سريعة على تساؤلات المبدعين والمستخدمين في المجتمع.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqItems.map((item, idx) => {
                            const isOpen = openFaqIndex === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`p-6 sm:p-8 card transition-all duration-500 cursor-pointer ${isOpen ? 'shadow-large ring-2 ring-primary/5' : ''}`}
                                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                >
                                    <div
                                        className="w-full flex items-center justify-between gap-6 text-right"
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${idx}`}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-colors duration-500 font-black text-sm ${isOpen ? 'bg-primary text-white' : 'bg-foreground/5 dark:bg-white/5 text-foreground/40 dark:text-white/40'}`}>
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <span className={`text-base sm:text-lg font-bold transition-colors duration-500 ${isOpen ? 'text-primary' : 'text-foreground dark:text-white'}`}>
                                                {item.question}
                                            </span>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-foreground/5 dark:bg-white/5 text-foreground/40 dark:text-white/40'}`}>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                        <div
                                            id={`faq-answer-${idx}`}
                                            className="pt-6 pr-14 text-base sm:text-lg text-foreground/60 dark:text-white/60 leading-relaxed font-medium"
                                        >
                                            {item.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
