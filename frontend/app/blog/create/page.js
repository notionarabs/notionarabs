'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';
import RichTextEditor from '../../../components/RichTextEditor';

const categories = [
  // الإنتاجية والتنظيم
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "التخطيط", value: "التخطيط" },
  { name: "إدارة المشاريع", value: "إدارة المشاريع" },
  { name: "التنظيم", value: "التنظيم" },
  { name: "إدارة الوقت", value: "إدارة الوقت" },
  { name: "الهدف والتطوير", value: "الهدف والتطوير" },

  // التقنية والتطوير
  { name: "التقنية", value: "التقنية" },
  { name: "البرمجة", value: "البرمجة" },
  { name: "تطوير التطبيقات", value: "تطوير التطبيقات" },
  { name: "التطوير الويب", value: "التطوير الويب" },
  { name: "قواعد البيانات", value: "قواعد البيانات" },
  { name: "الأمان السيبراني", value: "الأمان السيبراني" },
  { name: "الذكاء الاصطناعي", value: "الذكاء الاصطناعي" },
  { name: "البلوك تشين", value: "البلوك تشين" },
  { name: "التطبيقات", value: "التطبيقات" },
  { name: "المواقع", value: "المواقع" },

  // التصميم والإبداع
  { name: "تصميم", value: "تصميم" },
  { name: "التصميم الجرافيكي", value: "التصميم الجرافيكي" },
  { name: "التصميم المعماري", value: "التصميم المعماري" },
  { name: "التصوير", value: "التصوير" },
  { name: "الفيديو", value: "الفيديو" },
  { name: "الفنون", value: "الفنون" },
  { name: "الموسيقى", value: "الموسيقى" },
  { name: "الرسم", value: "الرسم" },
  { name: "النحت", value: "النحت" },
  { name: "الإبداع", value: "الإبداع" },

  // التسويق والأعمال
  { name: "التسويق", value: "التسويق" },
  { name: "المبيعات", value: "المبيعات" },
  { name: "خدمة العملاء", value: "خدمة العملاء" },
  { name: "الموارد البشرية", value: "الموارد البشرية" },
  { name: "المحاسبة", value: "المحاسبة" },
  { name: "التجارة الإلكترونية", value: "التجارة الإلكترونية" },
  { name: "الإعلان", value: "الإعلان" },
  { name: "العلاقات العامة", value: "العلاقات العامة" },
  { name: "العلامة التجارية", value: "العلامة التجارية" },
  { name: "الاستراتيجية", value: "الاستراتيجية" },
  { name: "القيادة", value: "القيادة" },
  { name: "الإدارة", value: "الإدارة" },

  // التعليم والتدريب
  { name: "التعليم", value: "التعليم" },
  { name: "التدريب", value: "التدريب" },
  { name: "التطوير المهني", value: "التطوير المهني" },
  { name: "التعليم الإلكتروني", value: "التعليم الإلكتروني" },
  { name: "اللغات", value: "اللغات" },
  { name: "الكتابة", value: "الكتابة" },
  { name: "الترجمة", value: "الترجمة" },

  // الصحة واللياقة
  { name: "الصحة", value: "الصحة" },
  { name: "اللياقة البدنية", value: "اللياقة البدنية" },
  { name: "الرياضة", value: "الرياضة" },
  { name: "اليوغا", value: "اليوغا" },
  { name: "الرقص", value: "الرقص" },
  { name: "الملاكمة", value: "الملاكمة" },
  { name: "السباحة", value: "السباحة" },
  { name: "الجري", value: "الجري" },
  { name: "ركوب الدراجات", value: "ركوب الدراجات" },
  { name: "التسلق", value: "التسلق" },
  { name: "التغذية", value: "التغذية" },
  { name: "الطب", value: "الطب" },
  { name: "التمريض", value: "التمريض" },
  { name: "العلاج الطبيعي", value: "العلاج الطبيعي" },

  // المالية والاستثمار
  { name: "المالية", value: "المالية" },
  { name: "الاستثمار", value: "الاستثمار" },
  { name: "العقارات", value: "العقارات" },
  { name: "التأمين", value: "التأمين" },
  { name: "القانون", value: "القانون" },
  { name: "التجارة", value: "التجارة" },

  // الحياة الشخصية
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "العلاقات", value: "العلاقات" },
  { name: "الأسرة", value: "الأسرة" },
  { name: "الأطفال", value: "الأطفال" },
  { name: "الزواج", value: "الزواج" },
  { name: "التربية", value: "التربية" },
  { name: "علم النفس", value: "علم النفس" },
  { name: "علم الاجتماع", value: "علم الاجتماع" },
  { name: "الفلسفة", value: "الفلسفة" },

  // الطعام والطبخ
  { name: "الطعام", value: "الطعام" },
  { name: "الطبخ", value: "الطبخ" },
  { name: "الحلويات", value: "الحلويات" },
  { name: "المشروبات", value: "المشروبات" },
  { name: "المطاعم", value: "المطاعم" },
  { name: "الطبخ المنزلي", value: "الطبخ المنزلي" },

  // السفر والترفيه
  { name: "السفر", value: "السفر" },
  { name: "الترفيه", value: "الترفيه" },
  { name: "السياحة", value: "السياحة" },
  { name: "الفندقة", value: "الفندقة" },
  { name: "الألعاب", value: "الألعاب" },
  { name: "الرياضة الإلكترونية", value: "الرياضة الإلكترونية" },
  { name: "الألعاب الجماعية", value: "الألعاب الجماعية" },
  { name: "ألعاب الفيديو", value: "ألعاب الفيديو" },
  { name: "ألعاب الطاولة", value: "ألعاب الطاولة" },
  { name: "الألغاز", value: "الألغاز" },

  // الموضة والجمال
  { name: "الموضة", value: "الموضة" },
  { name: "الجمال", value: "الجمال" },
  { name: "التجميل", value: "التجميل" },
  { name: "العناية بالبشرة", value: "العناية بالبشرة" },
  { name: "العناية بالشعر", value: "العناية بالشعر" },
  { name: "الأظافر", value: "الأظافر" },
  { name: "العطور", value: "العطور" },
  { name: "الملابس", value: "الملابس" },
  { name: "الأحذية", value: "الأحذية" },
  { name: "الحقائب", value: "الحقائب" },
  { name: "الساعات", value: "الساعات" },
  { name: "النظارات", value: "النظارات" },
  { name: "الإكسسوارات", value: "الإكسسوارات" },

  // المنزل والحديقة
  { name: "المنزل", value: "المنزل" },
  { name: "الحديقة", value: "الحديقة" },
  { name: "الزراعة المنزلية", value: "الزراعة المنزلية" },
  { name: "الديكور", value: "الديكور" },
  { name: "الأثاث", value: "الأثاث" },
  { name: "الأدوات", value: "الأدوات" },
  { name: "الأجهزة", value: "الأجهزة" },
  { name: "الزراعة", value: "الزراعة" },
  { name: "البيئة", value: "البيئة" },
  { name: "الطاقة", value: "الطاقة" },
  { name: "البناء", value: "البناء" },
  { name: "الهندسة", value: "الهندسة" },
  { name: "العمارة", value: "العمارة" },

  // السيارات والنقل
  { name: "السيارات", value: "السيارات" },
  { name: "النقل", value: "النقل" },
  { name: "الطيران", value: "الطيران" },
  { name: "البحرية", value: "البحرية" },
  { name: "اللوجستيات", value: "اللوجستيات" },

  // العلوم والأكاديميا
  { name: "العلوم", value: "العلوم" },
  { name: "الرياضيات", value: "الرياضيات" },
  { name: "الفيزياء", value: "الفيزياء" },
  { name: "الكيمياء", value: "الكيمياء" },
  { name: "الأحياء", value: "الأحياء" },
  { name: "التاريخ", value: "التاريخ" },
  { name: "الجغرافيا", value: "الجغرافيا" },
  { name: "الأدب", value: "الأدب" },
  { name: "الشعر", value: "الشعر" },
  { name: "المسرح", value: "المسرح" },
  { name: "السينما", value: "السينما" },

  // الحرف اليدوية
  { name: "الحرف اليدوية", value: "الحرف اليدوية" },
  { name: "النجارة", value: "النجارة" },
  { name: "الخياطة", value: "الخياطة" },
  { name: "الحياكة", value: "الحياكة" },
  { name: "الرسم على الزجاج", value: "الرسم على الزجاج" },
  { name: "الخزف", value: "الخزف" },
  { name: "المجوهرات", value: "المجوهرات" },

  // الحيوانات الأليفة
  { name: "الحيوانات الأليفة", value: "الحيوانات الأليفة" },
  { name: "القطط", value: "القطط" },
  { name: "الكلاب", value: "الكلاب" },
  { name: "الأسماك", value: "الأسماك" },
  { name: "الطيور", value: "الطيور" },

  // البرامج والأدوات
  { name: "البرامج", value: "البرامج" },
  { name: "نوشن", value: "نوشن" },
  { name: "أدوات الإنتاجية", value: "أدوات الإنتاجية" },
  { name: "أدوات التصميم", value: "أدوات التصميم" },
  { name: "أدوات التطوير", value: "أدوات التطوير" },

  // الأخبار والمراجعات
  { name: "الأخبار", value: "الأخبار" },
  { name: "المراجعات", value: "المراجعات" },
  { name: "المراجعات التقنية", value: "المراجعات التقنية" },
  { name: "مراجعات المنتجات", value: "مراجعات المنتجات" },
  { name: "مراجعات الخدمات", value: "مراجعات الخدمات" },

  // النصائح والتوجيه
  { name: "نصائح", value: "نصائح" },
  { name: "التوجيه المهني", value: "التوجيه المهني" },
  { name: "النصائح المالية", value: "النصائح المالية" },
  { name: "نصائح الصحة", value: "نصائح الصحة" },
  { name: "نصائح السفر", value: "نصائح السفر" },
  { name: "نصائح الطبخ", value: "نصائح الطبخ" },

  // ديني وروحاني
  { name: "ديني", value: "ديني" },
  { name: "الروحانيات", value: "الروحانيات" },
  { name: "التأمل", value: "التأمل" },
  { name: "التطوير الذاتي", value: "التطوير الذاتي" },

  // عام ومتنوع
  { name: "عام", value: "عام" },
  { name: "متنوع", value: "متنوع" },
  { name: "ثقافة", value: "ثقافة" },
  { name: "مجتمع", value: "مجتمع" },
  { name: "أحداث", value: "أحداث" },
  { name: "تحديات", value: "تحديات" },
  { name: "قصص نجاح", value: "قصص نجاح" },
  { name: "تجارب شخصية", value: "تجارب شخصية" }
];

