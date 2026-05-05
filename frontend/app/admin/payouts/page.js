'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { formatDate } from '../../../lib/dateUtils';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { DollarSign, CheckCircle, XCircle, Clock, Search, ExternalLink, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';
import ConfirmModal from '../../../components/ConfirmModal';

export default function AdminPayouts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
      const res = await api.get('/payouts/admin/all');
      if (res.data.success) {
        setPayouts(res.data.payouts || []);
      }
    } catch (err) {
      setError('فشل في تحميل طلبات السحب');
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
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">صانع المحتوى</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">المبلغ</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">وسيلة الدفع</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">الحالة</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-card-border">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      لا توجد طلبات سحب حالياً
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id || payout._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden shrink-0">
                            <Image 
                              src={payout.creatorId?.profilePicture || '/default-avatar.png'} 
                              alt="" 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div>
                            <div className="font-black text-gray-900 dark:text-white text-sm">{payout.creatorId?.name || 'مجهول'}</div>
                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500">{payout.creatorId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-lg text-emerald-600 dark:text-emerald-400">{payout.amount} ج.م</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-3">
                          {/* Data from the actual Request */}
                          <div className="p-3 bg-gray-50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-dark-card-border">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-gray-400">بيانات الطلب:</span>
                              <span className="text-[11px] font-black text-primary-500">
                                {payout.method === 'vodafone_cash' ? 'فودافون كاش' : 
                                 payout.method === 'instapay' ? 'إنستاباي' : 
                                 payout.method === 'bank_transfer' ? 'تحويل بنكي' : payout.method}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 break-all">
                              {payout.method === 'vodafone_cash' ? payout.accountDetails?.walletNumber :
                               payout.method === 'instapay' ? payout.accountDetails?.ipa :
                               payout.method === 'bank_transfer' ? `${payout.accountDetails?.bankName} - ${payout.accountDetails?.accountNumber}` :
                               JSON.stringify(payout.accountDetails || {})}
                            </div>
                          </div>

                          {/* Reference from Profile */}
                          <div className="p-3 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase text-blue-400">المرجع من الملف الشخصي:</span>
                              <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                                {payout.creatorId?.payoutMethod === 'vodafone_cash' ? 'فودافون كاش' : 
                                 payout.creatorId?.payoutMethod === 'instapay' ? 'إنستاباي' : 
                                 payout.creatorId?.payoutMethod === 'bank_transfer' ? 'تحويل بنكي' : 'غير محدد'}
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              {payout.creatorId?.payoutDetails?.walletNumber || 
                               payout.creatorId?.payoutDetails?.ipa || 
                               (payout.creatorId?.payoutDetails?.accountNumber ? `${payout.creatorId?.payoutDetails?.bankName}: ${payout.creatorId?.payoutDetails?.accountNumber}` : 'لا توجد بيانات مسجلة')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {formatDate(payout.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payout.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock size={12} /> قيد المراجعة
                          </span>
                        )}
                        {payout.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle size={12} /> تم الدفع
                          </span>
                        )}
                        {payout.status === 'REJECTED' && (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit text-xs font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle size={12} /> مرفوض
                            </span>
                            <span className="text-[10px] text-gray-500 max-w-[150px] line-clamp-2" title={payout.rejectionReason}>
                              {payout.rejectionReason}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {payout.status === 'PENDING' && (
                            <>
                              {rejectingId === (payout.id || payout._id) ? (
                                <div className="flex flex-col gap-2 min-w-[200px] bg-white dark:bg-dark-secondary p-3 rounded-lg border border-gray-200 shadow-lg absolute z-10 -ml-32">
                                  <textarea 
                                    placeholder="سبب الرفض (إلزامي)" 
                                    className="form-input text-xs h-16 resize-none"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <button 
                                      disabled={!rejectionReason.trim() || isProcessing}
                                      onClick={() => setConfirmModal({ 
                                        isOpen: true, 
                                        id: payout._id || payout.id, 
                                        status: 'REJECTED', 
                                        reason: rejectionReason 
                                      })}
                                      className="flex-1 bg-red-500 text-white text-xs font-bold py-1.5 rounded hover:bg-red-600 disabled:opacity-50"
                                    >
                                      تأكيد الرفض
                                    </button>
                                    <button 
                                      onClick={() => setRejectingId(null)}
                                      className="flex-1 bg-gray-200 text-gray-800 text-xs font-bold py-1.5 rounded hover:bg-gray-300"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setConfirmModal({ 
                                      isOpen: true, 
                                      id: payout.id || payout._id, 
                                      status: 'PAID', 
                                      reason: '' 
                                    })}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-black transition-colors"
                                  >
                                    <CheckCircle size={14} /> اعتماد
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(payout.id || payout._id)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-1 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-black transition-colors"
                                  >
                                    <XCircle size={14} /> رفض
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          
                          <Link 
                            href={`/creators/${payout.creatorId?.username || ''}`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 py-1.5 bg-gray-50 dark:bg-dark-tertiary hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg text-[10px] font-black transition-all border border-transparent hover:border-orange-500/20"
                          >
                            <Eye size={12} /> عرض ملف المبدع
                          </Link>
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
    </div>
  );
}
