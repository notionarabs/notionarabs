'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('رابط إعادة تعيين كلمة المرور غير صحيح');
      setIsValidatingToken(false);
    } else {
      setToken(tokenFromUrl);
      setIsValidatingToken(false);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-10 sm:-top-16 md:-top-20 -right-10 sm:-right-16 md:-right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-10 sm:-bottom-16 md:-bottom-20 -left-10 sm:-left-16 md:-left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
                <Image
                  src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                  alt="عرب نوشن"
                  width={120}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">تم تغيير كلمة المرور</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">تم تغيير كلمة المرور بنجاح</p>
            </div>

            {/* Success Message */}
            <div className="card p-6 sm:p-8 md:p-10 border-primary-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 sm:mb-5 md:mb-6">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">تم تغيير كلمة المرور بنجاح</h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                  تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول خلال ثوانٍ قليلة.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <Link
                    href="/login"
                    className="w-full btn-primary flex items-center justify-center text-sm sm:text-base"
                  >
                    تسجيل الدخول الآن
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6 sm:mt-8">
              <Link href="/" className="btn-ghost flex items-center justify-center text-sm sm:text-base">
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-2 border-primary-500 mx-auto mb-4 sm:mb-5 md:mb-6"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">جاري التحقق من الرابط...</h2>
            <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary px-4">يرجى الانتظار بينما نتحقق من صحة رابط إعادة تعيين كلمة المرور</p>
          </div>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-10 sm:-top-16 md:-top-20 -right-10 sm:-right-16 md:-right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-10 sm:-bottom-16 md:-bottom-20 -left-10 sm:-left-16 md:-left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
                <Image
                  src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                  alt="عرب نوشن"
                  width={120}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </Link>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">رابط غير صحيح</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary px-4">رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية</p>
            </div>

            {/* Error Message */}
            <div className="card p-6 sm:p-8 md:p-10 border-red-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 sm:mb-5 md:mb-6">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">رابط غير صحيح</h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-6 sm:mb-8">
                  رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <Link
                    href="/forgot-password"
                    className="w-full btn-primary flex items-center justify-center text-sm sm:text-base"
                  >
                    طلب رابط جديد
                  </Link>
                  <Link
                    href="/login"
                    className="w-full btn-outline flex items-center justify-center text-sm sm:text-base"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-6 sm:mt-8">
              <Link href="/" className="btn-ghost flex items-center justify-center text-sm sm:text-base">
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-10 sm:-top-16 md:-top-20 -right-10 sm:-right-16 md:-right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-10 sm:-bottom-16 md:-bottom-20 -left-10 sm:-left-16 md:-left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-32 h-32 sm:w-48 sm:h-48 md:w-60 md:h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <Link href="/" className="flex items-center justify-center mb-4 sm:mb-6">
              <Image
                src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                alt="عرب نوشن"
                width={120}
                height={40}
                className="h-10 sm:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">إعادة تعيين كلمة المرور</h1>
            <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">أدخل كلمة المرور الجديدة</p>
          </div>

          {/* Reset Password Form */}
          <div className="card p-6 sm:p-8 md:p-10 border-primary-200">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label text-sm sm:text-base">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input text-sm sm:text-base"
                  placeholder="أدخل كلمة المرور الجديدة"
                  dir="ltr"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label text-sm sm:text-base">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input text-sm sm:text-base"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  dir="ltr"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري التحديث...
                  </div>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                تذكرت كلمة المرور؟{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6 sm:mt-8">
            <Link href="/" className="btn-ghost flex items-center justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-b-2 border-primary-500 mx-auto mb-4 sm:mb-5 md:mb-6"></div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">جاري التحميل...</h2>
            <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary px-4">يرجى الانتظار بينما نقوم بتحميل الصفحة</p>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
