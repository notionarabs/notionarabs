import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية لمنصة عرب نوشن - تعرف على كيفية حماية بياناتك الشخصية وخصوصيتك عند استخدام خدماتنا الاستشارية وأنظمة نوشن المخصصة',
  url: '/privacy'
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">سياسة الخصوصية</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-gray-200">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">مقدمة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نحن في عرب نوشن نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لخدماتنا الاستشارية، أنظمة نوشن المخصصة، التدريب، الخدمات البرمجية، ومتجر القوالب.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 leading-relaxed">
                  باستخدامك لخدماتنا، فإنك توافق على جمع واستخدام معلوماتك وفقاً لهذه السياسة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">المعلومات التي نجمعها</h2>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات الاستشارات والمشاريع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  عند طلب استشارة أو خدمة من خدماتنا، نجمع المعلومات التالية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">الاسم الكامل</li>
                  <li className="leading-relaxed">عنوان البريد الإلكتروني</li>
                  <li className="leading-relaxed">رقم الهاتف / واتساب</li>
                  <li className="leading-relaxed">نوع الحساب (فرد أو شركة)</li>
                  <li className="leading-relaxed">اسم الشركة والدور الوظيفي (للشركات)</li>
                  <li className="leading-relaxed">حجم الفريق ومتطلبات المشروع</li>
                  <li className="leading-relaxed">نوع الخدمة المطلوبة (بناء نظام نوشن، أتمتة، تدريب، خدمات برمجية)</li>
                  <li className="leading-relaxed">الميزانية التقديرية والجدول الزمني</li>
                  <li className="leading-relaxed">تفاصيل المشروع والاحتياجات الخاصة</li>
                  <li className="leading-relaxed">موقع الشركة الإلكتروني (اختياري)</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات الحساب الشخصي</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  عند إنشاء حساب على منصتنا، نجمع:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">الاسم الكامل واسم المستخدم</li>
                  <li className="leading-relaxed">عنوان البريد الإلكتروني</li>
                  <li className="leading-relaxed">كلمة المرور (مشفرة)</li>
                  <li className="leading-relaxed">صورة الملف الشخصي</li>
                  <li className="leading-relaxed">النبذة الشخصية والسيرة الذاتية</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات المبدعين</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  عند التقدم لتصبح مبدعاً في متجر القوالب، نجمع معلومات إضافية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">معرض الأعمال والملف المهني</li>
                  <li className="leading-relaxed">الخبرة والمجالات المتخصصة</li>
                  <li className="leading-relaxed">روابط وسائل التواصل الاجتماعي</li>
                  <li className="leading-relaxed">رقم الهاتف للتواصل</li>
                  <li className="leading-relaxed">الدوافع والاهتمامات</li>
                  <li className="leading-relaxed">معلومات الدفع (للمبيعات)</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات طلبات التوظيف</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  عند التقدم للانضمام لفريقنا، نجمع:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">السيرة الذاتية والمؤهلات</li>
                  <li className="leading-relaxed">الخبرات السابقة</li>
                  <li className="leading-relaxed">المهارات والتخصصات</li>
                  <li className="leading-relaxed">معلومات الاتصال</li>
                  <li className="leading-relaxed">روابط الأعمال السابقة</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات الاستخدام والتفاعل</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نجمع معلومات حول كيفية استخدامك للمنصة:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">الصفحات والخدمات التي تتصفحها</li>
                  <li className="leading-relaxed">القوالب التي تتصفحها وتحمّلها</li>
                  <li className="leading-relaxed">التقييمات والتعليقات التي تتركها</li>
                  <li className="leading-relaxed">المبدعين الذين تتابعهم</li>
                  <li className="leading-relaxed">وقت ومدة استخدامك للمنصة</li>
                  <li className="leading-relaxed">معلومات الجهاز والمتصفح</li>
                  <li className="leading-relaxed">عنوان IP والموقع الجغرافي</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">كيف نستخدم معلوماتك</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نستخدم معلوماتك للأغراض التالية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">تقديم خدمات الاستشارات وبناء أنظمة نوشن المخصصة</li>
                  <li className="leading-relaxed">تطوير حلول الأتمتة والتكاملات البرمجية</li>
                  <li className="leading-relaxed">تقديم خدمات التدريب والدعم الفني</li>
                  <li className="leading-relaxed">تنفيذ الخدمات البرمجية والتطوير المخصص</li>
                  <li className="leading-relaxed">إدارة متجر القوالب والمحتوى التعليمي</li>
                  <li className="leading-relaxed">معالجة طلبات الانضمام كمبدع ومراجعة المحتوى</li>
                  <li className="leading-relaxed">التواصل معك حول مشاريعك وخدماتنا</li>
                  <li className="leading-relaxed">إرسال التحديثات والإشعارات المتعلقة بمشاريعك</li>
                  <li className="leading-relaxed">تحليل استخدام المنصة لتحسين خدماتنا</li>
                  <li className="leading-relaxed">معالجة المدفوعات والفواتير</li>
                  <li className="leading-relaxed">منع الاحتيال وإساءة الاستخدام</li>
                  <li className="leading-relaxed">الامتثال للقوانين واللوائح</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">مشاركة المعلومات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية فقط:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">مع فريق العمل الداخلي لتنفيذ مشاريعك</li>
                  <li className="leading-relaxed">مع موفري الخدمات الموثوقين (استضافة، معالجة الدفع، التحليلات)</li>
                  <li className="leading-relaxed">مع Notion API لتطوير وإدارة أنظمتك المخصصة</li>
                  <li className="leading-relaxed">عندما نعتقد أن الكشف مطلوب بموجب القانون</li>
                  <li className="leading-relaxed">لحماية حقوقنا وممتلكاتنا أو حقوق المستخدمين الآخرين</li>
                  <li className="leading-relaxed">في حالة الاندماج أو الاستحواذ أو بيع أصول الشركة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">حماية البيانات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">تشفير البيانات أثناء النقل والتخزين (SSL/TLS)</li>
                  <li className="leading-relaxed">تشفير كلمات المرور باستخدام خوارزميات قوية</li>
                  <li className="leading-relaxed">مراجعة منتظمة لأنظمة الأمان</li>
                  <li className="leading-relaxed">الوصول المحدود للمعلومات الحساسة</li>
                  <li className="leading-relaxed">مراقبة مستمرة للأنشطة المشبوهة</li>
                  <li className="leading-relaxed">نسخ احتياطي منتظم للبيانات</li>
                  <li className="leading-relaxed">التزام فريق العمل بسرية المعلومات</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">ملفات تعريف الارتباط (Cookies)</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  أنواع ملفات تعريف الارتباط التي نستخدمها:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">ملفات تعريف الارتباط الأساسية (ضرورية لعمل المنصة)</li>
                  <li className="leading-relaxed">ملفات تعريف الارتباط التحليلية (لفهم كيفية استخدام المنصة)</li>
                  <li className="leading-relaxed">ملفات تعريف الارتباط الوظيفية (لحفظ تفضيلاتك)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">حقوقك</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 pr-4">
                  <li className="leading-relaxed">الوصول إلى معلوماتك الشخصية وتحميلها</li>
                  <li className="leading-relaxed">تصحيح أو تحديث المعلومات غير الصحيحة</li>
                  <li className="leading-relaxed">حذف حسابك ومعلوماتك الشخصية</li>
                  <li className="leading-relaxed">تقييد معالجة معلوماتك أو الاعتراض عليها</li>
                  <li className="leading-relaxed">نقل معلوماتك إلى خدمة أخرى (قابلية النقل)</li>
                  <li className="leading-relaxed">إلغاء الاشتراك في الإشعارات الإلكترونية</li>
                  <li className="leading-relaxed">سحب الموافقة على معالجة البيانات في أي وقت</li>
                  <li className="leading-relaxed">طلب نسخة من بيانات مشروعك</li>
                </ul>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يمكنك ممارسة هذه الحقوق من خلال إعدادات حسابك أو بالتواصل معنا مباشرة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">الاحتفاظ بالبيانات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. قد نحتفظ ببعض المعلومات لفترات أطول إذا كان ذلك مطلوباً بموجب القانون أو لأغراض الأرشفة والمحاسبة.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 leading-relaxed">
                  بالنسبة لمشاريع الاستشارات والتطوير، نحتفظ بمعلومات المشروع لمدة لا تقل عن 3 سنوات بعد اكتمال المشروع لأغراض الدعم والصيانة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">تغييرات السياسة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  قد نحدث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمرارك في استخدام خدماتنا بعد التغييرات يعني موافقتك على السياسة المحدثة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">التواصل معنا</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  إذا كان لديك أي أسئلة حول هذه السياسة أو كيفية معالجة معلوماتك، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-2 sm:mb-3 leading-relaxed break-words">
                    <span className="font-semibold">البريد الإلكتروني:</span> support@notionarabs.com
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-2 sm:mb-3 leading-relaxed">
                    <span className="font-semibold">العنوان:</span> القاهرة، جمهورية مصر العربية
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





