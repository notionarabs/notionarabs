'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Get payment details from localStorage or URL params
    const paymentData = localStorage.getItem('lastPayment');
    if (paymentData) {
      setPaymentDetails(JSON.parse(paymentData));
      localStorage.removeItem('lastPayment');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            تم الدفع بنجاح!
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            شكراً لك على استخدام منصة عرب نوشن
          </p>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
              تفاصيل الدفع
            </h2>
            <div className="space-y-3 text-right">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">المبلغ:</span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  {paymentDetails.amount} {paymentDetails.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">نوع الدفع:</span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  {paymentDetails.type === 'template_purchase' ? 'شراء قالب' : 'اشتراك'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">بوابة الدفع:</span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  {paymentDetails.gateway}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">تاريخ الدفع:</span>
                <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ما التالي؟
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200 text-right">
            <p>• تم إرسال رسالة تأكيد إلى بريدك الإلكتروني</p>
            <p>• يمكنك الآن الوصول إلى القوالب المشتراة</p>
            <p>• ستجد جميع القوالب في قسم "قوالي" في ملفك الشخصي</p>
            <p>• يمكنك تحميل القوالب في أي وقت</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/profile/templates"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              قوالي
            </Link>

            <Link
              href="/templates"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              تصفح المزيد
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              الملف الشخصي
            </Link>

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-300 dark:border-dark-card-border text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              طلباتي
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-card-border">
          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-2">
            هل تحتاج مساعدة؟
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/help"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              مركز المساعدة
            </Link>
            <Link
              href="/contact"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
