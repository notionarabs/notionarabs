'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// Security configuration and utilities
const securityConfig = {
  // Validate email verification token format
  validateToken: (token) => {
    // Email verification tokens should be 64 characters (32 bytes hex)
    return token && typeof token === 'string' && token.length === 64 && /^[a-f0-9]+$/i.test(token);
  },

  // Sanitize email parameter
  sanitizeEmail: (email) => {
    if (!email || typeof email !== 'string') return null;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.toLowerCase().trim() : null;
  },

  // Enforce HTTPS for security
  enforceHttps: () => {
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      const httpsUrl = window.location.href.replace('http://', 'https://');
      window.location.replace(httpsUrl);
      return true;
    }
    return false;
  }
};

function VerifyEmailForm() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const hasInitialized = useRef(false);

  const { verifyEmail, resendVerification, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVerifyEmail = useCallback(async (verificationToken) => {
    // Prevent multiple verification attempts
    if (hasAttemptedVerification) {
      return;
    }

    setLoading(true);
    setError('');
    setErrorType('');
    setSuccess(false);
    setHasAttemptedVerification(true);

    try {
      const result = await verifyEmail(verificationToken);

      if (result.success) {
        setSuccess(true);
        setError('');
        setErrorType('');
        // The redirect will be handled by the useEffect that watches for user authentication
      } else {
        setError(result.error);
        setErrorType(result.errorType || 'UNKNOWN_ERROR');
        setSuccess(false);
      }
    } catch (error) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
      setErrorType('UNEXPECTED_ERROR');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [verifyEmail, hasAttemptedVerification]);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) {
      return;
    }

    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    hasInitialized.current = true;

    // Validate token format for security
    if (tokenFromUrl && !securityConfig.validateToken(tokenFromUrl)) {
      setInitialLoad(false);
      setLoading(false);
      setError('رمز التأكيد غير صحيح');
      return;
    }

    // Sanitize email parameter
    const sanitizedEmail = emailFromUrl ? securityConfig.sanitizeEmail(emailFromUrl) : null;
    if (emailFromUrl && !sanitizedEmail) {
      setInitialLoad(false);
      setLoading(false);
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setInitialLoad(false);
      // Auto-verify when token is present
      handleVerifyEmail(tokenFromUrl);
    } else {
      // No token in URL, show error state
      setInitialLoad(false);
      setLoading(false);
      setError('رمز التأكيد غير موجود في الرابط');
    }
  }, [searchParams]);

  // Redirect to home page when user is authenticated
  useEffect(() => {
    if (success && isAuthenticated && user) {
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [success, isAuthenticated, user, router]);

  const handleResendVerification = async (emailOverride) => {
    setLoading(true);
    setError('');
    setErrorType('');

    const email = emailOverride || searchParams.get('email') || resendEmail;
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريدك الإلكتروني الصحيح');
      setErrorType('NO_EMAIL');
      setLoading(false);
      return;
    }

    try {
      const result = await resendVerification(email);

      if (result.success) {
        setResendSent(true);
        setError('');
        setErrorType('');
      } else {
        setError(result.error);
        setErrorType('RESEND_FAILED');
      }
    } catch (error) {
      setError('حدث خطأ أثناء إعادة إرسال رابط التأكيد');
      setErrorType('RESEND_ERROR');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-large border-none text-center">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-6">
                <img
                  alt="عرب نوشن"
                  width="120"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="h-10 w-auto"
                  src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
                  style={{ color: 'transparent' }}
                />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black mb-3 text-accent-900 dark:text-white">تم تأكيد البريد</h1>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">تم تأكيد حسابك بنجاح</p>
            </div>

            {/* Success Message */}
            <div>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-glow">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white">تم التأكيد بنجاح</h2>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">
                تم تأكيد حسابك بنجاح. مرحباً بك في عرب نوشن! {isAuthenticated ? 'سيتم توجيهك إلى الصفحة الرئيسية خلال ثوانٍ قليلة.' : 'يرجى النقر على الزر أدناه للانتقال إلى الصفحة الرئيسية.'}
              </p>
              <div className="space-y-4">
                <Link
                  href="/"
                  className="w-full btn-primary text-base py-4 rounded-2xl inline-block text-center cursor-pointer shadow-large"
                >
                  الذهاب إلى الصفحة الرئيسية
                </Link>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="btn-ghost text-sm font-bold"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/" className="text-sm text-accent-700 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center font-bold gap-1.5">
              <svg className="w-4 h-4 ml-1.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show initial loading state while checking URL params
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-large border-none text-center">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-6">
                <img
                  alt="عرب نوشن"
                  width="120"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="h-10 w-auto"
                  src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
                  style={{ color: 'transparent' }}
                />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black mb-3 text-accent-900 dark:text-white">تأكيد البريد</h1>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">جاري التحقق من رابط التأكيد...</p>
            </div>

            {/* Loading Message */}
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-glow">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white">جاري التحقق...</h2>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">يرجى الانتظار بينما نتحقق من صحة الرابط</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no token found
  if (!token) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-large border-none text-center">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center mb-6">
                <img
                  alt="عرب نوشن"
                  width="120"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="h-10 w-auto"
                  src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
                  style={{ color: 'transparent' }}
                />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black mb-3 text-accent-900 dark:text-white">تأكيد البريد</h1>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">رابط التأكيد غير صحيح</p>
            </div>

            {/* Error Message */}
            <div>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400 shadow-glow">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white">رابط غير صحيح</h2>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">
                رابط تأكيد البريد الإلكتروني غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
              </p>
              <div className="space-y-4">
                <Link
                  href="/forgot-password"
                  className="w-full btn-primary text-base py-4 rounded-2xl inline-block text-center cursor-pointer shadow-large"
                >
                  طلب رابط جديد
                </Link>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="btn-ghost text-sm font-bold"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/" className="text-sm text-accent-700 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center font-bold gap-1.5">
              <svg className="w-4 h-4 ml-1.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-large border-none text-center">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                alt="عرب نوشن"
                width="120"
                height="40"
                decoding="async"
                data-nimg="1"
                className="h-10 w-auto"
                src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
                style={{ color: 'transparent' }}
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black mb-3 text-accent-900 dark:text-white">تأكيد البريد</h1>
            <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">جاري تأكيد بريدك الإلكتروني...</p>
          </div>

          {/* Loading/Error Message */}
          <div>
            {loading ? (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-glow">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white">جاري التأكيد...</h2>
                <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium">يرجى الانتظار بينما نؤكد بريدك الإلكتروني</p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400 shadow-glow">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white">
                  {errorType === 'ALREADY_VERIFIED' ? 'مؤكد بالفعل' :
                    errorType === 'EXPIRED_TOKEN' ? 'انتهت صلاحية الرابط' :
                      errorType === 'INVALID_TOKEN' ? 'رابط غير صحيح أو منتهي' :
                        'فشل في التأكيد'}
                </h2>
                <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">{error}</p>

                {errorType === 'ALREADY_VERIFIED' ? (
                  <div className="space-y-4">
                    <Link
                      href="/login"
                      className="w-full btn-primary text-base py-4 rounded-2xl inline-block text-center cursor-pointer shadow-large"
                    >
                      تسجيل الدخول
                    </Link>
                    <div className="text-center">
                      <Link
                        href="/"
                        className="btn-ghost text-sm font-bold"
                      >
                        العودة للصفحة الرئيسية
                      </Link>
                    </div>
                  </div>
                ) : errorType === 'EXPIRED_TOKEN' || errorType === 'INVALID_TOKEN' ? (
                  <div className="space-y-4">
                    {resendSent ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                        تم إرسال رابط تأكيد جديد! تحقق من بريدك الإلكتروني.
                      </div>
                    ) : (
                      <>
                        {!searchParams.get('email') && (
                          <div>
                            <label className="block text-sm font-bold text-accent-600 dark:text-gray-400 mb-2 text-right">
                              البريد الإلكتروني المسجل
                            </label>
                            <input
                              type="email"
                              value={resendEmail}
                              onChange={(e) => setResendEmail(e.target.value)}
                              placeholder="example@email.com"
                              className="w-full px-4 py-3 bg-white/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 text-accent-900 dark:text-white font-medium"
                              dir="ltr"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => handleResendVerification()}
                          disabled={loading || (!searchParams.get('email') && !resendEmail)}
                          className="w-full btn-primary text-base py-4 rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-large"
                        >
                          {loading ? 'جاري الإرسال...' : 'إعادة إرسال رابط التأكيد'}
                        </button>
                      </>
                    )}
                    <div className="text-center flex justify-center gap-4">
                      <Link href="/login" className="btn-ghost text-sm font-bold">تسجيل الدخول</Link>
                      <Link href="/signup" className="btn-ghost text-sm font-bold">إنشاء حساب جديد</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setHasAttemptedVerification(false);
                        handleVerifyEmail(token);
                      }}
                      disabled={loading}
                      className="w-full btn-primary text-base py-4 rounded-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-large"
                    >
                      {loading ? 'جاري المحاولة...' : 'إعادة المحاولة'}
                    </button>
                    <div className="text-center">
                      <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="btn-ghost text-sm font-bold disabled:opacity-50"
                      >
                        إعادة إرسال رابط التأكيد
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-accent-700 dark:text-gray-400 hover:text-primary transition-colors flex items-center justify-center font-bold gap-1.5">
            <svg className="w-4 h-4 ml-1.5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const { theme } = useTheme();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-large border-none text-center">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <img
                  alt="عرب نوشن"
                  width="120"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="h-10 w-auto"
                  src={theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
                  style={{ color: 'transparent' }}
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mb-3 text-accent-900 dark:text-white">تأكيد البريد</h1>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium animate-pulse">جاري التحميل...</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-glow animate-pulse">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
              <h2 className="text-xl font-black mb-3 text-accent-900 dark:text-white animate-pulse">جاري التحميل...</h2>
              <p className="text-sm sm:text-base text-accent-600 dark:text-gray-400 font-medium animate-pulse">يرجى الانتظار...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

