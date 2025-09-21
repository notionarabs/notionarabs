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
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Main Content */}
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">
              انضم إلى مجتمع المبدعين
            </h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto">
              شارك مواهبك مع العالم وابدأ في إنشاء وبيع قوالب نوتيون احترافية
            </p>
          </div>

          {/* Application Form */}
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="heading-3 text-primary-600 dark:text-orange-400 border-b border-gray-200 dark:border-dark-card-border pb-3">
                  المعلومات الشخصية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                      disabled={isAuthenticated}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      required
                      disabled={isAuthenticated}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h2 className="heading-3 text-primary-600 dark:text-orange-400 border-b border-gray-200 dark:border-dark-card-border pb-3">
                  المعلومات المهنية
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    رابط المعرض أو الأعمال السابقة *
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="https://example.com/portfolio"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    وصف خبرتك في التصميم أو إنشاء القوالب *
                  </label>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={4}
                    className="input-field"
                    placeholder="أخبرنا عن خبرتك في مجال التصميم، عدد سنوات العمل، والمشاريع التي عملت عليها..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                    المجالات التي تختص بها *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specialtyOptions.map((specialty) => (
                      <label key={specialty} className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="checkbox"
                          name="specialties"
                          value={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onChange={handleChange}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-dark-card-border dark:bg-dark-secondary"
                        />
                        <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                          {specialty}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    لماذا تريد الانضمام إلى مجتمع المبدعين؟ *
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="أخبرنا عن دوافعك وأهدافك من الانضمام إلى المنصة..."
                    required
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-6">
                <h2 className="heading-3 text-primary-600 dark:text-orange-400 border-b border-gray-200 dark:border-dark-card-border pb-3">
                  روابط التواصل الاجتماعي (اختياري)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://instagram.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia.linkedin}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                      الموقع الشخصي
                    </label>
                    <input
                      type="url"
                      name="socialMedia.website"
                      value={formData.socialMedia.website}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h2 className="heading-3 text-primary-600 dark:text-orange-400 border-b border-gray-200 dark:border-dark-card-border pb-3">
                  معلومات إضافية
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    متى ستكون متاحاً للعمل؟
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">اختر...</option>
                    <option value="immediately">فوراً</option>
                    <option value="1-week">خلال أسبوع</option>
                    <option value="2-weeks">خلال أسبوعين</option>
                    <option value="1-month">خلال شهر</option>
                    <option value="flexible">مرن</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                    ما هي توقعاتك من الأرباح الشهرية؟
                  </label>
                  <select
                    name="expectedEarnings"
                    value={formData.expectedEarnings}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">اختر...</option>
                    <option value="0-1000">0 - 1,000 ريال</option>
                    <option value="1000-3000">1,000 - 3,000 ريال</option>
                    <option value="3000-5000">3,000 - 5,000 ريال</option>
                    <option value="5000-10000">5,000 - 10,000 ريال</option>
                    <option value="10000+">أكثر من 10,000 ريال</option>
                  </select>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <label className="flex items-start space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-dark-card-border dark:bg-dark-secondary"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-dark-text-secondary">
                    أوافق على{' '}
                    <Link href="/terms" className="text-primary-600 dark:text-orange-400 hover:underline">
                      الشروط والأحكام
                    </Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary-600 dark:text-orange-400 hover:underline">
                      سياسة الخصوصية
                    </Link>
                    {' '}وأوافق على أن جميع المعلومات المقدمة صحيحة
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link href="/" className="btn-secondary text-center">
                  إلغاء
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الطلب'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
