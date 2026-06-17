import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية لمنصة عرب نوشن - تعرف على كيفية حماية بياناتك الشخصية عند استخدام متجر القوالب والأدوات الذكية.',
  url: '/privacy'
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black relative overflow-x-hidden transition-colors duration-300" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container-custom max-w-5xl">
          {/* Main Card */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-20 shadow-large border-none text-right">
            <div className="mb-16">
              <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">سياسة الخصوصية</h1>
              <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-gray-200">
                آخر تحديث: {formatCurrentDate()}
              </p>
            </div>

            <div className="space-y-16">
              {/* مقدمة */}
              <section className="relative">
                <h2 className="text-2xl sm:text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">مقدمة</h2>
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    نحن في عرب نوشن نلتزم التزاماً كاملاً بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند تصفحك لمنصتنا الإلكترونية، أو استخدامك لمتجر قوالب نوشن، أو تضمينك للودجتس والأدوات الذكية.
                  </p>
                  <p className="text-base sm:text-lg text-accent-600/70 dark:text-gray-400 leading-relaxed font-medium">
                    باستخدامك للمنصة، فإنك توافق على جمع واستخدام معلوماتك وفقاً للبنود الموضحة في هذه السياسة.
                  </p>
                </div>
              </section>

              {/* المعلومات التي نجمعها */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">المعلومات التي نجمعها</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">معلومات الحساب الشخصي</h3>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-3">
                      عند إنشاء حساب على منصتنا لتحميل القوالب أو التفاعل مع المجتمع، نجمع المعلومات التالية:
                    </p>
                    <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>الاسم الكامل واسم المستخدم.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>عنوان البريد الإلكتروني.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>كلمة المرور (والتي يتم تشفيرها وتأمينها بالكامل).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>صورة الملف الشخصي والنبذة الذاتية (في حال رغبت في إضافتهما).</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">معلومات المبدعين وصناع المحتوى</h3>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-3">
                      عند التقدم بطلب انضمام كمبدع معتمد لعرض وبيع قوالبك في المتجر، نجمع معلومات إضافية تشمل:
                    </p>
                    <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>معرض أعمالك وخبراتك السابقة في تصميم قوالب نوشن.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>روابط حسابات التواصل الاجتماعي المهنية ورقم الهاتف.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>بيانات الدفع وسحب الأرباح الخاصة بك (مثل رقم محفظة فودافون كاش، أو عنوان Instapay، أو تفاصيل الحساب البنكي).</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">معلومات الشراء والدفع</h3>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed">
                      عند قيامك بشراء قالب مدفوع، تتم معالجة المعاملة المالية عبر مزودي الدفع المعتمدين لدينا والآمنين تماماً (مثل Paymob). نحن <strong>لا نقوم</strong> بتخزين أو الاطلاع على أرقام بطاقتك الائتمانية أو بيانات الدفع الحساسة على خوادمنا على الإطلاق.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">معلومات الاستخدام والودجتس</h3>
                    <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-3">
                      لتحسين كفاءة الودجتس والأدوات الذكية التي تقوم بتضمينها، قد نقوم بجمع بيانات تقنية مثل:
                    </p>
                    <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>تفضيلات الودجت المحلية (مثل نوع الخط المختار، أو الموقع الجغرافي المحدد لحساب مواقيت الصلاة والطقس).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                        <span>بيانات استخدام المتصفح والجهاز، وعنوان IP لأغراض التحليل والأمان ومنع الهجمات.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* كيف نستخدم معلوماتك */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">كيف نستخدم معلوماتك</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-4">
                  نحن نستخدم البيانات التي نجمعها لتقديم وتطوير تجربة استخدام استثنائية:
                </p>
                <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>تمكينك من تصفح وتحميل القوالب وتفعيل الودجتس بسلاسة.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>إدارة ملفات المبدعين، وحساب وتسهيل سحب الأرباح المستحقة لهم.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>توفير الدعم الفني اللازم للمشترين والمبدعين على حد سواء عند حدوث مشاكل تقنية.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>تحسين أداء الودجتس والأدوات الذكية وإضافة خصائص مخصصة تلبي تفضيلات المستخدمين.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>حماية المنصة من محاولات الاحتيال، أو إساءة الاستخدام، أو الهجمات السيبرانية.</span>
                  </li>
                </ul>
              </section>

              {/* مشاركة المعلومات */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">مشاركة المعلومات</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed">
                  نحن لا نبيع، أو نؤجر، أو نشارك معلوماتك الشخصية مع جهات خارجية لغرض التسويق التجاري. قد تتم مشاركة البيانات فقط مع موفري الخدمات الموثوقين الذين يعملون معنا (مثل خوادم الاستضافة الآمنة، وبوابة الدفع Paymob لمعالجة مشترياتك)، أو عندما نكون ملزمين قانوناً بالإفصاح عن البيانات امتثالاً للقوانين السارية.
                </p>
              </section>

              {/* حماية البيانات */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">حماية وأمن البيانات</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-4">
                  نحن نضع أمن بياناتك في مقدمة أولوياتنا، ونطبق تدابير تقنية متقدمة تشمل:
                </p>
                <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>تشفير اتصالات المنصة ونقل البيانات باستخدام بروتوكولات حماية متقدمة (SSL/TLS).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>تشفير كلمات المرور في قواعد البيانات بطرق يستحيل معها الاطلاع عليها.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>تقييد الوصول لبيانات سحب أرباح المبدعين الحساسة إلا للمسؤولين المباشرين لغرض معالجة التحويلات فقط.</span>
                  </li>
                </ul>
              </section>

              {/* ملفات تعريف الارتباط */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">ملفات تعريف الارتباط (Cookies)</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed">
                  نستخدم ملفات تعريف الارتباط والتقنيات الشبيهة لتذكر حالة تسجيل دخولك للمنصة، ولحفظ تفضيلاتك وتعديلاتك الخاصة بالودجتس تفاعلياً لضمان عدم اضطرارك لإعادة ضبطها في كل مرة تزور فيها مساحة عملك على Notion. يمكنك التحكم في تفعيل الكوكيز عبر إعدادات متصفحك.
                </p>
              </section>

              {/* حقوقك */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">حقوقك القانونية</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-4">
                  تمنحك المنصة التحكم الكامل في بياناتك، ولديك الحق في:
                </p>
                <ul className="space-y-2 text-base sm:text-lg text-accent-600 dark:text-gray-300 font-medium">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>الوصول لبيانات حسابك الشخصي والاطلاع عليها أو تعديلها في أي وقت.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>طلب حذف حسابك وكافة البيانات المرتبطة به نهائياً من خوادمنا.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                    <span>إيقاف استلام الإشعارات أو البريد الإلكتروني الإخباري بضغطة زر واحدة.</span>
                  </li>
                </ul>
              </section>

              {/* الاحتفاظ بالبيانات */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">الاحتفاظ بالبيانات</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed">
                  نحن نحتفظ ببيانات حسابك طالما كان الحساب فعالاً لتقديم خدمات المتجر والودجتس لك. عند طلبك إغلاق الحساب، نقوم بإلغاء وتشفير/حذف بياناتك فوراً، باستثناء السجلات المالية الشرائية التي يفرض علينا القانون الاحتفاظ بها لفترات محددة لأغراض الفوترة والمحاسبة الضريبية.
                </p>
              </section>

              {/* تغييرات السياسة */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">تغييرات السياسة</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed">
                  قد نقوم بتحديث سياسة الخصوصية بشكل دوري لمواكبة التحديثات التقنية أو التنظيمية. سنقوم بإبلاغك بأي تغييرات جوهرية عبر إشعار بارز في المنصة أو عبر بريدك الإلكتروني المسجل لدينا.
                </p>
              </section>

              {/* التواصل معنا */}
              <section>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-500 dark:text-dark-text-primary">التواصل معنا</h2>
                <p className="text-base sm:text-lg text-accent-600 dark:text-gray-300 leading-relaxed mb-4">
                  لأي استفسارات بخصوص سياسة الخصوصية وحماية بياناتك، يمكنك التواصل معنا مباشرة:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-6 rounded-2xl space-y-3">
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-100 break-words">
                    <span className="font-semibold text-primary">البريد الإلكتروني:</span> support@notionarabs.com
                  </p>
                  <p className="text-base sm:text-lg text-accent-600 dark:text-gray-100">
                    <span className="font-semibold text-primary">العنوان:</span> القاهرة، جمهورية مصر العربية
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
