'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationOptions, setShowVerificationOptions] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { login, resendVerification } = useAuth();
  const router = useRouter();

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
      router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-accent-500 flex items-center justify-center px-4 py-8" dir="rtl">
      <div className="max-w-md w-full my-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center mb-6">
            <Image
              src="/NavLogoImageLight.png"
              alt="عرب نوشن"
              width={120}
              height={40}
              className="h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>
          <h1 className="text-3xl font-bold text-accent-500 mb-3">مرحباً بعودتك</h1>
          <p className="text-accent-600">سجل دخولك للوصول إلى حسابك</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-primary-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-accent-500 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-accent-500">
                  كلمة المرور
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="أدخل كلمة المرور"
                dir="ltr"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Verification Options */}
            {showVerificationOptions && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
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
                  className="text-blue-800 underline hover:text-blue-900"
                >
                  إعادة إرسال رابط التأكيد
                </button>
              </div>
            )}


            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-accent-600">أو</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <a
              href={`${process.env.NODE_ENV === 'production' ? 'https://notion-arabs.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')}/auth/google`}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-accent-500 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              تسجيل الدخول بـ Google
            </a>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-accent-600">
              ليس لديك حساب؟{' '}
              <Link href="/signup" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-10">
          <Link href="/" className="text-accent-600 hover:text-accent-500 transition-colors flex items-center justify-center">
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
