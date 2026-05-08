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
              <h1 className="text-4xl sm:text-6xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">سياسة ملفات تعريف الارتباط</h1>
              <p className="text-base sm:text-lg text-accent-700 dark:text-gray-200">
                آخر تحديث: {formatCurrentDate()}
              </p>
            </div>

            <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
              <div className="space-y-16">
                <section className="relative">
                  <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">ما هي ملفات تعريف الارتباط؟</h2>
                  <p className="text-xl text-accent-600 dark:text-gray-300 leading-relaxed font-medium">
                    ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا.
                    نستخدمها لضمان عمل خدماتنا الأساسية (الاستشارات، المتجر، الدورات) وتحسين تجربتك في تصفح المنصة.
                  </p>
                </section>

                <section className="relative">
                  <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white relative z-10">كيف نستخدم ملفات تعريف الارتباط</h2>
                  <p className="text-xl text-accent-600 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                    نستخدم ملفات تعريف الارتباط للأغراض التالية:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: '1. ملفات ضرورية جداً',
                        desc: 'هذه الملفات أساسية لتشغيل الموقع وتقديم الخدمات التي تطلبها، مثل الحفاظ على جلسة دخولك نشطة وآمنة، حماية حسابك، وتذكر الإعدادات الأساسية.'
                      },
                      {
                        title: '2. ملفات الأداء والتحليلات',
                        desc: 'تساعدنا في تحسين خدماتنا من خلال فهم كيفية استخدامك للموقع، ومعرفة القوالب الأكثر طلباً، وتحليل أداء صفحات الهبوط (Landing Pages).'
                      },
                      {
                        title: '3. ملفات الوظائف',
                        desc: 'تسمح للموقع بتذكر خياراتك لتوفير تجربة مخصصة وسلسة، مثل تذكر تفضيلات اللغة والعملة، وحفظ تقدمك في نماذج طلب الاستشارة.'
                      }
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-soft">
                        <span className="block font-black text-primary mb-3 text-lg">{item.title}</span>
                        <span className="text-accent-600 dark:text-gray-400 font-medium leading-relaxed block text-sm sm:text-base">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white">مدة الاحتفاظ بملفات تعريف الارتباط</h2>
                  <ul className="list-disc list-inside space-y-3 text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li className="leading-relaxed">
                      <span className="font-black text-accent-900 dark:text-white">ملفات الجلسة (Session Cookies):</span> هي ملفات مؤقتة وتُحذف تلقائياً بمجرد إغلاق متصفح الويب (مثل تذكر حالة التصفح الحالية).
                    </li>
                    <li className="leading-relaxed">
                      <span className="font-black text-accent-900 dark:text-white">ملفات دائمة (Persistent Cookies):</span> تبقى مخزنة على جهازك لفترة محددة لتذكر تفضيلاتك وتسهيل دخولك عند زيارتك القادمة (مثل ميزة "تذكرني").
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white">إدارة ملفات تعريف الارتباط</h2>
                  <p className="text-xl text-accent-600 dark:text-gray-300 leading-relaxed mb-6 font-medium">
                    يمكنك التحكم في ملفات تعريف الارتباط أو حذفها بالكامل من خلال إعدادات متصفحك الخاص. يرجى ملاحظة أن تعطيل بعض الملفات قد يؤثر على:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-lg text-accent-600 dark:text-gray-300 font-medium">
                    <li>القدرة على استخدام الميزات التفاعلية في المتجر</li>
                    <li>الوصول إلى منطقة الأعضاء أو المبدعين الخاصة بك</li>
                    <li>حفظ واسترجاع تفضيلاتك الشخصية وسلة المشتريات</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-3xl font-black mb-6 text-accent-900 dark:text-white">التواصل</h2>
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-soft max-w-xl">
                    <p className="text-xl text-accent-600 dark:text-gray-300 font-medium">
                      لأي استفسارات أو تفاصيل إضافية حول سياسة ملفات تعريف الارتباط، يرجى التواصل مع فريق الدعم الفني:
                    </p>
                    <p className="text-2xl text-accent-900 dark:text-white font-black mt-4 select-all">
                      support@notionarabs.com
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
