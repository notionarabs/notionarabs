import { motion } from 'framer-motion';
import { Search, Filter, Medal, TrendingUp, XCircle, ChevronLeft } from 'lucide-react';

export default function ApplicationFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  badgeFilter,
  setBadgeFilter,
  badgePresets,
  sortBy,
  setSortBy,
  resetFilters
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-md rounded-[2rem] border border-gray-100 dark:border-dark-card-border p-6 mb-10 shadow-medium"
      dir="rtl"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Search */}
        <div className="md:col-span-12 lg:col-span-4 relative text-right">
          <label className="text-[10px] font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
            <Search className="w-3 h-3" />
            البحث عن مبدع
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="الاسم، البريد أو التخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border pr-12 pl-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all focus:bg-white dark:focus:bg-dark-tertiary ring-2 ring-transparent focus:ring-orange-500/10 text-right"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 group-focus-within:text-orange-500 transition-colors" />
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-6 lg:col-span-2 text-right">
          <label className="text-[10px] font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
            <Filter className="w-3 h-3" />
            حالة الطلب
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبولة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
            <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
          </div>
        </div>

        {/* Badges */}
        <div className="md:col-span-6 lg:col-span-2 text-right">
          <label className="text-[10px] font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
            <Medal className="w-3 h-3" />
            تصفية الشارات
          </label>
          <div className="relative">
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
            >
              <option value="all">كل الشارات</option>
              <option value="with-badges">المزود بشارات</option>
              <option value="no-badges">بدون شارات</option>
              {badgePresets?.userBadges?.map(badge => (
                <option key={badge.type} value={badge.type}>{badge.label}</option>
              ))}
            </select>
            <Medal className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
            <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
          </div>
        </div>

        {/* Sort */}
        <div className="md:col-span-6 lg:col-span-3 text-right">
          <label className="text-[10px] font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
            <TrendingUp className="w-3 h-3" />
            ترتيب النتائج
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
            >
              <option value="date-desc">الأحدث أولاً</option>
              <option value="date-asc">الأقدم أولاً</option>
              <option value="name-asc">الاسم (أ - ي)</option>
              <option value="name-desc">الاسم (ي - أ)</option>
            </select>
            <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
            <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
          </div>
        </div>

        {/* Reset button */}
        <div className="md:col-span-1 lg:col-span-1">
          <button
            onClick={resetFilters}
            className="w-full h-[54px] flex items-center justify-center bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 rounded-2xl transition-all border border-rose-100/50"
            title="إعادة ضبط الفلاتر"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
