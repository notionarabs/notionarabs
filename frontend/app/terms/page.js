import Image from 'next/image';
import Link from 'next/link';
import { formatCurrentDate } from '../../lib/dateUtils';
import { Youtube, Facebook, Send, Users } from 'lucide-react';

export const metadata = {
  title: 'شروط الاستخدام | عرب نوشن',
  description:
    'شروط وأحكام استخدام منصة عرب نوشن - قم بقراءة الشروط قبل استخدام المنصة',
  alternates: {
    canonical: 'https://www.notionarabs.com/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Content */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">شروط الاستخدام</h1>
            <p className="text-base sm:text-lg text-accent-700 dark:text-dark-text-secondary">
              آخر تحديث: {formatCurrentDate()}
            </p>
          </div>

          <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8">
              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">1. قبول الشروط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  مرحباً بك في منصة عرب نوشن. هذه الشروط والأحكام تحكم استخدامك لمنصتنا وخدماتنا.
                  باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام منصتنا.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">2. وصف الخدمة</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  عرب نوشن هي منصة إلكترونية عربية تتيح للمستخدمين:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  <li>تصفح وتحميل قوالب نوشن مجاناً</li>
                  <li>رفع ومشاركة قوالب نوشن (للمبدعين المعتمدين)</li>
                  <li>الوصول إلى المدونة والمحتوى التعليمي</li>
                  <li>التفاعل مع مجتمع المبدعين والمستخدمين</li>
                  <li>إنشاء ملفات شخصية ومتابعة المبدعين</li>
                  <li>تقييم القوالب وترك التعليقات</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">3. إنشاء الحساب</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">3.1 متطلبات الحساب</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  لاستخدام خدماتنا، يجب أن:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  <li>تكون عمرك 18 عاماً أو أكثر</li>
                  <li>تقديم معلومات صحيحة ومحدثة</li>
                  <li>تحتفظ بأمان حسابك وكلمة المرور</li>
                  <li>تكون مسؤولاً عن جميع الأنشطة في حسابك</li>
                </ul>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">3.2 حساب المبدع</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  لرفع ومشاركة القوالب، تحتاج إلى:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  <li>التقدم بطلب انضمام كمبدع</li>
                  <li>تقديم معرض أعمال وخبرة مهنية</li>
                  <li>الالتزام بإرشادات جودة المحتوى</li>
                  <li>احترام حقوق الملكية الفكرية</li>
                  <li>الحصول على موافقة إدارية</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">4. استخدام الخدمة</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">4.1 الاستخدام المسموح</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكنك استخدام خدماتنا للأغراض القانونية فقط. يجب أن تلتزم بجميع القوانين المحلية والدولية.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">4.2 الاستخدام المحظور</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يحظر عليك:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  <li>انتهاك أي قوانين أو لوائح</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>نشر محتوى ضار أو مسيء</li>
                  <li>محاولة اختراق أو إتلاف النظام</li>
                  <li>استخدام الخدمة لأغراض احتيالية</li>
                  <li>إنشاء حسابات متعددة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">5. المحتوى وحقوق الملكية</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">5.1 محتوى المستخدمين</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  أنت تحتفظ بحقوق الملكية لمحتواك. عند رفع المحتوى، تمنحنا ترخيصاً غير حصري لاستخدامه وتوزيعه على المنصة.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">5.2 حقوق المنصة</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  جميع حقوق الملكية الفكرية للمنصة محفوظة. لا يجوز نسخ أو توزيع أو تعديل أي جزء من المنصة دون إذن كتابي.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">5.3 قوالب نوشن</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  جميع القوالب على المنصة مجانية ومملوكة للمبدعين. عند تحميل قالب، تحصل على رخصة للاستخدام الشخصي والتجاري.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">6. المحتوى والجودة</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">6.1 معايير المحتوى</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نحن نراجع جميع القوالب المرفوعة لضمان الجودة والملاءمة. نحتفظ بالحق في رفض أو إزالة أي محتوى لا يلبي معاييرنا.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">6.2 التقييمات والتعليقات</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكن للمستخدمين تقييم القوالب وترك التعليقات. يجب أن تكون التقييمات صادقة ومفيدة. نحتفظ بالحق في إزالة التعليقات غير المناسبة.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">6.3 الملكية الفكرية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يجب أن تكون جميع القوالب المرفوعة أصلية أو مرخصة للاستخدام. نحن لا نتحمل مسؤولية انتهاك حقوق الملكية الفكرية.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">7. إلغاء الحساب</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  يمكنك إلغاء حسابك في أي وقت. عند الإلغاء:
                </p>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  <li>ستفقد الوصول لجميع القوالب المحملة</li>
                  <li>سيتم حذف معلوماتك الشخصية</li>
                  <li>لن تتمكن من استرداد المحتوى المحذوف</li>
                  <li>ستفقد جميع التقييمات والتعليقات</li>
                  <li>ستفقد متابعيك ومتابعاتك</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">8. المسؤولية والضمانات</h2>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">8.1 إخلاء المسؤولية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نقدم الخدمة "كما هي" دون ضمانات صريحة أو ضمنية. لا نضمن عدم انقطاع الخدمة أو خلوها من الأخطاء.
                </p>

                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-accent-600 dark:text-dark-text-secondary">8.2 حدود المسؤولية</h3>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  مسؤوليتنا محدودة بمبلغ الاشتراك المدفوع. لن نكون مسؤولين عن أي أضرار غير مباشرة أو تبعية.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">9. تعديل الشروط</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات ستصبح سارية فور نشرها على المنصة.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  استمرار استخدامك للمنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">10. القانون المطبق</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  هذه الشروط تحكمها قوانين جمهورية مصر العربية. أي نزاعات تخضع لاختصاص محاكم القاهرة.
                </p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">11. التواصل معنا</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary mb-3 sm:mb-4 leading-relaxed">
                  إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا:
                </p>
                <div className="bg-gray-50 dark:bg-dark-tertiary p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-gray-200 dark:border-dark-card-border">
                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3">
                    <strong className="font-semibold">البريد الإلكتروني:</strong> support@notionarabs.com
                  </p>
                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3">
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
        <div className="container-custom section-padding px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
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

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center md:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
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
