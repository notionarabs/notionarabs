import Image from 'next/image';
import Link from 'next/link';
import { formatCurrentDate } from '../../lib/dateUtils';
import { Youtube, Facebook, Send, Users } from 'lucide-react';

export default function CookiesPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">سياسة ملفات تعريف الارتباط</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary">آخر تحديث: {formatCurrentDate()}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">ما هي ملفات تعريف الارتباط؟</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا.
                  نستخدمها لضمان عمل الميزات الأساسية (مثل تسجيل الدخول) وتحسين التجربة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">أنواع ملفات تعريف الارتباط التي نستخدمها</h2>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">1. ملفات تعريف الارتباط الأساسية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  هذه الملفات ضرورية لعمل الموقع بشكل صحيح. تشمل:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li><strong>ملفات المصادقة:</strong> للحفاظ على تسجيل دخولك (مثل authToken)</li>
                  <li><strong>ملفات الأمان:</strong> لحماية حسابك من الوصول غير المصرح به</li>
                  <li><strong>ملفات الجلسة:</strong> لتذكر تفاعلك مع الموقع أثناء جلستك الحالية</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">2. ملفات تعريف الارتباط الوظيفية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  تحسن وظائف الموقع وتجربة المستخدم:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li>تذكر تفضيلاتك الشخصية</li>
                  <li>تحسين أداء الموقع وسرعة التحميل</li>
                  <li>تخصيص المحتوى حسب احتياجاتك</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">3. ملفات تعريف الارتباط التحليلية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  تساعدنا في فهم كيفية استخدامك للموقع لتحسينه:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li>إحصائيات الزيارات والصفحات الأكثر استخداماً</li>
                  <li>مدة الجلسة ومعدل التفاعل</li>
                  <li>مصدر الزيارات وأجهزة الاستخدام</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">مدة الاحتفاظ بملفات تعريف الارتباط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  تختلف مدة الاحتفاظ بملفات تعريف الارتباط حسب نوعها:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li><strong>ملفات الجلسة:</strong> تُحذف عند إغلاق المتصفح</li>
                  <li><strong>ملفات المصادقة:</strong> تبقى لمدة 7 أيام أو حتى تسجيل الخروج</li>
                  <li><strong>ملفات التحليل:</strong> قد تبقى لمدة تصل إلى سنتين</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">كيفية التحكم في ملفات تعريف الارتباط</h2>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">من خلال إعدادات المتصفح</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li>حذف ملفات تعريف الارتباط الموجودة</li>
                  <li>منع تخزين ملفات تعريف الارتباط الجديدة</li>
                  <li>تحديد أنواع ملفات تعريف الارتباط المقبولة</li>
                  <li>تلقي إشعارات قبل تخزين ملفات تعريف الارتباط</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 mt-4 sm:mt-6">من خلال الموقع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكنك تسجيل الخروج لإزالة ملفات المصادقة من جهازك، أو التواصل معنا لمساعدتك في إدارة ملفات تعريف الارتباط.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">تأثير تعطيل ملفات تعريف الارتباط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  إذا قمت بتعطيل ملفات تعريف الارتباط، فقد تواجه:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  <li>عدم القدرة على تسجيل الدخول أو البقاء مسجلاً</li>
                  <li>فقدان التفضيلات المحفوظة</li>
                  <li>عدم عمل بعض الميزات بشكل صحيح</li>
                  <li>تدهور تجربة الاستخدام العامة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">إدارة تفضيلات ملفات تعريف الارتباط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-6">
                  يمكنك تغيير تفضيلات ملفات تعريف الارتباط في أي وقت من خلال النقر على زر "الإعدادات" في شريط ملفات تعريف الارتباط.
                </p>
                <div className="bg-primary-50 dark:bg-dark-tertiary border border-primary-200 dark:border-dark-card-border rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary-900 dark:text-dark-text-primary mb-2 sm:mb-3">
                    كيفية إعادة فتح إعدادات ملفات تعريف الارتباط:
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-primary-800 dark:text-dark-text-secondary">
                    <li>احذف ملفات تعريف الارتباط من متصفحك أو استخدم وضع التصفح الخاص</li>
                    <li>قم بتحديث الصفحة</li>
                    <li>ستظهر لك شاشة إعدادات ملفات تعريف الارتباط مرة أخرى</li>
                  </ol>
                  <p className="text-xs sm:text-sm text-primary-700 dark:text-dark-text-tertiary mt-3">
                    أو يمكنك التواصل معنا لمساعدتك في إدارة ملفات تعريف الارتباط.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">التواصل</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">للاستفسار حول ملفات تعريف الارتباط، راسلنا على: support@notionarabs.com</p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image src="/NavLogoLight.svg" alt="عرب نوشن" width={60} height={40} className="h-10 sm:h-12 w-auto" quality={100} priority unoptimized />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed max-w-md">منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </Link>
              </div>
            </div>

            <div className="sm:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المدونة</Link></li>
                </ul>
              </div>
            </div>

            <div className="sm:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center md:text-right">© {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.</p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
