'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuth();
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
      <div className="min-h-screen bg-gradient-bw flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gradient-bw mb-4 inline-block">
              عرب نوشن
            </Link>
            <h1 className="text-3xl font-bold text-bw-black mb-2">تم إرسال الرابط</h1>
            <p className="text-bw-gray">تحقق من بريدك الإلكتروني</p>
          </div>

          {/* Success Message */}
          <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-bw-black mb-2">تم إرسال رابط إعادة تعيين كلمة المرور</h3>
              <p className="text-bw-gray mb-6">
                إذا كان البريد الإلكتروني مسجلاً في نظامنا، ستتلقى رابطاً لإعادة تعيين كلمة المرور خلال دقائق قليلة.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full py-3 px-4 btn-bw-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  إرسال رابط آخر
                </button>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-bw-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-bw-gray hover:text-bw-black transition-colors flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-bw flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gradient-bw mb-4 inline-block">
            عرب نوشن
          </Link>
          <h1 className="text-3xl font-bold text-bw-black mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-bw-gray">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-bw-black mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
                {error.includes('Google') && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium">💡 نصيحة:</p>
                    <p className="text-blue-700 text-sm">
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
              className="w-full py-3 px-4 btn-bw-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="mt-6 text-center">
            <p className="text-bw-gray">
              تذكرت كلمة المرور؟{' '}
              <Link href="/login" className="text-black font-semibold hover:text-gray-700 transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-bw-gray hover:text-bw-black transition-colors flex items-center justify-center">
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
