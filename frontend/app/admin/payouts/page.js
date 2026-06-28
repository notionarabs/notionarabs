'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { DollarSign, CheckCircle, XCircle, Clock, Search, ExternalLink, CreditCard, Eye, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';
import ConfirmModal from '../../../components/ConfirmModal';

const parseUTCDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(dateStr)) {
        return new Date(dateStr + 'Z');
    }
    return new Date(dateStr);
};

const formatTransactionDate = (dateStr) => {
    if (!dateStr) return '';
    const date = parseUTCDate(dateStr);
    return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export default function AdminPayouts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [payouts, setPayouts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [activeTab, setActiveTab] = useState('creators');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyModal, setHistoryModal] = useState({ isOpen: false, creatorId: null, creatorName: '' });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Confirmation state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    status: '',
    reason: ''
  });

  // Clear balance modal state
  const [clearBalanceModal, setClearBalanceModal] = useState({
    isOpen: false,
    creatorId: null,
    creatorName: '',
    balance: 0
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchPayouts();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const [payoutsRes, creatorsRes] = await Promise.all([
        api.get('/payouts/admin/all'),
        api.get('/admin/users?role=creator&limit=100')
      ]);
      if (payoutsRes.data.success) {
        setPayouts(payoutsRes.data.payouts || []);
      }
      if (creatorsRes.data.success) {
        setCreators(creatorsRes.data.users || []);
      }
    } catch (err) {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = '') => {
    setIsProcessing(true);
    try {
      const res = await api.patch(`/payouts/admin/${id}`, { status, rejectionReason: reason });
      if (res.data.success) {
        showSuccess(res.data.message || 'تم تحديث الحالة بنجاح');
        setRejectingId(null);
        setRejectionReason('');
        setConfirmModal({ ...confirmModal, isOpen: false });
        fetchPayouts();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'حدث خطأ أثناء المعالجة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearBalance = async (creatorId) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/admin/creators/${creatorId}/clear-balance`);
      if (res.data.success) {
        showSuccess(res.data.message || 'تم تصفير الرصيد وتسجيل التحويل بنجاح');
        setClearBalanceModal({ isOpen: false, creatorId: null, creatorName: '', balance: 0 });
        fetchPayouts();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'حدث خطأ أثناء تصفير الرصيد');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><LoadingIndicator /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary py-12" dir="rtl">
      <BreadcrumbWrapper items={[
        { name: 'لوحة الإدارة', url: '/admin' },
        { name: 'إدارة المدفوعات', url: '/admin/payouts' }
      ]} />
      <div className="container-custom max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <DollarSign className="text-emerald-500 w-8 h-8" />
              إدارة المدفوعات والأرباح
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">قم بمراجعة طلبات السحب المستحقة لصناع المحتوى</p>
          </div>
          <div className="bg-white dark:bg-dark-secondary p-4 rounded-xl border border-gray-200 dark:border-dark-card-border shadow-sm flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black">طلبات معلقة</div>
              <div className="text-2xl font-black text-amber-500">{payouts.filter(p => p.status === 'PENDING').length}</div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-dark-card-border"></div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black">إجمالي مدفوع</div>
              <div className="text-2xl font-black text-emerald-500">
                {payouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)} ج.م
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-bold">
            {error}
          </div>
        )}
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-200 dark:border-dark-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 dark:bg-dark-tertiary border-b border-gray-200 dark:border-dark-card-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">المبدع</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">الرصيد الحالي</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">إجمالي الأرباح</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">عدد القوالب</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">بيانات الدفع المسجلة</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">حالة التحويل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-card-border">
                  {creators.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        لا يوجد صناع محتوى مسجلين حالياً
                      </td>
                    </tr>
                  ) : (
                    creators.map((creator) => (
                      <tr key={creator._id || creator.id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors">
                        <td className="px-6 py-4">
                          <Link 
                            href={`/creators/${creator.username || creator.id || creator._id || ''}`}
                            target="_blank"
                            className="flex items-center gap-3 hover:opacity-85 transition-opacity group"
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-orange-500 transition-all">
                              <img 
                                src={creator.profilePicture || '/default-avatar.png'} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div>
                              <div className="font-black text-gray-900 dark:text-white text-sm group-hover:text-orange-500 transition-colors flex items-center gap-1">
                                {creator.name || 'مجهول'}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                              </div>
                              <div className="text-xs font-bold text-gray-400 dark:text-gray-500">{creator.email}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-base text-amber-600 dark:text-amber-400">{creator.balance || 0} ج.م</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-base text-emerald-600 dark:text-emerald-400">{creator.totalEarnings || 0} ج.م</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-700 dark:text-zinc-300">{creator.templatesCount || 0}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 dark:text-gray-400 max-w-xs">
                            {creator.payoutMethod ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-black text-[11px] text-primary-500">
                                  {creator.payoutMethod === 'vodafone_cash' ? 'فودافون كاش' :
                                   creator.payoutMethod === 'instapay' ? 'إنستاباي' :
                                   creator.payoutMethod === 'bank_transfer' ? 'تحويل بنكي' : creator.payoutMethod}
                                </span>
                                <span className="font-mono text-zinc-500 dark:text-zinc-500">
                                  {creator.payoutMethod === 'vodafone_cash' ? creator.payoutDetails?.walletNumber :
                                   creator.payoutMethod === 'instapay' ? creator.payoutDetails?.ipa :
                                   creator.payoutMethod === 'bank_transfer' ? `${creator.payoutDetails?.bankName} - ${creator.payoutDetails?.accountNumber}` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600 font-medium">لا توجد بيانات مسجلة</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {creator.balance > 0 ? (
                              <button
                                onClick={() => setClearBalanceModal({
                                  isOpen: true,
                                  creatorId: creator.id || creator._id,
                                  creatorName: creator.name || 'مجهول',
                                  balance: creator.balance
                                })}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-sm disabled:opacity-50"
                              >
                                تأكيد التحويل
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-500">
                                <CheckCircle size={12} /> تم التحويل
                              </span>
                            )}
                            <button
                              onClick={() => setHistoryModal({
                                isOpen: true,
                                creatorId: creator.id || creator._id,
                                creatorName: creator.name || 'مجهول'
                              })}
                              className="inline-flex items-center gap-1.5 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-card-border text-gray-700 dark:text-dark-text-secondary text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer border border-transparent dark:border-white/5 outline-none"
                            >
                              <Clock size={12} /> سجل التحويلات
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => handleStatusUpdate(confirmModal.id, confirmModal.status, confirmModal.reason)}
        title={confirmModal.status === 'PAID' ? 'تأكيد الدفع' : 'تأكيد الرفض'}
        message={
          confirmModal.status === 'PAID' 
            ? 'هل أنت متأكد من رغبتك في تحويل حالة الطلب إلى "تم الدفع"؟ سيتم إرسال إشعار لصانع المحتوى.' 
            : 'هل أنت متأكد من رغبتك في رفض طلب السحب هذا؟ سيتم إرجاع المبلغ إلى رصيد المبدع.'
        }
        confirmText={confirmModal.status === 'PAID' ? 'تأكيد الدفع' : 'تأكيد الرفض'}
        variant={confirmModal.status === 'PAID' ? 'success' : 'danger'}
        isLoading={isProcessing}
      />

      {/* Clear Balance Confirmation Modal */}
      <ConfirmModal
        isOpen={clearBalanceModal.isOpen}
        onClose={() => setClearBalanceModal({ isOpen: false, creatorId: null, creatorName: '', balance: 0 })}
        onConfirm={() => handleClearBalance(clearBalanceModal.creatorId)}
        title="تأكيد تحويل الرصيد"
        message={`هل أنت متأكد من رغبتك في تصفير رصيد المبدع "${clearBalanceModal.creatorName}" وتسجيل تحويل مبلغ ${clearBalanceModal.balance} ج.م له؟`}
        confirmText="تأكيد التحويل"
        variant="success"
        isLoading={isProcessing}
      />

      {/* Creator History Modal */}
      {historyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white dark:bg-dark-secondary w-full max-w-3xl rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="text-primary-500 w-5 h-5" />
                  سجل التحويلات لـ {historyModal.creatorName}
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-tertiary mt-1">عرض جميع عمليات السحب السابقة والمدفوعة لهذا المبدع</p>
              </div>
              <button
                onClick={() => setHistoryModal({ isOpen: false, creatorId: null, creatorName: '' })}
                className="p-2 bg-gray-50 dark:bg-dark-tertiary text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl transition-all cursor-pointer outline-none border-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {payouts.filter(p => (p.creatorId?._id || p.creatorId?.id || p.creatorId) === historyModal.creatorId).length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-dark-text-tertiary font-bold">
                  لا توجد تحويلات سابقة مسجلة لهذا المبدع.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/5 pb-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <th className="pb-3 text-right">التاريخ</th>
                        <th className="pb-3 text-right">المبلغ</th>
                        <th className="pb-3 text-right">وسيلة التحويل</th>
                        <th className="pb-3 text-right">حالة التحويل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {payouts
                        .filter(p => (p.creatorId?._id || p.creatorId?.id || p.creatorId) === historyModal.creatorId)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map(payout => (
                          <tr key={payout.id || payout._id} className="text-xs text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/20">
                            <td className="py-4 font-bold">{formatTransactionDate(payout.createdAt)}</td>
                            <td className="py-4 font-black text-sm text-emerald-600 dark:text-emerald-400">{payout.amount} ج.م</td>
                            <td className="py-4">
                              <span className="font-bold text-[11px] text-primary-500">
                                {payout.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                                 payout.paymentMethod === 'instapay' ? 'إنستاباي' :
                                 payout.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : payout.paymentMethod || 'غير محدد'}
                              </span>
                              {payout.paymentDetails && (
                                <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
                                  {payout.paymentMethod === 'vodafone_cash' && payout.paymentDetails.walletNumber}
                                  {payout.paymentMethod === 'instapay' && payout.paymentDetails.ipa}
                                  {payout.paymentMethod === 'bank_transfer' && `${payout.paymentDetails.bankName} - ${payout.paymentDetails.accountNumber}`}
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full w-fit font-black ${
                                  payout.status === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-500'
                                    : payout.status === 'REJECTED'
                                    ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-500'
                                    : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500'
                                }`}>
                                  {payout.status === 'PAID' ? 'تم التحويل' : payout.status === 'REJECTED' ? 'مرفوض' : 'معلق'}
                                </span>
                                {payout.status === 'REJECTED' && payout.rejectionReason && (
                                  <span className="text-[10px] text-red-500 font-semibold max-w-xs">{payout.rejectionReason}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-dark-tertiary border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setHistoryModal({ isOpen: false, creatorId: null, creatorName: '' })}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-dark-card-border dark:hover:bg-zinc-700 text-gray-700 dark:text-white text-xs font-black rounded-xl transition-all cursor-pointer outline-none border-none"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
