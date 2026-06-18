import { motion } from 'framer-motion';
import Image from 'next/image';
import { memo } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Mail,
  User as UserIcon,
  Tag,
  Calendar,
  Eye
} from 'lucide-react';
import { extractFirstImage } from '../../../../lib/seo';

const BlogTableRow = memo(({ blog, idx, handleViewDetails, handleStatusChange, formatDate, normalizeImageUrl }) => {
  const status = blog.status || 'draft';
  const config = {
    pending: { bg: 'bg-yellow-50', darkBg: 'bg-yellow-900/20', text: 'text-yellow-600', darkText: 'text-yellow-400', label: 'قيد المراجعة', icon: Clock },
    published: { bg: 'bg-green-50', darkBg: 'bg-green-900/20', text: 'text-green-600', darkText: 'text-green-400', label: 'منشور', icon: CheckCircle },
    rejected: { bg: 'bg-red-50', darkBg: 'bg-red-900/20', text: 'text-red-600', darkText: 'text-red-400', label: 'مرفوض', icon: XCircle },
    draft: { bg: 'bg-gray-50', darkBg: 'bg-dark-tertiary', text: 'text-gray-500', darkText: 'text-dark-text-secondary', label: 'مسودة', icon: FileText }
  }[status];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="hover:bg-gray-50/80 dark:hover:bg-dark-card-hover transition-colors group border-b border-gray-100 dark:border-dark-card-border"
    >
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-dark-tertiary rounded-xl overflow-hidden relative border border-gray-100 dark:border-dark-card-border">
            {(() => {
              const effectiveImage = blog.featuredImage || extractFirstImage(blog.content) || '/images/blog-fallback.png';
              return (
                <Image
                  src={normalizeImageUrl(effectiveImage)}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              );
            })()}
          </div>
          <div className="max-w-[200px] text-right">
            <p className="text-sm font-bold text-accent-500 dark:text-dark-text-primary truncate">
              {blog.title}
            </p>
            <p className="text-[11px] text-accent-400 dark:text-dark-text-secondary line-clamp-1">
              {blog.excerpt}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border border-white dark:border-dark-card-border">
            {blog.author?.profilePicture ? (
              <Image
                src={normalizeImageUrl(blog.author.profilePicture)}
                alt=""
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-primary-600" />
            )}
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-gray-900 dark:text-white">
              {blog.author?.name || 'مبدع غير معروف'}
            </div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
               <Mail className="w-3 h-3 text-primary-500" />
               {blog.author?.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-dark-tertiary text-accent-500 dark:text-dark-text-primary border border-gray-200 dark:border-dark-card-border">
          <Tag className="w-3 h-3" />
          {blog.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${config.bg} dark:${config.darkBg} ${config.text} dark:${config.darkText}`}>
          <config.icon className="w-3.5 h-3.5" />
          {config.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="text-xs text-accent-500 dark:text-dark-text-secondary flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 opacity-50" />
          {formatDate(blog.createdAt)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(blog)}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors group/btn"
            title="عرض التفاصيل"
          >
            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>

          {blog.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange(blog._id, 'published')}
                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors group/btn"
                title="موافقة"
              >
                <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => handleStatusChange(blog._id, 'rejected')}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors group/btn"
                title="رفض"
              >
                <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            </>
          )}

          {blog.status === 'published' && (
            <button
              onClick={() => handleStatusChange(blog._id, 'rejected')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary text-accent-500 dark:text-dark-text-secondary rounded-lg transition-colors group/btn"
              title="إلغاء النشن"
            >
              <XCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          )}

          {blog.status === 'rejected' && (
            <button
              onClick={() => handleStatusChange(blog._id, 'published')}
              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors group/btn"
              title="موافقة مجدداً"
            >
              <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
});

BlogTableRow.displayName = 'BlogTableRow';

export default function BlogTable({
  blogs,
  loading,
  handleViewDetails,
  handleStatusChange,
  formatDate,
  normalizeImageUrl,
  setSelectedStatus
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-dark-secondary rounded-2xl border border-gray-200 dark:border-dark-card-border shadow-medium overflow-hidden mb-8"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-tertiary/50 border-b border-gray-100 dark:border-dark-card-border">
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المقال</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">المؤلف</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">التصنيف</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-accent-400 dark:text-dark-text-tertiary uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-card-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-8">
                    <div className="h-10 bg-gray-100 dark:bg-dark-tertiary rounded-xl w-full"></div>
                  </td>
                </tr>
              ))
            ) : blogs.length > 0 ? (
              blogs.map((blog, idx) => (
                <BlogTableRow
                  key={blog._id}
                  blog={blog}
                  idx={idx}
                  handleViewDetails={handleViewDetails}
                  handleStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  normalizeImageUrl={normalizeImageUrl}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 dark:bg-dark-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-accent-200 dark:text-dark-text-quaternary" />
                  </div>
                  <h3 className="heading-3 mb-2">لا توجد مقالات</h3>
                  <p className="body-large">لم يتم العثور على أي مقالات حسب الفلتر المختار.</p>
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="mt-4 text-primary-500 font-bold hover:underline animate-pulse"
                  >
                    إزالة الفلاتر
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
