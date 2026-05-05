'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '../lib/dateUtils';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import LoadingIndicator from './LoadingIndicator';

const CreatorEarnings = () => {
  const { user, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const router = useRouter();

  // Load creator stats
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
          setPayouts(response.data.payouts);
        }
      } catch (err) {
        console.error('Error loading payouts:', err);
      }
    };

    if (user && user.creatorStatus === 'approved') {
      loadStats();
      loadPayouts();
    }
  }, [user, ensureTokenInHeaders]);

  const handleWithdraw = async () => {
    if (!stats?.currentBalance || stats.currentBalance < 100) return;

    // Check if payout details are set
    if (!user?.payoutMethod || !user?.payoutDetails || Object.keys(user.payoutDetails).length === 0) {
      showError('يرجى ضبط إعدادات الدفع أولاً في صفحة الإعدادات');
      router.push('/profile?section=settings');
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في سحب مبلغ ${stats.currentBalance} ج.م؟`)) return;

    try {
      setIsWithdrawing(true);
      ensureTokenInHeaders();
      const response = await api.post('/payouts/request', {
        amount: stats.currentBalance,
        method: user.payoutMethod,
        accountDetails: JSON.stringify(user.payoutDetails)
      });

      if (response.data.success) {
        showSuccess('تم تقديم طلب السحب بنجاح!');
        // Refresh stats
        const statsRes = await api.get('/creators/me/stats');
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      showError(err.response?.data?.message || 'حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!user || user.creatorStatus !== 'approved') {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-tertiary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
          غير مصرح لك
        </h3>
        <p className="text-gray-500 dark:text-dark-text-tertiary">
          يجب أن تكون مبدعاً معتمداً لعرض الإحصائيات
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
          إحصائيات الأرباح والأداء
        </h2>
        <div className="text-sm text-gray-500 dark:text-dark-text-tertiary">
          آخر تحديث: {formatDate(new Date())}
        </div>
      </div>

      {/* Primary Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-emerald-100 text-sm font-medium mb-1">إجمالي الأرباح</p>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-black">{stats?.totalEarnings || 0}</h3>
            <span className="text-lg font-bold mb-1">ج.م</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
            <span className="text-emerald-100">صافي المبيعات الكلي</span>
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM12 8V7m0 1v1m0 0v1m0 0v1m0-5V5m0 5h1m-1 0H11" />
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary rounded-2xl p-6 shadow-medium dark:shadow-dark-medium border border-gray-200 dark:border-dark-card-border">
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm font-medium mb-1">الرصيد القابل للسحب</p>
          <div className="flex items-end gap-2 text-gray-900 dark:text-dark-text-primary">
            <h3 className="text-4xl font-black">{stats?.currentBalance || 0}</h3>
            <span className="text-lg font-bold mb-1">ج.م</span>
          </div>
          <button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || !stats?.currentBalance || stats.currentBalance < 100}
            className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-primary-600 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isWithdrawing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {isWithdrawing ? 'جاري المعالجة...' : 'طلب سحب الأرباح'}
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatSmallCard 
          title="التحميلات" 
          value={stats?.totalDownloads || 0} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          color="blue"
        />
        <StatSmallCard 
          title="المشاهدات" 
          value={stats?.totalViews || 0} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2}/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          color="purple"
        />
        <StatSmallCard 
          title="التقييم" 
          value={stats?.averageRating || '0.0'} 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
          color="orange"
        />
      </div>

      {/* Recent Templates Performance */}
      {stats?.recentTemplates && stats.recentTemplates.length > 0 && (
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-medium border border-gray-200 dark:border-dark-card-border overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-dark-card-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
              أداء القوالب الأخيرة
            </h3>
            <Link href="/profile?section=templates" className="text-sm font-bold text-primary-600 dark:text-primary-400">عرض الكل</Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-dark-card-border">
            {stats.recentTemplates.map((template) => (
              <div key={template.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${template.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {template.isPaid ? 'Paid' : 'Free'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-dark-text-primary">{template.title}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      {template.views} مشاهدة • {template.downloads} تحميل • {template.isPaid ? `${template.price} ج.م` : 'مجاني'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500">
                    <span className="text-sm font-bold">{template.rating || '0.0'}</span>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout History */}
      {payouts && payouts.length > 0 && (
        <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-medium border border-gray-200 dark:border-dark-card-border overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-dark-card-border">
            <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">سجل السحوبات</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-tertiary/30 border-b border-gray-100 dark:border-dark-card-border">
                  <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">المبلغ</th>
                  <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">الطريقة</th>
                  <th className="px-6 py-4 text-sm font-black text-gray-600 dark:text-dark-text-primary uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
                {payouts.map((payout) => (
                  <tr key={payout.id || payout._id} className="hover:bg-gray-50 dark:hover:bg-dark-tertiary/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text-primary font-medium">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-dark-text-primary">
                      {payout.amount} ج.م
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-dark-text-secondary font-medium">
                      {payout.method === 'vodafone_cash' ? 'فودافون كاش' : 'تحويل بنكي'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        payout.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        payout.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {payout.status === 'PAID' ? 'تم الدفع' : 
                         payout.status === 'REJECTED' ? 'مرفوض' : 
                         payout.status === 'APPROVED' ? 'مقبول' : 'قيد الانتظار'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Info Section */}
      <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-6 border border-primary-100 dark:border-primary-900/30">
        <h4 className="font-bold text-primary-900 dark:text-primary-200 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          نظام الأرباح والمدفوعات
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-800 dark:text-primary-300">
          <div className="space-y-2">
            <p className="flex gap-2"><span>•</span> <span>يتم احتساب الأرباح بنسبة 80% للمبدع و20% عمولة المنصة.</span></p>
            <p className="flex gap-2"><span>•</span> <span>الحد الأدنى لطلب السحب هو 100 ج.م.</span></p>
          </div>
          <div className="space-y-2">
            <p className="flex gap-2"><span>•</span> <span>تتم معالجة الطلبات عبر فودافون كاش أو تحويل بنكي خلال 3 أيام عمل.</span></p>
            <p className="flex gap-2"><span>•</span> <span>تأكد من تحديث بيانات الدفع في إعدادات ملفك الشخصي.</span></p>
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
  return (
    <div className="bg-white dark:bg-dark-secondary rounded-2xl p-5 border border-gray-200 dark:border-dark-card-border flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-gray-900 dark:text-dark-text-primary">{value}</p>
      </div>
    </div>
  );
};

export default CreatorEarnings;