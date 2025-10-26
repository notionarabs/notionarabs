'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [emailSendFailed, setEmailSendFailed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const { signup, resendVerification } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setError(''); // Clear error when user types
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
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    if (!formData.password) {
      setError('كلمة المرور مطلوبة');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }
    if (!agreedToTerms) {
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

    const result = await signup(formData.name, formData.email, formData.password);

    if (result.success) {
      if (result.requiresVerification && result.verificationToken) {
        // Show verification message - no account created yet
        setUserEmail(formData.email);
        setVerificationToken(result.verificationToken);
        setShowVerificationMessage(true);
        setEmailSendFailed(false);
      } else {
        // Account created successfully (either with verification or without)
        router.push('/');
      }
    } else {
      if (result.errorType === 'EMAIL_SEND_FAILED' || result.errorType === 'EMAIL_SERVICE_NOT_CONFIGURED') {
        setEmailSendFailed(true);
        setError('فشل في إرسال بريد التأكيد. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.');
      } else {
        setError(result.error || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    }

    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;

    setResendingEmail(true);
    setError('');

    // For resend, we need to call the signup endpoint again with the same data
    const result = await signup(formData.name, formData.email, formData.password);

    if (result.success) {
      setEmailSendFailed(false);
      setShowVerificationMessage(true);
      setVerificationToken(result.verificationToken);
    } else {
      setError(result.error);
    }

    setResendingEmail(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="max-w-md w-full my-4 sm:my-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
            <Image
              src="/NavLogoLight.svg"
              alt="عرب نوشن"
              width={120}
              height={40}
              className="h-10 sm:h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">انضم إلى مجتمعنا</h1>
          <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">أنشئ حسابك وابدأ رحلتك معنا</p>
        </div>

        {/* Signup Form */}
        <div className="card p-6 sm:p-8 md:p-10 border-primary-200">
          {!showVerificationMessage ? (
            <>
              {/* Social Signup Buttons - Moved to beginning */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api')}/auth/google`}
                  className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base flex items-center justify-center"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="hidden sm:inline">التسجيل بـ Google</span>
                  <span className="sm:hidden">Google</span>
                </a>
              </div>

              {/* Divider */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 bg-white dark:bg-dark-card-bg text-accent-600 dark:text-dark-text-secondary">أو</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="أدخل بريدك الإلكتروني"
                    dir="ltr"
                  />
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    dir="ltr"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="أعد إدخال كلمة المرور"
                    dir="ltr"
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                    أوافق على{' '}
                    <Link href="/terms" className="text-primary-500 hover:text-primary-600 transition-colors">
                      الشروط والأحكام
                    </Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary-500 hover:text-primary-600 transition-colors">
                      سياسة الخصوصية
                    </Link>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                    {error}
                    {emailSendFailed && (
                      <div className="mt-2 sm:mt-3">
                        <button
                          onClick={handleResendVerification}
                          disabled={resendingEmail}
                          className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-xs sm:text-sm underline disabled:opacity-50"
                        >
                          {resendingEmail ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-500/30 rounded-full animate-spin">
                                <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                              </div>
                              <span className="hidden sm:inline">جاري الإرسال...</span>
                              <span className="sm:hidden">جاري الإرسال</span>
                            </div>
                          ) : (
                            'إعادة إرسال بريد التأكيد'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}



                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                        <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"></div>
                      </div>
                      <span className="hidden sm:inline">جاري إنشاء الحساب...</span>
                      <span className="sm:hidden">جاري الإنشاء</span>
                    </div>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </button>
              </form>
            </>
          ) : null}

          {/* Verification Message */}
          {showVerificationMessage && (
            <div className="card p-6 sm:p-8 border-primary-200">
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">تحقق من بريدك الإلكتروني</h2>
                <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                  تم إرسال رابط التأكيد إلى بريدك الإلكتروني
                </p>
              </div>

              <div className="bg-secondary-50 dark:bg-dark-card-bg border border-secondary-200 dark:border-dark-card-border rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm md:text-base text-center font-mono text-accent-600 dark:text-dark-text-primary break-all">
                  {userEmail}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">1</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">افتح بريدك الإلكتروني</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">2</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">ابحث عن رسالة من "عرب نوشن"</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">3</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">اضغط على رابط التأكيد</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-bold">4</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">سيتم إنشاء حسابك تلقائياً</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
                >
                  {resendingEmail ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-500/30 rounded-full animate-spin">
                        <div className="absolute inset-0 border-2 border-transparent border-t-primary-500 rounded-full"></div>
                      </div>
                      <span className="hidden sm:inline">جاري الإرسال...</span>
                      <span className="sm:hidden">جاري الإرسال</span>
                    </div>
                  ) : (
                    'إعادة إرسال بريد التأكيد'
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowVerificationMessage(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setAgreedToTerms(false);
                    setEmailSendFailed(false);
                  }}
                  className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
                >
                  إنشاء حساب آخر
                </button>
              </div>

              <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-yellow-50 dark:bg-dark-card-bg border border-yellow-200 dark:border-dark-card-border rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-dark-text-secondary text-center">
                  لا تجد الرسالة؟ تحقق من مجلد الرسائل المهملة (Spam)
                </p>
              </div>
            </div>
          )}

          {/* Login Link - Only show when not in verification mode */}
          {!showVerificationMessage && (
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-primary-500 font-medium hover:text-primary-600 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 sm:mt-8 md:mt-10">
          <Link href="/" className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary hover:text-accent-500 dark:hover:text-accent-400 transition-colors flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
