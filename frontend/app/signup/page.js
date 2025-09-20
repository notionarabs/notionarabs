'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (!agreedToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await signup(formData.name, formData.email, formData.password);

    console.log('Signup result:', result);
    console.log('requiresVerification:', result.requiresVerification);
    console.log('verificationToken:', result.verificationToken);

    if (result.success) {
      if (result.requiresVerification && result.verificationToken) {
        console.log('Account created, showing verification message');
        // Show verification message instead of redirecting immediately
        setUserEmail(formData.email);
        setVerificationToken(result.verificationToken);
        setShowVerificationMessage(true);
      } else {
        console.log('No verification required or missing token, redirecting to home');
        console.log('This should not happen with the new flow!');
        router.push('/');
      }
    } else {
      console.log('Signup failed:', result.error);
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-bw flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-gradient-bw mb-4 inline-block">
            عرب نوشن
          </Link>
          <h1 className="text-3xl font-bold text-bw-black mb-2">انضم إلى مجتمعنا</h1>
          <p className="text-bw-gray">أنشئ حسابك وابدأ رحلتك معنا</p>
        </div>

        {/* Signup Form */}
        <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!showVerificationMessage ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-bw-black mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-bw-black mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="ltr"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-bw-black mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                  dir="ltr"
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-bw-black mb-2">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="أعد إدخال كلمة المرور"
                  dir="ltr"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                />
                <label htmlFor="terms" className="mr-2 text-sm text-bw-gray">
                  أوافق على{' '}
                  <a href="/terms" className="text-black hover:text-gray-700 transition-colors">
                    الشروط والأحكام
                  </a>
                  {' '}و{' '}
                  <a href="/privacy" className="text-black hover:text-gray-700 transition-colors">
                    سياسة الخصوصية
                  </a>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Verification Message */}
              {showVerificationMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="w-full">
                      <p className="font-medium">تم إنشاء الحساب بنجاح!</p>
                      <p className="mt-1">تم إرسال رابط تأكيد البريد الإلكتروني إلى {userEmail}</p>
                      <p className="mt-2">يرجى التحقق من بريدك الإلكتروني والضغط على الرابط لتأكيد حسابك.</p>
                      <p className="mt-2 text-sm text-green-600">سيتم توجيهك إلى الصفحة الرئيسية بعد تأكيد بريدك الإلكتروني.</p>

                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => {
                            // Redirect to verification page with token
                            router.push(`/verify-email?token=${verificationToken}&email=${userEmail}`);
                          }}
                          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          انتقل إلى صفحة التأكيد
                        </button>

                        <button
                          onClick={() => {
                            setShowVerificationMessage(false);
                            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                            setAgreedToTerms(false);
                          }}
                          className="w-full py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                        >
                          إنشاء حساب آخر
                        </button>
                      </div>
                    </div>
                  </div>
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
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  'إنشاء الحساب'
                )}
              </button>
            </form>
          ) : null}

          {/* Divider and Social Login - Only show when not in verification mode */}
          {!showVerificationMessage && (
            <>
              {/* Divider */}
              <div className="mt-6 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-bw-white text-bw-gray">أو</span>
                  </div>
                </div>
              </div>

              {/* Social Signup Buttons */}
              <div className="space-y-3">
                <a
                  href={`${process.env.NODE_ENV === 'production' ? 'https://notion-arabs.onrender.com/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')}/auth/google`}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-bw-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  التسجيل بـ Google
                </a>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-bw-gray">
                  لديك حساب بالفعل؟{' '}
                  <Link href="/login" className="text-black font-semibold hover:text-gray-700 transition-colors">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </>
          )}
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
