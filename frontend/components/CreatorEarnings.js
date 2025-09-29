'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

const CreatorEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load earnings data
  useEffect(() => {
    const loadEarnings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/payments/earnings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setEarnings(data.data);
        } else {
          setError(data.message || 'حدث خطأ في جلب الأرباح');
        }
      } catch (error) {
        console.error('Error loading earnings:', error);
        setError('حدث خطأ في جلب الأرباح');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.creatorStatus === 'approved') {
      loadEarnings();
    }
  }, [user]);

  // Handle payout request
  const handlePayoutRequest = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      setError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (parseFloat(payoutAmount) > earnings.pendingPayouts) {
      setError('المبلغ المطلوب يتجاوز المبلغ المعلق');
      return;
    }

    setIsProcessingPayout(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(payoutAmount) })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('تم إرسال طلب الدفع بنجاح');
        setPayoutAmount('');
        // Reload earnings
        window.location.reload();
      } else {
        setError(data.message || 'حدث خطأ في معالجة طلب الدفع');
      }
    } catch (error) {
      console.error('Payout request error:', error);
      setError('حدث خطأ في معالجة طلب الدفع');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  if (!user || user.creatorStatus !== 'approved') {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
          غير مصرح لك
        </h3>
        <p className="text-gray-500 dark:text-dark-text-tertiary">
          يجب أن تكون مبدعاً معتمداً لعرض الأرباح
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          أرباحي
        </h2>
        <div className="text-sm text-gray-500 dark:text-dark-text-tertiary">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                إجمالي الأرباح
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {earnings?.totalEarnings?.toFixed(2) || '0.00'} EGP
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                المبلغ المعلق
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {earnings?.pendingPayouts?.toFixed(2) || '0.00'} EGP
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                إجمالي المدفوعات
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {earnings?.totalPayouts?.toFixed(2) || '0.00'} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Request */}
      {earnings?.canPayout && (
        <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-4">
            طلب دفع
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                المبلغ المطلوب (EGP)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="1"
                max={earnings.pendingPayouts}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-tertiary dark:text-dark-text-primary"
                placeholder={`الحد الأقصى: ${earnings.pendingPayouts.toFixed(2)} EGP`}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePayoutRequest}
                disabled={isProcessingPayout || !payoutAmount}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessingPayout ? (
                  <>
                    <LoadingIndicator size="sm" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    طلب الدفع
                  </>
                )}
              </button>

              <button
                onClick={() => setPayoutAmount(earnings.pendingPayouts.toString())}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                المبلغ كاملاً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Payout Info */}
      {earnings?.nextPayoutDate && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-blue-800 dark:text-blue-200">
              موعد الدفع التالي: {new Date(earnings.nextPayoutDate).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-800 dark:text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Revenue Sharing Info */}
      <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
          معلومات تقاسم الإيرادات
        </h4>
        <div className="text-sm text-gray-600 dark:text-dark-text-secondary space-y-1">
          <p>• تحصل على 90% من سعر كل قالب تبيعه</p>
          <p>• تحصل المنصة على 10% كرسوم خدمة</p>
          <p>• يمكنك طلب الدفع عندما يصل المبلغ المعلق إلى 50 EGP أو أكثر</p>
          <p>• يتم معالجة طلبات الدفع خلال 3-5 أيام عمل</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorEarnings;
