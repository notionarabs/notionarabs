'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { Youtube, Facebook, Send, X, Users, Mail, Wrench, Handshake, Newspaper } from 'lucide-react';

const contactMethods = [
  {
    title: "البريد الإلكتروني",
    description: "راسلنا وسنرد عليك خلال 24 ساعة",
    contact: "support@notionarabs.com",
    Icon: Mail,
    bg: "from-primary-100 to-primary-200 dark:from-orange-900/30 dark:to-orange-800/30"
  },
  {
    title: "الدعم الفني",
    description: "للحصول على مساعدة فنية سريعة",
    contact: "support@notionarabs.com",
    Icon: Wrench,
    bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30"
  }
];

const faqs = [
  {
    question: "كيف يمكنني استخدام القوالب؟",
    answer: "بعد شراء القالب، ستحصل على رابط للوصول إليه في حسابك. يمكنك نسخ القالب إلى حساب نوشن الخاص بك."
  },
  {
    question: "هل القوالب متوافقة مع جميع أجهزة نوشن؟",
    answer: "نعم، جميع القوالب متوافقة مع تطبيق نوشن على جميع المنصات (الويب، الهاتف، التابلت)."
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

  // Set page metadata
  useEffect(() => {
    document.title = 'اتصل بنا | عرب نوشن';
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://www.notionarabs.com/contact');
    } else {
      const newCanonical = document.createElement('link');
      newCanonical.setAttribute('rel', 'canonical');
      newCanonical.setAttribute('href', 'https://www.notionarabs.com/contact');
      document.head.appendChild(newCanonical);
    }
  }, []);
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

      // Send the actual API request
      const endpoint = creator ? '/contact/creator' : '/contact/general';
      const response = await api.post(endpoint, submissionData);

      if (response.data.success) {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: creator ? 'creator' : 'general'
        });

        // Scroll to top of form to show success message
        setTimeout(() => {
          document.getElementById('contact-form')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        throw new Error(response.data.message || 'فشل في إرسال الرسالة');
      }
    } catch (error) {
      setIsSubmitting(false);
      setSubmitStatus('error');
    }

  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">
              {creator ? `تواصل مع ${creator.displayName || creator.name}` : 'تواصل معنا'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              {creator
                ? `تواصل مع ${creator.displayName || creator.name} للاستفسار عن قوالبه أو التعاون معه`
                : 'نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو مساعدة تحتاجها'
              }
            </p>
          </div>

          {/* Creator Information Section */}
          {loadingCreator && (
            <div className="card p-4 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary border border-primary-200 dark:border-orange-500/30">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 dark:border-orange-500"></div>
                <span className="mr-3 text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">جاري تحميل معلومات المبدع...</span>
              </div>
            </div>
          )}

          {creator && (
            <div className="card p-4 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12 bg-gradient-to-r from-primary-50 to-orange-50 dark:from-dark-tertiary dark:to-dark-primary border border-primary-200 dark:border-orange-500/30">
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  {creator.profilePicture ? (
                    <Image
                      src={creator.profilePicture}
                      alt={creator.displayName || creator.name}
                      width={80}
                      height={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white dark:border-dark-secondary shadow-lg"
                      quality={100}
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border-4 border-white dark:border-dark-secondary shadow-lg">
                      <span className="text-xl sm:text-2xl font-bold text-primary-500 dark:text-orange-400">
                        {(creator.displayName || creator.name)?.charAt(0)?.toUpperCase() || 'م'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-right">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-accent-500 dark:text-dark-text-primary mb-2">
                    {creator.displayName || creator.name}
                  </h2>
                  {creator.bio && (
                    <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-3">
                      {creator.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-4 text-xs sm:text-sm">
                    {creator.templateCount > 0 && (
                      <span className="bg-primary-100 dark:bg-orange-500/20 text-primary-700 dark:text-orange-300 px-2 sm:px-3 py-1 rounded-full">
                        {creator.templateCount} قالب
                      </span>
                    )}
                    {creator.verified && (
                      <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        مبدع موثق
                      </span>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-4 text-center md:text-right">
                    <Link
                      href={`/creators/${creator.username}`}
                      className="text-primary-600 dark:text-orange-400 hover:text-primary-700 dark:hover:text-orange-300 font-medium text-xs sm:text-sm hover:underline flex items-center justify-center md:justify-end gap-1"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      عرض صفحة المبدع
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Form */}
            <div id="contact-form" className="card p-4 sm:p-6 md:p-8 lg:p-10 border-primary-200 dark:border-orange-500/30">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-100 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">أرسل لنا رسالة</h2>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  نحن هنا لمساعدتك في أي وقت
                </p>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl text-xs sm:text-sm mb-6 sm:mb-8 shadow-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-lg">تم الإرسال بنجاح!</p>
                      <p className="text-xs sm:text-sm mt-1">
                        {creator
                          ? `تم إرسال رسالتك إلى ${creator.displayName || creator.name} بنجاح! سنتواصل معك قريباً.`
                          : 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm mb-6 sm:mb-8">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">حدث خطأ</p>
                      <p className="text-xs sm:text-sm mt-1">حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 text-sm sm:text-base"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 text-sm sm:text-base"
                      placeholder="أدخل بريدك الإلكتروني"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    نوع الاستفسار
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 text-sm sm:text-base"
                  >
                    <option value="general">استفسار عام</option>
                    <option value="technical">دعم فني</option>
                    <option value="partnership">شراكة</option>
                    <option value="feedback">ملاحظات ومقترحات</option>
                    <option value="creator">تواصل مع مبدع</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subject" className="form-label flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    الموضوع
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 text-sm sm:text-base"
                    placeholder="أدخل موضوع الرسالة"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-orange-500 dark:focus:border-orange-500 resize-none text-sm sm:text-base"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary text-base sm:text-lg py-3 sm:py-4 px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>إرسال الرسالة</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-accent-500 dark:text-dark-text-primary">طرق التواصل</h2>
                <div className="space-y-3 sm:space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="card p-4 sm:p-5 md:p-6 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${method.bg} flex-shrink-0`}>
                          <method.Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-1.5 sm:mb-2">
                            {method.title}
                          </h3>
                          <p className="text-accent-600 dark:text-dark-text-secondary mb-2 sm:mb-3 text-xs sm:text-sm">
                            {method.description}
                          </p>
                          <a
                            href={`mailto:${method.contact}`}
                            className="text-primary-500 dark:text-orange-500 font-medium hover:underline text-xs sm:text-sm break-all"
                          >
                            {method.contact}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 sm:p-5 md:p-6">
                <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                  أوقات العمل
                </h3>
                <div className="text-accent-600 dark:text-dark-text-secondary">
                  <p className="mb-1.5 sm:mb-2 text-sm sm:text-base">24 ساعة يومياً، 7 أيام في الأسبوع</p>
                  <p className="text-xs sm:text-sm">خدمة متاحة على مدار الساعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-accent-500 dark:text-dark-text-primary">الأسئلة الشائعة</h2>
            <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto px-4">
              إجابات سريعة على أكثر الأسئلة شيوعاً
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card p-4 sm:p-5 md:p-6 hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary-100 dark:bg-orange-500/20 flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-accent-600 dark:text-dark-text-secondary text-xs sm:text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-500 to-primary-500 dark:from-dark-secondary dark:to-dark-tertiary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-3 sm:mb-4">
            لم تجد ما تبحث عنه؟
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-100 dark:text-dark-text-secondary mb-6 sm:mb-8 px-4">
            اكتشف المزيد من الخيارات المتاحة لك
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-4xl mx-auto">
            <Link href="/templates" className="btn-primary text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-white text-primary-600 hover:bg-gray-50 dark:bg-dark-primary dark:text-orange-400 dark:hover:bg-dark-tertiary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[180px] md:max-w-[200px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              تصفح القوالب
            </Link>
            <Link href="/creators" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              المبدعين
            </Link>
            <Link href="/blog" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              المدونة
            </Link>
            <Link href="/about" className="btn-outline text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400 dark:hover:text-dark-primary flex items-center justify-center gap-2 w-full sm:w-auto sm:flex-1 sm:max-w-[160px] md:max-w-[180px]">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              من نحن
            </Link>
          </div>
          <div className="mt-6 sm:mt-8">
            <Link href="#contact-form" className="text-white/80 hover:text-white text-xs sm:text-sm underline hover:no-underline transition-colors">
              أو تواصل معنا مباشرة
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
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
              <p className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
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
                  <li><Link href="/templates" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  <li><Link href="/about" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-4 sm:mb-6 md:mb-8">
                <li><Link href="/contact" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-xs sm:text-sm md:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
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
