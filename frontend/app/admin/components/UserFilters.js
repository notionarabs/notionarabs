import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Activity } from 'lucide-react';

export default function UserFilters({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  resetFilters
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 mb-12 border-none shadow-large"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <label className="form-label flex items-center gap-2">
            <Search className="w-4 h-4" />
            البحث عن مستخدم
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="الاسم، البريد الإلكتروني، أو المعرف..."
              className="form-input pr-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-400" />
          </div>
        </div>

        {/* Role classification */}
        <div className="md:col-span-3">
          <label className="form-label flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصنيف المستخدمين
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-select"
          >
            <option value="all">جميع المستخدمين</option>
            <option value="admin">المديرين</option>
            <option value="creator">المبدعين</option>
            <option value="user">المستخدمين</option>
          </select>
        </div>

        {/* Sort results */}
        <div className="md:col-span-3">
          <label className="form-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            ترتيب النتائج
          </label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="form-select"
          >
            <option value="createdAt-desc">الأحدث أولاً</option>
            <option value="createdAt-asc">الأقدم أولاً</option>
            <option value="name-asc">الاسم (أ - ي)</option>
            <option value="name-desc">الاسم (ي - أ)</option>
          </select>
        </div>

        {/* Reset button */}
        <div className="md:col-span-1">
          <button
            onClick={resetFilters}
            className="w-full h-[50px] flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-dark-tertiary dark:hover:bg-dark-quaternary rounded-xl transition-colors"
            title="إعادة ضبط الفلاتر"
          >
            <Activity className="w-5 h-5 text-accent-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
