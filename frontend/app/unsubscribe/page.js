'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

function UnsubscribeContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();

  // Get email from URL params if available
  const emailParam = searchParams.get('email');
  if (emailParam && !email) {
    setEmail(emailParam);
  }

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('تم إلغاء الاشتراك بنجاح. لن تصلك رسائل إلكترونية منا بعد الآن.');
      } else {
        setMessage(data.message || 'حدث خطأ أثناء إلغاء الاشتراك. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Ambient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-md w-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-large p-8 sm:p-10 relative z-10 border-none transition-all duration-300">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-primary shadow-glow">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-accent-900 dark:text-white mb-3">إلغاء الاشتراك</h1>
          <p className="text-accent-600 dark:text-gray-400 font-bold">نحن نأسف لرؤيتك تغادرنا</p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleUnsubscribe} className="space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                'إلغاء الاشتراك'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">تم بنجاح!</h2>
            <p className="text-accent-600 dark:text-gray-400 mb-8 font-medium leading-relaxed">{message}</p>
            <Link
              href="/"
              className="inline-flex w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl items-center justify-center gap-3 transition-all duration-300 shadow-large hover:scale-105 cursor-pointer"
            >
              <span>العودة للرئيسية</span>
            </Link>
          </div>
        )}

        {message && !isSuccess && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl">
            <p className="text-red-800 dark:text-red-400 text-sm font-semibold">{message}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
          <p className="text-sm text-accent-600 dark:text-gray-400 font-medium">
            إذا كنت ترغب في إعادة الاشتراك، يمكنك{' '}
            <Link href="/signup" className="text-primary hover:text-primary-hover font-bold hover:underline transition-all">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Ambient Mesh Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-md w-full bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-large p-8 text-center relative z-10 border-none">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-glow">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-accent-600 dark:text-gray-400 font-bold animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
