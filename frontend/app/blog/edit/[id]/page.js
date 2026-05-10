'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../contexts/ToastContext';
import api from '../../../../lib/api';
import SuccessModal from '../../../../components/SuccessModal';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Edit3, User, Eye, 
  FileText, ChevronRight, X, Zap, 
  MessageSquare, Clock, ArrowLeft, Bookmark, Save
} from 'lucide-react';

const RichTextEditor = dynamic(() => import('../../../../components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-50/50 dark:bg-dark-tertiary/20 h-[400px] rounded-2xl w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
});

const categories = [
  // الإنتاجية والتنظيم
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "التخطيط", value: "التخطيط" },
  { name: "إدارة الوقت", value: "إدارة الوقت" },
  { name: "الهدف والتطوير", value: "الهدف والتطوير" },
  { name: "التقنية", value: "التقنية" },
  { name: "البرمجة", value: "البرمجة" },
  { name: "الذكاء الاصطناعي", value: "الذكاء الاصطناعي" },
  { name: "تصميم", value: "تصميم" },
  { name: "التسويق", value: "التسويق" },
  { name: "نوشن", value: "نوشن" },
  { name: "التعليم", value: "التعليم" },
  { name: "الصحة", value: "الصحة" },
  { name: "اللياقة البدنية", value: "اللياقة البدنية" },
  { name: "المالية", value: "المالية" },
  { name: "الاستثمار", value: "الاستثمار" },
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "الطعام", value: "الطعام" },
  { name: "السفر", value: "السفر" },
  { name: "الموضة", value: "الموضة" },
  { name: "العلوم", value: "العلوم" },
  { name: "عام", value: "عام" }
];

