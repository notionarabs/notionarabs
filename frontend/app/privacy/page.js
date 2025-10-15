import Image from 'next/image';
import Link from 'next/link';
import { formatCurrentDate } from '../../lib/dateUtils';
import { Youtube, Facebook, Send, Users } from 'lucide-react';

export const metadata = {
  title: 'سياسة الخصوصية | عرب نوشن',
  description:
    'سياسة الخصوصية لمنصة عرب نوشن - تعرف على كيفية حماية بياناتك الشخصية وخصوصيتك',
  alternates: {
    canonical: 'https://www.notionarabs.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">سياسة الخصوصية</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">مقدمة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نحن في عرب نوشن نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  باستخدامك لمنصتنا، فإنك توافق على جمع واستخدام معلوماتك وفقاً لهذه السياسة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">المعلومات التي نجمعها</h2>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">المعلومات الشخصية الأساسية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل، مثل:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">الاسم الكامل واسم المستخدم</li>
                  <li className="leading-relaxed">عنوان البريد الإلكتروني</li>
                  <li className="leading-relaxed">كلمة المرور (مشفرة)</li>
                  <li className="leading-relaxed">صورة الملف الشخصي</li>
                  <li className="leading-relaxed">النبذة الشخصية والسيرة الذاتية</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات المبدعين</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  عند التقدم لتصبح مبدعاً، نجمع معلومات إضافية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">معرض الأعمال والملف المهني</li>
                  <li className="leading-relaxed">الخبرة والمجالات المتخصصة</li>
                  <li className="leading-relaxed">روابط وسائل التواصل الاجتماعي</li>
                  <li className="leading-relaxed">رقم الهاتف (اختياري)</li>
                  <li className="leading-relaxed">الدوافع والاهتمامات</li>
                </ul>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">معلومات الاستخدام والتفاعل</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نجمع معلومات حول كيفية استخدامك للمنصة:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
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
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نستخدم معلوماتك للأغراض التالية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">تقديم وتحسين خدمات المنصة (تصفح القوالب، الملفات الشخصية، المدونة)</li>
                  <li className="leading-relaxed">معالجة طلبات الانضمام كمبدع ومراجعة المحتوى</li>
                  <li className="leading-relaxed">إدارة نظام المتابعة والتقييمات</li>
                  <li className="leading-relaxed">التواصل معك حول حسابك وخدماتنا</li>
                  <li className="leading-relaxed">إرسال التحديثات والإشعارات (يمكن إلغاؤها في أي وقت)</li>
                  <li className="leading-relaxed">تحليل استخدام المنصة لتحسينها وتطوير ميزات جديدة</li>
                  <li className="leading-relaxed">منع الاحتيال وإساءة الاستخدام</li>
                  <li className="leading-relaxed">الامتثال للقوانين واللوائح</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">مشاركة المعلومات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية فقط:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">مع موفري الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة</li>
                  <li className="leading-relaxed">عندما نعتقد أن الكشف مطلوب بموجب القانون</li>
                  <li className="leading-relaxed">لحماية حقوقنا وممتلكاتنا أو حقوق المستخدمين الآخرين</li>
                  <li className="leading-relaxed">في حالة الاندماج أو الاستحواذ أو بيع أصول الشركة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">حماية البيانات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">تشفير البيانات أثناء النقل والتخزين</li>
                  <li className="leading-relaxed">مراجعة منتظمة لأنظمة الأمان</li>
                  <li className="leading-relaxed">الوصول المحدود للمعلومات الحساسة</li>
                  <li className="leading-relaxed">مراقبة مستمرة للأنشطة المشبوهة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">ملفات تعريف الارتباط (Cookies)</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  أنواع ملفات تعريف الارتباط التي نستخدمها:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">ملفات تعريف الارتباط الأساسية (ضرورية لعمل المنصة)</li>
                  <li className="leading-relaxed">ملفات تعريف الارتباط التحليلية (لفهم كيفية استخدام المنصة)</li>
                  <li className="leading-relaxed">ملفات تعريف الارتباط التسويقية (لإظهار الإعلانات المناسبة)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">حقوقك</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary pr-4">
                  <li className="leading-relaxed">الوصول إلى معلوماتك الشخصية وتحميلها</li>
                  <li className="leading-relaxed">تصحيح أو تحديث المعلومات غير الصحيحة</li>
                  <li className="leading-relaxed">حذف حسابك ومعلوماتك الشخصية</li>
                  <li className="leading-relaxed">تقييد معالجة معلوماتك أو الاعتراض عليها</li>
                  <li className="leading-relaxed">نقل معلوماتك إلى خدمة أخرى (قابلية النقل)</li>
                  <li className="leading-relaxed">إلغاء الاشتراك في الإشعارات الإلكترونية</li>
                  <li className="leading-relaxed">سحب الموافقة على معالجة البيانات في أي وقت</li>
                </ul>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكنك ممارسة هذه الحقوق من خلال إعدادات حسابك أو بالتواصل معنا مباشرة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">الاحتفاظ بالبيانات</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. قد نحتفظ ببعض المعلومات لفترات أطول إذا كان ذلك مطلوباً بموجب القانون.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">تغييرات السياسة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  قد نحدث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
                </p>
              </section>

              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">التواصل معنا</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  إذا كان لديك أي أسئلة حول هذه السياسة أو كيفية معالجة معلوماتك، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl">
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3 leading-relaxed break-words">
                    <strong className="font-semibold">البريد الإلكتروني:</strong> support@notionarabs.com
                  </p>
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3 leading-relaxed">
                    <strong className="font-semibold">العنوان:</strong> القاهرة، جمهورية مصر العربية
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg md:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg md:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg md:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg md:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg md:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <li><Link href="/templates" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">القوالب</Link></li>
                  <li><Link href="/creators" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <li><Link href="/about" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">من نحن</Link></li>
                  <li><Link href="/blog" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <li><Link href="/contact" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">الشروط</Link></li>
                <li><Link href="/cookies" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors inline-block">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-7 md:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center sm:justify-end">
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