// Removed statusOptions as we now use buttons instead of dropdown

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, loading: authLoading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categories: [], // Changed to array for multi-category selection
    tags: [] // Changed to array for tag-based input
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
  const tagInputRef = useRef(null);

  // Blog preview state
  const [showPreview, setShowPreview] = useState(false);

  // Prevent duplicate draft restoration messages
  const [draftRestored, setDraftRestored] = useState(false);
  const hasRestoredDraftRef = useRef(false);

  // Redirect if not authenticated or not approved creator
  useEffect(() => {
    // Ensure token is set in headers when component mounts
    ensureTokenInHeaders();

    if (!authLoading && !user) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
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

  // Helper to check if there's actual content to save/restore
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

  // Auto-save functionality (Debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      if (hasMeaningfulContent(formData)) {
        const draftData = {
          ...formData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('blogDraft', JSON.stringify(draftData));
        setLastSaved(new Date());
      } else {
        // If content was cleared, remove the draft and clear the status
        if (localStorage.getItem('blogDraft')) {
          localStorage.removeItem('blogDraft');
        }
        setLastSaved(null);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [formData]);

  // Clear "Auto-saved" status immediately if form is emptied manually
  useEffect(() => {
    if (!hasMeaningfulContent(formData)) {
      setLastSaved(null);
    }
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    // Prevent double execution in Strict Mode or re-renders
    if (hasRestoredDraftRef.current) return;

    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);

        // Mark as handled immediately to prevent double toast
        hasRestoredDraftRef.current = true;

        if (hasMeaningfulContent(draftData)) {
          setFormData({
            title: draftData.title || '',
            excerpt: draftData.excerpt || '',
            content: draftData.content || '',
            categories: (draftData.categories || (draftData.category ? [draftData.category] : [])).filter(Boolean),
            tags: Array.isArray(draftData.tags) ? draftData.tags : (draftData.tags ? [draftData.tags] : []),
          });

          if (draftData.timestamp) {
            setLastSaved(new Date(draftData.timestamp));
          }

          showSuccess('تم استعادة المسودة المحفوظة');
          setDraftRestored(true);
        } else {
          // If the draft exists but is empty, clean it up
          localStorage.removeItem('blogDraft');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [showSuccess]);

  // Handle click outside to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear draft when form is successfully submitted
  const clearDraft = () => {
    localStorage.removeItem('blogDraft');
    setLastSaved(null);
  };


  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'عنوان المقال مطلوب';
        } else if (value.length > 200) {
          newErrors.title = 'العنوان يجب أن يكون أقل من 200 حرف';
        } else {
          delete newErrors.title;
        }
        break;
      case 'excerpt':
        if (!value.trim()) {
          newErrors.excerpt = 'ملخص المقال مطلوب';
        } else if (value.length < 50) {
          newErrors.excerpt = 'الملخص يجب أن يكون على الأقل 50 حرف';
        } else if (value.length > 500) {
          newErrors.excerpt = 'الملخص يجب أن يكون أقل من 500 حرف';
        } else {
          delete newErrors.excerpt;
        }
        break;
      case 'content':
        const textContent = stripHtml(value);
        if (!textContent.trim()) {
          newErrors.content = 'محتوى المقال مطلوب';
        } else if (textContent.length < 300) {
          newErrors.content = 'المحتوى يجب أن يكون على الأقل 300 حرف';
        } else {
          delete newErrors.content;
        }
        break;
      case 'categories':
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors.categories = 'فئة المقال مطلوبة';
        } else {
          delete newErrors.categories;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);

    // Show preview when title is entered
    if (name === 'title') {
      setShowPreview(value.trim().length > 0);
    }

    // Keep preview visible if title exists
    if (name !== 'title' && formData.title.trim().length > 0) {
      setShowPreview(true);
    }
  };

  // Category search and selection functions
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
    !formData.categories.includes(category.value) // Don't show already selected categories
  ).slice(0, 20); // Limit to 20 results for better performance

  const handleCategorySearch = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
  };

  const handleCategorySelect = (category) => {
    if (!formData.categories.includes(category.value) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category.value]
      }));
    }
    setCategorySearch('');
    // Keep dropdown open for multiple selections
  };

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
  };

  // Tag management functions
  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (trimmedTag && !currentTags.includes(trimmedTag) && currentTags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...currentTags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: Array.isArray(prev.tags) ? prev.tags.filter(tag => tag !== tagToRemove) : []
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && Array.isArray(formData.tags) && formData.tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowCategoryDropdown(false);
      setCategorySearch('');
    }
  };


  const handleSubmit = async (e, submissionType = 'draft') => {
    e.preventDefault();

    if (!user) {
      showError('يجب تسجيل الدخول أولاً');
      return;
    }

    // Validate fields based on submission type
    const isTitleValid = validateField('title', formData.title);
    const isContentValid = validateField('content', formData.content);

    // For review submission, validate all fields
    if (submissionType === 'review') {
      const isExcerptValid = validateField('excerpt', formData.excerpt);
      const isCategoryValid = validateField('categories', formData.categories);

      if (!isTitleValid || !isExcerptValid || !isContentValid || !isCategoryValid) {
        showError('يرجى تصحيح الأخطاء في النموذج');
        return;
      }
    } else {
      // For draft submission, only validate title and content
      if (!isTitleValid || !isContentValid) {
        showError('يرجى إدخال عنوان المقال ومحتوى المقال');
        return;
      }
    }

    try {
      setSubmitting(true);

      // Ensure token is set in headers before making API call
      const hasToken = ensureTokenInHeaders();
      if (!hasToken) {
        showError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }

      // Tags are already an array
      const tagsArray = formData.tags;

      const blogData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.categories[0], // Send first category as single category field
        categories: formData.categories, // Also send full array for future use
        tags: tagsArray,
        status: submissionType === 'review' ? 'pending' : 'draft'
      };

      // Remove undefined values
      Object.keys(blogData).forEach(key => {
        if (blogData[key] === undefined) {
          delete blogData[key];
        }
      });


      const response = await api.post('/blogs', blogData);

      if (response.data.success) {
        showSuccess(response.data.message);
        setShowSuccessModal(true);
        clearDraft();

        // Clear form
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          categories: [],
          tags: '',
        });
      }
    } catch (error) {
      console.error('Blog creation error:', error);

      if (error.response?.status === 409) {
        showError(error.response.data.message);
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('حدث خطأ أثناء إنشاء المقال. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not an approved creator
  if (!authLoading && user && user.creatorStatus !== 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-dark-secondary dark:to-dark-tertiary text-white py-8 md:py-12 lg:py-16">
        <div className="container-custom text-center px-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">إنشاء مقال جديد</h1>
          <p className="text-sm md:text-base lg:text-lg text-primary-100 dark:text-dark-text-secondary max-w-2xl mx-auto px-4">
            شارك معرفتك وخبرتك مع مجتمع عرب نوشن من خلال إنشاء مقال مفيد ومفيد
          </p>
          <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 px-4">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="btn-outline inline-flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة للملف الشخصي
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile/my-blogs')}
              className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              الذهاب إلى مقالاتي
            </button>
          </div>
        </div>
      </section>

      {/* Blog Creation Form */}
      <section className="py-6 md:py-8 lg:py-12 px-4">
        <div className="container-custom max-w-4xl">
          <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-medium dark:shadow-dark-medium p-4 md:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4h6" />
                  </svg>
                  عنوان المقال *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input text-base md:text-lg ${errors.title ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                  placeholder="اكتب عنوان المقال هنا..."
                  required
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.title.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {formData.title.length}/200 حرف
                    </p>
                  </div>
                  {errors.title && (
                    <p className="text-xs text-red-500 font-medium">{errors.title}</p>
                  )}
                </div>

                {/* Blog Preview Card */}
                {showPreview && (
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xs md:text-sm font-semibold text-orange-700 dark:text-orange-300">معاينة المقال</h3>
                    </div>

                    {/* Blog Card Preview */}
                    <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-lg border border-gray-200 dark:border-dark-card-border overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Auto-Generated Featured Image */}
                      <div className="relative w-full h-32 md:h-40 lg:h-48 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full opacity-30"></div>
                          <div className="absolute top-12 right-8 w-8 h-8 bg-white rounded-full opacity-20"></div>
                          <div className="absolute bottom-8 left-12 w-12 h-12 bg-white rounded-full opacity-25"></div>
                          <div className="absolute bottom-4 right-4 w-6 h-6 bg-white rounded-full opacity-30"></div>
                          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white rounded-full opacity-20"></div>
                        </div>

                        {/* Main Content Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

                        {/* Generated Image Content */}
                        <div className="absolute inset-0 flex flex-col justify-center items-center p-3 md:p-4 lg:p-6 text-center">
                          {/* Blog Icon */}
                          <div className="mb-2 md:mb-3 lg:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white border-opacity-30">
                              <svg className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                              </svg>
                            </div>
                          </div>

                          {/* Auto-generated Title */}
                          <h3 className="text-white text-sm md:text-base lg:text-lg font-bold leading-tight mb-1 md:mb-2 drop-shadow-lg max-w-full px-2">
                            {formData.title || 'مقال جديد'}
                          </h3>

                          {/* Auto-generated Subtitle */}
                          <p className="text-white text-xs md:text-sm opacity-90 max-w-full px-2">
                            {formData.excerpt ?
                              (formData.excerpt.length > 80 ? formData.excerpt.substring(0, 80) + '...' : formData.excerpt) :
                              'اكتشف المزيد في هذا المقال المميز'
                            }
                          </p>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 md:p-3 lg:p-4">
                          <div className="flex items-center justify-between gap-2">
                            {/* Categories */}
                            {formData.categories.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {formData.categories.slice(0, 2).map((categoryValue, index) => {
                                  const category = categories.find(c => c.value === categoryValue);
                                  return (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-md text-[10px] md:text-xs font-medium border border-white border-opacity-30"
                                    >
                                      {category?.name}
                                    </span>
                                  );
                                })}
                                {formData.categories.length > 2 && (
                                  <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-md text-[10px] md:text-xs font-medium border border-white border-opacity-30">
                                    +{formData.categories.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Author and Date */}
                            <div className="flex items-center gap-1 md:gap-2 text-white text-xs md:text-sm opacity-90">
                              <div className="w-5 h-5 md:w-6 md:h-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white border-opacity-30">
                                <span className="text-white text-[10px] md:text-xs font-bold">
                                  {user?.name?.charAt(0)?.toUpperCase() || 'ك'}
                                </span>
                              </div>
                              <span className="hidden sm:inline">{user?.name || 'كاتب المقال'}</span>
                              <span className="hidden sm:inline mx-1 md:mx-2">•</span>
                              <span>الآن</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 md:p-5 lg:p-6">
                        {/* Read More Link */}
                        <div className="flex items-center justify-between">
                          <button className="inline-flex items-center gap-1 md:gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-xs md:text-sm transition-colors">
                            <span>اقرأ المزيد</span>
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>

                          {/* Engagement Stats */}
                          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 dark:text-dark-text-tertiary">
                            <div className="flex items-center gap-0.5 md:gap-1">
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>0</span>
                            </div>
                            <div className="flex items-center gap-0.5 md:gap-1">
                              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] md:text-xs text-orange-600 dark:text-orange-400 mt-2 md:mt-3 text-center">
                      💡 هذا هو شكل مقالك في المدونة
                    </p>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ملخص المقال *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className={`form-input resize-none text-sm md:text-base ${errors.excerpt ? 'border-red-500 focus:border-red-500 ring-red-200' : 'focus:ring-primary-200'}`}
                  placeholder="اكتب ملخص مختصر للمقال..."
                  required
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.excerpt.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {formData.excerpt.length}/500 حرف
                    </p>
                  </div>
                  {errors.excerpt && (
                    <p className="text-xs text-red-500 font-medium">{errors.excerpt}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  محتوى المقال *
                </label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => {
                    setFormData(prev => ({ ...prev, content }));
                  }}
                  placeholder="ابدا بكتابة مقالك هنا... يمكنك استخدام العناوين والقوائم لتنسيق المحتوى."
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stripHtml(formData.content).length >= 300 ? 'bg-green-500' : stripHtml(formData.content).length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                      {stripHtml(formData.content).length} حرف (الحد الأدنى: 300 حرف)
                    </p>
                  </div>
                  {errors.content && (
                    <p className="text-xs text-red-500 font-medium">{errors.content}</p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    فئات المقال *
                  </div>
                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                    {formData.categories.filter(Boolean).length}/3
                  </span>
                </label>

                {/* Category Multi-Select Input */}
                <div className="relative" ref={categoryDropdownRef}>
                  <div className={`form-input w-full min-h-[2.5rem] md:min-h-[3rem] px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 border-2 border-gray-200 dark:border-dark-input-border focus-within:border-primary-500 dark:focus-within:border-primary-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-400 flex flex-wrap items-center gap-1.5 md:gap-2 ${errors.categories ? 'border-red-500 focus-within:border-red-500' : ''}`}>
                    {/* Selected Categories Inside Input */}
                    {formData.categories.filter(Boolean).map((categoryValue, index) => {
                      const category = categories.find(c => c.value === categoryValue);
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs md:text-sm font-medium"
                        >
                          {category?.name || categoryValue}
                          <button
                            type="button"
                            onClick={() => removeCategory(categoryValue)}
                            className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      );
                    })}

                    {/* Search Input */}
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={handleCategorySearch}
                      onFocus={() => formData.categories.length < 3 && setShowCategoryDropdown(true)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => {
                        setTimeout(() => setShowCategoryDropdown(false), 200);
                      }}
                      placeholder={
                        formData.categories.length >= 3
                          ? "تم الوصول للحد الأقصى (3 فئات)"
                          : formData.categories.length > 0
                            ? "أضف فئة أخرى..."
                            : "ابحث عن الفئة..."
                      }
                      disabled={formData.categories.length >= 3}
                      className="flex-1 min-w-[100px] md:min-w-[120px] bg-transparent outline-none text-sm md:text-base text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="off"
                    />
                  </div>

                  {/* Search/Clear icon */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {categorySearch ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCategorySearch('');
                          setShowCategoryDropdown(false);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="مسح البحث"
                      >
                        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>

                  {/* Dropdown */}
                  {showCategoryDropdown && formData.categories.length < 3 && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        <>
                          {filteredCategories.map((category, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleCategorySelect(category)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary transition-colors border-b border-gray-100 dark:border-dark-card-border last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span>{category.name}</span>
                              </div>
                            </button>
                          ))}
                          {/* Show message if there are more results */}
                          {categories.filter(category =>
                            category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                            !formData.categories.includes(category.value)
                          ).length > 20 && (
                              <div className="px-4 py-2 text-xs text-gray-500 dark:text-dark-text-tertiary text-center bg-gray-50 dark:bg-dark-tertiary border-t border-gray-100 dark:border-dark-card-border">
                                عرض 20 من {categories.filter(category =>
                                  category.name.toLowerCase().includes(categorySearch.toLowerCase()) &&
                                  !formData.categories.includes(category.value)
                                ).length} نتيجة. اكتب أكثر للبحث المحدد.
                              </div>
                            )}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-gray-500 dark:text-dark-text-tertiary text-center">
                          <svg className="w-6 h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          لا توجد فئات مطابقة
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.categories && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errors.categories}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-semibold text-accent-600 dark:text-dark-text-primary mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    العلامات
                  </div>
                  <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                    {Array.isArray(formData.tags) ? formData.tags.length : 0}/10
                  </span>
                </label>

                {/* Tag Input */}
                <div className="relative">
                  <div className="form-input w-full min-h-[2.5rem] md:min-h-[3rem] px-3 md:px-4 py-2 md:py-3 pr-10 md:pr-12 border-2 border-gray-200 dark:border-dark-input-border focus-within:border-primary-500 dark:focus-within:border-primary-500 rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-400 flex flex-wrap items-center gap-1.5 md:gap-2">
                    {/* Selected Tags */}
                    {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs md:text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}

                    {/* Tag Input Field */}
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder={(Array.isArray(formData.tags) ? formData.tags.length : 0) >= 10 ? "تم الوصول للحد الأقصى (10 علامات)" : (Array.isArray(formData.tags) ? formData.tags.length : 0) > 0 ? "أضف علامة..." : "اكتب علامة واضغط Enter"}
                      disabled={(Array.isArray(formData.tags) ? formData.tags.length : 0) >= 10}
                      className="flex-1 min-w-[140px] md:min-w-[200px] bg-transparent outline-none text-sm md:text-base text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="off"
                    />
                  </div>

                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>

                <p className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                  اضغط Enter لإضافة علامة. الحد الأقصى 10 علامات
                </p>
              </div>


              {/* Save Status */}
              {lastSaved && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 md:p-3 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-green-700 dark:text-green-300">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">تم الحفظ تلقائياً! 💾</span>
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span className="hidden sm:inline">{lastSaved.toLocaleTimeString('en-US')}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col gap-3 md:gap-4 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base text-accent-600 dark:text-dark-text-secondary bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    إلغاء
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'draft')}
                    disabled={submitting}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>جاري الحفظ...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <span>حفظ كمسودة</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'review')}
                    disabled={submitting}
                    className="flex-1 btn-primary py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>إرسال للمراجعة</span>
                      </div>
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs md:text-sm">
                      <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">معلومات مهمة:</p>
                      <ul className="text-blue-700 dark:text-blue-300 space-y-0.5 md:space-y-1">
                        <li>• <strong>حفظ كمسودة:</strong> يحفظ المقال كمسودة بدون مراجعة (العنوان والمحتوى مطلوبان فقط)</li>
                        <li>• <strong>إرسال للمراجعة:</strong> يرسل المقال للمراجعة والنشر (جميع الحقول مطلوبة)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/blog');
        }}
        title="تم إرسال المقال للمراجعة! ⏳"
        message="شكراً لك على مشاركة مقالك مع مجتمع عرب نوشن! مقالك الآن في حالة 'قيد المراجعة' وسيتم مراجعته من قبل فريقنا المتخصص خلال 24-48 ساعة. سيتم إشعارك بالنتيجة عبر البريد الإلكتروني. نتطلع لرؤية المزيد من مقالاتك الممتازة! 🎉"
        continueButtonText="الذهاب للمدونة"
      />
    </div>
  );
}
