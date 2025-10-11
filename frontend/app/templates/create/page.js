'use client';

import { useState, useRef, Suspense } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';

function CreateTemplatePageContent() {
  const { user, isAuthenticated, loading, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdFromQuery = searchParams?.get('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categories: [], // New field for multiple categories
    notionLink: '',
    language: 'ar', // Template language (ar, en, or both)
    isPaid: false, // Whether the template is paid
    price: '', // Price for paid templates
    purchaseLink: '', // Purchase link for paid templates
    features: '',
    tags: [], // Changed to array for tag-based input
    previewImage: '',
    previewImages: [],
    explanationVideo: '' // Video link for template explanation
  });

  // Multi-select state
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);
  const categoryInputRef = useRef(null);

  // Tags state
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef(null);

  useEffect(() => {
    // Ensure token is set in headers when component mounts
    ensureTokenInHeaders();

    // Only redirect if we've finished loading and user is not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    // Redirect if user is not an approved creator
    if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
      router.push('/');
    }
  }, [isAuthenticated, loading, user, router, ensureTokenInHeaders]);

  // Load existing template into the form when editing
  useEffect(() => {
    const loadTemplateForEdit = async () => {
      if (!editIdFromQuery || !isAuthenticated || loading) return;
      try {
        const resp = await api.get('/templates/my-templates');
        const mine = resp.data.templates || [];
        const toEdit = mine.find(t => t._id === editIdFromQuery);
        if (toEdit) {
          setIsEditMode(true);
          setEditingTemplateId(toEdit._id);
          setFormData({
            title: toEdit.title || '',
            description: toEdit.description || '',
            category: toEdit.category || '',
            categories: toEdit.categories || (toEdit.category ? [toEdit.category] : []),
            notionLink: toEdit.notionLink || '',
            language: toEdit.language || 'ar',
            isPaid: toEdit.isPaid || false,
            price: toEdit.price || '',
            purchaseLink: toEdit.purchaseLink || '',
            features: toEdit.features || '',
            tags: Array.isArray(toEdit.tags) ? toEdit.tags : (toEdit.tags ? [toEdit.tags] : []),
            previewImage: toEdit.previewImage || '',
            previewImages: Array.isArray(toEdit.previewImages) ? toEdit.previewImages : [],
            explanationVideo: toEdit.explanationVideo || ''
          });
          setUploadedImage(toEdit.previewImage || null);
          setUploadedImages(Array.isArray(toEdit.previewImages) ? toEdit.previewImages : []);
          showInfo && showInfo('تم تحميل بيانات القالب للتعديل');
        } else {
          showWarning && showWarning('لم يتم العثور على القالب المطلوب للتعديل');
        }
      } catch (err) {
        console.error('Failed loading template for edit', err);
        showError && showError('تعذر تحميل بيانات القالب للتعديل');
      }
    };
    loadTemplateForEdit();
  }, [editIdFromQuery, isAuthenticated, loading]);

  // Handle click outside to close dropdown
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

  // Show loading only if we're actually loading and don't have user data
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-lg text-accent-600 dark:text-dark-text-secondary">جاري تحميل صفحة إنشاء القالب...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, don't render anything (will redirect)
  if (!loading && !isAuthenticated) {
    return null;
  }

  // Redirect if user is not an approved creator
  if (!loading && isAuthenticated && user && user.creatorStatus !== 'approved') {
    return null;
  }

  const categories = [
    'الإنتاجية',
    'الدراسة',
    'الأعمال',
    'الحياة الشخصية',
    'الإبداع',
    'التقنية',
    'الصحة',
    'المالية',
    'التنظيم',
    'التخطيط',
    'ديني',
    'التسويق',
    'التصميم',
    'التطوير',
    'التعليم',
    'السفر',
    'الطعام',
    'الرياضة',
    'الترفيه',
    'الموضة',
    'الجمال',
    'المنزل',
    'الحديقة',
    'الحيوانات الأليفة',
    'السيارات',
    'التكنولوجيا',
    'البرمجة',
    'قواعد البيانات',
    'الأمان السيبراني',
    'الذكاء الاصطناعي',
    'البلوك تشين',
    'التجارة الإلكترونية',
    'المبيعات',
    'خدمة العملاء',
    'الموارد البشرية',
    'المحاسبة',
    'الاستثمار',
    'العقارات',
    'التأمين',
    'القانون',
    'الطب',
    'التمريض',
    'العلاج الطبيعي',
    'التغذية',
    'الطبخ',
    'الحلويات',
    'المشروبات',
    'المطاعم',
    'الفنون',
    'الموسيقى',
    'الرسم',
    'النحت',
    'التصوير',
    'الفيديو',
    'الكتابة',
    'الترجمة',
    'اللغات',
    'التاريخ',
    'الجغرافيا',
    'العلوم',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'علم النفس',
    'علم الاجتماع',
    'الفلسفة',
    'الأدب',
    'الشعر',
    'المسرح',
    'السينما',
    'الألعاب',
    'الرياضة الإلكترونية',
    'السياحة',
    'الفندقة',
    'النقل',
    'الطيران',
    'البحرية',
    'الزراعة',
    'البيئة',
    'الطاقة',
    'البناء',
    'الهندسة',
    'العمارة',
    'الديكور',
    'الأثاث',
    'الأدوات',
    'الأجهزة',
    'البرامج',
    'التطبيقات',
    'المواقع',
    'التطوير الويب',
    'تطوير التطبيقات',
    'الألعاب',
    'التعليم الإلكتروني',
    'الاجتماعات',
    'التواصل',
    'الشبكات الاجتماعية',
    'المحتوى',
    'الإعلان',
    'العلاقات العامة',
    'العلامة التجارية',
    'الاستراتيجية',
    'القيادة',
    'الإدارة',
    'المشاريع',
    'العمليات',
    'الجودة',
    'الابتكار',
    'البحث والتطوير',
    'التحليل',
    'الإحصاء',
    'البيانات',
    'التقارير',
    'العروض التقديمية',
    'التدريب',
    'التطوير المهني',
    'الاستشارات',
    'الخدمات',
    'المنتجات',
    'التصنيع',
    'التوزيع',
    'المخازن',
    'اللوجستيات',
    'السفر',
    'الترفيه',
    'الرياضة',
    'اللياقة البدنية',
    'اليوغا',
    'الرقص',
    'الملاكمة',
    'السباحة',
    'الجري',
    'ركوب الدراجات',
    'التسلق',
    'التخييم',
    'الصيد',
    'صيد الأسماك',
    'الحدائق',
    'الزراعة المنزلية',
    'الطبخ المنزلي',
    'الحرف اليدوية',
    'النجارة',
    'الخياطة',
    'الحياكة',
    'الرسم على الزجاج',
    'الخزف',
    'المجوهرات',
    'التجميل',
    'العناية بالبشرة',
    'العناية بالشعر',
    'الأظافر',
    'العطور',
    'الملابس',
    'الأحذية',
    'الحقائب',
    'الساعات',
    'النظارات',
    'الإكسسوارات',
    'الهدايا',
    'الألعاب',
    'الدمى',
    'السيارات اللعبة',
    'الألغاز',
    'البطاقات',
    'ألعاب الطاولة',
    'ألعاب الفيديو',
    'ألعاب الهاتف',
    'ألعاب الكمبيوتر',
    'الألعاب الجماعية',
    'الألعاب الفردية',
    'الألعاب الرياضية',
    'الألعاب الذهنية',
    'الألعاب الإبداعية',
    'الألعاب التعليمية',
    'الألعاب الترفيهية',
    'الألعاب الاجتماعية',
    'الألعاب التنافسية',
    'الألعاب التعاونية',
    'الألعاب الاستراتيجية',
    'الألعاب المغامرات',
    'الألعاب الأكشن',
    'الألعاب الرياضية',
    'الألعاب المحاكاة',
    'الألعاب اللغز',
    'الألعاب المنطقية',
    'الألعاب الإبداعية',
    'الألعاب التعليمية',
    'الألعاب الترفيهية',
    'الألعاب الاجتماعية',
    'الألعاب التنافسية',
    'الألعاب التعاونية',
    'الألعاب الاستراتيجية',
    'الألعاب المغامرات',
    'الألعاب الأكشن'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Multi-select category functions
  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const addCategory = (category) => {
    if (!formData.categories.includes(category) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    setCategorySearch('');
    // Keep dropdown open for multiple selections
    // setShowCategoryDropdown(false);
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
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
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

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleCategorySearch = (e) => {
    setCategorySearch(e.target.value);
    setShowCategoryDropdown(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowCategoryDropdown(false);
      setCategorySearch('');
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      return;
    }

    // No dimension validation - accept any image resolution

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.imageUrl;
        setUploadedImage(imageUrl);
        setFormData(prev => ({
          ...prev,
          previewImage: imageUrl
        }));
        showSuccess('تم رفع الصورة بنجاح');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || 'فشل في رفع الصورة';
      showError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // تم إزالة إنشاء لقطة الشاشة تلقائياً. الرجاء رفع صورة يدوياً.

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle multiple image uploads
  const handleMultipleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check if adding these files would exceed the 4 image limit
    if (formData.previewImages.length + files.length > 4) {
      showError('يمكنك رفع 4 صور كحد أقصى');
      return;
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showError(`الملف ${file.name} ليس صورة صالحة`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showError(`الملف ${file.name} كبير جداً (أكثر من 2 ميجابايت)`);
        return;
      }
    }

    setIsUploadingImage(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          return response.data.data.imageUrl;
        }
        throw new Error('فشل في رفع الصورة');
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      setFormData(prev => ({
        ...prev,
        previewImages: [...prev.previewImages, ...uploadedUrls]
      }));

      showSuccess(`تم رفع ${uploadedUrls.length} صورة بنجاح`);

      // Clear the input
      e.target.value = '';

    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error.response?.data?.message || 'فشل في رفع الصور';
      showError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove image from multiple images
  const removeMultipleImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure token is set in headers before making API call
      const hasToken = ensureTokenInHeaders();
      if (!hasToken) {
        showError('يجب تسجيل الدخول أولاً');
        router.push('/login');
        return;
      }
      // Client-side validation
      if (!formData.title.trim()) {
        showError('يرجى إدخال عنوان القالب');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        showError('يرجى إدخال وصف القالب');
        setIsSubmitting(false);
        return;
      }
      if (formData.description.length > 300) {
        showError('وصف القالب يجب أن يكون أقل من 300 حرف');
        setIsSubmitting(false);
        return;
      }
      if (formData.features && formData.features.length > 1000) {
        showError('مميزات القالب يجب أن تكون أقل من 1000 حرف');
        setIsSubmitting(false);
        return;
      }
      if (!formData.categories || formData.categories.length === 0) {
        showError('يرجى اختيار فئة واحدة على الأقل');
        setIsSubmitting(false);
        return;
      }
      // Price and purchase link validation for paid templates
      if (formData.isPaid) {
        if (!formData.price || formData.price <= 0) {
          showError('يرجى إدخال سعر صحيح للقالب المدفوع');
          setIsSubmitting(false);
          return;
        }
        if (!formData.purchaseLink || !formData.purchaseLink.trim()) {
          showError('يرجى إدخال رابط الشراء للقالب المدفوع');
          setIsSubmitting(false);
          return;
        }
      }
      if (!formData.notionLink.trim()) {
        showError('يرجى إدخال رابط قالب نوشن');
        setIsSubmitting(false);
        return;
      }
      if (!formData.previewImage.trim()) {
        showError('يرجى رفع لقطة شاشة للصفحة الرئيسية للقالب كصورة مصغرة');
        setIsSubmitting(false);
        return;
      }

      // Tags are already an array
      const tagsArray = formData.tags;

      // Clean up the form data - remove empty strings for optional fields
      const templateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.categories[0], // Keep first category for backward compatibility
        categories: formData.categories, // Send all categories
        notionLink: formData.notionLink.trim(),
        isPaid: formData.isPaid,
        price: formData.isPaid ? Number(formData.price) : undefined,
        purchaseLink: formData.isPaid ? formData.purchaseLink.trim() : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        features: formData.features.trim() || undefined,
        previewImage: formData.previewImage || undefined,
        previewImages: formData.previewImages.length > 0 ? formData.previewImages : undefined,
        explanationVideo: formData.explanationVideo.trim() || undefined
      };

      // Remove undefined values
      Object.keys(templateData).forEach(key => {
        if (templateData[key] === undefined || templateData[key] === '') {
          delete templateData[key];
        }
      });

      const response = (isEditMode && editingTemplateId)
        ? await api.put(`/templates/${editingTemplateId}`, templateData)
        : await api.post('/templates', templateData);

      if (response.data.success) {
        // Clear all form fields
        setFormData({
          title: '',
          description: '',
          category: '',
          categories: [],
          notionLink: '',
          isPaid: false,
          price: '',
          purchaseLink: '',
          features: '',
          tags: [],
          previewImage: '',
          previewImages: [],
          explanationVideo: ''
        });
        setUploadedImage(null);
        setUploadedImages([]);

        // Show success modal
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating template:', error);

      // Handle duplicate template error specifically
      if (error.response?.status === 409) {
        const duplicateField = error.response?.data?.duplicateField;
        let errorMessage = error.response?.data?.message;

        if (duplicateField === 'title') {
          errorMessage += '\n\nيرجى تغيير عنوان القالب ليصبح مختلفاً عن القوالب السابقة.';
        } else if (duplicateField === 'notionLink') {
          errorMessage += '\n\nيرجى التأكد من أن رابط نوشن مختلف عن القوالب السابقة.';
        }

        showError(errorMessage);
      } else {
        // Show more specific error message for other errors
        let errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إرسال القالب. يرجى المحاولة مرة أخرى.';

        // If there are validation errors, show them
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const validationErrors = error.response.data.errors.map(err => err.msg).join('\n');
          errorMessage = `أخطاء في البيانات:\n${validationErrors}`;
        }

        showError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50/30 dark:from-dark-primary dark:via-dark-secondary dark:to-dark-tertiary transition-colors duration-300 overflow-visible" dir="rtl">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300 shadow-sm">
        <div className="container-custom py-4 sm:py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                    إنشاء قالب جديد
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary">
                    أضف قالبك المبتكر وشاركه مع المجتمع العربي
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>املأ النموذج أدناه لإرسال قالبك للمراجعة</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push('/profile')}
                className="btn-outline inline-flex items-center justify-center gap-2 text-sm sm:text-base w-full md:w-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-custom py-4 sm:py-6 md:py-8 overflow-visible">
        <div className="max-w-4xl mx-auto overflow-visible">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8 overflow-visible">
            {/* Basic Information */}
            <div className="card p-4 sm:p-6 md:p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm overflow-visible">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 dark:bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-orange-400">المعلومات الأساسية</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 overflow-visible">
                <div className="md:col-span-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    عنوان القالب *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400"
                      placeholder="مثال: مخطط الدراسة الشامل"
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      الفئات *
                    </div>
                    <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      {formData.categories.length}/3
                    </span>
                  </label>

                  {/* Category Multi-Select Input */}
                  <div className="relative">
                    <div className="form-input w-full min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 dark:border-dark-input-border focus-within:border-primary-500 dark:focus-within:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {/* Selected Categories Inside Input */}
                      {formData.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs sm:text-sm font-medium"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                          >
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}

                      {/* Search Input */}
                      <input
                        ref={categoryInputRef}
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
                        className="flex-1 min-w-[100px] sm:min-w-[120px] bg-transparent outline-none text-sm sm:text-base text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete="off"
                      />
                    </div>

                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Dropdown */}
                    {showCategoryDropdown && formData.categories.length < 3 && (
                      <div ref={categoryDropdownRef} className="absolute z-[9999] w-full mt-2 bg-white dark:bg-dark-card-bg border border-gray-200 dark:border-dark-card-border rounded-lg sm:rounded-xl shadow-2xl max-h-48 sm:max-h-64 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addCategory(category)}
                              onMouseDown={(e) => e.preventDefault()}
                              disabled={formData.categories.includes(category)}
                              className="w-full text-right px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary text-sm sm:text-base text-gray-900 dark:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-gray-100 dark:border-dark-card-border last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <span>{category}</span>
                                {formData.categories.includes(category) && (
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 sm:px-4 py-4 sm:py-6 text-gray-500 dark:text-dark-text-tertiary text-center text-sm sm:text-base">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            لا توجد فئات مطابقة
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    وصف القالب *
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    وصف مختصر للقالب يظهر في صفحة القالب الرئيسية (حد أقصى 300 حرف)
                  </p>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      maxLength={300}
                      rows={4}
                      className={`form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-primary-500 dark:focus:border-orange-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-primary-300 dark:hover:border-orange-400 resize-none ${formData.description.length > 300 ? 'border-red-500' : ''}`}
                      placeholder="اكتب وصفاً مختصراً عن القالب ومميزاته..."
                    />
                    <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4">
                      <span className={`text-xs ${formData.description.length > 300 ? 'text-red-500' : formData.description.length > 250 ? 'text-yellow-500' : 'text-gray-400'}`}>
                        {formData.description.length}/300
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Link & Image */}
            <div className="card p-4 sm:p-6 md:p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">الرابط والصورة</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    رابط قالب نوشن *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="notionLink"
                      value={formData.notionLink}
                      onChange={handleInputChange}
                      required
                      className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-green-500 dark:focus:border-green-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-green-300 dark:hover:border-green-400"
                      placeholder="https://notion.so/your-template-link"
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    تأكد من أن الرابط قابل للوصول العام
                  </p>
                </div>

                {/* Template Language */}
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    لغة القالب *
                  </label>
                  <div className="relative">
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      required
                      className="form-input py-3 sm:py-4 pr-10 sm:pr-12 pl-3 sm:pl-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-green-500 dark:focus:border-green-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-green-300 dark:hover:border-green-400 appearance-none cursor-pointer"
                    >
                      <option value="ar">العربية فقط</option>
                      <option value="en">الإنجليزية فقط</option>
                      <option value="fr">الفرنسية فقط</option>
                      <option value="ar-en">ثنائي اللغة (عربي/إنجليزي)</option>
                      <option value="ar-fr">ثنائي اللغة (عربي/فرنسي)</option>
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>اختر اللغة المستخدمة في محتوى القالب لمساعدة المستخدمين في العثور على القوالب المناسبة</span>
                  </p>
                </div>

                {/* Paid Template Toggle */}
                <div>
                  <label className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      هل هذا قالب مدفوع؟
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPaid"
                        checked={formData.isPaid}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            isPaid: e.target.checked,
                            price: e.target.checked ? prev.price : '',
                            purchaseLink: e.target.checked ? prev.purchaseLink : ''
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </label>

                  {/* Price and Purchase Link Inputs - Show only when isPaid is true */}
                  {formData.isPaid && (
                    <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl space-y-4">
                      {/* Price Input */}
                      <div>
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-2 sm:mb-3">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          السعر *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required={formData.isPaid}
                            min="0"
                            step="0.01"
                            className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-green-300 dark:hover:border-green-400 bg-white dark:bg-dark-input"
                            placeholder="00.00"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          أدخل السعر بالريال السعودي (ر.س)
                        </p>
                      </div>

                      {/* Purchase Link Input */}
                      <div>
                        <label className="flex items-center text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mb-2 sm:mb-3">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          رابط الشراء *
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            name="purchaseLink"
                            value={formData.purchaseLink}
                            onChange={handleInputChange}
                            required={formData.isPaid}
                            className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-green-300 dark:hover:border-green-400 bg-white dark:bg-dark-input"
                            placeholder="https://example.com/purchase-link"
                            dir="ltr"
                          />
                          <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          أدخل الرابط الذي سيستخدمه المشترون لشراء القالب
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Image Upload */}
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    لقطة شاشة للقالب *
                  </label>

                  {/* تمت إزالة إنشاء لقطة الشاشة تلقائياً */}

                  {/* Manual Upload Option */}

                  {!uploadedImage ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3"
                      >
                        {isUploadingImage ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm sm:text-base">
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-green-600"></div>
                            <span>جاري رفع الصورة...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                اضغط لرفع لقطة شاشة للصفحة الرئيسية للقالب
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                PNG, JPG, GIF حتى 2 ميجابايت - مطلوب كصورة مصغرة
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">تم رفع الصورة بنجاح</span>
                      </div>
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="صورة المعاينة"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          onError={() => {
                            showError('فشل في تحميل الصورة');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImage(null);
                            setFormData(prev => ({ ...prev, previewImage: '' }));
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          title="إزالة الصورة"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        هذه اللقطة ستكون الصورة المصغرة الرسمية للقالب
                      </p>
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                          💡 نصائح لتحسين الصورة:
                        </p>
                        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                          <li>• تأكد من وضوح النص والعناصر في الصورة</li>
                          <li>• اختر لقطة شاشة تعرض أفضل ما في القالب</li>
                          <li>• استخدم دقة عالية للحصول على أفضل جودة</li>
                          <li>• تجنب الصور الضبابية أو غير الواضحة</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multiple Images Upload Section */}
            <div className="bg-white dark:bg-dark-secondary rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-dark-card-border">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600 dark:text-dark-text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <h3 className="text-base sm:text-lg font-semibold text-accent-700 dark:text-dark-text-primary">
                  صور إضافية للقالب (اختياري)
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mb-3">
                  يمكنك إضافة صور إضافية لعرض جوانب مختلفة من القالب. هذه الصور ستظهر في صفحة تفاصيل القالب.
                </p>

                {!uploadedImages.length ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFileChange}
                      className="hidden"
                      id="multiple-image-upload"
                      disabled={isUploadingImage}
                    />
                    <label
                      htmlFor="multiple-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2 sm:gap-3"
                    >
                      {isUploadingImage ? (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                          <div className="loading-spinner"></div>
                          <span>جاري رفع الصور...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                              اضغط لرفع صور إضافية للقالب
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              يمكنك اختيار عدة صور مرة واحدة - PNG, JPG, GIF حتى 2 ميجابايت (حد أقصى 4 صور)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`معاينة ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={() => {
                              showError('فشل في تحميل الصورة');
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeMultipleImage(index)}
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="إزالة الصورة"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 bg-black/50 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add more images button - only show if less than 4 images */}
                    {formData.previewImages.length < 4 && (
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultipleFileChange}
                          className="hidden"
                          id="add-more-images"
                          disabled={isUploadingImage}
                        />
                        <label
                          htmlFor="add-more-images"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          إضافة صور أخرى ({formData.previewImages.length}/4)
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Video Explanation */}
            <div className="card p-4 sm:p-6 md:p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600 dark:text-dark-text-secondary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <h3 className="text-base sm:text-lg font-semibold text-accent-700 dark:text-dark-text-primary">
                  فيديو توضيحي للقالب (اختياري)
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mb-3">
                  يمكنك إضافة رابط فيديو يوضح كيفية استخدام القالب. هذا الفيديو سيساعد المستخدمين على فهم القالب بشكل أفضل.
                </p>

                <div className="relative">
                  <input
                    type="url"
                    name="explanationVideo"
                    value={formData.explanationVideo}
                    onChange={handleInputChange}
                    className="form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-purple-500 dark:focus:border-purple-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-400"
                    placeholder="https://youtube.com/watch?v=... أو https://vimeo.com/..."
                    dir="ltr"
                  />
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  يدعم روابط YouTube و Vimeo و منصات الفيديو الأخرى
                </p>
              </div>
            </div>

            {/* Features & Details */}
            <div className="card p-4 sm:p-6 md:p-8 shadow-xl border-0 bg-white/80 dark:bg-dark-card-bg/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">المميزات والتفاصيل</h2>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    مميزات القالب (اختياري)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    وصف مفصل لمميزات القالب يظهر في صفحة تفاصيل القالب (حد أقصى 1000 حرف)
                  </p>
                  <div className="relative">
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      maxLength={1000}
                      rows={6}
                      className={`form-input pr-10 sm:pr-12 pl-3 sm:pl-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-dark-input-border focus:border-blue-500 dark:focus:border-blue-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-400 resize-none ${formData.features.length > 1000 ? 'border-red-500' : ''}`}
                      placeholder="اكتب وصفاً مفصلاً لمميزات القالب..."
                    />
                    <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4">
                      <span className={`text-xs ${formData.features.length > 1000 ? 'text-red-500' : formData.features.length > 800 ? 'text-yellow-500' : 'text-gray-400'}`}>
                        {formData.features.length}/1000
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 ml-1.5 sm:ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      الكلمات المفتاحية (اختياري)
                    </div>
                    <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                      {formData.tags.length}/10
                    </span>
                  </label>

                  {/* Tag Input */}
                  <div className="relative">
                    <div className="form-input w-full min-h-[2.5rem] sm:min-h-[3rem] px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 dark:border-dark-input-border focus-within:border-blue-500 dark:focus-within:border-blue-500 rounded-lg sm:rounded-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {/* Selected Tags */}
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs sm:text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                          >
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        placeholder={formData.tags.length >= 10 ? "تم الوصول للحد الأقصى (10 كلمات)" : formData.tags.length > 0 ? "أضف كلمة مفتاحية..." : "اكتب كلمة مفتاحية واضغط Enter"}
                        disabled={formData.tags.length >= 10}
                        className="flex-1 min-w-[150px] sm:min-w-[200px] bg-transparent outline-none text-sm sm:text-base text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-quaternary disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete="off"
                      />
                    </div>

                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    اضغط Enter لإضافة كلمة مفتاحية. الحد الأقصى 10 كلمات
                  </p>
                </div>

              </div>
            </div>

            {/* Guidelines */}
            <div className="card p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-amber-800 dark:text-amber-200">إرشادات مهمة</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4 text-amber-700 dark:text-amber-300">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm font-bold">1</span>
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">تأكد من أن قالبك أصلي ولا ينتهك حقوق الملكية الفكرية</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm font-bold">2</span>
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">رابط نوشن يجب أن يكون قابل للوصول العام</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm font-bold">3</span>
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">سيتم مراجعة القالب من قبل الإدارة قبل النشر</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs sm:text-sm font-bold">4</span>
                  </div>
                  <span className="text-xs sm:text-sm leading-relaxed">تأكد من دقة المعلومات المقدمة</span>
                </li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="btn-outline inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    إرسال للمراجعة
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile');
        }}
      />
    </div>
  );
}

export default function CreateTemplatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300"></div>}>
      <CreateTemplatePageContent />
    </Suspense>
  );
}