'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  PackageOpen
} from 'lucide-react';

export default function PurchasesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);

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

  // Process items whenever orders change
  useEffect(() => {
    const itemsMap = new Map();
    orders
      .flatMap((o) => (o.items || []).map((i) => ({
        ...i,
        orderId: o.id,
        date: o.date,
        status: o.status,
        // Ensure we have a valid templateId, checking all possible locations including populated template object
        templateId: (i.templateId || (typeof i.template === 'object' ? i.template?._id : i.template) || i.id)?.toString(),
        // Ensure we have a valid name
        name: i.name || (typeof i.template === 'object' ? i.template?.title : null) || 'قالب بدون عنوان',
        // Ensure we have a valid image
        previewImage: i.previewImage || (typeof i.template === 'object' ? (i.template?.previewImage || i.template?.previewImages?.[0]) : null) || '',
        // Ensure we have a notion link
        notionLink: i.notionLink || (typeof i.template === 'object' ? i.template?.notionLink : null) || ''
      })))
      // Filter for valid items: downloaded OR completed order OR (legacy) paid status
      .filter((i) => i.downloaded || i.status === 'completed' || i.status === 'paid')
      .forEach((item) => {
        const templateId = item.templateId;
        // Skip if we couldn't find a template ID
        if (!templateId) return;

        // Keep the most recent item if duplicates exist
        if (!itemsMap.has(templateId) || new Date(item.date || 0) > new Date(itemsMap.get(templateId).date || 0)) {
          itemsMap.set(templateId, item);
        }
      });
    setItems(Array.from(itemsMap.values()));
  }, [orders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
            <CheckCircle2 size={12} className="stroke-[3]" />
            <span>مكتمل</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Clock size={12} className="stroke-[3]" />
            <span>قيد الانتظار</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800">
            <XCircle size={12} className="stroke-[3]" />
            <span>ملغي</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold border border-gray-200 dark:border-gray-700">
            <span>{status}</span>
          </div>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md w-full bg-white dark:bg-dark-secondary p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-dark-card-border">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              تسجيل الدخول مطلوب
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              يرجى تسجيل الدخول لعرض تاريخ مشترياتك والقوالب الخاصة بك
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-500/25"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 font-sans" dir="rtl">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl border-b border-gray-200 dark:border-dark-card-border sticky top-0 z-30">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-l from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent inline-flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary-500" />
                مشترياتي
              </h1>
              <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">
                إدارة وتحميل القوالب التي قمت بشرائها
              </p>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-tertiary p-1.5 rounded-xl border border-gray-200 dark:border-dark-card-border">
                <div className="bg-white dark:bg-dark-secondary px-3 py-1.5 rounded-lg shadow-sm text-sm font-bold text-gray-900 dark:text-white">
                  {items.length} قوالب
                </div>
                <div className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                  تم شراؤها
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container-custom py-8 sm:py-12">
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fade-in"
          >
            <div className="w-32 h-32 bg-gray-100 dark:bg-dark-tertiary rounded-full flex items-center justify-center mb-6 relative">
              <PackageOpen size={64} className="text-gray-400 dark:text-gray-500 stroke-1" />
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-dark-secondary p-2 rounded-full shadow-lg">
                <ShoppingBag size={24} className="text-primary-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              لا توجد مشتريات حتى الآن
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-lg">
              لم تقم بشراء أي قوالب بعد. استكشف متجرنا للعثور على قوالب نوشن احترافية تساعدك في تنظيم حياتك وعملك.
            </p>
            <Link
              href="/store"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-primary-500/30 hover:-translate-y-1 flex items-center gap-2 group"
            >
              <Search size={20} className="group-hover:scale-110 transition-transform" />
              تصفح المتجر
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 animate-fade-in"
          >
            {items.map((item) => (
              <div
                key={`${item.orderId}-${item.templateId || item.id}`}
                className="group relative bg-white dark:bg-dark-secondary rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-card-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-dark-tertiary overflow-hidden">
                  {item.previewImage ? (
                    <Image
                      src={item.previewImage}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <ShoppingBag size={48} className="opacity-50" />
                    </div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                    <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {new Date(item.date || Date.now()).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.name}
                    </h3>
                    <div className="shrink-0">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <button
                      onClick={() => window.open(item.notionLink || `/templates/${item.templateId?.toString() || item.id?.toString()}`, '_blank')}
                      className="w-full py-3 px-4 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-card-border text-gray-700 dark:text-gray-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors group/btn"
                    >
                      <span>عرض القالب</span>
                      <ExternalLink size={16} className="group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                    </button>

                    {item.downloaded ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/10 py-2 rounded-lg">
                        <CheckCircle2 size={14} />
                        تم التحميل مسبقاً
                      </div>
                    ) : (
                      <button
                        onClick={() => window.open(item.notionLink || `/templates/${item.templateId?.toString() || item.id?.toString()}`, '_blank')}
                        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                      >
                        <Download size={18} />
                        <span>تحميل الآن</span>
                      </button>
                    )}
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
