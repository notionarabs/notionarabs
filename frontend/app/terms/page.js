'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrentDate } from '../../lib/dateUtils';

export default function TermsPage() {

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Content */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="heading-1 mb-6">شروط الاستخدام</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="heading-2 mb-4">1. قبول الشروط</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  مرحباً بك في منصة عرب نوشن. هذه الشروط والأحكام تحكم استخدامك لمنصتنا وخدماتنا.
                  باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام منصتنا.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">2. وصف الخدمة</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  عرب نوشن هي منصة إلكترونية تتيح للمستخدمين:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>تصفح وشراء قوالب نوتيون</li>
                  <li>رفع وبيع قوالب نوتيون (للمبدعين)</li>
                  <li>الوصول إلى موارد تعليمية حول نوتيون</li>
                  <li>التفاعل مع مجتمع المستخدمين</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">3. إنشاء الحساب</h2>
                <h3 className="heading-3 mb-3">3.1 متطلبات الحساب</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  لاستخدام خدماتنا، يجب أن:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>تكون عمرك 18 عاماً أو أكثر</li>
                  <li>تقديم معلومات صحيحة ومحدثة</li>
                  <li>تحتفظ بأمان حسابك وكلمة المرور</li>
                  <li>تكون مسؤولاً عن جميع الأنشطة في حسابك</li>
                </ul>

                <h3 className="heading-3 mb-3">3.2 حساب المبدع</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  لرفع وبيع القوالب، تحتاج إلى:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>إنشاء حساب مبدع</li>
                  <li>تقديم معلومات دفع صحيحة</li>
                  <li>الالتزام بإرشادات جودة المحتوى</li>
                  <li>احترام حقوق الملكية الفكرية</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">4. استخدام الخدمة</h2>
                <h3 className="heading-3 mb-3">4.1 الاستخدام المسموح</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  يمكنك استخدام خدماتنا للأغراض القانونية فقط. يجب أن تلتزم بجميع القوانين المحلية والدولية.
                </p>

                <h3 className="heading-3 mb-3">4.2 الاستخدام المحظور</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  يحظر عليك:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>انتهاك أي قوانين أو لوائح</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>نشر محتوى ضار أو مسيء</li>
                  <li>محاولة اختراق أو إتلاف النظام</li>
                  <li>استخدام الخدمة لأغراض احتيالية</li>
                  <li>إنشاء حسابات متعددة</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">5. المحتوى وحقوق الملكية</h2>
                <h3 className="heading-3 mb-3">5.1 محتوى المستخدمين</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  أنت تحتفظ بحقوق الملكية لمحتواك. عند رفع المحتوى، تمنحنا ترخيصاً غير حصري لاستخدامه وتوزيعه.
                </p>

                <h3 className="heading-3 mb-3">5.2 حقوق المنصة</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  جميع حقوق الملكية الفكرية للمنصة محفوظة. لا يجوز نسخ أو توزيع أو تعديل أي جزء من المنصة دون إذن كتابي.
                </p>

                <h3 className="heading-3 mb-3">5.3 قوالب نوتيون</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  القوالب المباعة على المنصة مملوكة للمبدعين. عند شراء قالب، تحصل على رخصة للاستخدام الشخصي والتجاري.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">6. المدفوعات والاسترداد</h2>
                <h3 className="heading-3 mb-3">6.1 المدفوعات</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  جميع المدفوعات تتم عبر قنوات آمنة. الأسعار تشمل الضرائب المطبقة.
                </p>

                <h3 className="heading-3 mb-3">6.2 الاسترداد</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  يمكن طلب استرداد خلال 30 يوماً من الشراء. الاسترداد يتم عبر نفس طريقة الدفع الأصلية.
                </p>

                <h3 className="heading-3 mb-3">6.3 أرباح المبدعين</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  يتم تحويل الأرباح شهرياً بعد خصم رسوم المنصة. الحد الأدنى للتحويل هو 50 ريال.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">7. إلغاء الحساب</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  يمكنك إلغاء حسابك في أي وقت. عند الإلغاء:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-6 text-accent-600 dark:text-dark-text-secondary">
                  <li>ستفقد الوصول لجميع القوالب المحملة</li>
                  <li>سيتم حذف معلوماتك الشخصية</li>
                  <li>لن تتمكن من استرداد المحتوى المحذوف</li>
                  <li>ستستمر التزاماتك المالية حتى نهاية فترة الاشتراك</li>
                </ul>
              </section>

              <section>
                <h2 className="heading-2 mb-4">8. المسؤولية والضمانات</h2>
                <h3 className="heading-3 mb-3">8.1 إخلاء المسؤولية</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نقدم الخدمة "كما هي" دون ضمانات صريحة أو ضمنية. لا نضمن عدم انقطاع الخدمة أو خلوها من الأخطاء.
                </p>

                <h3 className="heading-3 mb-3">8.2 حدود المسؤولية</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  مسؤوليتنا محدودة بمبلغ الاشتراك المدفوع. لن نكون مسؤولين عن أي أضرار غير مباشرة أو تبعية.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">9. تعديل الشروط</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات ستصبح سارية فور نشرها على المنصة.
                </p>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                  استمرار استخدامك للمنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">10. القانون المطبق</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  هذه الشروط تحكمها قوانين المملكة العربية السعودية. أي نزاعات تخضع لاختصاص محاكم الرياض.
                </p>
              </section>

              <section>
                <h2 className="heading-2 mb-4">11. التواصل معنا</h2>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-4">
                  إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-6 rounded-xl">
                  <p className="text-accent-600 dark:text-dark-text-secondary mb-2">
                    <strong>البريد الإلكتروني:</strong> legal@notion-arabs.com
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
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
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
