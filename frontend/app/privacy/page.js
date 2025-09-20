'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import { formatCurrentDate } from '../../lib/dateUtils';

export default function PrivacyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <header className="w-full bg-accent-500 dark:bg-dark-secondary sticky top-0 z-50 shadow-medium dark:shadow-dark-medium backdrop-blur-sm bg-accent-500/95 dark:bg-dark-secondary/95 transition-colors duration-300">
        <div className="container-custom flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/NavLogoLight.svg"
              alt="عرب نوشن"
              width={240}
              height={80}
              className="h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 lg:gap-2 xl:gap-3">
            <a href="/templates" className="nav-link">القوالب</a>
            <a href="/creators" className="nav-link">المبدعين</a>
            <a href="/blog" className="nav-link">المدونة</a>
            <a href="/about" className="nav-link">من نحن</a>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 dark:text-dark-text-tertiary">مرحباً، {user?.name}</span>
                <Link href="/profile" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  الملف الشخصي
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" className="btn-primary">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 transition-all duration-300 border border-gray-600 dark:border-dark-card-border rounded-xl hover:bg-white/10 dark:hover:bg-dark-tertiary hover:border-gray-500 dark:hover:border-dark-text-tertiary flex-shrink-0"
              aria-label="فتح القائمة"
            >
              <svg className="w-5 h-5 text-gray-300 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-accent-500 dark:bg-dark-secondary border-b border-gray-700 dark:border-dark-card-border shadow-large dark:shadow-dark-large backdrop-blur-sm transition-colors duration-300">
          <div className="container-custom py-6 space-y-6">
            <nav className="space-y-2">
              <a href="/templates" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">القوالب</a>
              <a href="/creators" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المبدعين</a>
              <a href="/blog" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المدونة</a>
              <a href="/about" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">من نحن</a>
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-600 dark:border-dark-card-border pt-6">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 text-gray-300 dark:text-dark-text-tertiary bg-white/5 dark:bg-dark-tertiary rounded-xl">
                    مرحباً، {user?.name}
                  </div>
                  <a href="/profile" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    الملف الشخصي
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-right py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block py-3 px-4 btn-primary text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوتيون المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><a href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</a></li>
                <li><a href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</a></li>
                <li><a href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</a></li>
                <li><a href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</a></li>
                <li><a href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</a></li>
                <li><a href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</a></li>
                <li><a href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</a></li>
                <li><a href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</a></li>
                <li><a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</a></li>
                <li><a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</a>
                <a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</a>
                <a href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
