'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';

const contactMethods = [
  {
    title: "البريد الإلكتروني",
    description: "راسلنا على البريد الإلكتروني وسنرد عليك خلال 24 ساعة",
    contact: "info@notion-arabs.com",
    icon: "📧"
  },
  {
    title: "الدعم الفني",
    description: "للحصول على مساعدة فنية سريعة",
    contact: "support@notion-arabs.com",
    icon: "🛠️"
  },
  {
    title: "الشراكات",
    description: "للمنظمات والشركات المهتمة بالشراكة",
    contact: "partnerships@notion-arabs.com",
    icon: "🤝"
  },
  {
    title: "الإعلام",
    description: "للاستفسارات الإعلامية والصحفية",
    contact: "press@notion-arabs.com",
    icon: "📰"
  }
];

const faqs = [
  {
    question: "كيف يمكنني إلغاء اشتراكي؟",
    answer: "يمكنك إلغاء اشتراكك من خلال الذهاب إلى إعدادات الحساب والنقر على 'إلغاء الاشتراك'. ستحتفظ بجميع القوالب المحملة حتى نهاية فترة الاشتراك."
  },
  {
    question: "هل يمكنني الحصول على استرداد؟",
    answer: "نعم، نقدم استرداد كامل خلال 30 يوماً من تاريخ الاشتراك. تواصل معنا عبر البريد الإلكتروني للحصول على المساعدة."
  },
  {
    question: "كيف يمكنني رفع قوالب للبيع؟",
    answer: "بعد إنشاء حساب مبدع، يمكنك رفع قوالبك من خلال لوحة التحكم. تأكد من اتباع إرشادات الجودة والمحتوى."
  },
  {
    question: "هل تدعمون الدفع بالعملات المحلية؟",
    answer: "نعم، نقبل الدفع بالريال السعودي والدرهم الإماراتي والدينار الكويتي بالإضافة إلى العملات الدولية."
  }
];

