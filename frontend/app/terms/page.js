import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
  title: 'شروط الاستخدام',
  description: 'شروط وأحكام استخدام خدمات عرب نوشن الاستشارية وأنظمة نوشن المخصصة - قم بقراءة الشروط قبل استخدام خدماتنا',
  url: '/terms'
});

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container-custom max-w-5xl">
          {/* Main Card */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-20 shadow-large border-none">
            <div className="mb-16">
              <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">شروط الاستخدام</h1>
            <p className="text-base sm:text-lg text-accent-700 dark:text-gray-200">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <div className="space-y-16">
              <section className="relative">
                <div className="absolute -right-8 top-0 text-[120px] font-black text-primary/5 select-none leading-none">01</div>
                <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">1. قبول الشروط</h2>
                <div className="space-y-4">
                  <p className="text-xl text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    مرحباً بك في عرب نوشن. هذه الشروط والأحكام تحكم استخدامك لخدماتنا الاستشارية، أنظمة نوشن المخصصة، خدمات الأتمتة والتكاملات، التدريب، الخدمات البرمجية، ومتجر القوالب.
                    باستخدامك لخدماتنا، فإنك توافق على الالتزام بهذه الشروط.
                  </p>
                  <p className="text-lg text-accent-600/70 dark:text-gray-400 leading-relaxed font-medium">
                    إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام خدماتنا.
                  </p>
                </div>
              </section>

              <section className="relative">
                <div className="absolute -right-8 top-0 text-[120px] font-black text-primary/5 select-none leading-none">02</div>
                <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">2. وصف الخدمات</h2>
                <p className="text-xl text-accent-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                  عرب نوشن تقدم مجموعة متكاملة من الخدمات الاحترافية:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'الاستشارات', desc: 'استشارات متخصصة في تصميم وتطوير أنظمة نوشن' },
                    { label: 'بناء أنظمة مخصصة', desc: 'تصميم وتطوير مساحات عمل متكاملة حسب احتياجاتك' },
                    { label: 'الأتمتة والتكاملات', desc: 'ربط نوشن مع الأدوات الأخرى وأتمتة العمليات' },
                    { label: 'التدريب والدعم الفني', desc: 'تدريب فريقك على استخدام نوشن بكفاءة' },
                    { label: 'الخدمات البرمجية', desc: 'تطوير حلول برمجية مخصصة ومتكاملة' },
                    { label: 'متجر القوالب', desc: 'تصفح وتحميل قوالب نوشن من مبدعين معتمدين' }
                  ].map((item, i) => (
                    <li key={i} className="p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-soft">
                      <span className="block font-black text-primary mb-2 text-lg">{item.label}</span>
                      <span className="text-accent-600 dark:text-gray-400 font-medium">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">3. طلب الخدمات الاستشارية</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">3.1 عملية الطلب</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لطلب خدمة استشارية أو مشروع مخصص:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>املأ نموذج الاستشارة بمعلومات دقيقة عن مشروعك</li>
                  <li>حدد نوع الخدمة المطلوبة والميزانية التقديرية</li>
                  <li>سيتم التواصل معك خلال 24-48 ساعة لمناقشة التفاصيل</li>
                  <li>سنقدم لك عرض سعر مفصل ونطاق العمل</li>
                  <li>بعد الموافقة، سيتم البدء في المشروع حسب الجدول الزمني المتفق عليه</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">3.2 اتفاقية الخدمة</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لكل مشروع، سيتم توقيع اتفاقية خدمة تحدد:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>نطاق العمل والمخرجات المتوقعة</li>
                  <li>الجدول الزمني ومراحل التسليم</li>
                  <li>التكلفة وشروط الدفع</li>
                  <li>مسؤوليات كل طرف</li>
                  <li>شروط التعديلات والمراجعات</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">4. الدفع والفواتير</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">4.1 شروط الدفع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  شروط الدفع للمشاريع:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>دفعة مقدمة 50% عند بدء المشروع</li>
                  <li>الدفعة المتبقية 50% عند التسليم النهائي</li>
                  <li>للمشاريع الكبيرة، يمكن تقسيم الدفع على مراحل</li>
                  <li>جميع الأسعار بالجنيه المصري ما لم يُذكر خلاف ذلك</li>
                  <li>الأسعار لا تشمل ضريبة القيمة المضافة (إن وجدت)</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">4.2 طرق الدفع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نقبل الدفع عبر التحويل البنكي، البطاقات الائتمانية، أو أي طريقة متفق عليها.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">4.3 استرداد الأموال</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  الدفعات المقدمة غير قابلة للاسترداد بعد بدء العمل. في حالة إلغاء المشروع، سيتم احتساب التكلفة بناءً على العمل المنجز.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">5. التسليم والمراجعات</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">5.1 التسليم</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  سيتم تسليم المشروع حسب الجدول الزمني المتفق عليه. قد تتأثر المواعيد بـ:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>تأخر في تقديم المعلومات أو المحتوى من العميل</li>
                  <li>تغييرات كبيرة في نطاق العمل</li>
                  <li>ظروف خارجة عن إرادتنا</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">5.2 المراجعات والتعديلات</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يشمل كل مشروع جولتين من المراجعات المجانية. التعديلات الإضافية أو التغييرات الكبيرة في النطاق ستكون بتكلفة إضافية.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">6. حقوق الملكية الفكرية</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">6.1 ملكية المشروع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  بعد استلام الدفعة النهائية كاملة، تنتقل ملكية نظام نوشن المخصص إليك. تحتفظ عرب نوشن بالحق في:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>عرض المشروع في معرض الأعمال (بعد موافقتك)</li>
                  <li>استخدام المفاهيم العامة في مشاريع أخرى</li>
                  <li>الاحتفاظ بنسخة للأرشفة والدعم الفني</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">6.2 قوالب المتجر</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  القوالب المتاحة في المتجر مملوكة للمبدعين. عند تحميل قالب، تحصل على رخصة للاستخدام الشخصي والتجاري دون إعادة البيع.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">7. الضمانات والدعم</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">7.1 ضمان الجودة</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نضمن أن جميع المشاريع المسلمة:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>تعمل بشكل صحيح حسب المواصفات المتفق عليها</li>
                  <li>خالية من الأخطاء الفنية الكبيرة</li>
                  <li>متوافقة مع منصة Notion</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">7.2 الدعم الفني</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نقدم دعماً فنياً مجانياً لمدة 30 يوماً بعد التسليم لإصلاح أي أخطاء. الدعم الممتد والتدريب الإضافي متاح بتكلفة منفصلة.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">7.3 الصيانة</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يمكنك الاشتراك في خطة صيانة شهرية للحصول على تحديثات دورية، دعم فني مستمر، وتحسينات.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">8. إنشاء الحساب (للمنصة)</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">8.1 متطلبات الحساب</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لاستخدام منصتنا وتصفح القوالب، يجب أن:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>تكون عمرك 18 عاماً أو أكثر</li>
                  <li>تقديم معلومات صحيحة ومحدثة</li>
                  <li>تحتفظ بأمان حسابك وكلمة المرور</li>
                  <li>تكون مسؤولاً عن جميع الأنشطة في حسابك</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">8.2 حساب المبدع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لرفع ومشاركة القوالب في المتجر، تحتاج إلى التقدم بطلب انضمام كمبدع والحصول على موافقة إدارية.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">9. الاستخدام المقبول</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">9.1 الاستخدام المحظور</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يحظر عليك:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>انتهاك أي قوانين أو لوائح</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>نشر محتوى ضار أو مسيء</li>
                  <li>محاولة اختراق أو إتلاف النظام</li>
                  <li>استخدام الخدمة لأغراض احتيالية</li>
                  <li>إعادة بيع القوالب المجانية</li>
                  <li>مشاركة بيانات الدخول مع الآخرين</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">10. المسؤولية والضمانات</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">10.1 إخلاء المسؤولية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  بينما نبذل قصارى جهدنا لتقديم خدمات عالية الجودة، لا نضمن:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>عدم انقطاع الخدمة أو خلوها من الأخطاء</li>
                  <li>توافق الحلول مع جميع احتياجاتك المستقبلية</li>
                  <li>استمرار عمل التكاملات مع خدمات الطرف الثالث</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">10.2 حدود المسؤولية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  مسؤوليتنا محدودة بقيمة المشروع المدفوع. لن نكون مسؤولين عن أي أضرار غير مباشرة، تبعية، أو خسائر في الأرباح.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-gray-100">10.3 مسؤولية العميل</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  العميل مسؤول عن:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>النسخ الاحتياطي لبياناته</li>
                  <li>توفير المعلومات والمحتوى الدقيق</li>
                  <li>الامتثال لشروط استخدام Notion</li>
                  <li>تدريب فريقه على استخدام النظام</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">11. السرية</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نلتزم بالحفاظ على سرية جميع المعلومات التي تشاركها معنا أثناء المشروع. لن نكشف عن معلومات مشروعك لأي طرف ثالث دون موافقتك الكتابية.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">12. إنهاء الخدمة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يمكن لأي طرف إنهاء المشروع بإشعار كتابي. في حالة الإنهاء:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                  <li>سيتم احتساب التكلفة بناءً على العمل المنجز</li>
                  <li>ستتلقى جميع الملفات والوثائق المكتملة حتى تاريخ الإنهاء</li>
                  <li>الدفعات المقدمة غير قابلة للاسترداد</li>
                  <li>تبقى التزامات السرية سارية</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">13. تعديل الشروط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات ستصبح سارية فور نشرها على المنصة.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 leading-relaxed">
                  استمرار استخدامك لخدماتنا بعد التعديلات يعني موافقتك على الشروط الجديدة. المشاريع الجارية تبقى خاضعة للشروط المتفق عليها عند بدء المشروع.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">14. القانون المطبق</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  هذه الشروط تحكمها قوانين جمهورية مصر العربية. أي نزاعات تخضع لاختصاص محاكم القاهرة.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">15. التواصل معنا</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border">
                  <p className="text-sm sm:text-base text-accent-600 dark:text-gray-100 mb-2 sm:mb-3">
                    <span className="font-semibold">البريد الإلكتروني:</span> support@notionarabs.com
                  </p>
                  <p className="text-sm sm:text-base text-accent-600 dark:text-gray-100 mb-2 sm:mb-3">
                    <span className="font-semibold">العنوان:</span> القاهرة، جمهورية مصر العربية
                  </p>
                </div>
              </section>
            </div>
          </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}





