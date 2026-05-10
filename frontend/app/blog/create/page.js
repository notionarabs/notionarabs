'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Send, Loader2, Edit3, Layout, User, Eye, 
  Download, FileText, ChevronRight, X, Zap, 
  MessageSquare, Clock, ArrowLeft, Bookmark
} from 'lucide-react';

const RichTextEditor = dynamic(() => import('../../../components/RichTextEditor'), {
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

function CreateBlogPageContent() {
  const router = useRouter();
  const { user, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [],
    tags: []
  });

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

  // Redirect if not authenticated or not approved creator
  useEffect(() => {
    ensureTokenInHeaders();
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }
  }, [authLoading, user, router, ensureTokenInHeaders]);

  const stripHtml = (html) => {
    if (typeof document === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const hasMeaningfulContent = (data) => {
    const plainContent = stripHtml(data.content || '').trim();
    return (
      data.title?.trim() ||
      plainContent ||
      data.excerpt?.trim() ||
      (data.categories && data.categories.length > 0) ||
      (data.tags && data.tags.length > 0)
    );
  };

  // Auto-save
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      if (hasMeaningfulContent(formData)) {
        const draftData = { ...formData, timestamp: new Date().toISOString() };
        localStorage.setItem('blogDraft', JSON.stringify(draftData));
        setLastSaved(new Date());
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        if (hasMeaningfulContent(draftData)) {
          setFormData({
            title: draftData.title || '',
            excerpt: draftData.excerpt || '',
            content: draftData.content || '',
            categories: (draftData.categories || []).filter(Boolean),
            tags: Array.isArray(draftData.tags) ? draftData.tags : [],
          });
          if (draftData.timestamp) setLastSaved(new Date(draftData.timestamp));
          showSuccess('تم استعادة المسودة المحفوظة');
        }
      } catch (e) {}
    }
  }, []);

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

  const handleSubmit = async (e, submissionType = 'draft') => {
    e.preventDefault();
    if (!user) { showError('يجب تسجيل الدخول أولاً'); return; }

    const plainContent = stripHtml(formData.content);
    
    if (!formData.title.trim() || plainContent.length < 50) {
      showError('يرجى إدخال عنوان ومحتوى كافٍ للمقال');
      return;
    }

    if (submissionType === 'review' && (formData.categories.length === 0 || formData.excerpt.length < 20)) {
      showError('يرجى اختيار فئة وكتابة ملخص للمقال قبل الإرسال للمراجعة');
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
        status: submissionType === 'review' ? 'pending' : 'draft'
      };

      const response = await api.post('/blogs', blogData);
      if (response.data.success) {
        showSuccess(response.data.message);
        setShowSuccessModal(true);
        localStorage.removeItem('blogDraft');
        setFormData({ title: '', excerpt: '', content: '', categories: [], tags: [] });
      }
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ أثناء حفظ المقال');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300"></div>;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Premium Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-30">
        <div className="container-custom py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Plus className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">إنشاء مقال جديد</h1>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-secondary font-bold">
                  <span>لوحة المبدعين</span>
                  <span className="opacity-30">•</span>
                  <span className="text-blue-600 dark:text-blue-400">مركز المعرفة</span>
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
                onClick={(e) => handleSubmit(e, 'review')}
                disabled={submitting}
                className="btn-primary text-xs sm:text-sm font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border-none shadow-glow flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                <span>نشر للمراجعة</span>
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
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">هوية المقال</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">ابدأ بعنوان جذاب وملخص مفيد</p>
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
                      placeholder="عنوان مثير للاهتمام..."
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
                      placeholder="نبذة سريعة تظهر في الصفحة الرئيسية..."
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
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">المحتوى التفصيلي</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">استخدم المحرر لتنسيق مقالك بشكل احترافي</p>
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
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">ساعد القراء في العثور على مقالك</p>
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

              {/* Autosave Status */}
              {lastSaved && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  تم الحفظ تلقائياً {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Sticky Preview */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">معاينة المقال</h3>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">مباشر</span>
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
                      Blog Post
                   </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    {formData.categories.slice(0, 1).map(cat => (
                       <span key={cat} className="text-[9px] font-black text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-md uppercase">
                          {cat}
                       </span>
                    ))}
                    {!formData.categories.length && <div className="w-12 h-3 bg-gray-100 dark:bg-dark-tertiary rounded animate-pulse"></div>}
                  </div>
                  
                  <p className="text-[11px] font-bold text-gray-400 dark:text-dark-text-secondary line-clamp-3 leading-relaxed mb-6 min-h-[48px]">
                    {formData.excerpt || 'هنا سيظهر الملخص المختصر الذي تكتبه للمقال، اجعله جذاباً ليشجع المستخدمين على القراءة...'}
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
                          <span className="text-[8px] font-bold text-gray-400">الآن</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                       <div className="flex items-center gap-1">
                          <MessageSquare size={10} />
                          <span className="text-[8px] font-black">0</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Bookmark size={10} />
                          <span className="text-[8px] font-black">0</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-500/10 rounded-[2rem] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h5 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">إرشادات الكتابة</h5>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'استخدم عناوين جذابة وواضحة',
                    'قسم المحتوى إلى فقرات صغيرة',
                    'أضف صوراً أو روابط مفيدة',
                    'راجع الأخطاء الإملائية جيداً'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-blue-700/70 dark:text-blue-500/60 leading-tight">
                       <span className="shrink-0 mt-0.5">•</span>
                       <span>{text}</span>
                    </li>
                  ))}
                </ul>
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
        title="تم إرسال المقال للمراجعة! ⏳"
        message="شكراً لك على مشاركة معرفتك! مقالك قيد المراجعة الآن وسيظهر في المدونة فور الموافقة عليه."
        continueButtonText="الذهاب لمقالاتي"
      />
    </div>
  );
}

export default function CreateBlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300"></div>}>
      <CreateBlogPageContent />
    </Suspense>
  );
}

