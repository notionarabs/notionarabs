import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Calendar,
  Eye,
  User as UserIcon,
  Tag,
  CreditCard,
  ExternalLink,
  Pin,
  PinOff,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Layout
} from 'lucide-react';
import { getCategoryName } from '../../../../lib/categoryMapping';

export default function TemplateTable({
  templates,
  selectedTemplates,
  handleSelectAll,
  handleSelectTemplate,
  handleViewDetails,
  handlePinTemplate,
  handleStatusChange,
  pinLoading,
  formatDate,
  getStatusBadge,
  totalPages,
  currentPage,
  setCurrentPage,
  bulkAction,
  setBulkAction,
  actionLoading,
  handleBulkAction,
  setSelectedTemplates
}) {
  return (
    <div>
      {/* Bulk Action Alert */}
      <AnimatePresence>
        {selectedTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="mb-8"
          >
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden" dir="rtl">
              <div className="flex items-center gap-4 text-primary-500 text-right">
                <div className="p-3 bg-primary-500/20 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">تم تحديد {selectedTemplates.length} قالب</h4>
                  <p className="text-sm font-bold opacity-80">يمكنك إجراء عمليات جماعية على القوالب المحددة.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 md:flex-none px-4 py-3 bg-white dark:bg-dark-secondary border-none rounded-xl font-bold text-sm outline-none shadow-soft text-right"
                >
                  <option value="">اختر الإجراء الجماعي...</option>
                  <option value="approve">موافقة جماعية</option>
                  <option value="reject">رفض جماعي</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || actionLoading}
                  className="px-8 py-3 bg-primary-500 text-white rounded-xl font-bold shadow-soft hover:shadow-glow disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                >
                  {actionLoading ? 'جاري التنفيذ...' : 'تطبيق'}
                </button>
                <button
                  onClick={() => setSelectedTemplates([])}
                  className="p-3 text-accent-400 hover:text-rose-500 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Table */}
      <div className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="border-b border-gray-50 dark:border-dark-card-border bg-gray-50/50 dark:bg-dark-tertiary/30">
                <th className="px-8 py-4 text-right w-10">
                  <input
                    type="checkbox"
                    checked={templates.length > 0 && selectedTemplates.length === templates.length}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                  />
                </th>
                <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">تمثيل القالب</th>
                <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">المبدع</th>
                <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">التصنيف & السعر</th>
                <th className="px-6 py-6 text-right text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">حالة المراجعة</th>
                <th className="px-6 py-6 text-left text-xs font-black text-accent-300 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-card-border">
              {templates.map((template, idx) => (
                <tr
                  key={template._id}
                  className="group hover:bg-gray-50/50 dark:hover:bg-dark-tertiary/20 transition-all duration-300"
                >
                  <td className="px-8 py-5 text-right">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template._id)}
                      onChange={() => handleSelectTemplate(template._id)}
                      className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500/20 transition-all cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-5">
                      <div className="relative group/img flex-shrink-0">
                        <div className="w-20 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-tertiary shadow-soft relative">
                          {template.previewImage ? (
                            <Image
                              src={template.previewImage}
                              alt={template.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                              unoptimized={template.previewImage.startsWith('http')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-accent-200 bg-gray-100 dark:bg-dark-tertiary">
                              <Layout className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        {template.isPinned && (
                          <div className="absolute -top-2 -right-2 p-1.5 bg-orange-500 text-white rounded-lg shadow-glow-orange scale-90">
                            <Pin className="w-3 h-3 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 text-right">
                        <span className="text-sm font-black text-accent-500 dark:text-dark-text-primary truncate transition-colors group-hover:text-orange-500">
                          {template.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-accent-300 dark:text-dark-text-tertiary uppercase">
                            <Calendar className="w-3 h-3" />
                            {formatDate(template.createdAt)}
                          </span>
                          {template.views > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <Eye className="w-3 h-3" />
                              {template.views}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center relative">
                        {template.creator?.profilePicture ? (
                          <Image
                            src={template.creator.profilePicture}
                            alt={template.creator.name}
                            fill
                            className="object-cover"
                            unoptimized={template.creator.profilePicture.startsWith('http')}
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{template.creator?.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5">{template.creator?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-accent-400 dark:text-dark-text-tertiary">
                        {getCategoryName(template.category || template.categories?.[0]) || 'عام'}
                        <Tag className="w-3 h-3" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        {template.isPaid ? (
                          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/30 font-black text-[11px]">
                            {template.price} ج.م
                            <CreditCard className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-[11px] font-black text-accent-300 uppercase">مجاني</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    {getStatusBadge(template.status)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(template)}
                        className="p-2.5 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl text-accent-400 hover:text-orange-500 hover:border-orange-500/30 transition-all shadow-soft"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-4 bg-gray-100 dark:bg-dark-card-border mx-1" />

                      <button
                        onClick={() => handlePinTemplate(template._id)}
                        disabled={pinLoading === template._id}
                        className={`p-2.5 rounded-xl transition-all shadow-soft border ${
                          template.isPinned
                            ? 'bg-orange-500 text-white shadow-glow-orange border-transparent'
                            : 'bg-white dark:bg-dark-secondary border-gray-100 dark:border-dark-card-border text-accent-400 hover:text-orange-500'
                        }`}
                      >
                        {pinLoading === template._id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : template.isPinned ? (
                          <PinOff className="w-4 h-4" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </button>

                      {template.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(template, 'approved')}
                            className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-soft"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(template, 'rejected')}
                            className="p-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-soft"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-dark-tertiary/20 border-t border-gray-50 dark:border-dark-card-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-accent-300 uppercase tracking-widest">
              صفحة {currentPage} من {totalPages}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl font-black text-xs text-accent-500 dark:text-dark-text-primary disabled:opacity-50 transition-all hover:translate-x-1 shadow-soft"
              >
                <span>السابق</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border rounded-xl font-black text-xs text-accent-500 dark:text-dark-text-primary disabled:opacity-50 transition-all hover:-translate-x-1 shadow-soft"
              >
                <ChevronRight className="w-4 h-4" />
                <span>التالي</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
