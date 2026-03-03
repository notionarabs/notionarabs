import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
    title: 'سياسة الاسترجاع',
    description: 'سياسة الاسترجاع والاسترداد الخاصة بخدمات ومنتجات عرب نوشن',
    url: '/refund-policy'
});

export default function RefundPolicyPage() {
    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
            <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
                <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6">
                    <div className="mb-8 sm:mb-10 md:mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">سياسة الاسترجاع والاسترداد</h1>
                        <p className="text-base sm:text-lg text-accent-700 dark:text-gray-200">
                            آخر تحديث: {formatCurrentDate()}
                        </p>
                    </div>
                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                        <div className="space-y-6 sm:space-y-8">
                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">1. المنتجات الرقمية (القوالب والأدوات)</h2>
                                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                                    نظراً لطبيعة المنتجات الرقمية (مثل قوالب نوشن والأدوات) والتي يتم تسليمها فوراً وباب الوصول إليها يكون مفتوحاً بمجرد الشراء، فإننا لا نقدم سياسة استرجاع عامة لهذه المنتجات بعد تحميلها أو الحصول على رابط الوصول الخاص بها.
                                </p>
                                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                                    ومع ذلك، في حالات استثنائية (مثل عدم قدرتك على الوصول للملف، أو وجود خطأ تقني جوهري في المنتج)، يرجى التواصل معنا. يمكنك أيضاً طلب استرداد المبلغ خلال 14 يوماً من تاريخ الشراء وفقاً لسياسة الاسترجاع الخاصة بمتجر قوالب نوشن (Notion Marketplace).
                                </p>
                            </section>
                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">2. الخدمات الاستشارية وبناء الأنظمة</h2>
                                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                                    بالنسبة للخدمات المخصصة والمشاريع:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                                    <li>الدفعات المقدمة (العربون) غير قابلة للاسترداد بعد بدء العمل في المشروع.</li>
                                    <li>في حال إلغاء المشروع من طرفك قبل الانتهاء منه، سيتم احتساب التكلفة بناءً على نسبة العمل المنجز ولا يطالب العميل بأي مبالغ زائدة تم دفعها كدفعة مقدمة إذا كانت لا تتجاوز قيمة العمل المنجز.</li>
                                    <li>إذا لم نتمكن من إتمام المشروع لأسباب تعود إلينا، سيتم رد المبلغ المدفوع بشكل نسبي للعمل الذي لم يكتمل.</li>
                                </ul>
                            </section>
                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">3. آلية وإجراءات الاسترداد</h2>
                                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                                    في حال الموافقة على طلب الاسترداد:
                                </p>
                                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                                    <li>سيتم إرجاع المبلغ بنفس طريقة الدفع الأصلية التي استخدمتها عند الشراء.</li>
                                    <li>قد يستغرق ظهور المبلغ في حسابك البنكي أو بطاقتك الائتمانية من 7 إلى 14 يوم عمل حسب سياسات البنك المصدر.</li>
                                </ul>
                            </section>
                            <section>
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">4. التواصل لطلبات الاسترجاع</h2>
                                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                                    لتقديم طلب استرجاع أو الاستفسار عن هذه السياسة، يرجى التواصل معنا عبر:
                                </p>
                                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border">
                                    <p className="text-sm sm:text-base text-accent-600 dark:text-gray-100 mb-2 sm:mb-3">
                                        <span className="font-semibold">البريد الإلكتروني:</span> support@notionarabs.com
                                    </p>
                                    <p className="text-sm sm:text-base text-accent-600 dark:text-gray-100 mb-2 sm:mb-3">
                                        <span className="font-semibold">رقم الموبايل:</span> <span dir="ltr">+20 114 509 6563</span>
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