function ContactForm() {
  const searchParams = useSearchParams();
  const creatorId = searchParams.get('creator');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loadingCreator, setLoadingCreator] = useState(false);

  // Fetch creator data when creatorId is provided
  useEffect(() => {
    if (creatorId) {
      fetchCreatorData();
    }
  }, [creatorId]);

  const fetchCreatorData = async () => {
    try {
      setLoadingCreator(true);
      const response = await api.get(`/creators/${creatorId}`);
      if (response.data.success) {
        setCreator(response.data.creator);
        // Pre-fill subject for creator contact
        setFormData(prev => ({
          ...prev,
          subject: `استفسار حول قوالب ${response.data.creator.displayName || response.data.creator.name}`,
          category: 'creator'
        }));
      }
    } catch (error) {
      console.error('Error fetching creator:', error);
      setCreator(null);
    } finally {
      setLoadingCreator(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare form data with creator information
      const submissionData = {
        ...formData,
        creatorId: creatorId || null,
        creatorName: creator ? (creator.displayName || creator.name) : null
      };

      // Add creator context to message if contacting a creator
      if (creator) {
        submissionData.message = `المرسل: ${submissionData.name}\nالبريد الإلكتروني: ${submissionData.email}\n\nالمبدع المستهدف: ${creator.displayName || creator.name}\nمعرف المبدع: ${creatorId}\n\nالرسالة:\n${submissionData.message}`;
      }

      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await api.post('/contact', submissionData);

      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: creator ? 'creator' : 'general'
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
    }

  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6">
              {creator ? `تواصل مع ${creator.displayName || creator.name}` : 'تواصل معنا'}
            </h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              {creator
                ? `تواصل مع ${creator.displayName || creator.name} للاستفسار عن قوالبه أو التعاون معه`
                : 'نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو مساعدة تحتاجها'
              }
            </p>
          </div>

          {/* Creator Information Section */}
          {loadingCreator && (
            <div className="card p-8 mb-12 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary border border-primary-200 dark:border-orange-500/30">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-orange-500"></div>
                <span className="mr-3 text-accent-600 dark:text-dark-text-secondary">جاري تحميل معلومات المبدع...</span>
              </div>
            </div>
          )}

          {creator && (
            <div className="card p-8 mb-12 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary border border-primary-200 dark:border-orange-500/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {creator.avatar ? (
                    <Image
                      src={creator.avatar}
                      alt={creator.displayName || creator.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-4 border-white dark:border-dark-secondary shadow-lg"
                      quality={100}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-500 dark:bg-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {(creator.displayName || creator.name).charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h2 className="heading-3 text-accent-500 dark:text-dark-text-primary mb-2">
                    {creator.displayName || creator.name}
                  </h2>
                  {creator.bio && (
                    <p className="text-accent-600 dark:text-dark-text-secondary mb-3">
                      {creator.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                    {creator.templateCount > 0 && (
                      <span className="bg-primary-100 dark:bg-orange-500/20 text-primary-700 dark:text-orange-300 px-3 py-1 rounded-full">
                        {creator.templateCount} قالب
                      </span>
                    )}
                    {creator.verified && (
                      <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        مبدع موثق
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-center md:text-right">
                    <Link
                      href={`/creators/${creator.username}`}
                      className="text-primary-600 dark:text-orange-400 hover:text-primary-700 dark:hover:text-orange-300 font-medium text-sm hover:underline flex items-center justify-center md:justify-end gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      عرض صفحة المبدع
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card p-8">
              <h2 className="heading-2 mb-6">أرسل لنا رسالة</h2>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {creator
                      ? `تم إرسال رسالتك إلى ${creator.displayName || creator.name} بنجاح! سنتواصل معك قريباً.`
                      : 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
                    }
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="أدخل بريدك الإلكتروني"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    نوع الاستفسار
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="general">استفسار عام</option>
                    <option value="technical">دعم فني</option>
                    <option value="billing">الفوترة والدفع</option>
                    <option value="partnership">شراكة</option>
                    <option value="feedback">ملاحظات ومقترحات</option>
                    <option value="creator">تواصل مع مبدع</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="أدخل موضوع الرسالة"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-input"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      جاري الإرسال...
                    </div>
                  ) : (
                    'إرسال الرسالة'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="heading-2 mb-6">طرق التواصل</h2>
                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="card p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{method.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                            {method.title}
                          </h3>
                          <p className="text-accent-600 dark:text-dark-text-secondary mb-3">
                            {method.description}
                          </p>
                          <a
                            href={`mailto:${method.contact}`}
                            className="text-primary-500 dark:text-orange-500 font-medium hover:underline"
                          >
                            {method.contact}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-4">
                  أوقات العمل
                </h3>
                <div className="space-y-2 text-accent-600 dark:text-dark-text-secondary">
                  <div className="flex justify-between">
                    <span>الأحد - الخميس:</span>
                    <span>9:00 ص - 6:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجمعة - السبت:</span>
                    <span>مغلق</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التوقيت:</span>
                    <span>توقيت الرياض (GMT+3)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">الأسئلة الشائعة</h2>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              إجابات سريعة على أكثر الأسئلة شيوعاً
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card p-6">
                  <h3 className="font-semibold text-lg text-accent-500 dark:text-dark-text-primary mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-accent-600 dark:text-dark-text-secondary">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            تصفح مركز المساعدة أو تواصل معنا مباشرة للحصول على المساعدة التي تحتاجها
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help" className="btn-primary text-lg px-8 py-4">
              مركز المساعدة
            </Link>
            <Link href="/templates" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              تصفح القوالب
            </Link>
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
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
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

export default function ContactPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
          <div className="container-custom">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-orange-500 mx-auto"></div>
              <p className="mt-4 text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
            </div>
          </div>
        </section>
      </main>
    }>
      <ContactForm />
    </Suspense>
  );
}
