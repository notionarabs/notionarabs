'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('جاري معالجة الدفع...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const gateway = searchParams.get('gateway');
        const paymentId = searchParams.get('payment_id');
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');

        if (!gateway || !paymentId) {
          setStatus('error');
          setMessage('بيانات الدفع غير مكتملة');
          return;
        }

        // Prepare gateway data based on the gateway
        let gatewayData = {};

        switch (gateway) {
          case 'tap_payments':
            gatewayData = {
              transactionId: transactionId || searchParams.get('tap_id'),
              status: status
            };
            break;
          case 'paymob':
            gatewayData = {
              transactionId: transactionId || searchParams.get('order_id'),
              paymentKey: searchParams.get('payment_key')
            };
            break;
          case 'hyperpay':
            gatewayData = {
              transactionId: transactionId || searchParams.get('id'),
              result: searchParams.get('result')
            };
            break;
          case 'paypal':
            gatewayData = {
              transactionId: transactionId || searchParams.get('token'),
              payerId: searchParams.get('PayerID')
            };
            break;
          default:
            gatewayData = {
              transactionId: transactionId,
              status: status
            };
        }

        // Confirm payment with backend
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            paymentId: paymentId,
            gatewayData: gatewayData
          })
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('تم تأكيد الدفع بنجاح!');

          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push('/payment/success');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'فشل في تأكيد الدفع');
        }

      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage('حدث خطأ في معالجة الدفع');
      }
    };

    processPayment();
  }, [searchParams, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return <LoadingIndicator size="lg" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-8 text-center">
        {getStatusIcon()}

        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'success' && 'تم بنجاح!'}
          {status === 'error' && 'حدث خطأ!'}
          {status === 'processing' && 'جاري المعالجة...'}
        </h1>

        <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                سيتم توجيهك إلى صفحة النجاح خلال لحظات...
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/profile')}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                الذهاب إلى الملف الشخصي
              </button>
              <button
                onClick={() => router.push('/templates')}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
              >
                تصفح القوالب
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/templates')}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                المحاولة مرة أخرى
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
              >
                التواصل مع الدعم
              </button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                يرجى عدم إغلاق هذه الصفحة حتى اكتمال المعالجة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
