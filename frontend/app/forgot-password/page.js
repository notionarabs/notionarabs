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
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-10 sm:-top-16 md:-top-20 -right-10 sm:-right-16 md:-right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-10 sm:-bottom-16 md:-bottom-20 -left-10 sm:-left-16 md:-left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
          <div className="max-w-md w-full my-2 sm:my-4 md:my-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <Link href="/" className="inline-flex items-center justify-center mb-3 sm:mb-4 md:mb-6 hover:opacity-80 transition-opacity">
                <Image
                  src={theme === 'dark' ? "/brand/NavLogoDark.svg" : "/brand/NavLogoLight.svg"}
                  alt="عرب نوشن"
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-accent-500 dark:text-dark-text-primary px-2">تم إرسال الرابط</h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-accent-600 dark:text-dark-text-secondary px-2">تحقق من بريدك الإلكتروني</p>
            </div>

            {/* Success Message */}
            <div className="card p-4 sm:p-6 md:p-8 lg:p-10 border-primary-200 shadow-lg">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-accent-500 dark:text-dark-text-primary px-1">تم إرسال رابط إعادة تعيين كلمة المرور</h3>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-relaxed px-1">
                  إذا كان البريد الإلكتروني مسجلاً في نظامنا، ستتلقى رابطاً لإعادة تعيين كلمة المرور خلال دقائق قليلة.
                </p>
                <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                  <button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg transform hover:scale-[1.01]"
                  >
                    إرسال رابط آخر
                  </button>
                  <Link
                    href="/login"
                    className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary active:bg-gray-100 dark:active:bg-dark-primary font-medium py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base flex items-center justify-center shadow-sm hover:shadow-md transform hover:scale-[1.01]"
                  >
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-4 sm:mt-5 md:mt-6 lg:mt-8">
              <Link href="/" className="inline-flex items-center justify-center bg-transparent hover:bg-gray-50 dark:hover:bg-dark-tertiary active:bg-gray-100 dark:active:bg-dark-primary text-gray-600 dark:text-dark-text-secondary font-medium py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-400/20 dark:bg-primary-900/20 rounded-full -top-10 sm:-top-16 md:-top-20 -right-10 sm:-right-16 md:-right-20 animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-300/20 dark:bg-primary-800/20 rounded-full -bottom-10 sm:-bottom-16 md:-bottom-20 -left-10 sm:-left-16 md:-left-20 animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-72 lg:h-72 bg-primary-200/20 dark:bg-primary-700/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000 mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="max-w-md w-full my-2 sm:my-4 md:my-6">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <Link href="/" className="inline-flex items-center justify-center mb-3 sm:mb-4 md:mb-6 hover:opacity-80 transition-opacity">
              <Image
                src={theme === 'dark' ? "/brand/NavLogoDark.svg" : "/brand/NavLogoLight.svg"}
                alt="عرب نوشن"
                width={120}
                height={40}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-3 text-accent-500 dark:text-dark-text-primary px-2">نسيت كلمة المرور؟</h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed px-2">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
          </div>

          {/* Forgot Password Form */}
          <div className="card p-4 sm:p-6 md:p-8 lg:p-10 border-primary-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="text-xs sm:text-sm md:text-base font-medium text-gray-700 dark:text-dark-text-primary mb-1.5 sm:mb-2 block">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 dark:border-dark-input-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="ltr"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs sm:text-sm leading-relaxed">
                  {error}
                  {error.includes('Google') && (
                    <div className="mt-2 sm:mt-2.5 md:mt-3 p-2 sm:p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-800 dark:text-blue-300 font-medium text-xs sm:text-sm mb-1">💡 نصيحة:</p>
                      <p className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm leading-relaxed">
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
                className="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 disabled:hover:shadow-none shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">جاري الإرسال...</span>
                    <span className="sm:hidden">جاري الإرسال</span>
                  </div>
                ) : (
                  'إرسال رابط إعادة التعيين'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 text-center">
              <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">
                تذكرت كلمة المرور؟{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-all">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4 sm:mt-5 md:mt-6 lg:mt-8">
            <Link href="/" className="inline-flex items-center justify-center bg-transparent hover:bg-gray-50 dark:hover:bg-dark-tertiary active:bg-gray-100 dark:active:bg-dark-primary text-gray-600 dark:text-dark-text-secondary font-medium py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 rounded-lg md:rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
