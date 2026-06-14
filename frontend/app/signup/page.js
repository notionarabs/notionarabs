'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [emailSendFailed, setEmailSendFailed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const { signup, resendVerification } = useAuth();
  const { theme } = useTheme();
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

    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-200">
            <Image
              src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
              alt="عرب نوشن"
              width={140}
              height={45}
              className="h-10 sm:h-12 w-auto drop-shadow-sm"
              quality={100}
              priority
              unoptimized
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            انضم إلى مجتمعنا
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            أنشئ حسابك وابدأ رحلتك الإبداعية معنا
          </p>
        </div>

        {/* Signup Card - Glass Style */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none shadow-large rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 relative overflow-hidden group/card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50"></div>

          {!showVerificationMessage ? (
            <>
              {/* Social Signup */}
              <div className="mb-6">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.notionarabs.com/api' : 'http://localhost:5000/api')}/auth/google`}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-white/5 border-none text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 group hover:shadow-md"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>التسجيل باستخدام Google</span>
                </a>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gray-200/50 dark:bg-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/50 dark:bg-dark-card-bg/50 backdrop-blur-sm text-gray-500 dark:text-gray-400">أو عبر البريد</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mr-1">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium"
                    placeholder="الاسم الكامل"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mr-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mr-1">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium pr-14"
                        placeholder="••••••"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 016.375 2.325M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 mr-1">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium pr-14"
                        placeholder="••••••"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors focus:outline-none"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.95 9.95 0 016.375 2.325M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border-none shadow-soft group/terms">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 text-primary border-none rounded-lg focus:ring-0 cursor-pointer bg-white dark:bg-white/10 shadow-sm"
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-accent-600 dark:text-gray-400 leading-relaxed cursor-pointer select-none font-medium">
                    أوافق على{' '}
                    <Link href="/terms" className="text-primary hover:underline font-bold transition-all">الشروط والأحكام</Link>
                    {' '}و{' '}
                    <Link href="/privacy" className="text-primary hover:underline font-bold transition-all">سياسة الخصوصية</Link>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span className="font-medium">{error}</span>
                    </div>
                    {emailSendFailed && (
                      <div className="mt-2 mr-7">
                        <button
                          onClick={handleResendVerification}
                          disabled={resendingEmail}
                          className="text-red-700 dark:text-red-300 underline hover:no-underline font-medium text-xs"
                        >
                          {resendingEmail ? 'جاري الإرسال...' : 'إعادة إرسال بريد التأكيد'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-200 text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>جاري إنشاء الحساب...</span>
                    </div>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </button>
              </form>
            </>
          ) : (
            // Verification Message View
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-scaleIn">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">تحقق من بريدك الإلكتروني</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
                تم إرسال رابط التأكيد إلى: <br />
                <span className="font-semibold text-primary-600 dark:text-primary-400 dir-ltr inline-block mt-1">{userEmail}</span>
              </p>

              <div className="space-y-4 max-w-xs mx-auto text-right">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">افتح بريدك الإلكتروني</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">ابحث عن رسالة "عرب نوشن"</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">اضغط على رابط التأكيد</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full bg-white dark:bg-white/10 border-none text-gray-700 dark:text-white font-medium py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                  {resendingEmail ? 'جاري الإرسال...' : 'إعادة إرسال بريد التأكيد'}
                </button>

                <button
                  onClick={() => {
                    setShowVerificationMessage(false);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setAgreedToTerms(false);
                    setEmailSendFailed(false);
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  العودة وإنشاء حساب آخر
                </button>
              </div>
            </div>
          )}

          {/* Footer Link */}
          {!showVerificationMessage && (
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-white/5 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-all">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Back Home */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium">
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
