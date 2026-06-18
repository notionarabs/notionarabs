import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Mail, Clock } from 'lucide-react';

export default function UserTable({
  users,
  usersLoading,
  loading,
  filteredUserCount,
  exportUsersCSV,
  exportLoading,
  setSelectedUser,
  setShowDetailsModal,
  formatDate
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border-none shadow-large overflow-hidden"
    >
      {/* Table Header Controls */}
      <div className="px-6 py-5 border-none flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-dark-tertiary/20">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 space-x-reverse">
            {users.slice(0, 3).map((u, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-secondary bg-primary-500 overflow-hidden">
                {u.profilePicture ? (
                  <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-white bg-gradient-to-br from-primary-500 to-orange-600">
                    {u.name?.charAt(0)}
                  </div>
                )}
              </div>
            ))}
            {users.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-secondary bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center text-[10px] text-accent-500">
                +{users.length - 3}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">
            {filteredUserCount !== null ? `${filteredUserCount} مستخدم` : 'جاري التحميل...'}
          </h3>
        </div>

        <button
          onClick={exportUsersCSV}
          disabled={users.length === 0 || exportLoading}
          className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {exportLoading ? (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exportLoading ? 'جاري التحضير...' : 'تصدير البيانات (CSV)'}
        </button>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-tertiary/50">
              <th className="px-6 py-4 text-center text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الإجراءات</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المستخدم</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">البريد الإلكتروني</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider hidden md:table-cell">المنصة</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider hidden lg:table-cell">تاريخ الانضمام</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الصلاحية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
            <AnimatePresence>
              {usersLoading ? (
                [...Array(5)].map((_, i) => (
                  <motion.tr
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="animate-pulse"
                  >
                    <td className="px-6 py-4">
                      <div className="h-9 w-9 bg-gray-100 dark:bg-dark-tertiary rounded-xl mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-24" />
                          <div className="h-3 bg-gray-100 dark:bg-dark-tertiary rounded w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-32" />
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="h-6 bg-gray-100 dark:bg-dark-tertiary rounded-lg w-16" />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="h-4 bg-gray-100 dark:bg-dark-tertiary rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-100 dark:bg-dark-tertiary rounded-full w-12" />
                    </td>
                  </motion.tr>
                ))
              ) : (
                users.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50/80 dark:hover:bg-dark-card-hover transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailsModal(true);
                        }}
                        className="p-2.5 bg-orange-500/10 hover:bg-orange-50 text-orange-500 hover:text-white dark:bg-orange-500/20 dark:hover:bg-orange-500 rounded-xl transition-all shadow-sm ring-1 ring-orange-500/20"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-dark-card-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-soft">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-orange-500 transition-colors">
                            {user.name}
                          </div>
                          {user.username && (
                            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-accent-600 dark:text-dark-text-secondary flex items-center gap-2">
                        <Mail className="w-3 h-3 opacity-50" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {user.googleId ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          البريد
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-accent-500 dark:text-dark-text-secondary flex items-center gap-2">
                        <Clock className="w-3 h-3 opacity-50" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        user.role?.toLowerCase() === 'admin'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : user.role?.toLowerCase() === 'creator'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                            : 'bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-tertiary'
                      }`}>
                        {user.role?.toLowerCase() === 'admin' ? 'مدير' : user.role?.toLowerCase() === 'creator' ? 'مبدع' : 'مستخدم'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty Results Placeholder */}
      {!loading && users.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-accent-200 dark:text-dark-text-quaternary" />
          </div>
          <h3 className="heading-3 mb-2">لا توجد نتائج</h3>
          <p className="body-large">لم نتمكن من العثور على أي مستخدمين يطابقون بحثك.</p>
        </div>
      )}

      {/* Table Footer Page Details */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-dark-tertiary/20 text-center">
        <p className="text-xs text-accent-400 dark:text-dark-text-quaternary">
          {filteredUserCount > 50
            ? "يتم عرض أول 50 مستخدم. استخدم البحث للعثور على مستخدمين محددين."
            : `يتم عرض ${users.length} مستخدم.`}
        </p>
      </div>
    </motion.div>
  );
}
