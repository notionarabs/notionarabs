'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/dateUtils';
import api from '../lib/api';
import LoadingIndicator from './LoadingIndicator';
import { useToast } from '../contexts/ToastContext';

export default function AdminPayouts() {
    const { user, ensureTokenInHeaders } = useAuth();
    const { showSuccess, showError } = useToast();
    const [payouts, setPayouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, PAID, REJECTED
    const [processingId, setProcessingId] = useState(null);

    const loadPayouts = async () => {
        try {
            setIsLoading(true);
            ensureTokenInHeaders();
            const response = await api.get('/payouts/admin/all');
            if (response.data.success) {
                setPayouts(response.data.payouts);
            }
        } catch (error) {
            console.error('Error loading admin payouts:', error);
            showError('تعذر تحميل طلبات السحب');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadPayouts();
        }
    }, [user]);

    const handleUpdateStatus = async (id, status, reason = '') => {
        try {
            setProcessingId(id);
            ensureTokenInHeaders();
            const response = await api.patch(`/payouts/admin/${id}`, { status, rejectionReason: reason });
            if (response.data.success) {
                showSuccess('تم تحديث حالة الطلب بنجاح');
                setPayouts(prev => prev.map(p => (p.id === id || p._id === id) ? response.data.payout : p));
            }
        } catch (error) {
            showError('حدث خطأ أثناء تحديث الطلب');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredPayouts = payouts.filter(p => filter === 'ALL' || p.status === filter);

    if (user?.role !== 'admin') return <div className="p-8 text-center">غير مصرح لك بالوصول لهذه الصفحة</div>;
    if (isLoading) return <LoadingIndicator />;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-dark-text-primary">إدارة سحب الأرباح</h1>
                    <p className="text-gray-500 dark:text-dark-text-secondary">مراجعة ومعالجة طلبات سحب الأموال للمبدعين</p>
                </div>
                
                <div className="flex p-1 bg-gray-100 dark:bg-dark-tertiary rounded-xl">
                    {['ALL', 'PENDING', 'PAID', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white dark:bg-dark-secondary text-primary-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            {f === 'ALL' ? 'الكل' : f === 'PENDING' ? 'قيد الانتظار' : f === 'PAID' ? 'تم الدفع' : 'مرفوض'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-medium border border-gray-200 dark:border-dark-card-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right" dir="rtl">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-dark-tertiary/30 border-b border-gray-100 dark:border-dark-card-border">
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary">المبدع</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary">المبلغ</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary">تفاصيل الدفع</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary">الحالة</th>
                                <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
                            {filteredPayouts.map((payout) => {
                                let details = {};
                                try { details = typeof payout.accountDetails === 'string' ? JSON.parse(payout.accountDetails) : (payout.accountDetails || {}); } catch(e) {}
                                
                                return (
                                    <tr key={payout.id || payout._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-dark-text-primary text-sm">{payout.creatorId}</p>
                                            <p className="text-xs text-gray-500">{formatDate(payout.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-dark-text-primary">
                                            {payout.amount} ج.م
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-dark-text-secondary">
                                            {payout.method === 'vodafone_cash' ? (
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 font-bold">فودافون كاش</span>
                                                    <span>رقم: {details.walletNumber}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-primary-600 font-bold">تحويل بنكي</span>
                                                    <span>{details.bankName} - {details.accountName}</span>
                                                    <span>{details.accountNumber}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                                payout.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                payout.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {payout.status === 'PAID' ? 'تم الدفع' : payout.status === 'REJECTED' ? 'مرفوض' : 'قيد الانتظار'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payout.status === 'PENDING' && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(payout.id || payout._id, 'PAID')}
                                                        disabled={processingId === (payout.id || payout._id)}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        تم الدفع
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('سبب الرفض:');
                                                            if (reason) handleUpdateStatus(payout.id || payout._id, 'REJECTED', reason);
                                                        }}
                                                        disabled={processingId === (payout.id || payout._id)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        رفض
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredPayouts.length === 0 && (
                    <div className="p-12 text-center text-gray-500">لا توجد طلبات سحب بهذا التصنيف</div>
                )}
            </div>
        </div>
    );
}
