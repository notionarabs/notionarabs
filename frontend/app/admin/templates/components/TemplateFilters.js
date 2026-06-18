import { Search, Filter, ChevronLeft } from 'lucide-react';

export default function TemplateFilters({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  setCurrentPage
}) {
  return (
    <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300" />
            <input
              type="text"
              placeholder="البحث في القوالب..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 dark:bg-dark-tertiary/50 border-none pr-10 pl-4 py-3 rounded-xl text-sm outline-none text-right focus:bg-white dark:focus:bg-dark-tertiary transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 dark:bg-dark-tertiary/50 border-none appearance-none pr-10 pl-10 py-3 rounded-xl text-sm outline-none cursor-pointer text-right focus:bg-white dark:focus:bg-dark-tertiary transition-all"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">موافق عليها</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <ChevronLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}
