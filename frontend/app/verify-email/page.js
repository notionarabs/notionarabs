'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  const { verifyEmail, resendVerification, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVerifyEmail = useCallback(async (verificationToken) => {
    console.log('VerifyEmail: Starting email verification with token:', verificationToken ? 'present' : 'missing');
    setLoading(true);
    setError('');

    const result = await verifyEmail(verificationToken);
    console.log('VerifyEmail: Verification result:', result);

    if (result.success) {
      console.log('VerifyEmail: Verification successful, setting success state');
      setSuccess(true);
      // The redirect will be handled by the useEffect that watches for user authentication
    } else {
      console.log('VerifyEmail: Verification failed:', result.error);
      setError(result.error);
    }

    setLoading(false);
  }, [verifyEmail]);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Auto-verify when token is present (either from signup with email or direct link)
      handleVerifyEmail(tokenFromUrl);
    }
  }, [searchParams, handleVerifyEmail]);

  // Redirect to home page when user is authenticated
  useEffect(() => {
    console.log('VerifyEmail: Checking redirect conditions:', { success, isAuthenticated, user: !!user });
    if (success && isAuthenticated && user) {
      console.log('VerifyEmail: User is authenticated, redirecting to home page');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [success, isAuthenticated, user, router]);

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    // Get email from URL params or prompt user
    const email = searchParams.get('email');
    if (!email) {
      setError('يرجى إدخال بريدك الإلكتروني');
      setLoading(false);
      return;
    }

    const result = await resendVerification(email);

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
            <h1 className="text-3xl font-bold text-bw-black mb-2">تم تأكيد البريد الإلكتروني</h1>
            <p className="text-bw-gray">تم تأكيد حسابك بنجاح</p>
          </div>

          {/* Success Message */}
          <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-bw-black mb-2">تم تأكيد البريد الإلكتروني بنجاح</h3>
              <p className="text-bw-gray mb-6">
                تم تأكيد حسابك بنجاح. مرحباً بك في عرب نوشن! {isAuthenticated ? 'سيتم توجيهك إلى الصفحة الرئيسية خلال ثوانٍ قليلة.' : 'يرجى النقر على الزر أدناه للانتقال إلى الصفحة الرئيسية.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-4 btn-bw-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  الذهاب إلى الصفحة الرئيسية
                </button>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-bw-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  تسجيل الدخول
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-bw flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-gradient-bw mb-4 inline-block">
              عرب نوشن
            </Link>
            <h1 className="text-3xl font-bold text-bw-black mb-2">تأكيد البريد الإلكتروني</h1>
            <p className="text-bw-gray">رابط التأكيد غير صحيح</p>
          </div>

          {/* Error Message */}
          <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-bw-black mb-2">رابط غير صحيح</h3>
              <p className="text-bw-gray mb-6">
                رابط تأكيد البريد الإلكتروني غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
              </p>
              <div className="space-y-3">
                <Link
                  href="/forgot-password"
                  className="w-full py-3 px-4 btn-bw-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  طلب رابط جديد
                </Link>
                <Link
                  href="/login"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-bw-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  تسجيل الدخول
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
          <h1 className="text-3xl font-bold text-bw-black mb-2">تأكيد البريد الإلكتروني</h1>
          <p className="text-bw-gray">جاري تأكيد بريدك الإلكتروني...</p>
        </div>

        {/* Loading/Error Message */}
        <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            {loading ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-bw-black mb-2">جاري التأكيد...</h3>
                <p className="text-bw-gray">يرجى الانتظار بينما نؤكد بريدك الإلكتروني</p>
              </>
            ) : error ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-bw-black mb-2">فشل في التأكيد</h3>
                <p className="text-bw-gray mb-4">{error}</p>
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full py-3 px-4 btn-bw-primary rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  إعادة إرسال رابط التأكيد
                </button>
              </>
            ) : null}
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

