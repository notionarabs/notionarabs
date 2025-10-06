'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function PurchasesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // not used in simplified UI

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        let fetched = [];
        try {
          const res = await api.get('/orders/me');
          if (res?.data?.success) {
            fetched = res.data.orders || [];
          }
        } catch (_) {
          // ignore network/API errors for now
        }

        // Merge with any optimistic local orders
        try {
          const localOrdersRaw = typeof window !== 'undefined' ? localStorage.getItem('orders') : null;
          const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
          // Keep unique by id + templateId of first item
          const key = (o) => `${o.id || ''}-${o.items?.[0]?.templateId || ''}`;
          const map = new Map();
          [...localOrders, ...fetched].forEach((o) => map.set(key(o), o));
          setOrders(Array.from(map.values()));
        } catch (_) {
          setOrders(fetched);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchOrders();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [loading, isAuthenticated]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  // Flatten orders to a list of purchased/downloaded template items only
  const items = orders
    .flatMap((o) => (o.items || []).map((i) => ({ ...i, orderId: o.id, date: o.date, status: o.status })))
    .filter((i) => i.downloaded || i.status === 'completed');

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <div className="container-custom py-12 sm:py-16 md:py-20">
          <div className="text-center">
            <LoadingIndicator />
            <p className="text-base sm:text-lg text-gray-600 dark:text-dark-text-secondary mt-4">جاري تحميل مشترياتك...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <div className="container-custom py-12 sm:py-16 md:py-20 text-center px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            يجب تسجيل الدخول لعرض المشتريات
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary">
            يرجى تسجيل الدخول لعرض تاريخ مشترياتك
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <main className="container-custom py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">القوالب الخاصة بي</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-dark-text-secondary">جميع القوالب التي قمت بتحميلها أو شرائها</p>
        </div>

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4 sm:px-0">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              لا توجد مشتريات
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-dark-text-terتيary mb-4">
              لم تقم بشراء أي قوالب بعد
            </p>
            <a href="/templates" className="btn-primary inline-block text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">تصفح القوالب</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            {items.map((item) => (
              <div key={`${item.orderId}-${item.templateId || item.id}`} className="card p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center">
                    {item.previewImage ? (
                      <Image src={item.previewImage} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-dark-text-primary">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">{new Date(item.date || Date.now()).toLocaleDateString('en-US')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{getStatusText(item.status)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  {item.downloaded ? (
                    <span className="text-green-600 dark:text-green-400 text-xs sm:text-sm">تم التحميل</span>
                  ) : (
                    <span className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm">لم يتم التحميل</span>
                  )}
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => window.open(item.notionLink || `/templates/${item.templateId || item.id}`, '_blank')}
                      className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
                    >
                      عرض القالب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


