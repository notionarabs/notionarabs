import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
    title: 'سياسة الاسترجاع',
    description: 'سياسة الاسترجاع والاسترداد الخاصة بالمنتجات الرقمية وقوالب متجر عرب نوشن',
    url: '/refund-policy'
});

export default function RefundPolicyPage() {
    return (
        <main className="min-h-screen bg-transparent relative overflow-x-hidden transition-colors duration-300" dir="rtl">
            {/* Ambient Mesh Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            
            {/* Content */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="container-custom max-w-5xl">
                    {/* Main Card */}
                    <div className="bg-white/50 dark:bg-white/5 backdrop-blur-[40px] rounded-[3rem] p-10 sm:p-20 shadow-large border-none text-right">
                        <div className="mb-16">
                            <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">سياسة الاسترجاع</h1>
                            <p className="text-base sm:text-lg text-accent-700 dark:text-gray-200">
                                آخر تحديث: {formatCurrentDate()}
                            </p>
                        </div>
                        
                        <div className="space-y-16">
                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 text-accent-900 dark:text-white tracking-widest uppercase">1. المنتجات الرقمية وقوالب المتجر</h2>
                                <p className="text-xl text-accent-700 dark:text-gray-300 leading-relaxed font-medium">
                                    نظراً لطبيعة المنتجات الرقمية (مثل قوالب نوشن والأدوات) والتي يمكن نسخها واستنساخها فوراً بمجرد الشراء، فإن المشتريات من متجرنا غير قابلة للاسترداد بشكل تلقائي.
                                </p>
                                <p className="text-xl text-accent-700 dark:text-gray-300 leading-relaxed font-medium mt-4">
                                    ومع ذلك، يحق للمشتري تقديم طلب استرداد المبلغ خلال 14 يوماً من تاريخ الشراء في الحالات الاستثنائية التالية فقط:
                                </p>
                                <ul className="space-y-4 text-xl text-accent-700 dark:text-gray-300 font-medium list-none pr-0 mt-4">
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                                        <span>وجود خطأ تقني جوهري ودائم في القالب يمنع استخدامه كما تم وصفه، ولم يتمكن المبدع من إصلاحه.</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                                        <span>الاختلاف الجذري والكامل بين محتوى القالب الفعلي والوصف المقدم من المبدع في صفحة المنتج.</span>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-3 flex-shrink-0" />
                                        <span>في حال الموافقة على طلب الاسترداد الاستثنائي، سيتم خصم قيمة المنتج المسترد من رصيد المبدع (البائع).</span>
                                    </li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 text-accent-900 dark:text-white tracking-widest uppercase">2. آلية وإجراءات الاسترداد</h2>
                                <p className="text-xl text-accent-700 dark:text-gray-300 leading-relaxed font-medium">
                                    في حال الموافقة على طلب الاسترداد المستوفي للشروط، سيتم إرجاع المبلغ بنفس طريقة الدفع الأصلية (عبر بوابة الدفع المعتمدة Paymob). قد يستغرق ظهور المبلغ في حسابك البنكي أو محفظتك الإلكترونية من 7 إلى 14 يوم عمل وفقاً للإجراءات البنكية المعمول بها.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-6 text-accent-900 dark:text-white tracking-widest uppercase">3. التواصل لطلبات الاسترجاع</h2>
                                <p className="text-xl text-accent-700 dark:text-gray-300 mb-8 font-medium">
                                    لتقديم طلب استرجاع، يرجى التواصل معنا عبر القنوات الرسمية:
                                </p>
                                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-soft space-y-4">
                                    <p className="text-xl text-accent-900 dark:text-white font-black">
                                        <span className="opacity-40 uppercase tracking-widest text-xs block mb-2">البريد الإلكتروني</span>
                                        support@notionarabs.com
                                    </p>
                                    <p className="text-xl text-accent-900 dark:text-white font-black">
                                        <span className="opacity-40 uppercase tracking-widest text-xs block mb-2">الخط الساخن</span>
                                        <span dir="ltr">+20 114 509 6563</span>
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </main>
    );
}
