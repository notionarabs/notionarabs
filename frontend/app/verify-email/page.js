'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

function VerifyEmailForm() {
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);
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
    hasInitialized.current = true;

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

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    setErrorType('');

    // Get email from URL params or prompt user
    const email = searchParams.get('email');
    if (!email) {
      setError('يرجى إدخال بريدك الإلكتروني');
      setErrorType('NO_EMAIL');
      setLoading(false);
      return;
    }

    try {
      const result = await resendVerification(email);

      if (result.success) {
        setSuccess(true);
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
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full my-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                alt="عرب نوشن"
                width="120"
                height="40"
                decoding="async"
                data-nimg="1"
                className="h-12 w-auto"
                src="/NavLogoLight.svg"
                style={{ color: 'transparent' }}
              />
            </Link>
            <h1 className="heading-2 mb-3">تم تأكيد البريد الإلكتروني</h1>
            <p className="body-large">تم تأكيد حسابك بنجاح</p>
          </div>

          {/* Success Message */}
          <div className="card p-8 border-primary-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="heading-2 mb-4">تم تأكيد البريد الإلكتروني بنجاح</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                تم تأكيد حسابك بنجاح. مرحباً بك في عرب نوشن! {isAuthenticated ? 'سيتم توجيهك إلى الصفحة الرئيسية خلال ثوانٍ قليلة.' : 'يرجى النقر على الزر أدناه للانتقال إلى الصفحة الرئيسية.'}
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full btn-primary text-lg py-3"
                >
                  الذهاب إلى الصفحة الرئيسية
                </button>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="btn-ghost text-sm"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-10">
            <Link href="/" className="body-medium hover:text-accent-500 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full my-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                alt="عرب نوشن"
                width="120"
                height="40"
                decoding="async"
                data-nimg="1"
                className="h-12 w-auto"
                src="/NavLogoLight.svg"
                style={{ color: 'transparent' }}
              />
            </Link>
            <h1 className="heading-2 mb-3">تأكيد البريد الإلكتروني</h1>
            <p className="body-large">جاري التحقق من رابط التأكيد...</p>
          </div>

          {/* Loading Message */}
          <div className="card p-8 border-primary-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="heading-2 mb-4">جاري التحقق...</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">يرجى الانتظار بينما نتحقق من صحة الرابط</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no token found
  if (!token) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full my-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="flex items-center justify-center mb-6">
              <img
                alt="عرب نوشن"
                width="120"
                height="40"
                decoding="async"
                data-nimg="1"
                className="h-12 w-auto"
                src="/NavLogoLight.svg"
                style={{ color: 'transparent' }}
              />
            </Link>
            <h1 className="heading-2 mb-3">تأكيد البريد الإلكتروني</h1>
            <p className="body-large">رابط التأكيد غير صحيح</p>
          </div>

          {/* Error Message */}
          <div className="card p-8 border-error-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="heading-2 mb-4">رابط غير صحيح</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                رابط تأكيد البريد الإلكتروني غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
              </p>
              <div className="space-y-4">
                <Link
                  href="/forgot-password"
                  className="w-full btn-primary text-lg py-3"
                >
                  طلب رابط جديد
                </Link>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="btn-ghost text-sm"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-10">
            <Link href="/" className="body-medium hover:text-accent-500 transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full my-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center mb-6">
            <img
              alt="عرب نوشن"
              width="120"
              height="40"
              decoding="async"
              data-nimg="1"
              className="h-12 w-auto"
              src="/NavLogoLight.svg"
              style={{ color: 'transparent' }}
            />
          </Link>
          <h1 className="heading-2 mb-3">تأكيد البريد الإلكتروني</h1>
          <p className="body-large">جاري تأكيد بريدك الإلكتروني...</p>
        </div>

        {/* Loading/Error Message */}
        <div className="card p-8 border-primary-200">
          <div className="text-center">
            {loading ? (
              <>
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="heading-2 mb-4">جاري التأكيد...</h2>
                <p className="body-large text-accent-600 dark:text-dark-text-secondary">يرجى الانتظار بينما نؤكد بريدك الإلكتروني</p>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="heading-2 mb-4">
                  {errorType === 'ALREADY_VERIFIED' ? 'البريد الإلكتروني مؤكد بالفعل' :
                    errorType === 'EXPIRED_TOKEN' ? 'انتهت صلاحية الرابط' :
                      errorType === 'INVALID_TOKEN' ? 'رابط غير صحيح' :
                        'فشل في التأكيد'}
                </h2>
                <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">{error}</p>

                {errorType === 'ALREADY_VERIFIED' ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full btn-primary text-lg py-3"
                    >
                      تسجيل الدخول
                    </button>
                    <div className="text-center">
                      <button
                        onClick={() => router.push('/')}
                        className="btn-ghost text-sm"
                      >
                        العودة للصفحة الرئيسية
                      </button>
                    </div>
                  </div>
                ) : errorType === 'EXPIRED_TOKEN' || errorType === 'INVALID_TOKEN' ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'جاري الإرسال...' : 'طلب رابط جديد'}
                    </button>
                    <div className="text-center">
                      <button
                        onClick={() => router.push('/login')}
                        className="btn-ghost text-sm"
                      >
                        تسجيل الدخول
                      </button>
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
                      className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'جاري المحاولة...' : 'إعادة المحاولة'}
                    </button>
                    <div className="text-center">
                      <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center mt-10">
          <Link href="/" className="body-medium hover:text-accent-500 transition-colors flex items-center justify-center">
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full my-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <img
                alt="عرب نوشن"
                width="120"
                height="40"
                decoding="async"
                data-nimg="1"
                className="h-12 w-auto"
                src="/NavLogoLight.svg"
                style={{ color: 'transparent' }}
              />
            </div>
            <h1 className="heading-2 mb-3">تأكيد البريد الإلكتروني</h1>
            <p className="body-large">جاري التحميل...</p>
          </div>
          <div className="card p-8 border-primary-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
              <h2 className="heading-2 mb-4">جاري التحميل...</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">يرجى الانتظار...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