function EditBlogPageContent() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;
  const { user, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [],
    tags: [],
    status: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // Category search state
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Tags state
  const [tagInput, setTagInput] = useState('');

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId || !user) return;
      try {
        setLoading(true);
        ensureTokenInHeaders();
        const response = await api.get(`/blogs/by-id/${blogId}`);
        if (response.data.success) {
          const blog = response.data.blog;
          setFormData({
            title: blog.title || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            categories: blog.categories || (blog.category ? [blog.category] : []),
            tags: Array.isArray(blog.tags) ? blog.tags : [],
            status: blog.status || 'draft'
          });
        }
      } catch (error) {
        showError('فشل في تحميل بيانات المقال');
        router.push('/profile?tab=blogs');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId, user, router, ensureTokenInHeaders]);

  // Redirect if not authenticated or not approved creator
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const stripHtml = (html) => {
    if (typeof document === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCategory = (category) => {
    if (!formData.categories.includes(category.value) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category.value]
      }));
    }
    setCategorySearch('');
    setShowCategoryDropdown(false);
  };

  const removeCategory = (categoryValue) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== categoryValue)
    }));
  };

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !formData.tags.includes(trimmed) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmed]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e, submissionType = 'update') => {
    if (e) e.preventDefault();
    if (!user) { showError('يجب تسجيل الدخول أولاً'); return; }

    const plainContent = stripHtml(formData.content);
    
    if (!formData.title.trim() || plainContent.length < 50) {
      showError('يرجى إدخال عنوان ومحتوى كافٍ للمقال');
      return;
    }

    try {
      setSubmitting(true);
      ensureTokenInHeaders();

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.categories[0],
        categories: formData.categories,
        tags: formData.tags,
        status: submissionType === 'review' ? 'pending' : (formData.status === 'published' ? undefined : formData.status)
      };

      const response = await api.put(`/blogs/${blogId}`, blogData);
      if (response.data.success) {
        showSuccess(response.data.message || 'تم تحديث المقال بنجاح!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء تحديث المقال');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-sm font-black text-gray-500 animate-pulse uppercase tracking-widest">جاري تحميل بيانات المقال...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Executive Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-30">
        <div className="container-custom py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Edit3 className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">تعديل المقال</h1>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-secondary font-bold">
                  <span>لوحة التحكم</span>
                  <span className="opacity-30">•</span>
                  <span className="text-blue-600 dark:text-blue-400">تحديث المحتوى</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               <button
                onClick={() => router.push('/profile?tab=blogs')}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-500 hover:text-gray-900 dark:text-dark-text-secondary dark:hover:text-dark-text-primary transition-colors bg-gray-50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer"
              >
                <ChevronRight size={16} />
                مقالاتي
              </button>
              
              <button
                onClick={(e) => handleSubmit(e, formData.status === 'published' ? 'update' : 'review')}
                disabled={submitting}
                className="btn-primary text-xs sm:text-sm font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border-none shadow-glow flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                <span>{formData.status === 'published' ? 'حفظ التعديلات' : 'نشر للمراجعة'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Side: Form */}
          <div className="flex-1 space-y-8">
            <form className="space-y-8">
              {/* Segment 1: Blog Identity */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center text-indigo-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">هوية المقال</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">عدل العنوان والملخص التعريفي</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">عنوان المقال *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="عنوان المقال..."
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-blue-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">ملخص المقال *</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="نبذة مختصرة عن محتوى المقال..."
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-blue-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Segment 2: Deep Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-500">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">المحتوى التفصيلي</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">قم بتحديث وتنسيق محتوى مقالك</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-dark-tertiary/20 rounded-3xl p-1 border border-gray-100 dark:border-white/5 min-h-[400px]">
                  <RichTextEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="ابدأ رحلة الكتابة هنا..."
                  />
                </div>
              </motion.div>

              {/* Segment 3: Categorization */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative z-20 overflow-visible"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-500">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">التصنيفات والوسوم</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">تأكد من اختيار التصنيفات الصحيحة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Categories */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">الفئات المختارة ({formData.categories.length}/3)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {formData.categories.map(c => (
                         <span key={c} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[10px] font-black flex items-center gap-2">
                           {c}
                           <X size={12} className="cursor-pointer" onClick={() => removeCategory(c)} />
                         </span>
                       ))}
                    </div>
                    <div className="relative" ref={categoryDropdownRef}>
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => { setCategorySearch(e.target.value); setShowCategoryDropdown(true); }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        placeholder="ابحث عن فئة..."
                        className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none"
                      />
                      <AnimatePresence>
                        {showCategoryDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl max-h-48 overflow-y-auto"
                          >
                            {categories.filter(c => c.name.includes(categorySearch)).map(cat => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => addCategory(cat)}
                                className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary text-sm font-bold text-gray-700 dark:text-dark-text-primary transition-colors"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">الوسوم ({formData.tags.length}/10)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {formData.tags.map(tag => (
                         <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary rounded-lg text-[10px] font-black flex items-center gap-2">
                           {tag}
                           <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                         </span>
                       ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                      placeholder="اكتب ووسم واضغط Enter..."
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            </form>
          </div>

          {/* Right Side: Sticky Preview */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">معاينة مباشرة</h3>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Live Preview</span>
                </div>
              </div>

              {/* Blog Card Preview */}
              <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-4 shadow-2xl shadow-blue-500/10 transition-all group overflow-hidden">
                <div className="aspect-video rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 relative mb-4 flex items-center justify-center">
                   <div className="text-center p-6">
                      <FileText size={40} className="text-white/20 mx-auto mb-2" />
                      <h4 className="text-white text-base font-black leading-tight line-clamp-2">
                        {formData.title || 'عنوان المقال الجديد'}
                      </h4>
                   </div>
                   <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-white/10">
                      {formData.status === 'published' ? 'Published' : 'Draft / Pending'}
                   </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    {formData.categories.slice(0, 1).map(cat => (
                       <span key={cat} className="text-[9px] font-black text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-md uppercase">
                          {cat}
                       </span>
                    ))}
                  </div>
                  
                  <p className="text-[11px] font-bold text-gray-400 dark:text-dark-text-secondary line-clamp-3 leading-relaxed mb-6 min-h-[48px]">
                    {formData.excerpt || 'هنا سيظهر الملخص المختصر للمقال بعد التحديث...'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center border border-gray-200 dark:border-white/10">
                          <User size={12} className="text-gray-400" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-900 dark:text-dark-text-primary uppercase tracking-tighter">
                             {user?.name || 'المبدع'}
                          </span>
                          <span className="text-[8px] font-bold text-gray-400">تعديل الآن</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                       <div className="flex items-center gap-1">
                          <MessageSquare size={10} />
                          <span className="text-[8px] font-black">--</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Bookmark size={10} />
                          <span className="text-[8px] font-black">--</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-gray-50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${formData.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <h5 className="text-[10px] font-black text-gray-500 dark:text-dark-text-secondary uppercase tracking-widest">حالة المقال الحالية</h5>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-black text-gray-900 dark:text-dark-text-primary uppercase tracking-tight">
                      {formData.status === 'published' ? 'منشور علناً' : formData.status === 'pending' ? 'قيد المراجعة' : 'مسودة'}
                   </span>
                   {formData.status === 'published' && (
                     <Eye className="w-4 h-4 text-emerald-500" />
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile?tab=blogs');
        }}
        title="تم تحديث المقال بنجاح! 🎉"
        message="لقد تم حفظ تعديلاتك بنجاح. يمكنك رؤية التحديثات في مدونتك الآن."
        continueButtonText="الذهاب لمقالاتي"
      />
    </div>
  );
}

export default function EditBlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300"></div>}>
      <EditBlogPageContent />
    </Suspense>
  );
}
