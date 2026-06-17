import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
  title: 'شروط الاستخدام',
  description: 'شروط وأحكام استخدام منصة عرب نوشن، متجر القوالب، والأدوات الذكية (الودجتس).',
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
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-20 shadow-large border-none text-right">
            <div className="mb-16">
              <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">شروط الاستخدام</h1>
              <p className="text-base sm:text-lg text-accent-700 dark:text-gray-200 font-medium">
                آخر تحديث: {formatCurrentDate()}
              </p>
            </div>

            <div className="space-y-16">
              {/* 1. قبول الشروط */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">1. قبول الشروط</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    مرحباً بك في عرب نوشن (Notion Arabs)، المنصة والمجتمع الإقليمي الأول المتخصص في تمكين المبدعين وصناع المحتوى العرب. تحكم هذه الشروط والأحكام استخدامك لموقعنا الإلكتروني، بما في ذلك متجر قوالب نوشن، والأدوات الذكية (الودجتس)، والمحتوى التعليمي والمجتمعي.
                  </p>
                  <p className="text-base sm:text-lg text-accent-600/80 dark:text-gray-400 leading-relaxed font-medium">
                    باستخدامك لمنصتنا أو تحميلك للقوالب أو تضمينك للأدوات، فإنك توافق على الالتزام الكامل بهذه الشروط والأحكام وسياستنا للخصوصية. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام المنصة.
                  </p>
                </div>
              </section>

              {/* 2. وصف الخدمات والمنصة */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">2. وصف خدمات المنصة</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                  عرب نوشن هي مجتمع رقمي يوفر الأدوات والوسائل المساعدة لتحسين الإنتاجية والتنظيم باستخدام Notion:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'متجر القوالب', desc: 'تصفح وتحميل وشراء قوالب نوشن مبتكرة صممها مبدعون وصناع محتوى معتمدون.' },
                    { label: 'الأدوات الذكية والودجتس', desc: 'ودجتس تفاعلية مخصصة (مواقيت الصلاة، الأذكار، الساعة العربية، الطقس، حاسبة الزكاة، Pomodoro) للتضمين المباشر.' }
                  ].map((item, i) => (
                    <li key={i} className="p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-soft">
                      <span className="block font-black text-primary mb-2 text-lg">{item.label}</span>
                      <span className="text-accent-600 dark:text-gray-400 font-medium">{item.desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 3. شروط استخدام الأدوات الذكية والودجتس */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">3. شروط استخدام الأدوات الذكية والودجتس</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    توفر المنصة ودجتس وأدوات برمجية ذكية مصممة خصيصاً للتضمين (Embed) داخل صفحات نوشن والمواقع الشخصية. يخضع استخدام هذه الأدوات للبنود التالية:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>الترخيص والاستخدام:</strong> نمنحك رخصة مجانية أو مدفوعة (حسب الأداة) للتضمين الشخصي أو التجاري داخل مساحات العمل الخاصة بك.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>القيود البرمجية:</strong> يمنع تماماً محاولة فك تشفير الأدوات، أو نسخ الأكواد المصدرية، أو استضافة الودجتس على خوادم خاصة بك، أو إعادة توجيه الروابط وتوزيعها بشكل مستقل دون إذن كتابي.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>مصادر البيانات الخارجية:</strong> يتم تقديم الودجتس "كما هي" وعبر الاتصال بالإنترنت. قد تتأثر دقة أو استمرارية بعض الأدوات بالخدمات الخارجية المعتمدة عليها (مثل حسابات الفلك لجدول مواقيت الصلاة أو بيانات الطقس).</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 4. تراخيص واستخدام القوالب */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">4. تراخيص واستخدام القوالب</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    عند تحميلك لقالب (سواء كان مجانياً أو مدفوعاً) من متجر المنصة، فإنك توافق على رخصة الاستخدام التالية:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>رخصة مستخدم واحد:</strong> يُمنح المشتري رخصة غير حصرية لاستخدام القالب وتخصيصه وتطويره داخل مساحة عمله الخاصة أو مساحة عمل شركته.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>حظر إعادة التوزيع والبيع:</strong> يمنع منعاً باتاً بيع القالب، أو ترخيصه من الباطن، أو إتاحته مجاناً للعامة، أو ترويجه كمشروع خاص بك لإعادة التوزيع التجاري، حتى وإن قمت بتعديل أجزاء منه.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span><strong>الملكية الفكرية:</strong> تعود ملكية تصميم وهيكل القالب للمبدع الذي صممه والمسجل رسمياً بالمنصة.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 5. سياسة المشتريات وأرباح المبدعين */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">5. سياسة المشتريات وأرباح المبدعين</h2>
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-primary">5.1 عمليات الشراء الآمنة</h3>
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    تتم معالجة كافة المدفوعات لشراء القوالب بشكل آمن عبر بوابات الدفع المعتمدة (مثل Paymob). نحن لا نحتفظ ببيانات بطاقات الائتمان على خوادمنا.
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-primary">5.2 سحب الأرباح للمبدعين</h3>
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    بصفتك مبدعاً مسجلاً في متجر عرب نوشن، تخضع عمليات البيع للقواعد التالية:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>تقتطع المنصة نسبة عمولة تشغيلية محددة مقابل معالجة المدفوعات واستضافة وإدارة القالب بالمتجر، ويتم توضيح صافي الأرباح في لوحة التحكم.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>يمكن للمبدع طلب سحب أرباحه المتاحة عند تخطي الحد الأدنى للسحب، وتتم المعالجة عبر قنوات الدفع المفضلة (مثل Vodafone Cash، Instapay، أو التحويل البنكي) خلال فترة تتراوح بين 3 إلى 7 أيام عمل.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 6. سياسة الاسترجاع */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">6. سياسة الاسترجاع</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    نظراً لأن القوالب والودجتس هي منتجات رقمية قابلة للاستنساخ الفوري بمجرد إتمام الشراء، فإن سياسة الاسترجاع محددة بالآتي:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>المشتريات غير قابلة للاسترداد بشكل تلقائي بمجرد استلام رابط القالب.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>يحق للمشترين طلب الاسترداد خلال 14 يوماً من الشراء في حالتين فقط: وجود خلل تقني تام يمنع استخدام القالب وعجز المبدع عن حله، أو وجود تعارض جذري كامل بين محتوى القالب الفعلي والوصف التوضيحي المدرج بصفحة المنتج.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 7. العضوية وحماية الحساب */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">7. العضوية وحماية الحساب</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    لتحميل القوالب أو التسجيل كمبدع، يجب توفير معلومات حقيقية وصحيحة. أنت مسؤول مسؤولية تامة عن حفظ بيانات الدخول وسرية كلمة المرور الخاصة بحسابك، ولا نتحمل أي مسؤولية عن أي سوء استخدام ناتج عن مشاركة بيانات حسابك مع أطراف أخرى. ويشترط ألا يقل العمر عن 18 عاماً للاشتراك والبيع بالمنصة.
                  </p>
                </div>
              </section>

              {/* 8. الاستخدام المقبول والمحظور */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">8. الاستخدام المقبول والمحظور</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    يُلتزم جميع أعضاء المنصة بالاستخدام البناء للموقع، ويمنع منعاً باتاً القيام بالتالي:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>استخدام المنصة أو القوالب أو الودجتس في انتهاك أي قوانين معمول بها.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>محاولة اختراق النظام، أو استغلال ثغرات، أو رفع ملفات برمجية ضارة وخبيثة للموقع.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>مشاركة روابط تحميل القوالب المدفوعة مع غير المشترين للتهرب من الرسوم المفروضة.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 9. إخلاء المسؤولية وحدود المسؤولية */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">9. إخلاء المسؤولية وحدود المسؤولية</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    نحن في عرب نوشن نقدم منصة مجتمعية وأدوات لمساعدتك، ولكننا نخلي مسؤوليتنا عن التالي:
                  </p>
                  <ul className="space-y-3 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>أي توقف للأعمال، أو تلف/خسارة في البيانات بمساحة عملك على Notion بسبب الاستخدام الخاطئ للقوالب أو الودجتس.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>أي تغييرات فنية مفاجئة تجريها شركة Notion الأم قد تؤثر مؤقتاً أو دائماً على تفعيل القوالب أو الودجتس.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                      <span>تقتصر مسؤوليتنا المالية القصوى تجاهك عن أي أضرار أو مطالبات على المبلغ المالي الفعلي الذي دفعته عبر المنصة لقاء شراء المنتج الرقمي ذي الصلة.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 10. تعديل الشروط والأحكام */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">10. تعديل الشروط والأحكام</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                  نحتفظ بالحق في تعديل أو تحديث هذه الشروط في أي وقت. وتصبح التعديلات سارية المفعول فور نشرها على الموقع. استمرار استخدامك للمنصة وتحميل المنتجات بعد التعديل يعني قبولك الضمني للشروط المحدثة.
                </p>
              </section>

              {/* 11. القانون المطبق */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">11. القانون المطبق والنزاعات</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                  تخضع هذه الشروط والأحكام وتفسر وفقاً لقوانين جمهورية مصر العربية، وتخضع أي نزاعات قضائية تنشأ عنها ولا تسوى ودياً لاختصاص محاكم القاهرة الحصري.
                </p>
              </section>

              {/* 12. التواصل معنا */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">12. التواصل معنا</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                  لأي استفسار أو لتقديم طلبات الاسترداد والشكاوى، يمكنك التواصل مع الدعم الفني للمنصة عبر القنوات التالية:
                </p>
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-soft space-y-4">
                  <p className="text-lg sm:text-xl text-accent-900 dark:text-white font-black">
                    <span className="opacity-40 uppercase tracking-widest text-xs block mb-2">البريد الإلكتروني</span>
                    support@notionarabs.com
                  </p>
                  <p className="text-lg sm:text-xl text-accent-900 dark:text-white font-black">
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
