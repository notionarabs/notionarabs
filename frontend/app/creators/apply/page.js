'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';

export default function CreatorApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    portfolio: '',
    experience: '',
    specialties: [],
    motivation: '',
    sampleWork: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: ''
    },
    availability: '',
    expectedEarnings: '',
    agreeToTerms: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user, isAuthenticated, checkAuthStatus } = useAuth();
  const router = useRouter();

  // Pre-fill form with user data if authenticated
  useState(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  const specialtyOptions = [
    'الإنتاجية والتنظيم',
    'العمل والأعمال',
    'الدراسة والبحث',
    'التخطيط الشخصي',
    'إدارة المشاريع',
    'التسويق والمبيعات',
    'التصميم الجرافيكي',
    'التطوير والبرمجة',
    'الكتابة والمحتوى',
    'التمويل والمحاسبة',
    'الموارد البشرية',
    'التعليم والتدريب'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('socialMedia.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialKey]: value
        }
      }));
    } else if (name === 'specialties') {
      setFormData(prev => ({
        ...prev,
        specialties: checked
          ? [...prev.specialties, value]
          : prev.specialties.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      return false;
    }
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return false;
    }
    if (!formData.portfolio.trim()) {
      setError('رابط المعرض مطلوب');
      return false;
    }
    if (!formData.experience.trim()) {
      setError('وصف الخبرة مطلوب');
      return false;
    }
    if (formData.specialties.length === 0) {
      setError('يجب اختيار مجال واحد على الأقل');
      return false;
    }
    if (!formData.motivation.trim()) {
      setError('سبب الرغبة في الانضمام مطلوب');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Import API function
      const api = (await import('../../../lib/api')).default;

      // Send application data to backend
      const response = await api.post('/auth/apply-creator', {
        portfolio: formData.portfolio,
        experience: formData.experience,
        specialties: formData.specialties,
        motivation: formData.motivation,
        phone: formData.phone,
        socialMedia: formData.socialMedia,
        availability: formData.availability,
        expectedEarnings: formData.expectedEarnings
      });

      if (response.data.success) {
        // Update the user data in AuthContext with the new creatorStatus
        await checkAuthStatus(); // Refresh user data
        setSuccess(true);
      } else {
        setError(response.data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      console.error('Creator application error:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    }

    setLoading(false);
  };

  // Check if user already has a pending or approved creator status
  if (user?.creatorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Navigation */}
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              العودة للرئيسية
            </Link>
          </div>
        </nav>

        {/* Pending Status */}
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="heading-1 text-yellow-600 dark:text-yellow-400 mb-4">
                طلبك قيد المراجعة
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                تم استلام طلبك للانضمام كمبدع وهو قيد المراجعة حالياً. سنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.creatorStatus === 'approved') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Navigation */}
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <Link href="/profile" className="text-white hover:text-gray-300 transition-colors">
              الملف الشخصي
            </Link>
          </div>
        </nav>

        {/* Approved Status */}
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="heading-1 text-green-600 dark:text-green-400 mb-4">
                مبروك! أنت الآن مبدع معتمد
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                تم قبول طلبك للانضمام كمبدع. يمكنك الآن الوصول إلى لوحة التحكم والبدء في إنشاء وبيع قوالبك.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/profile" className="btn-primary">
                  لوحة التحكم
                </Link>
                <Link href="/creators" className="btn-secondary">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.creatorStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Navigation */}
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              العودة للرئيسية
            </Link>
          </div>
        </nav>

        {/* Rejected Status */}
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="heading-1 text-red-600 dark:text-red-400 mb-4">
                لم يتم قبول طلبك
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                نأسف، لم يتم قبول طلبك للانضمام كمبدع في هذا الوقت. يمكنك المحاولة مرة أخرى في المستقبل.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Navigation */}
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              العودة للرئيسية
            </Link>
          </div>
        </nav>

        {/* Success Message */}
        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="heading-1 text-green-600 dark:text-green-400 mb-4">
                تم إرسال طلبك بنجاح!
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                شكراً لك على اهتمامك بالانضمام إلى مجتمع المبدعين. سنراجع طلبك وسنعاود التواصل معك خلال 3-5 أيام عمل.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
                <Link href="/creators" className="btn-secondary">
                  تصفح المبدعين
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary transition-colors duration-300" dir="rtl">
      {/* Main Content */}
      <div className="container-custom py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="heading-1 mb-6 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
              انضم إلى مجتمع المبدعين
            </h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto leading-relaxed">
              شارك مواهبك مع العالم وابدأ في إنشاء وبيع قوالب نوشن احترافية.
              <br className="hidden sm:block" />
              كن جزءاً من مجتمع المبدعين الرائدين في المنطقة العربية
            </p>

            {/* Benefits Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-dark-card-border">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-accent-700 dark:text-dark-text-primary">أرباح مضمونة</span>
              </div>
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-dark-card-border">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-accent-700 dark:text-dark-text-primary">دعم فني مستمر</span>
              </div>
              <div className="flex items-center justify-center space-x-3 space-x-reverse bg-white/60 dark:bg-dark-card-bg/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-dark-card-border">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-accent-700 dark:text-dark-text-primary">مجتمع نشط</span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card p-8 md:p-12 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Information */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-6">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="heading-3 text-primary-600 dark:text-orange-400">
                    المعلومات الشخصية
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      الاسم الكامل *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      يمكنك تعديل اسمك إذا كان مختلفاً عن الاسم المسجل في حسابك
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl transition-all duration-200 cursor-not-allowed"
                        placeholder="example@email.com"
                        required
                        disabled={isAuthenticated}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      هذا الحقل مملوء تلقائياً من حسابك ولا يمكن تعديله
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      رقم الهاتف *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                        placeholder="+966 50 123 4567"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h2 className="heading-3 text-primary-600 dark:text-orange-400">
                    المعلومات المهنية
                  </h2>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    رابط المعرض أو الأعمال السابقة *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://example.com/portfolio"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">يمكنك مشاركة رابط Behance، Dribbble، أو أي منصة أخرى تعرض أعمالك</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    وصف خبرتك في التصميم أو إنشاء القوالب *
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={5}
                    className="form-input py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none"
                    placeholder="أخبرنا عن خبرتك في مجال التصميم، عدد سنوات العمل، والمشاريع التي عملت عليها..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">شاركنا تفاصيل عن خبرتك، المشاريع التي عملت عليها، وأي إنجازات مهمة</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-4">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    المجالات التي تختص بها *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialtyOptions.map((specialty) => (
                      <label key={specialty} className="group relative flex items-center p-4 bg-gray-50 dark:bg-dark-tertiary rounded-xl border-2 border-transparent hover:border-primary-200 dark:hover:border-orange-500/30 cursor-pointer transition-all duration-200 hover:shadow-md">
                        <input
                          type="checkbox"
                          name="specialties"
                          value={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-lg border-2 ml-4 flex items-center justify-center transition-all duration-200 ${formData.specialties.includes(specialty)
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                          }`}>
                          {formData.specialties.includes(specialty) && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-200 ${formData.specialties.includes(specialty)
                          ? 'text-primary-700 dark:text-orange-300'
                          : 'text-gray-700 dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-orange-400'
                          }`}>
                          {specialty}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">اختر المجالات التي تبرع فيها (يمكنك اختيار أكثر من مجال)</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                    <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    لماذا تريد الانضمام إلى مجتمع المبدعين؟ *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    rows={4}
                    className="form-input py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none"
                    placeholder="أخبرنا عن دوافعك وأهدافك من الانضمام إلى المنصة..."
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">شاركنا رؤيتك وأهدافك من الانضمام إلى مجتمع المبدعين</p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-6">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="heading-3 text-primary-600 dark:text-orange-400">
                    روابط التواصل الاجتماعي
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">اختياري</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-pink-500 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-blue-600 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      الموقع الشخصي
                    </label>
                    <input
                      type="url"
                      name="socialMedia.website"
                      value={formData.socialMedia.website}
                      onChange={handleChange}
                      className="form-input pr-12 pl-4 py-4 text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">شاركنا روابطك على وسائل التواصل الاجتماعي لنتعرف عليك أكثر</p>
              </div>

              {/* Additional Information */}
              <div className="space-y-8">
                <div className="flex items-center space-x-3 space-x-reverse mb-6">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="heading-3 text-primary-600 dark:text-orange-400">
                    معلومات إضافية
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      متى ستكون متاحاً للعمل؟
                    </label>
                    <div className="relative">
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full"
                      >
                        <option value="">اختر متى ستكون متاحاً...</option>
                        <option value="immediately">فوراً</option>
                        <option value="1-week">خلال أسبوع</option>
                        <option value="2-weeks">خلال أسبوعين</option>
                        <option value="1-month">خلال شهر</option>
                        <option value="flexible">مرن</option>
                      </select>
                      {/* Custom dropdown indicator */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-dark-text-primary mb-3">
                      <svg className="w-4 h-4 text-primary-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      ما هي توقعاتك من الأرباح الشهرية؟
                    </label>
                    <div className="relative">
                      <select
                        name="expectedEarnings"
                        value={formData.expectedEarnings}
                        onChange={handleChange}
                        className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-full"
                      >
                        <option value="">اختر توقعاتك من الأرباح...</option>
                        <option value="0-1000">0 - 1,000 ريال</option>
                        <option value="1000-3000">1,000 - 3,000 ريال</option>
                        <option value="3000-5000">3,000 - 5,000 ريال</option>
                        <option value="5000-10000">5,000 - 10,000 ريال</option>
                        <option value="10000+">أكثر من 10,000 ريال</option>
                      </select>
                      {/* Custom dropdown indicator */}
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-dark-tertiary rounded-xl p-6 border border-gray-200 dark:border-dark-card-border">
                  <label className="flex items-start space-x-4 space-x-reverse cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${formData.agreeToTerms
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                        }`}>
                        {formData.agreeToTerms && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                        أوافق على{' '}
                        <Link href="/terms" className="text-primary-600 dark:text-orange-400 hover:underline font-medium">
                          الشروط والأحكام
                        </Link>
                        {' '}و{' '}
                        <Link href="/privacy" className="text-primary-600 dark:text-orange-400 hover:underline font-medium">
                          سياسة الخصوصية
                        </Link>
                        {' '}وأوافق على أن جميع المعلومات المقدمة صحيحة ومكتملة
                      </span>
                    </div>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link href="/" className="btn-secondary text-center px-8 py-4 text-lg">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    إلغاء
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        إرسال الطلب
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
