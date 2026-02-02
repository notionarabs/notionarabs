import { generateMetadata } from '../../lib/seo';
import { formatCurrentDate } from '../../lib/dateUtils';
import Footer from '../../components/Footer';

export const metadata = generateMetadata({
  title: 'سياسة ملفات تعريف الارتباط',
  description: 'سياسة ملفات تعريف الارتباط لمنصة عرب نوشن وخدماتها الاستشارية - كيف نستخدم الكوكيز لتحسين تجربتك',
  url: '/cookies'
});

export default function CookiesPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">سياسة ملفات تعريف الارتباط</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-gray-200">آخر تحديث: {formatCurrentDate()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">ما هي ملفات تعريف الارتباط؟</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا.
                  نستخدمها لضمان عمل خدماتنا الأساسية (الاستشارات، المتجر، الدورات) وتحسين تجربتك في تصفح المنصة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">كيف نستخدم ملفات تعريف الارتباط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  نستخدم ملفات تعريف الارتباط للأغراض التالية:
                </p>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6 text-accent-500 dark:text-dark-text-primary">1. ملفات ضرورية جداً</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  هذه الملفات أساسية لتشغيل الموقع وتقديم الخدمات التي تطلبها، مثل:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-gray-100">
                  <li><span className="font-semibold">تسجيل الدخول:</span> الحفاظ على جلسة دخولك نشطة وآمنة أثناء تصفح الموقع</li>
                  <li><span className="font-semibold">أمان الحساب:</span> حماية حسابك وبياناتك من الوصول غير المصرح به</li>
                  <li><span className="font-semibold">تفضيلات المستخدم:</span> تذكر إعداداتك الأساسية لتقديم تجربة تصفح سلسة</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6 text-accent-500 dark:text-dark-text-primary">2. ملفات الأداء والتحليلات</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  تساعدنا في تحسين خدماتنا من خلال فهم كيفية استخدامك للموقع:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-gray-100">
                  <li>معرفة القوالب والخدمات الأكثر طلباً</li>
                  <li>تحليل أداء صفحات الهبوط (Landing Pages)</li>
                  <li>رصد وتصحيح الأخطاء التقنية</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6 text-accent-500 dark:text-dark-text-primary">3. ملفات الوظائف</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  تسمح للموقع بتذكر خياراتك لتوفير تجربة مخصصة:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-gray-100">
                  <li>تذكر تفضيلات اللغة والعملة</li>
                  <li>حفظ تقدمك في نماذج طلب الاستشارة</li>
                  <li>تخصيص عرض القوالب حسب اهتماماتك</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">مدة الاحتفاظ بملفات تعريف الارتباط</h2>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-gray-100">
                  <li><span className="font-semibold">ملفات الجلسة:</span> مؤقتة وتُحذف بمجرد إغلاق المتصفح (مثل تذكر حالة التصفح الحالية)</li>
                  <li><span className="font-semibold">ملفات دائمة:</span> تبقى لفترة محددة لتذكرك عند زيارتك القادمة (مثل "تذكرني")</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">إدارة ملفات تعريف الارتباط</h2>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6 text-accent-500 dark:text-dark-text-primary">خياراتك</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100 mb-3 sm:mb-4 leading-relaxed">
                  يمكنك التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات المتصفح. يرجى ملاحظة أن تعطيل بعض الملفات قد يؤثر على:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-gray-100">
                  <li>القدرة على استخدام الميزات التفاعلية</li>
                  <li>الوصول إلى منطقة الأعضاء أو المبدعين</li>
                  <li>حفظ تفضيلاتك الشخصية</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">التواصل</h2>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border">
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-gray-100">
                    لأي استفسارات حول سياسة الكوكيز، يرجى التواصل معنا عبر:
                    <br />
                    <span className="font-semibold select-all">support@notionarabs.com</span>
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

