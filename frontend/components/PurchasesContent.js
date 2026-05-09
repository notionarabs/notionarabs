'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Download,
  ExternalLink,
  CheckCircle2,
  Search,
  PackageOpen,
  Star
} from 'lucide-react';

export default function PurchasesContent() {
  const { user, isAuthenticated, loading } = useAuth();
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-14 bg-gray-100 dark:bg-dark-tertiary rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="h-72 bg-gray-100 dark:bg-dark-tertiary rounded-3xl"></div>
          <div className="h-72 bg-gray-100 dark:bg-dark-tertiary rounded-3xl"></div>
          <div className="h-72 bg-gray-100 dark:bg-dark-tertiary rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const isCreator = user?.creatorStatus?.toLowerCase() === 'approved';

  return (
    <div dir="rtl">
      {/* Search Header */}
      <div className="mb-8 border-none pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
            {isCreator ? 'القوالب المقتناة' : 'مشترياتي'}
          </h1>
          <p className="text-base text-gray-600 dark:text-dark-text-secondary font-medium">
            {isCreator 
              ? 'إدارة وتحميل القوالب التي قمت باقتنائها من المبدعين الآخرين' 
              : 'تحميل وإدارة قوالب نوشن التي قمت باقتنائها'}
          </p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="ابحث في مقتنياتك..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pr-12 pl-4 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-sm text-gray-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-32 h-32 bg-gray-50 dark:bg-dark-tertiary/20 rounded-[2.5rem] flex items-center justify-center mb-8 relative rotate-3 shadow-inner">
            <PackageOpen size={64} className="text-gray-300 dark:text-gray-600 stroke-1" />
            <div className="absolute -top-3 -left-3 bg-white dark:bg-dark-secondary p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-white/5">
              <Star size={20} className="text-amber-500 fill-current" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
            {searchQuery ? 'لا توجد نتائج بحث' : 'مكتبتك فارغة حالياً'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 text-sm font-bold leading-relaxed">
            {searchQuery 
              ? `لم نجد أي قوالب تطابق "${searchQuery}". جرب كلمة بحث أخرى.` 
              : 'استكشف متجرنا للعثور على قوالب نوشن احترافية تبسط حياتك وعملك.'}
          </p>
          <Link
            href="/templates"
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-primary-500/25 hover:scale-105 flex items-center gap-2 group decoration-none"
          >
            <Search size={16} className="group-hover:rotate-12 transition-transform" />
            <span>استكشف القوالب المميزة</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={`${item.orderId}-${item.templateId || item.id}`}
              className="group relative bg-white dark:bg-dark-secondary rounded-[2rem] overflow-hidden border border-gray-100/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full"
            >
              {/* Media Wrapper */}
              <div className="relative aspect-[16/10] w-full bg-gray-50/50 dark:bg-dark-tertiary/20 overflow-hidden p-2.5">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm bg-gray-100 dark:bg-dark-tertiary">
                  {item.previewImage ? (
                    <Image
                      src={item.previewImage}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-600">
                      <ShoppingBag size={48} className="opacity-20" />
                    </div>
                  )}
                </div>
                
                <div className="absolute top-5 left-5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Info Wrapper */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5 gap-3">
                  <h3 className="font-black text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
                    {item.name}
                  </h3>
                  <div className="shrink-0 scale-90 group-hover:scale-95 transition-transform">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <Link
                    href={`/templates/${item.templateId}`}
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-tertiary/80 text-gray-700 dark:text-gray-200 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-100 dark:border-white/5 decoration-none group/details"
                  >
                    <span>تفاصيل القالب</span>
                    <ExternalLink size={14} className="group-hover/details:translate-x-1 rtl:group-hover/details:-translate-x-1 transition-transform" />
                  </Link>

                  {item.downloaded ? (
                    <button
                      onClick={() => window.open(item.notionLink, '_blank')}
                      className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 relative overflow-hidden group/notion border-none cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/notion:translate-x-full transition-transform duration-1000"></div>
                      <CheckCircle2 size={16} className="text-white/80" />
                      <span>فتح في نوشن</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={downloadingItemId === item.templateId}
                      className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed group/dl border-none cursor-pointer"
                    >
                      {downloadingItemId === item.templateId ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Download size={16} className="group-hover/dl:translate-y-0.5 transition-transform" />
                          <span>تحميل الآن</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
