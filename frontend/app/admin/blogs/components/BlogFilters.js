import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

export default function BlogFilters({
  selectedStatus,
  setSelectedStatus,
  setCurrentPage,
  statusOptions,
  blogsLength,
  totalBlogs
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-200 dark:border-dark-card-border shadow-medium"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="w-full md:w-1/3 text-right">
          <label className="form-label flex items-center gap-2 pr-1">
            <Filter className="w-4 h-4" />
            تصفية حسب الحالة
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select text-right"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-accent-500 dark:text-dark-text-secondary font-medium mb-3">
          عرض {blogsLength} من أصل {totalBlogs} مقال
        </div>
      </div>
    </motion.div>
  );
}
