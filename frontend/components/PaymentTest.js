'use client';

import { useState } from 'react';
import { paymentAPI } from '../lib/api';

const PaymentTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [testData, setTestData] = useState({
    country: 'EG',
    city: 'Cairo',
    postalCode: '12345',
    address: '123 Test St'
  });

  const testScenarios = [
    {
      name: 'Egypt - Template Purchase',
      data: {
        templateId: '60f7b3b3b3b3b3b3b3b3b3b3',
        country: 'EG',
        billingAddress: {
          city: 'Cairo',
          postalCode: '12345',
          address: '123 Main St'
        }
      },
      expectedGateway: 'paypal'
    },
    {
      name: 'Saudi Arabia - Subscription',
      data: {
        subscription: 'creator',
        country: 'SA',
        billingAddress: {
          city: 'Riyadh',
          postalCode: '12345',
          address: '123 Main St'
        }
      },
      expectedGateway: 'tap_payments'
    },
    {
      name: 'Jordan - Template Purchase',
      data: {
        templateId: '60f7b3b3b3b3b3b3b3b3b3b3',
        country: 'JO',
        billingAddress: {
          city: 'Amman',
          postalCode: '12345',
          address: '123 Main St'
        }
      },
      expectedGateway: 'paypal'
    },
    {
      name: 'Morocco - Template Purchase',
      data: {
        templateId: '60f7b3b3b3b3b3b3b3b3b3b3',
        country: 'MA',
        billingAddress: {
          city: 'Casablanca',
          postalCode: '12345',
          address: '123 Main St'
        }
      },
      expectedGateway: 'paypal'
    }
  ];

  const runTest = async (scenario) => {
    setIsLoading(true);
    try {
      const response = await paymentAPI.createPaymentIntent(scenario.data);

      const result = {
        scenario: scenario.name,
        success: response.data.success,
        gateway: response.data.data?.gateway,
        expectedGateway: scenario.expectedGateway,
        correct: response.data.data?.gateway === scenario.expectedGateway,
        error: response.data.message || 'No error'
      };

      setResults(prev => [...prev, result]);
    } catch (error) {
      const result = {
        scenario: scenario.name,
        success: false,
        gateway: 'N/A',
        expectedGateway: scenario.expectedGateway,
        correct: false,
        error: error.response?.data?.message || error.message
      };

      setResults(prev => [...prev, result]);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    for (const scenario of testScenarios) {
      await runTest(scenario);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const testSupportedCountries = async () => {
    try {
      const response = await paymentAPI.getSupportedCountries();
      console.log('Supported Countries:', response.data);
      alert(`Found ${Object.keys(response.data).length} supported countries`);
    } catch (error) {
      console.error('Error loading countries:', error);
      alert('Error loading supported countries');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-dark-secondary rounded-xl shadow-lg" dir="rtl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
        🧪 Payment System Test Panel
      </h2>

      {/* Quick Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testSupportedCountries}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Supported Countries
        </button>

        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'جاري التشغيل...' : 'تشغيل جميع الاختبارات'}
        </button>
      </div>

      {/* Individual Test Scenarios */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
          اختبارات فردية
        </h3>

        {testScenarios.map((scenario, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-tertiary rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
                {scenario.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                متوقع: {scenario.expectedGateway}
              </p>
            </div>

            <button
              onClick={() => runTest(scenario)}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              اختبار
            </button>
          </div>
        ))}
      </div>

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
            نتائج الاختبارات
          </h3>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${result.success && result.correct
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : result.success && !result.correct
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
                      {result.scenario}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      البوابة: {result.gateway} | المتوقع: {result.expectedGateway}
                    </p>
                    {!result.success && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        خطأ: {result.error}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {result.success && result.correct && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ✅ نجح
                      </span>
                    )}
                    {result.success && !result.correct && (
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        ⚠️ بوابة خاطئة
                      </span>
                    )}
                    {!result.success && (
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        ❌ فشل
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-dark-tertiary rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
              ملخص النتائج
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.filter(r => r.success && r.correct).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">نجح</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.filter(r => r.success && !r.correct).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">بوابة خاطئة</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.filter(r => !r.success).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">فشل</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          تعليمات الاختبار
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• تأكد من تشغيل الخادم الخلفي على المنفذ 5000</li>
          <li>• تأكد من تسجيل الدخول في التطبيق</li>
          <li>• تأكد من إضافة متغيرات البيئة للبوابات</li>
          <li>• استخدم قيم تجريبية للاختبار</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTest;
