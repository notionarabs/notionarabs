'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled


  useEffect(() => {
    if (!loading) {
      // Fetch user orders from API
      setOrders([]);
      setIsLoading(false);
    }
  }, [loading]);

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading || isLoading) {
    return <LoadingIndicator />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
            يجب تسجيل الدخول لعرض الطلبات
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            يرجى تسجيل الدخول لعرض تاريخ طلباتك
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      <main className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
            طلباتي
          </h1>
          <p className="text-gray-600 dark:text-dark-text-secondary">
            عرض وإدارة جميع طلباتك
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'جميع الطلبات' },
              { key: 'pending', label: 'قيد الانتظار' },
              { key: 'completed', label: 'مكتملة' },
              { key: 'cancelled', label: 'ملغية' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-dark-secondary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border'
                  }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-tertiary rounded-full">
                  {orders.filter(order => tab.key === 'all' ? true : order.status === tab.key).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              لا توجد طلبات
            </h3>
            <p className="text-gray-500 dark:text-dark-text-tertiary">
              لم تقم بشراء أي قوالب بعد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-card-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                        طلب #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                        تاريخ الطلب: {new Date(order.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <p className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mt-1">
                        ${order.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-dark-tertiary rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-dark-text-primary">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                            الكمية: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                            ${item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-tertiary border-t border-gray-200 dark:border-dark-card-border">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200">
                        عرض التفاصيل
                      </button>
                      {order.status === 'completed' && (
                        <button className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200">
                          تحميل
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-secondary rounded-lg transition-colors duration-200">
                          إلغاء الطلب
                        </button>
                      )}
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-secondary rounded-lg transition-colors duration-200">
                      إعادة الطلب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                {orders.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                إجمالي الطلبات
              </p>
            </div>
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {orders.filter(order => order.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                طلبات مكتملة
              </p>
            </div>
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6 text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {orders.filter(order => order.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                طلبات معلقة
              </p>
            </div>
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border p-6 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                إجمالي المشتريات
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
