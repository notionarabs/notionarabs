'use client';

import Link from 'next/link';

export default function FinalCTA() {
    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="relative overflow-hidden rounded-[3rem] border-none bg-accent transition-all duration-500 shadow-2xl p-8 sm:p-12 md:p-16 lg:p-20">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}></div>

                    <div className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
                        <div className="text-center lg:text-right">
                            <p className="text-sm font-black tracking-[0.3em] text-primary mb-6 uppercase">
                                الخطوة التالية
                            </p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight">
                                جاهز لتطوير مهاراتك <br /><span className="inline-block text-gradient pt-2 pb-2 -mt-2 -mb-2">في عالم نوشن؟</span>
                            </h2>
                            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                انضم لآلاف المستخدمين العرب وابدأ اليوم في تنظيم حياتك وأعمالك بأفضل الأدوات والقوالب الاحترافية.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                <Link href="/#marketplace" className="btn-primary min-w-[200px] text-lg py-4 shadow-[0_0_30px_rgba(245,99,30,0.3)]">
                                    استكشف القوالب
                                </Link>
                                <Link href="/creators" className="btn-secondary min-w-[200px] text-lg py-4 bg-white/5 backdrop-blur-md border-none hover:bg-white/10 text-white shadow-sm transition-all">
                                    منصة المبدعين
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'قالب عربي', value: '100+' },
                                { label: 'مبدع نشط', value: '50+' },
                                { label: 'عضو مجتمع', value: '5000+' },
                                { label: 'جودة محتوى', value: 'احترافية' }
                            ].map((item, idx) => (
                                <div key={idx} className="group p-6 rounded-3xl border-none bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-500 text-center shadow-sm">
                                    <div className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-500">{item.value}</div>
                                    <div className="text-xs sm:text-sm text-white/50 font-bold tracking-wider uppercase">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
