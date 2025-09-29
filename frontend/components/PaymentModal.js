'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from './LoadingIndicator';

const PaymentModal = ({ isOpen, onClose, template, subscription, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    country: 'EG', // Default to Egypt
    billingAddress: {
      city: '',
      postalCode: '',
      address: ''
    }
  });
  const [supportedCountries, setSupportedCountries] = useState({});
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState('');

  // Load supported countries
  useEffect(() => {
    const loadSupportedCountries = async () => {
      try {
        const response = await fetch('/api/payments/supported-countries');

        // Check if response is HTML (backend not running)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Backend not running, using fallback countries');
          setSupportedCountries({
            'EG': { name: 'مصر', currency: 'EGP', gateway: 'paypal' },
            'SA': { name: 'السعودية', currency: 'SAR', gateway: 'tap_payments' },
            'AE': { name: 'الإمارات', currency: 'AED', gateway: 'tap_payments' },
            'KW': { name: 'الكويت', currency: 'KWD', gateway: 'tap_payments' },
            'BH': { name: 'البحرين', currency: 'BHD', gateway: 'tap_payments' },
            'QA': { name: 'قطر', currency: 'QAR', gateway: 'tap_payments' },
            'OM': { name: 'عمان', currency: 'OMR', gateway: 'tap_payments' },
            'JO': { name: 'الأردن', currency: 'JOD', gateway: 'paypal' },
            'LB': { name: 'لبنان', currency: 'LBP', gateway: 'paypal' },
            'MA': { name: 'المغرب', currency: 'MAD', gateway: 'paypal' },
            'TN': { name: 'تونس', currency: 'TND', gateway: 'paypal' },
            'DZ': { name: 'الجزائر', currency: 'DZD', gateway: 'paypal' },
            'LY': { name: 'ليبيا', currency: 'LYD', gateway: 'paypal' },
            'SY': { name: 'سوريا', currency: 'SYP', gateway: 'paypal' },
            'IQ': { name: 'العراق', currency: 'IQD', gateway: 'paypal' },
            'PS': { name: 'فلسطين', currency: 'USD', gateway: 'paypal' }
          });
          return;
        }

        const data = await response.json();
        if (data.success) {
          setSupportedCountries(data.data);
        } else {
          throw new Error(data.message || 'Failed to load countries');
        }
      } catch (error) {
        console.error('Error loading countries:', error);
        // Set fallback countries
        setSupportedCountries({
          'EG': { name: 'مصر', currency: 'EGP', gateway: 'paypal' },
          'SA': { name: 'السعودية', currency: 'SAR', gateway: 'tap_payments' },
          'AE': { name: 'الإمارات', currency: 'AED', gateway: 'tap_payments' },
          'KW': { name: 'الكويت', currency: 'KWD', gateway: 'tap_payments' },
          'BH': { name: 'البحرين', currency: 'BHD', gateway: 'tap_payments' },
          'QA': { name: 'قطر', currency: 'QAR', gateway: 'tap_payments' },
          'OM': { name: 'عمان', currency: 'OMR', gateway: 'tap_payments' },
          'JO': { name: 'الأردن', currency: 'JOD', gateway: 'paypal' },
          'LB': { name: 'لبنان', currency: 'LBP', gateway: 'paypal' },
          'MA': { name: 'المغرب', currency: 'MAD', gateway: 'paypal' },
          'TN': { name: 'تونس', currency: 'TND', gateway: 'paypal' },
          'DZ': { name: 'الجزائر', currency: 'DZD', gateway: 'paypal' },
          'LY': { name: 'ليبيا', currency: 'LYD', gateway: 'paypal' },
          'SY': { name: 'سوريا', currency: 'SYP', gateway: 'paypal' },
          'IQ': { name: 'العراق', currency: 'IQD', gateway: 'paypal' },
          'PS': { name: 'فلسطين', currency: 'USD', gateway: 'paypal' }
        });
      }
    };

    if (isOpen) {
      loadSupportedCountries();
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('billingAddress.')) {
      const field = name.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create payment intent
  const handleCreatePayment = async () => {
    if (!paymentData.country) {
      setError('يرجى اختيار البلد');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const requestData = {
        country: paymentData.country,
        billingAddress: paymentData.billingAddress
      };

      if (template) {
        requestData.templateId = template._id;
      } else if (subscription) {
        requestData.subscription = subscription;
      }

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      // Check if response is HTML (backend not running)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend server is not running. Please start the backend server.');
      }

      const data = await response.json();

      if (data.success) {
        setPaymentIntent(data.data);

        // Redirect to payment gateway
        if (data.data.gatewayResponse.redirectUrl) {
          window.location.href = data.data.gatewayResponse.redirectUrl;
        } else if (data.data.gatewayResponse.paymentUrl) {
          window.location.href = data.data.gatewayResponse.paymentUrl;
        }
      } else {
        setError(data.message || 'حدث خطأ في إنشاء طلب الدفع');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      if (error.message.includes('Backend server is not running')) {
        setError('الخادم غير متاح. يرجى تشغيل الخادم الخلفي أولاً.');
      } else {
        setError('حدث خطأ في إنشاء طلب الدفع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get payment amount
  const getPaymentAmount = () => {
    if (template) {
      return template.price;
    } else if (subscription) {
      const prices = {
        creator: 29,
        professional: 49
      };
      return prices[subscription];
    }
    return 0;
  };

  // Get currency for selected country
  const getCurrency = () => {
    const country = supportedCountries[paymentData.country];
    return country ? country.currency : 'EGP';
  };

  // Get gateway name
  const getGatewayName = () => {
    const country = supportedCountries[paymentData.country];
    const gatewayNames = {
      'tap_payments': 'Tap Payments',
      'paymob': 'Paymob',
      'hyperpay': 'HyperPay',
      'paypal': 'PayPal'
    };
    return country ? gatewayNames[country.gateway] : 'PayPal';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-card-border">
          <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
            {template ? 'شراء القالب' : 'الاشتراك في الخطة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text-secondary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-dark-tertiary rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              ملخص الدفع
            </h3>
            {template && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">القالب:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {template.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">السعر:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {template.price} {getCurrency()}
                  </span>
                </div>
              </div>
            )}
            {subscription && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">الخطة:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {subscription === 'creator' ? 'مبدع' : 'احترافي'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">السعر:</span>
                  <span className="font-medium text-gray-900 dark:text-dark-text-primary">
                    {getPaymentAmount()} {getCurrency()}
                  </span>
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-dark-card-border mt-3 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-dark-text-primary">المجموع:</span>
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                  {getPaymentAmount()} {getCurrency()}
                </span>
              </div>
            </div>
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              البلد
            </label>
            <select
              name="country"
              value={paymentData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-tertiary dark:text-dark-text-primary"
            >
              <option value="">اختر البلد</option>
              {Object.entries(supportedCountries).map(([code, country]) => (
                <option key={code} value={code}>
                  {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
              عنوان الفواتير
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                المدينة
              </label>
              <input
                type="text"
                name="billingAddress.city"
                value={paymentData.billingAddress.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-tertiary dark:text-dark-text-primary"
                placeholder="أدخل اسم المدينة"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                الرمز البريدي
              </label>
              <input
                type="text"
                name="billingAddress.postalCode"
                value={paymentData.billingAddress.postalCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-tertiary dark:text-dark-text-primary"
                placeholder="أدخل الرمز البريدي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                العنوان
              </label>
              <textarea
                name="billingAddress.address"
                value={paymentData.billingAddress.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-card-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-tertiary dark:text-dark-text-primary"
                placeholder="أدخل العنوان التفصيلي"
              />
            </div>
          </div>

          {/* Payment Gateway Info */}
          {paymentData.country && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  سيتم توجيهك إلى {getGatewayName()} لإتمام الدفع
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-tertiary rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card-border transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleCreatePayment}
              disabled={isLoading || !paymentData.country}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingIndicator size="sm" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  ادفع الآن
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
