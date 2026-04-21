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

    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-200">
            <Image
              src="/brand/NavLogoLight.svg"
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
            مرحباً بعودتك
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            سجل دخولك لمتابعة رحلتك
          </p>
        </div>

        {/* Login Card - Glass Style */}
        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none shadow-large rounded-[2.5rem] p-8 sm:p-10 transition-all duration-500 relative overflow-hidden group/card">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50"></div>

          {/* Social Login */}
          <div className="mb-6">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://notion-arabs.onrender.com/api' : 'http://localhost:5000/api')}/auth/google`}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-white/5 border-none text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 group hover:shadow-md"
            >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>تسجيل الدخول باستخدام Google</span>
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

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5 mr-1 ml-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
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
                className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium"
                placeholder="••••••"
                dir="ltr"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Verification Options */}
            {showVerificationOptions && (
              <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                <p className="font-medium mb-1">الحساب غير مفعل</p>
                <p className="opacity-90 mb-3 text-xs">يجب تأكيد بريدك الإلكتروني لتفعيل الحساب.</p>
                <button
                  onClick={async () => {
                    const result = await resendVerification(userEmail);
                    if (result.success) {
                      setError('تم إرسال رابط التأكيد إلى بريدك الإلكتروني');
                    } else {
                      setError(result.error);
                    }
                  }}
                  className="text-blue-700 dark:text-blue-300 underline hover:no-underline font-medium text-xs"
                >
                  إعادة إرسال رابط التأكيد
                </button>
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
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-white/5 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-all">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
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
