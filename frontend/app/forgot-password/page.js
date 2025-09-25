'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(true);
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
              <h1 className="heading-2 mb-3">تم إرسال الرابط</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">تحقق من بريدك الإلكتروني</p>
            </div>

            {/* Success Message */}
            <div className="card p-10 border-primary-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4">تم إرسال رابط إعادة تعيين كلمة المرور</h3>
                <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-8">
                  إذا كان البريد الإلكتروني مسجلاً في نظامنا، ستتلقى رابطاً لإعادة تعيين كلمة المرور خلال دقائق قليلة.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="w-full btn-primary"
                  >
                    إرسال رابط آخر
                  </button>
                  <Link
                    href="/login"
                    className="w-full btn-outline flex items-center justify-center"
                  >
                    العودة لتسجيل الدخول
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
            <h1 className="heading-2 mb-3">نسيت كلمة المرور؟</h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
          </div>

          {/* Forgot Password Form */}
          <div className="card p-10 border-primary-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="ltr"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                  {error.includes('Google') && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-300 font-medium">💡 نصيحة:</p>
                      <p className="text-blue-700 dark:text-blue-400 text-sm">
                        إذا كان حسابك مسجل عبر Google، استخدم زر "تسجيل الدخول بـ Google" في صفحة تسجيل الدخول.
                      </p>
                    </div>
                  )}
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
                    جاري الإرسال...
                  </div>
                ) : (
                  'إرسال رابط إعادة التعيين'
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
