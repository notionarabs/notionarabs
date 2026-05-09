'use client';

import { useState, useRef, Suspense, useMemo, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import SuccessModal from '../../../components/SuccessModal';
import CategorySelector from '../../../components/CategorySelector';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Send, 
  Loader2, 
  Edit3, 
  ImageOff, 
  Layout, 
  User, 
  Eye, 
  Download, 
  UploadCloud, 
  Camera, 
  Trash,
  Link as LinkIcon, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  X 
} from 'lucide-react';

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
  const hasShownEditToastRef = useRef(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const hasRestoredDraftRef = useRef(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categories: [], // New field for multiple categories
    notionLink: '',
    language: 'ar', // Template language (ar, en, or both)
    isPaid: false, // Whether the template is paid
    price: '', // Price for paid templates
    features: '',
    tags: [], // Changed to array for tag-based input
    previewImage: '',
    previewImages: [],
    explanationVideo: '' // Video link for template explanation
  });

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

  // Helper to check if there's actual content to save/restore
  const hasMeaningfulContent = (data) => {
    return (
      data.title?.trim() ||
      data.description?.trim() ||
      data.notionLink?.trim() ||
      (data.categories && data.categories.length > 0) ||
      (data.tags && data.tags.length > 0) ||
      data.previewImage ||
      (data.previewImages && data.previewImages.length > 0)
    );
  };

  // Auto-save functionality (Debounced)
  useEffect(() => {
    if (typeof window === 'undefined' || isEditMode) return;

    const timer = setTimeout(() => {
      if (hasMeaningfulContent(formData)) {
        const draftData = {
          ...formData,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('templateDraft', JSON.stringify(draftData));
        setLastSaved(new Date());
      } else {
        // If content was cleared, remove the draft and clear the status
        if (localStorage.getItem('templateDraft')) {
          localStorage.removeItem('templateDraft');
        }
        setLastSaved(null);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [formData, isEditMode]);



  // Helper to format features for the textarea robustly
  const formatFeaturesForInput = (data) => {
    if (!data) return '';
    
    const ultimateClean = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map(v => ultimateClean(v)).flat().filter(Boolean);
      if (typeof val !== 'string') return [String(val)];

      let cleaned = val;

      // 1. Target and remove complex artifact patterns like ." . , "
      cleaned = cleaned.replace(/[.,\s]*"[\s.,]*"?[.,\s]*/g, '\n');
      
      // 2. Wipe out sequences of JSON/Escape noise characters
      cleaned = cleaned.replace(/[\\[\]"\/]{2,}/g, ' ');
      
      // 3. Try to unwrap if it still looks like a JSON string
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        try {
          const parsed = JSON.parse(cleaned);
          if (typeof parsed === 'string' || Array.isArray(parsed)) {
            cleaned = Array.isArray(parsed) ? parsed.join('\n') : parsed;
          }
        } catch (e) {}
      }

      // 4. Split by newline and perform deep per-item cleaning
      return cleaned.split('\n')
        .map(item => item.trim())
        .map(item => item.replace(/^[\\[\]"\/, .]+|[\\[\]"\/, .]+$/g, '').trim())
        .filter(item => item && item.length > 2 && !/^[\\\/\[\]" \t\n\r,.]+$/.test(item));
    };

    return ultimateClean(data).join('\n');
  };

  // Load draft on component mount
  useEffect(() => {
    // Prevent double execution in Strict Mode or re-renders
    // CRITICAL: Only restore drafts if we are NOT in edit mode
    if (hasRestoredDraftRef.current || isEditMode || editIdFromQuery) return;

    const savedDraft = localStorage.getItem('templateDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);

        // Mark as handled immediately to prevent double toast
        hasRestoredDraftRef.current = true;

        if (hasMeaningfulContent(draftData)) {
          // Clean features in draft if they look like JSON
          if (draftData.features) {
            draftData.features = formatFeaturesForInput(draftData.features);
          }

          setFormData(prev => ({
            ...prev,
            ...draftData
          }));

          if (draftData.previewImage) setUploadedImage(draftData.previewImage);
          if (draftData.previewImages) setUploadedImages(draftData.previewImages);

          if (draftData.timestamp) {
            setLastSaved(new Date(draftData.timestamp));
          }

          showSuccess('تم استعادة المسودة المحفوظة');
          setDraftRestored(true);
        } else {
          // If the draft exists but is empty, clean it up
          localStorage.removeItem('templateDraft');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [showSuccess, isEditMode]);

  // Clear draft when form is successfully submitted
  const clearDraft = () => {
    localStorage.removeItem('templateDraft');
    setLastSaved(null);
  };

  // Load existing template into the form when editing
  useEffect(() => {
    const loadTemplateForEdit = async () => {
      if (!editIdFromQuery || !isAuthenticated || loading) return;

      // Prevent double execution for the same ID
      if (hasShownEditToastRef.current === editIdFromQuery) return;

      // Mark as handled for this ID immediately to prevent race conditions during async calls
      hasShownEditToastRef.current = editIdFromQuery;

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
            features: formatFeaturesForInput(toEdit.features),
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



  // Show loading only if we're actually loading and don't have user data
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <div className="container-custom py-8 sm:py-12">
          {/* Header Skeleton */}
          <div className="mb-8 sm:mb-12">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 sm:w-48"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 sm:w-64"></div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm border border-gray-200 dark:border-dark-card-border p-6 sm:p-8">
              <div className="animate-pulse space-y-8">
                {/* Basic Info Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-32"></div>
                  <div className="space-y-6">
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-16"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-40"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed"></div>
                </div>

                {/* Features Section */}
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-28"></div>
                  <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-4 justify-end">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
            </div>
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

  // Categories are now imported from lib/templateCategories.js


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const addCategory = (category) => {
    if (!formData.categories.includes(category) && formData.categories.length < 3) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
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

  const handleCaptureScreenshot = async () => {
    if (!formData.notionLink.trim()) {
      showError('يرجى إدخال رابط القالب أولاً');
      return;
    }

    if (!formData.notionLink.includes('notion.site')) {
      showError('يجب أن يكون الرابط من نطاق notion.site (رابط نشر القالب)');
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await api.post('/screenshot', { url: formData.notionLink.trim() });
      if (response.data.success) {
        const imageUrl = response.data.data.screenshotUrl;
        setUploadedImage(imageUrl);
        setFormData(prev => ({
          ...prev,
          previewImage: imageUrl
        }));
        showSuccess('تم التقاط الصورة بنجاح');
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      const errorMessage = error.response?.data?.message || 'فشل في التقاط الصورة تلقائياً. يرجى المحاولة مرة أخرى أو رفع صورة يدوياً.';
      showError(errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

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
      if (formData.description.length > 150) {
        showError('وصف القالب يجب أن يكون أقل من 150 حرف');
        setIsSubmitting(false);
        return;
      }
      if (!formData.features.trim()) {
        showError('يرجى إدخال الوصف التفصيلي للقالب');
        setIsSubmitting(false);
        return;
      }
      if (formData.features.length > 2000) {
        showError('الوصف التفصيلي يجب أن يكون أقل من 2000 حرف');
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
      }
      if (!formData.notionLink.trim()) {
        showError('يرجى إدخال رابط قالب نوشن');
        setIsSubmitting(false);
        return;
      }
      if (!formData.notionLink.includes('notion.site')) {
        showError('يجب أن يكون الرابط من نطاق notion.site (رابط نشر القالب)');
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
          features: '',
          tags: [],
          previewImage: '',
          previewImages: [],
          explanationVideo: ''
        });
        setUploadedImage(null);
        setUploadedImages([]);

        // Clear draft
        clearDraft();

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
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Premium Header */}
      <div className="bg-white/80 dark:bg-dark-secondary/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 sticky top-0 z-30">
        <div className="container-custom py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-orange-500 dark:to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 dark:shadow-orange-500/20">
                <Plus className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">
                  {isEditMode ? 'تعديل القالب' : 'إنشاء قالب جديد'}
                </h1>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-dark-text-secondary font-bold">
                  <span>لوحة المبدعين</span>
                  <span className="opacity-30">•</span>
                  <span className="text-primary-600 dark:text-orange-400">تصميم وتطوير</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               <button
                onClick={() => router.push('/profile?tab=templates')}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-xs font-black text-gray-500 hover:text-gray-900 dark:text-dark-text-secondary dark:hover:text-dark-text-primary transition-colors bg-gray-50 dark:bg-dark-tertiary rounded-xl border border-gray-100 dark:border-white/5 cursor-pointer"
              >
                <ChevronRight size={16} />
                العودة للملف
              </button>
              
              <button
                form="template-form"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs sm:text-sm font-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl border-none shadow-glow flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>{isEditMode ? 'حفظ التعديلات' : 'إرسال للمراجعة'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Side: Form Segments */}
          <div className="flex-1 space-y-8">
            <form id="template-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Segment 1: Identity */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-500">
                    <Edit3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">هوية القالب</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">ابدأ بتعريف قالبك للمستخدمين</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">عنوان القالب *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="مثال: نظام إدارة المشاريع الاحترافي"
                      required
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-primary-500 dark:focus:border-orange-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary outline-none transition-all focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-orange-500/5"
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block">وصف مختصر *</label>
                      <span className={`text-[10px] font-black ${formData.description.length > 140 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {formData.description.length}/150
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      maxLength={150}
                      rows={2}
                      placeholder="وصف جذاب يظهر في بطاقة القالب (يجب أن يكون قصيراً ومركزاً)"
                      required
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-primary-500 dark:focus:border-orange-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary outline-none transition-all focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-orange-500/5 resize-none"
                    />
                  </div>

                  {/* Categories Multi-Select */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block">الفئات (حتى 3) *</label>
                      <span className="text-[10px] font-black text-gray-400">{formData.categories.length}/3</span>
                    </div>
                    <CategorySelector
                      selectedCategories={formData.categories}
                      onAddCategory={addCategory}
                      onRemoveCategory={removeCategory}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Segment 2: Media & Resources */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-500">
                    <ImageOff size={20} className="hidden" /> {/* Lucide icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">الوسائط والمحتوى</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">اجعل قالبك يبدو احترافياً بالصور</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Notion Link */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">رابط نشر القالب (notion.site) *</label>
                    <div className="relative">
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                        <LinkIcon size={18} />
                      </div>
                      <input
                        type="url"
                        name="notionLink"
                        value={formData.notionLink}
                        onChange={handleInputChange}
                        placeholder="https://your-name.notion.site/..."
                        required
                        dir="ltr"
                        className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-primary-500 dark:focus:border-orange-500 rounded-2xl pr-14 pl-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Primary Image Upload */}
                  <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">الصورة المصغرة الأساسية *</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload Box */}
                      <div className="relative group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="primary-image"
                        />
                        <label 
                          htmlFor="primary-image"
                          className="flex flex-col items-center justify-center w-full aspect-video rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-dark-tertiary/10 hover:bg-gray-50 dark:hover:bg-dark-tertiary/20 hover:border-primary-500 dark:hover:border-orange-500 transition-all cursor-pointer group"
                        >
                          {isUploadingImage ? (
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                          ) : (
                            <>
                              <div className="p-3 bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6 text-primary-500" />
                              </div>
                              <span className="text-xs font-black text-gray-700 dark:text-dark-text-primary">رفع صورة يدوياً</span>
                              <span className="text-[10px] font-bold text-gray-400 mt-1">PNG, JPG حتى 2MB</span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* AI Screenshot Box */}
                      <button
                        type="button"
                        onClick={handleCaptureScreenshot}
                        disabled={isUploadingImage || !formData.notionLink}
                        className="flex flex-col items-center justify-center w-full aspect-video rounded-3xl border border-gray-100 dark:border-white/5 bg-primary-500/5 dark:bg-orange-500/5 hover:bg-primary-500/10 dark:hover:bg-orange-500/10 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="p-3 bg-white dark:bg-dark-secondary rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mb-3 group-hover:scale-110 transition-transform">
                          <Camera className="w-6 h-6 text-primary-500 dark:text-orange-500" />
                        </div>
                        <span className="text-xs font-black text-primary-600 dark:text-orange-400">التقاط تلقائي</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1">بواسطة رابط نوشن</span>
                      </button>
                    </div>

                    {uploadedImage && (
                      <div className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl group">
                        <Image src={uploadedImage} alt="Thumbnail preview" fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button"
                            onClick={() => { setUploadedImage(null); setFormData(p => ({ ...p, previewImage: '' })); }}
                            className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-all"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Gallery Images */}
                  <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block">صور إضافية للمعرض (حتى 4)</label>
                      <span className="text-[10px] font-black text-gray-400">{formData.previewImages.length}/4</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {formData.previewImages.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 group">
                          <Image src={img} alt={`Gallery ${index}`} fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => removeMultipleImage(index)}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 transition-all"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {formData.previewImages.length < 4 && (
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleMultipleFileChange}
                            className="hidden"
                            id="gallery-images"
                            disabled={isUploadingImage}
                          />
                          <label 
                            htmlFor="gallery-images"
                            className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-dark-tertiary/10 hover:bg-gray-50 dark:hover:bg-dark-tertiary/20 hover:border-primary-500 transition-all cursor-pointer group"
                          >
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                            <span className="text-[10px] font-black text-gray-400 mt-1">إضافة</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description Detail (Features) */}
                  <div className="space-y-2 pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block">الوصف التفصيلي (المميزات) *</label>
                      <span className={`text-[10px] font-black ${formData.features.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {formData.features.length}/2000
                      </span>
                    </div>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      maxLength={2000}
                      rows={6}
                      placeholder="اكتب هنا ما يميز قالبك، كيف يساعد المستخدمين، وما هي الأقسام المتضمنة..."
                      required
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-primary-500 dark:focus:border-orange-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-tertiary outline-none transition-all focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-orange-500/5"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Segment 3: Commercial & Extras */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-500">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-dark-text-primary tracking-tight">البيانات التجارية والإضافية</h2>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">حدد السعر واللغة والكلمات المفتاحية</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">لغة القالب *</label>
                    <div className="relative">
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none appearance-none cursor-pointer"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">الإنجليزية</option>
                        <option value="ar-en">ثنائي اللغة (عربي/إنجليزي)</option>
                      </select>
                      <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  {/* Pricing Toggle & Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">التسعير</label>
                    <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 rounded-2xl p-2 h-[58px]">
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, isPaid: false, price: '' }))}
                        className={`flex-1 h-full rounded-xl text-xs font-black transition-all ${!formData.isPaid ? 'bg-white dark:bg-dark-secondary shadow-sm text-primary-600 dark:text-orange-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        مجاني
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, isPaid: true }))}
                        className={`flex-1 h-full rounded-xl text-xs font-black transition-all ${formData.isPaid ? 'bg-white dark:bg-dark-secondary shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        مدفوع
                      </button>
                    </div>
                  </div>

                  {formData.isPaid && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="md:col-span-2 space-y-2"
                    >
                      <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">السعر (ج.م) *</label>
                      <div className="relative">
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">ج.م</div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required={formData.isPaid}
                          placeholder="0.00"
                          className="w-full bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 focus:border-emerald-500 rounded-2xl px-14 py-4 text-sm font-black text-gray-900 dark:text-dark-text-primary outline-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Tags */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-wider block mr-1">الكلمات المفتاحية (اختياري)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                       {formData.tags.map((tag, i) => (
                         <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary rounded-lg text-xxs font-black flex items-center gap-1.5 border border-gray-200/50 dark:border-white/5">
                            {tag}
                            <X size={12} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => removeTag(tag)} />
                         </span>
                       ))}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={handleTagInputChange}
                        onKeyDown={handleTagKeyDown}
                        placeholder="اكتب كلمة واضغط Enter..."
                        className="w-full bg-gray-50/50 dark:bg-dark-tertiary/20 border border-gray-100 dark:border-white/5 focus:border-primary-500 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 dark:text-dark-text-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Indicator (Autosave) */}
              {lastSaved && (
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  تم الحفظ تلقائياً {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </form>
          </div>

          {/* Right Side: Sticky Live Preview */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xs font-black text-gray-400 dark:text-dark-text-tertiary uppercase tracking-[0.2em]">معاينة حية</h3>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">مباشر</span>
                </div>
              </div>

              {/* Template Card Mockup */}
              <div className="bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-4 shadow-2xl shadow-primary-500/10 transition-all group overflow-hidden">
                <div className="aspect-video rounded-[1.5rem] overflow-hidden bg-gray-50 dark:bg-dark-primary border border-gray-100 dark:border-white/5 relative mb-4">
                  {uploadedImage ? (
                    <Image src={uploadedImage} alt="Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-dark-text-tertiary">
                      <Layout size={40} className="opacity-20 mb-2" />
                      <span className="text-[10px] font-black uppercase opacity-40">بانتظار الصورة</span>
                    </div>
                  )}
                  {formData.isPaid && (
                     <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
                        {formData.price ? `${formData.price} ج.م` : 'مدفوع'}
                     </div>
                  )}
                </div>

                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {formData.categories.slice(0, 1).map((cat, i) => (
                       <span key={i} className="text-[9px] font-black text-primary-500 bg-primary-500/5 px-2 py-0.5 rounded-md uppercase">
                          {cat}
                       </span>
                    ))}
                    {!formData.categories.length && <div className="w-12 h-3 bg-gray-100 dark:bg-dark-tertiary rounded animate-pulse"></div>}
                  </div>
                  
                  <h4 className="text-base font-black text-gray-900 dark:text-dark-text-primary mb-1 line-clamp-1">
                    {formData.title || 'عنوان القالب الجديد'}
                  </h4>
                  
                  <p className="text-[11px] font-bold text-gray-400 dark:text-dark-text-secondary line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                    {formData.description || 'هنا سيظهر الوصف المختصر الذي تكتبه للقالب بشكل جذاب للمستخدمين...'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-tertiary flex items-center justify-center border border-gray-200 dark:border-white/10">
                          <User size={12} className="text-gray-400" />
                       </div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                          {user?.name || 'المبدع'}
                       </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                       <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span className="text-[9px] font-black">0</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <Download size={12} />
                          <span className="text-[9px] font-black">0</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guidelines Small Card */}
              <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-500/10 rounded-[2rem] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <h5 className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">إرشادات سريعة</h5>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'تأكد من أن رابط نوشن متاح للعامة',
                    'استخدم صورة عالية الجودة للمعاينة',
                    'الوصف المفصل يزيد من فرص الموافقة',
                    'راجع القالب جيداً قبل الإرسال'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-amber-700/70 dark:text-amber-500/60 leading-tight">
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={() => {
          setShowSuccessModal(false);
          router.push('/profile?tab=templates');
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
