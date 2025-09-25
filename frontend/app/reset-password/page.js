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
          <div className="absolute w-60 h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="flex items-center justify-center mb-6">
                <Image
                  src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                  alt="عرب نوشن"
                  width={120}
                  height={40}
                  className="h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </Link>
              <h1 className="heading-2 mb-3">تم تغيير كلمة المرور</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">تم تغيير كلمة المرور بنجاح</p>
            </div>

            {/* Success Message */}
            <div className="card p-10 border-primary-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4">تم تغيير كلمة المرور بنجاح</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-8">
                  تم تغيير كلمة المرور بنجاح. سيتم توجيهك إلى صفحة تسجيل الدخول خلال ثوانٍ قليلة.
                </p>
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    تسجيل الدخول الآن
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link href="/" className="btn-ghost flex items-center justify-center">
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
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
            <h2 className="heading-3 mb-2">جاري التحقق من الرابط...</h2>
            <p className="body-medium text-accent-600 dark:text-dark-text-secondary">يرجى الانتظار بينما نتحقق من صحة رابط إعادة تعيين كلمة المرور</p>
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
          <div className="absolute w-60 h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-60 h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="flex items-center justify-center mb-6">
                <Image
                  src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                  alt="عرب نوشن"
                  width={120}
                  height={40}
                  className="h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </Link>
              <h1 className="heading-2 mb-3">رابط غير صحيح</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية</p>
            </div>

            {/* Error Message */}
            <div className="card p-10 border-red-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4">رابط غير صحيح</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-8">
                  رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
                </p>
                <div className="space-y-4">
                  <Link
                    href="/forgot-password"
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    طلب رابط جديد
                  </Link>
                  <Link
                    href="/login"
                    className="w-full btn-outline flex items-center justify-center"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-8">
              <Link href="/" className="btn-ghost flex items-center justify-center">
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
        <div className="absolute w-60 h-60 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-20 -right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-60 h-60 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-20 -left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-60 h-60 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="flex items-center justify-center mb-6">
              <Image
                src={theme === 'dark' ? "/NavLogoDark.svg" : "/NavLogoLight.svg"}
                alt="عرب نوشن"
                width={120}
                height={40}
                className="h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <h1 className="heading-2 mb-3">إعادة تعيين كلمة المرور</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">أدخل كلمة المرور الجديدة</p>
          </div>

          {/* Reset Password Form */}
          <div className="card p-10 border-primary-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أدخل كلمة المرور الجديدة"
                  dir="ltr"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  dir="ltr"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="mt-8 text-center">
              <p className="body-medium text-accent-600 dark:text-dark-text-secondary">
                تذكرت كلمة المرور؟{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link href="/" className="btn-ghost flex items-center justify-center">
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
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
            <h2 className="heading-3 mb-2">جاري التحميل...</h2>
            <p className="body-medium text-accent-600 dark:text-dark-text-secondary">يرجى الانتظار بينما نقوم بتحميل الصفحة</p>
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
