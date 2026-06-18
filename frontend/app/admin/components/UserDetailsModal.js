import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Users, Mail, Activity, CreditCard } from 'lucide-react';

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
  formatDate
}) {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-accent-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-dark-card-border relative"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-gray-50 dark:bg-dark-tertiary hover:bg-rose-500 hover:text-white rounded-full transition-all text-accent-300"
          >
            <XCircle className="w-6 h-6" />
          </button>

          {/* User Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden bg-primary-100 dark:bg-primary-500/10 flex-shrink-0 border-4 border-white dark:border-dark-secondary shadow-soft">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-10 h-10 text-primary-500 m-auto mt-6" />
              )}
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{user.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  user.role?.toLowerCase() === 'admin'
                    ? 'bg-purple-500 text-white'
                    : user.role?.toLowerCase() === 'creator'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-dark-tertiary text-gray-500'
                }`}>
                  {user.role?.toLowerCase() === 'admin' ? 'مدير' : user.role?.toLowerCase() === 'creator' ? 'مبدع' : 'مستخدم'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30">
                  ID: {user._id?.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: General Info */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 block">معلومات التواصل</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-tertiary/50 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-bold truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-dark-tertiary/50 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 block">الحساب</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-dark-tertiary/50 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                    <span className="text-xs font-bold text-accent-400">تاريخ التسجيل</span>
                    <span className="text-xs font-black">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-dark-tertiary/50 rounded-2xl border border-gray-100 dark:border-dark-card-border">
                    <span className="text-xs font-bold text-accent-400">تفعيل البريد</span>
                    <span className={`text-xs font-black ${user.isEmailVerified ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {user.isEmailVerified ? 'مفعل' : 'غير مفعل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Earnings & Payout Methods */}
            <div className="space-y-6">
              {user.role?.toLowerCase() === 'creator' && (
                <div>
                  <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 block">بيانات السحب والأرباح</label>
                  <div className="bg-orange-50/50 dark:bg-orange-500/5 p-4 rounded-3xl border border-orange-100/50 dark:border-orange-500/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-orange-500 uppercase">وسيلة الدفع</span>
                        <span className="text-sm font-black dark:text-white">
                          {user.payoutMethod === 'vodafone_cash' ? 'فودافون كاش' : 
                           user.payoutMethod === 'instapay' ? 'إنستاباي' : 
                           user.payoutMethod === 'bank_transfer' ? 'تحويل بنكي' : 
                           user.payoutMethod || 'لم يتم التحديد'}
                        </span>
                      </div>
                      <div className="p-2 bg-white dark:bg-dark-secondary rounded-xl shadow-sm">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                      </div>
                    </div>

                    {user.payoutDetails ? (
                      <div className="space-y-3">
                        {user.payoutMethod === 'vodafone_cash' && (
                          <div className="bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-orange-100/30 dark:border-orange-500/10">
                            <span className="text-[10px] block text-accent-300 mb-1">رقم المحفظة</span>
                            <span className="text-sm font-black font-mono tracking-wider">{user.payoutDetails.walletNumber || '---'}</span>
                          </div>
                        )}
                        {user.payoutMethod === 'instapay' && (
                          <div className="bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-orange-100/30 dark:border-orange-500/10">
                            <span className="text-[10px] block text-accent-300 mb-1">عنوان الـ IPA</span>
                            <span className="text-sm font-black font-mono tracking-wider">{user.payoutDetails.ipa || '---'}</span>
                          </div>
                        )}
                        {user.payoutMethod === 'bank_transfer' && (
                          <div className="space-y-2">
                            <div className="bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-orange-100/30 dark:border-orange-500/10">
                              <span className="text-[10px] block text-accent-300 mb-1">اسم البنك</span>
                              <span className="text-xs font-black">{user.payoutDetails.bankName || '---'}</span>
                            </div>
                            <div className="bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-orange-100/30 dark:border-orange-500/10">
                              <span className="text-[10px] block text-accent-300 mb-1">اسم صاحب الحساب</span>
                              <span className="text-xs font-black">{user.payoutDetails.accountName || '---'}</span>
                            </div>
                            <div className="bg-white dark:bg-dark-secondary p-3 rounded-2xl border border-orange-100/30 dark:border-orange-500/10">
                              <span className="text-[10px] block text-accent-300 mb-1">رقم الحساب / IBAN</span>
                              <span className="text-xs font-black font-mono">{user.payoutDetails.accountNumber || '---'}</span>
                            </div>
                          </div>
                        )}
                        {(!user.payoutMethod || !user.payoutDetails) && (
                          <p className="text-xs text-orange-400 font-bold italic text-center py-2">لا توجد بيانات دفع مسجلة</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-orange-400 font-bold italic text-center py-2">لا توجد بيانات دفع مسجلة</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-500/10 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-black text-accent-300 block mb-1 uppercase">الرصيد</span>
                        <span className="text-lg font-black text-emerald-500">{user.balance || 0} ج.م</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-accent-300 block mb-1 uppercase">إجمالي الأرباح</span>
                        <span className="text-lg font-black text-primary-500">{user.totalEarnings || 0} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user.role?.toLowerCase() !== 'creator' && (
                <div className="h-full flex items-center justify-center p-8 bg-gray-50 dark:bg-dark-tertiary/20 rounded-3xl border border-dashed border-gray-200 dark:border-dark-card-border">
                  <p className="text-xs text-accent-300 font-bold text-center">لا تتوفر بيانات دفع للمستخدمين العاديين</p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-10 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 dark:bg-dark-tertiary hover:bg-gray-200 dark:hover:bg-dark-quaternary text-accent-500 dark:text-dark-text-primary rounded-2xl font-black text-xs transition-all shadow-soft"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
