'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationOptions, setShowVerificationOptions] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [redirectPath, setRedirectPath] = useState('/');

  const { login, resendVerification } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect parameter from URL
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectPath(redirect);
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

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect to the intended page or homepage
      router.push(redirectPath);
    } else {
      setError(result.error);
      // If email verification is required, show additional options
      if (result.requiresVerification) {
        setShowVerificationOptions(true);
        setUserEmail(formData.email);
      }
    }

    setLoading(false);
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-accent-500 dark:text-dark-text-primary">مرحباً بعودتك</h1>
          <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">سجل دخولك للوصول إلى حسابك</p>
        </div>

        {/* Login Form */}
        <div className="card p-6 sm:p-8 md:p-10 border-primary-200">
          {/* Social Login Buttons - Moved to beginning */}
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <a
              href={`${process.env.NODE_ENV === 'production' ? 'http://ec2-50-19-23-245.compute-1.amazonaws.com/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')}/auth/google`}
              className="w-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base flex items-center justify-center"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="hidden sm:inline">تسجيل الدخول بـ Google</span>
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1 sm:gap-0">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary-500 hover:text-primary-600 transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="أدخل كلمة المرور"
                dir="ltr"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Email Verification Options */}
            {showVerificationOptions && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                <p className="font-medium mb-2">الحساب غير مفعل</p>
                <p className="mb-3">يجب تأكيد بريدك الإلكتروني أولاً لتفعيل الحساب.</p>
                <p className="mb-3">تحقق من بريدك الإلكتروني للحصول على رابط التأكيد.</p>
                <button
                  onClick={async () => {
                    const result = await resendVerification(userEmail);
                    if (result.success) {
                      setError('تم إرسال رابط التأكيد إلى بريدك الإلكتروني');
                    } else {
                      setError(result.error);
                    }
                  }}
                  className="text-blue-800 dark:text-blue-200 underline hover:text-blue-900 dark:hover:text-blue-100"
                >
                  إعادة إرسال رابط التأكيد
                </button>
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
                  <span className="hidden sm:inline">جاري تسجيل الدخول...</span>
                  <span className="sm:hidden">جاري الدخول</span>
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm md:text-base text-accent-600 dark:text-dark-text-secondary">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="text-primary-500 font-medium hover:text-primary-600 transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
