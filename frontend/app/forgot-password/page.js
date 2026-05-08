'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, ArrowRight, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { forgotPassword } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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
              src={mounted && theme === 'dark' ? '/brand/NavLogoLight.svg' : '/brand/NavLogoDark.svg'}
              alt="عرب نوشن"
              width={140}
              height={45}
              className="h-10 sm:h-12 w-auto drop-shadow-sm"
              quality={100}
              priority
              unoptimized
            />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none shadow-large rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden text-center"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent opacity-50"></div>
              
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-6 shadow-glow shadow-green-500/10">
                <Check className="h-8 w-8 animate-scaleIn" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                تم إرسال الرابط
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                إذا كان بريدك الإلكتروني مسجلاً لدينا، ستتلقى رابطاً لإعادة تعيين كلمة المرور خلال دقائق قليلة.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transform hover:-translate-y-0.5 transition-all duration-200 text-base cursor-pointer"
                >
                  إرسال رابط آخر
                </button>
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-soft hover:shadow-md border-none"
                >
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  <span>العودة لتسجيل الدخول</span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-none shadow-large rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group/card"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50"></div>

              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  نسيت كلمة المرور؟
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed px-2">
                  أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mr-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-4 bg-white/70 dark:bg-white/5 border-none text-gray-900 dark:text-white rounded-2xl focus:ring-1 focus:ring-primary/20 shadow-soft focus:shadow-glow transition-all duration-300 outline-none text-base font-medium"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <span className="font-medium">{error}</span>
                        {error.includes('Google') && (
                          <div className="mt-2.5 p-3 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg">
                            <p className="text-blue-800 dark:text-blue-300 font-bold text-xs mb-1">💡 نصيحة:</p>
                            <p className="text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
                              إذا كان حسابك مسجلاً عبر Google، يرجى استخدام زر "تسجيل الدخول بـ Google" في صفحة تسجيل الدخول.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-200 text-base disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري إرسال الرابط...</span>
                    </div>
                  ) : (
                    'إرسال رابط إعادة التعيين'
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-white/5 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  تذكرت كلمة المرور؟{' '}
                  <Link href="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline transition-all mr-1">
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-bold cursor-pointer">
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
