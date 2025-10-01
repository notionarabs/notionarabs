'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrentDate } from '../../lib/dateUtils';
import { Youtube, Facebook, Send, X, Users } from 'lucide-react';

export default function PrivacyPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Content */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="heading-1 mb-6">سياسة الخصوصية</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="heading-2 mb-4">مقدمة</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نحن في عرب نوشن نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  باستخدامك لمنصتنا، فإنك توافق على جمع واستخدام معلوماتك وفقاً لهذه السياسة.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">المعلومات التي نجمعها</h2>

                <h3 className="heading-3 mb-3">المعلومات الشخصية</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نجمع المعلومات التي تقدمها لنا مباشرة، مثل:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>الاسم الكامل</li>
                  <li>عنوان البريد الإلكتروني</li>
                  <li>كلمة المرور (مشفرة)</li>
                  <li>معلومات الدفع (عند الاشتراك)</li>
                  <li>معلومات الملف الشخصي</li>
                </ul>

                <h3 className="heading-3 mb-3">معلومات الاستخدام</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نجمع معلومات حول كيفية استخدامك للمنصة، مثل:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>القوالب التي تتصفحها وتحمّلها</li>
                  <li>وقت ومدة استخدامك للمنصة</li>
                  <li>معلومات الجهاز والمتصفح</li>
                  <li>عنوان IP والموقع الجغرافي</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">كيف نستخدم معلوماتك</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نستخدم معلوماتك للأغراض التالية:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>تقديم وتحسين خدماتنا</li>
                  <li>معالجة المدفوعات والاشتراكات</li>
                  <li>التواصل معك حول حسابك وخدماتنا</li>
                  <li>إرسال التحديثات والإشعارات</li>
                  <li>تحليل استخدام المنصة لتحسينها</li>
                  <li>منع الاحتيال وإساءة الاستخدام</li>
                  <li>الامتثال للقوانين واللوائح</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">مشاركة المعلومات</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية فقط:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>مع موفري الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة</li>
                  <li>عندما نعتقد أن الكشف مطلوب بموجب القانون</li>
                  <li>لحماية حقوقنا وممتلكاتنا أو حقوق المستخدمين الآخرين</li>
                  <li>في حالة الاندماج أو الاستحواذ أو بيع أصول الشركة</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">حماية البيانات</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نستخدم تدابير أمنية متقدمة لحماية معلوماتك، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>مراجعة منتظمة لأنظمة الأمان</li>
                  <li>الوصول المحدود للمعلومات الحساسة</li>
                  <li>مراقبة مستمرة للأنشطة المشبوهة</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  أنواع ملفات تعريف الارتباط التي نستخدمها:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>ملفات تعريف الارتباط الأساسية (ضرورية لعمل المنصة)</li>
                  <li>ملفات تعريف الارتباط التحليلية (لفهم كيفية استخدام المنصة)</li>
                  <li>ملفات تعريف الارتباط التسويقية (لإظهار الإعلانات المناسبة)</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">حقوقك</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>الوصول إلى معلوماتك الشخصية</li>
                  <li>تصحيح المعلومات غير الصحيحة</li>
                  <li>حذف معلوماتك الشخصية</li>
                  <li>تقييد معالجة معلوماتك</li>
                  <li>نقل معلوماتك إلى خدمة أخرى</li>
                  <li>الاعتراض على معالجة معلوماتك</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">الاحتفاظ بالبيانات</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. قد نحتفظ ببعض المعلومات لفترات أطول إذا كان ذلك مطلوباً بموجب القانون.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">تغييرات السياسة</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  قد نحدث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات مهمة عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">التواصل معنا</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  إذا كان لديك أي أسئلة حول هذه السياسة أو كيفية معالجة معلوماتك، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-6 rounded-xl">
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-2">
                    <strong>البريد الإلكتروني:</strong> privacy@notion-arabs.com
                  </p>
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-2">
                    <strong>العنوان:</strong> الرياض، المملكة العربية السعودية
                  </p>
                  <p className="text-accent-600 dark:text-dark-text-secondary">
                    <strong>الهاتف:</strong> +966 11 123 4567
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
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
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
