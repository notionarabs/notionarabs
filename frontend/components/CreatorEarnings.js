'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '../lib/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DollarSign, Wallet, ShieldCheck, CheckCircle2, AlertCircle, 
    Landmark, Phone, ArrowUpRight, Clock, Info, Check, X, Loader2, Award,
    Download, Star
} from 'lucide-react';

const parseUTCDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr + 'Z');
    }
    return new Date(dateStr);
};

const CreatorEarnings = () => {
    const { user, ensureTokenInHeaders } = useAuth();
    const { showSuccess, showError } = useToast();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [payouts, setPayouts] = useState([]);
    const [sales, setSales] = useState([]);
    const router = useRouter();

    // Load creator stats & requests history
    useEffect(() => {
        const loadStats = async () => {
            try {
                setIsLoading(true);
                ensureTokenInHeaders();
                const response = await api.get('/creators/me/stats');

                if (response.data.success) {
                    setStats(response.data.stats);
                } else {
                    setError(response.data.message || 'حدث خطأ في جلب الإحصائيات');
                }
            } catch (error) {
                console.error('Error loading stats:', error);
                setError('حدث خطأ في جلب الإحصائيات');
            } finally {
                setIsLoading(false);
            }
        };

        const loadPayouts = async () => {
            try {
                ensureTokenInHeaders();
                const response = await api.get('/payouts/me');
                if (response.data.success) {
                    setPayouts(response.data.payouts || []);
                }
            } catch (err) {
                console.error('Error loading payouts:', err);
            }
        };

        const loadSales = async () => {
            try {
                ensureTokenInHeaders();
                const response = await api.get('/creators/me/sales?limit=100');
                if (response.data.success) {
                    setSales(response.data.sales || []);
                }
            } catch (err) {
                console.error('Error loading sales:', err);
            }
        };

        if (user && user.creatorStatus === 'approved') {
            loadStats();
            loadPayouts();
            loadSales();
        }
    }, [user, ensureTokenInHeaders]);

    const transactions = useMemo(() => {
        const list = [];
        
        // Add payouts
        (payouts || []).forEach(p => {
            list.push({
                id: p.id || p._id,
                date: parseUTCDate(p.createdAt),
                type: 'سحب رصيد',
                amount: -p.amount,
                net: -p.amount,
                status: p.status === 'PAID' ? 'Succeeded' : p.status === 'REJECTED' ? 'Failed' : 'Pending',
                statusName: p.status === 'PAID' ? 'تم بنجاح' : p.status === 'REJECTED' ? 'فشلت' : 'قيد الانتظار'
            });
        });
        
        // Add sales (Payments)
        (sales || []).forEach(s => {
            if (s.price > 0) {
                list.push({
                    id: s.id || s._id,
                    date: parseUTCDate(s.date),
                    type: 'أرباح مبيعات',
                    amount: s.price,
                    net: s.price * 0.91, // after 9% platform fee
                    status: 'Succeeded',
                    statusName: 'تم بنجاح'
                });
            }
        });
        
        return list.sort((a, b) => b.date - a.date);
    }, [payouts, sales]);

    const formatTransactionDate = (dateObj) => {
        try {
            return dateObj.toLocaleString('ar-EG', { 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return '';
        }
    };

    const formatAmount = (amount) => {
        const isNegative = amount < 0;
        const absoluteVal = Math.abs(amount);
        const formattedVal = absoluteVal.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${isNegative ? '-' : '+'}${formattedVal} ج.م`;
    };



    if (!user || user.creatorStatus !== 'approved') {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-dark-secondary rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm max-w-xl mx-auto" dir="rtl">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-500/10 text-red-500 shadow-glow-sm">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary mb-2">
                    حساب غير مصرح
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-tertiary leading-relaxed max-w-sm mx-auto">
                    يجب أن تكون مبدعاً معتمداً بالمنصة لعرض لوحة الأرباح والسحوبات المالية.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse pb-12" dir="rtl">
                <div className="h-10 bg-gray-200 dark:bg-dark-secondary rounded-xl w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-44 bg-gray-200 dark:bg-dark-secondary rounded-3xl"></div>
                    <div className="h-44 bg-gray-200 dark:bg-dark-secondary rounded-3xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-gray-200 dark:bg-dark-secondary rounded-3xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    const payoutDetailLabel = user?.payoutMethod === 'vodafone_cash' ? 'رقم محفظة فودافون كاش' : 'رقم الحساب البنكي (IBAN)';
    const payoutDetailValue = user?.payoutMethod === 'vodafone_cash'
        ? (user?.payoutDetails?.walletNumber || user?.payoutDetails?.number || 'غير محدد')
        : (user?.payoutDetails?.accountNumber || user?.payoutDetails?.iban 
            ? `${user?.payoutDetails?.bankName ? user.payoutDetails.bankName + ' - ' : ''}${user?.payoutDetails?.accountNumber || user?.payoutDetails?.iban}`
            : 'غير محدد');

    return (
        <div className="space-y-8 pb-12" dir="rtl">
            {/* Header Block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary mb-2 tracking-tight">
                        الأرباح والمحفظة المالية
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary font-medium">
                        تتبع عوائد مبيعاتك وقدم طلبات سحب رصيدك بطريقة فورية وآمنة
                    </p>
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-dark-text-tertiary bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-white/5 px-3 py-1.5 rounded-xl self-start sm:self-center">
                    آخر تحديث للرصيد: {formatDate(new Date())}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/10 border border-red-200/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs">
                    {error}
                </div>
            )}

            {/* Financial Cards Grid - Advanced Aesthetics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total accumulated income card */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-950/80 dark:to-emerald-900/60 border border-emerald-500/10 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-emerald-100/90 text-xs font-black uppercase tracking-wider">إجمالي صافي الأرباح</span>
                                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
                                    <Award className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black tracking-tight">{(stats?.totalEarnings || 0).toLocaleString('ar-EG')}</h3>
                                <span className="text-base font-bold text-emerald-200">ج.م</span>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-emerald-100">
                            <span>صافي العوائد بعد احتساب عمولة المنصة</span>
                            <span className="font-bold">١٠٠٪ محمي ومصدق</span>
                        </div>
                    </div>
                </div>

                {/* Available balance card */}
                <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary-500/5 dark:bg-orange-500/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-400 dark:text-dark-text-tertiary text-xs font-black uppercase tracking-wider">الرصيد المتاح للسحب حالياً</span>
                            <button
                                onClick={() => router.push('/profile?tab=settings&subtab=payout')}
                                title="إعدادات الدفع"
                                className="p-2.5 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-white/5 text-gray-500 dark:text-dark-text-secondary hover:bg-primary-50 dark:hover:bg-orange-500/10 hover:text-primary-600 dark:hover:text-orange-400 hover:border-primary-100 dark:hover:border-orange-500/20 transition-all active:scale-95 cursor-pointer outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <Wallet className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-baseline gap-2 text-gray-900 dark:text-dark-text-primary">
                            <h3 className="text-4xl font-black tracking-tight">{(stats?.currentBalance || 0).toLocaleString('ar-EG')}</h3>
                            <span className="text-base font-bold text-gray-400 dark:text-dark-text-tertiary">ج.م</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-3 rounded-2xl flex items-center gap-2 border border-emerald-100/50 dark:border-emerald-900/10">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
                            <span>يتم مراجعة وتحويل الأرباح يدوياً من قبل الإدارة إلى وسيلة السحب الخاصة بك.</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-gray-50 dark:bg-dark-tertiary/20 p-3 rounded-2xl border border-gray-100/50 dark:border-white/5">
                                <p className="text-[9px] text-gray-400 font-black uppercase mb-1">وسيلة السحب</p>
                                <p className="text-xs font-black text-gray-900 dark:text-dark-text-primary">
                                    {user?.payoutMethod === 'vodafone_cash' ? 'فودافون كاش' : 'تحويل بنكي IBAN'}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-dark-tertiary/20 p-3 rounded-2xl border border-gray-100/50 dark:border-white/5 overflow-hidden">
                                <p className="text-[9px] text-gray-400 font-black uppercase mb-1">{payoutDetailLabel}</p>
                                <p className="text-xs font-black text-gray-900 dark:text-dark-text-primary truncate font-mono select-all">
                                    {payoutDetailValue}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Recent Transactions Section */}
            <div className="bg-white dark:bg-dark-secondary border border-gray-100/60 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden" dir="rtl">
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-dark-text-primary">
                            أحدث العمليات والحركات المالية
                        </h3>
                        <p className="text-[11px] text-gray-400 dark:text-dark-text-tertiary mt-0.5">
                            سجل بكافة الحركات المالية من عمليات بيع القوالب وسحوبات الرصيد الصادرة لحسابك
                        </p>
                    </div>

                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-tertiary/20 border-b border-gray-100 dark:border-white/5">
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">التاريخ</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase">النوع</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-left">القيمة</th>
                                <th className="px-8 py-4.5 text-xs font-black text-gray-500 dark:text-dark-text-tertiary uppercase text-left">الصافي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {transactions && transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/30 dark:hover:bg-dark-tertiary/10 transition-colors">
                                        <td className="px-8 py-4 text-xs font-bold text-gray-700 dark:text-dark-text-secondary">
                                            {formatTransactionDate(tx.date)}
                                        </td>
                                        <td className="px-8 py-4 text-xs font-bold text-gray-500 dark:text-dark-text-tertiary">
                                            {tx.type}
                                        </td>
                                        <td className="px-8 py-4 text-xs font-black text-gray-900 dark:text-dark-text-primary text-left font-mono">
                                            {formatAmount(tx.amount)}
                                        </td>
                                        <td className="px-8 py-4 text-xs font-black text-gray-900 dark:text-dark-text-primary text-left font-mono">
                                            {formatAmount(tx.net)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-xs font-bold text-gray-400 dark:text-dark-text-tertiary">
                                        لا توجد معاملات مسجلة حالياً.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout policies guidelines block - Structured Luxury banner */}
            <div className="bg-primary-50/50 dark:bg-orange-500/5 rounded-3xl p-6 border border-primary-100/40 dark:border-orange-500/10">
                <h4 className="font-black text-sm text-primary-900 dark:text-orange-400 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    <span>نظام توزيع الأرباح والسياسات المالية للمبدعين</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    <div className="space-y-3">
                        <p className="flex items-start gap-2">
                            <span className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0"><Check size={12} /></span>
                            <span>يتم احتساب الأرباح بنسبة <strong>٩١٪</strong> كاملة للمبدع، و <strong>٩٪</strong> كعمولة تشغيل وصيانة للمنصة.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0"><Check size={12} /></span>
                            <span>يتم تحويل الأرباح المتراكمة في رصيدك يدوياً بواسطة الإدارة دون الحاجة لتقديم طلب.</span>
                        </p>
                    </div>
                    <div className="space-y-3">
                        <p className="flex items-start gap-2">
                            <span className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0"><Check size={12} /></span>
                            <span>يتم تحويل الأموال وتصفير الرصيد عبر <strong>فودافون كاش</strong> أو <strong>الحساب البنكي</strong> المسجل.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex-shrink-0"><Check size={12} /></span>
                            <span>تأكد من صحة بيانات وسيلة السحب المسجلة في إعدادات الحساب لتفادي رفض المعاملات.</span>
                        </p>
                    </div>
                </div>
            </div>


        </div>
    );
};

const StatSmallCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    const sparklinePaths = {
        blue: 'M0,15 C20,5 40,25 60,10 C80,-5 90,20 100,8',
        purple: 'M0,20 C15,10 30,25 50,5 C70,15 85,0 100,12',
        orange: 'M0,10 C20,25 35,5 55,20 C75,5 90,15 100,5'
    };

    return (
        <div className="bg-white dark:bg-dark-secondary rounded-2xl p-5 border border-gray-100/60 dark:border-white/5 flex items-center justify-between gap-4 overflow-hidden relative group hover:shadow-sm transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider">{title}</p>
                    <p className="text-xl font-black text-gray-900 dark:text-dark-text-primary">{typeof value === 'number' ? value.toLocaleString('ar-EG') : value}</p>
                </div>
            </div>
            
            {/* Self-drawing micro sparkline path utilizing Framer Motion */}
            <div className="w-18 h-8 opacity-30 group-hover:opacity-60 transition-opacity duration-300 shrink-0 select-none">
                <svg className={`w-full h-full ${colors[color].split(' ')[1]}`} viewBox="0 0 100 30" fill="none">
                    <motion.path 
                        d={sparklinePaths[color]} 
                        stroke="currentColor" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default CreatorEarnings;