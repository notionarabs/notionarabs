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
        <section className="section-reveal py-24 sm:py-32 transition-colors duration-300 relative overflow-hidden" data-reveal-section>
            <div className="container-custom relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider mb-4">
                        الأسئلة الشائعة
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-accent-900 dark:text-white mb-6 leading-[1.3]">
                        كل ما تحتاج <span className="text-primary text-gradient inline-block py-1">معرفته</span>
                    </h2>
                    <p className="text-base sm:text-lg text-accent-700/60 dark:text-white/40 leading-relaxed font-medium">
                        إجابات سريعة وواضحة على التساؤلات الأكثر شيوعاً حول القوالب، التضمين، والانضمام كمبدع.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqItems.map((item, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                            <div
                                key={idx}
                                className={`p-6 sm:p-7 rounded-[2rem] bg-white/40 dark:bg-white/5 backdrop-blur-xl border transition-all duration-500 cursor-pointer ${
                                    isOpen 
                                        ? 'border-primary/30 dark:border-primary/40 shadow-glow bg-white/60 dark:bg-white/[0.08]' 
                                        : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 hover:bg-white/50 dark:hover:bg-white/[0.07]'
                                }`}
                                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            >
                                <div
                                    className="w-full flex items-center justify-between gap-6 text-right select-none"
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${idx}`}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-500 font-black text-xs shrink-0 ${
                                            isOpen 
                                                ? 'bg-primary text-white shadow-glow' 
                                                : 'bg-black/5 dark:bg-white/5 text-accent-900/40 dark:text-white/40'
                                        }`}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <span className={`text-base sm:text-lg font-black transition-colors duration-300 ${
                                            isOpen ? 'text-primary' : 'text-accent-900 dark:text-white'
                                        }`}>
                                            {item.question}
                                        </span>
                                    </div>
                                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                                        isOpen 
                                            ? 'bg-primary text-white rotate-180 shadow-glow' 
                                            : 'bg-black/5 dark:bg-white/5 text-accent-900/40 dark:text-white/40'
                                    }`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-4 pt-4 border-t border-accent-900/5 dark:border-white/5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                    <div
                                        id={`faq-answer-${idx}`}
                                        className="text-sm sm:text-base text-accent-700/70 dark:text-white/60 leading-relaxed font-medium pr-14"
                                    >
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
