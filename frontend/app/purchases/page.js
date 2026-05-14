'use client';

import { useState, useEffect, useMemo } from 'react';
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
  PackageOpen,
  Star
} from 'lucide-react';

export default function PurchasesPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingItemId, setDownloadingItemId] = useState(null);

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
        } catch (_) {}

        try {
          const localOrdersRaw = typeof window !== 'undefined' ? localStorage.getItem('orders') : null;
          const localOrders = localOrdersRaw ? JSON.parse(localOrdersRaw) : [];
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

  useEffect(() => {
    const itemsMap = new Map();
    orders
      .flatMap((o) => (o.items || []).map((i) => ({
        ...i,
        orderId: o.id,
        date: o.createdAt || o.date,
        status: o.status,
        downloaded: true,
        templateId: (typeof i.templateId === 'object' && i.templateId !== null
          ? (i.templateId._id || i.templateId.id)
          : i.templateId
        )?.toString(),
        name: i.name || (typeof i.templateId === 'object' ? i.templateId?.title : null) || 'قالب بدون عنوان',
        previewImage: i.previewImage || (typeof i.templateId === 'object' ? i.templateId?.previewImage : null) || '',
        notionLink: i.notionLink || (typeof i.templateId === 'object' ? i.templateId?.notionLink : null) || ''
      })))
      .filter((i) => {
        const s = (i.status || '').toLowerCase();
        return i.downloaded || s === 'completed' || s === 'paid' || s === 'success';
      })
      .forEach((item) => {
        const tid = item.templateId;
        if (!tid) return;
        if (!itemsMap.has(tid) || new Date(item.date || 0) > new Date(itemsMap.get(tid).date || 0)) {
          itemsMap.set(tid, item);
        }
      });
    setItems(Array.from(itemsMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [orders]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'completed':
      case 'success':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
            <CheckCircle2 size={12} className="stroke-[3]" />
            <span>مكتمل</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black border border-gray-200 dark:border-gray-700">
            <span>{status}</span>
          </div>
        );
    }
  };
  
  const handleDownload = async (item) => {
    const tid = item.templateId || item.id;
    if (!tid) return;
    setDownloadingItemId(tid);
    try {
      await api.post(`/templates/${tid}/download`);
      window.open(item.notionLink, '_blank');
    } catch (err) {
      window.open(item.notionLink, '_blank');
    } finally {
      setDownloadingItemId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
          </div>
          <span className="text-sm font-bold text-gray-400 animate-pulse">جاري جلب مقتنياتك...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md w-full bg-white dark:bg-dark-secondary p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-dark-card-border"
        >
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/10 rounded-3xl flex items-center justify-center mx-auto text-primary-600 dark:text-primary-400 rotate-6 shadow-inner">
            <ShoppingBag size={48} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">تحتاج لتسجيل الدخول</h1>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              انضم إلينا الآن لتتمكن من الوصول لجميع القوالب التي قمت بشرائها أو تحميلها مجاناً.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-5 px-8 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-500/25 hover:-translate-y-1 active:scale-95"
          >
            تسجيل الدخول للمتابعة
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 font-sans" dir="rtl">
      {/* Dynamic Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-2xl border-b border-gray-100 dark:border-dark-card-border sticky top-0 z-30 py-6 sm:py-8">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShoppingBag size={24} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">مكتبتي</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold text-sm sm:text-base">إدارة وتحميل القوالب التي قمت باقتنائها</p>
            </div>

            <div className="relative group w-full lg:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="ابحث في مقتنياتك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pr-12 pl-6 bg-gray-50 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container-custom py-10 sm:py-16">
        {filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-40 h-40 bg-gray-100 dark:bg-dark-tertiary rounded-[3rem] flex items-center justify-center mb-10 relative rotate-3 shadow-inner">
              <PackageOpen size={80} className="text-gray-300 dark:text-gray-600 stroke-1" />
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -left-4 bg-white dark:bg-dark-secondary p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-card-border"
              >
                <Star size={32} className="text-amber-500 fill-current" />
              </motion.div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4">
              {searchQuery ? 'لا توجد نتائج بحث' : 'مكتبتك فارغة حالياً'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
              {searchQuery 
                ? `لم نجد أي قوالب تطابق "${searchQuery}". جرب كلمة بحث أخرى.` 
                : 'استكشف متجرنا للعثور على قوالب نوشن احترافية تساعدك في تنظيم حياتك وعملك والبدء في بناء نظامك الخاص.'}
            </p>
            <Link
              href="/templates"
              className="px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-primary-500/40 hover:-translate-y-1 flex items-center gap-3 group"
            >
              <Search size={24} className="group-hover:rotate-12 transition-transform" />
              <span>استكشف القوالب المميزة</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
            {filteredItems.map((item) => (
              <motion.div
                key={`${item.orderId}-${item.templateId || item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white dark:bg-dark-secondary rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-dark-card-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
              >
                {/* Media Wrapper */}
                <div className="relative aspect-[16/10] w-full bg-gray-100 dark:bg-dark-tertiary overflow-hidden p-3">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm">
                    {item.previewImage ? (
                      <Image
                        src={item.previewImage}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <ShoppingBag size={64} className="opacity-20" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                  </div>
                </div>

                {/* Info Wrapper */}
                <div className="p-8 pt-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <div className="shrink-0 scale-90 group-hover:scale-100 transition-transform">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <div className="mt-auto space-y-4">
                    <Link
                      href={`/templates/${item.templateId}`}
                      className="w-full py-4 px-6 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-card-border text-gray-700 dark:text-gray-200 font-black rounded-2xl flex items-center justify-center gap-3 transition-all border border-gray-100 dark:border-dark-card-border group/details"
                    >
                      <span className="text-sm uppercase tracking-wider font-black">تفاصيل القالب</span>
                      <ExternalLink size={18} className="group-hover/details:translate-x-1 rtl:group-hover/details:-translate-x-1 transition-transform" />
                    </Link>

                    {item.downloaded ? (
                      <button
                        onClick={() => window.open(item.notionLink, '_blank')}
                        className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 relative overflow-hidden group/notion"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/notion:translate-x-full transition-transform duration-1000"></div>
                        <CheckCircle2 size={20} className="text-white/80" />
                        <span className="text-lg">فتح في نوشن</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(item)}
                        disabled={downloadingItemId === item.templateId}
                        className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-70 disabled:cursor-not-allowed group/dl"
                      >
                        {downloadingItemId === item.templateId ? (
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Download size={20} className="group-hover/dl:translate-y-1 transition-transform" />
                            <span className="text-lg">تحميل الآن</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
