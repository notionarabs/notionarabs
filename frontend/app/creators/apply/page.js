'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Award, 
  ChevronDown, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  Clock, 
  RotateCw,
  ChevronLeft,
  Heart,
  Globe
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import ReactCountryFlag from 'react-country-flag';
import { countryOptions } from '../../../lib/countryData';
import { validatePhoneNumber } from '../../../lib/phoneValidation';
import { useDebouncedCallback } from '../../../hooks/useDebounce';

const createInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  countryCode: '+20', // Default to Egypt
  portfolio: '',
  experience: '',
  specialties: [],
  motivation: '',
  agreeToTerms: false
});

export default function CreatorApplyPage() {
  const [formData, setFormData] = useState(createInitialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const countryDropdownRef = useRef(null);
  const specialtyDropdownRef = useRef(null);
  const draftLoadedRef = useRef(false);
  const { user, isAuthenticated, checkAuthStatus, refreshUserData, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/creators/apply');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (draftLoadedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedDraft = localStorage.getItem('creatorApplyDraft');
      if (storedDraft) {
        const parsedDraft = JSON.parse(storedDraft);

        if (parsedDraft?.formData) {
          setFormData(prev => ({
            ...prev,
            ...parsedDraft.formData,
            specialties: Array.isArray(parsedDraft.formData.specialties)
              ? parsedDraft.formData.specialties
              : prev.specialties
          }));
        }

        if (typeof parsedDraft?.customSpecialty === 'string') {
          setCustomSpecialty(parsedDraft.customSpecialty);
        }

        if (typeof parsedDraft?.showCustomInput === 'boolean') {
          setShowCustomInput(parsedDraft.showCustomInput);
        }
      }
    } catch (error) {
      console.error('Failed to load creator application draft:', error);
    } finally {
      draftLoadedRef.current = true;
    }
  }, []);

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Monitor user creatorStatus changes to update UI
  useEffect(() => {
    if (user?.creatorStatus === 'pending' && success) {
      setSuccess(false); // Reset success state since we're showing pending
    }
  }, [user?.creatorStatus, success]);

  // Auto-refresh user data when on pending page to check for status updates
  useEffect(() => {
    if (user?.creatorStatus === 'pending') {
      const interval = setInterval(async () => {
        try {
          await checkAuthStatus();
        } catch (error) {
          console.error('Failed to refresh user status:', error);
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.creatorStatus, checkAuthStatus]);

  // Close dropdowns when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
      if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(event.target)) {
        setIsSpecialtyDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
        setIsSpecialtyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (user?.creatorStatus === 'pending' || user?.creatorStatus === 'approved') {
      try {
        localStorage.removeItem('creatorApplyDraft');
      } catch (error) {
        console.error('Failed to clear creator application draft:', error);
      }
    }
  }, [user?.creatorStatus]);

  // Debounced localStorage save to prevent lag on every keystroke
  const saveDraftToLocalStorage = useDebouncedCallback(() => {
    if (!draftLoadedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const draftPayload = {
        formData,
        customSpecialty,
        showCustomInput
      };

      localStorage.setItem('creatorApplyDraft', JSON.stringify(draftPayload));
    } catch (error) {
      console.error('Failed to save creator application draft:', error);
    }
  }, 500);

  useEffect(() => {
    saveDraftToLocalStorage();
  }, [formData, customSpecialty, showCustomInput, saveDraftToLocalStorage]);

  const specialtyOptions = [
    'الإنتاجية والتنظيم',
    'العمل والأعمال',
    'الدراسة والبحث',
    'التخطيط الشخصي',
    'إدارة المشاريع',
    'التسويق والمبيعات',
    'التصميم الجرافيكي',
    'التطوير والبرمجة',
    'الكتابة والمحتوى',
    'التمويل والمحاسبة',
    'الموارد البشرية',
    'التعليم والتدريب',
    'أخرى'
  ];

  const selectedCountry = useMemo(() => {
    return countryOptions.find(c => c.code === formData.countryCode) || countryOptions.find(c => c.countryCode === 'EG');
  }, [formData.countryCode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'specialties') {
      if (value === 'أخرى') {
        setShowCustomInput(checked);
        if (!checked) {
          setCustomSpecialty('');
          setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(item =>
              item !== 'أخرى' && item !== customSpecialty.trim()
            )
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          specialties: checked
            ? [...prev.specialties, value]
            : prev.specialties.filter(item => item !== value)
        }));
      }
    } else if (name === 'customSpecialty') {
      setCustomSpecialty(value);
    } else {
      if (name === 'phone') {
        const phoneRegex = /^[0-9\s\-\(\)\+]*$/;
        if (phoneRegex.test(value) || value === '') {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));

          if (value.trim()) {
            if (validatePhoneNumber(value, formData.countryCode)) {
              setPhoneError('');
            } else {
              setPhoneError('رقم الهاتف غير صحيح');
            }
          } else {
            setPhoneError('');
          }
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    }
    setError('');
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code
    }));
    setIsCountryDropdownOpen(false);

    if (formData.phone.trim()) {
      if (validatePhoneNumber(formData.phone, country.code)) {
        setPhoneError('');
      } else {
        setPhoneError('رقم الهاتف غير صحيح');
      }
    }
  };

  const handleCustomSpecialtyBlur = () => {
    if (customSpecialty.trim()) {
      const trimmedSpecialty = customSpecialty.trim();
      const specialties = trimmedSpecialty
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      setFormData(prev => {
        const filteredSpecialties = prev.specialties.filter(item =>
          item !== 'أخرى' && !specialties.includes(item)
        );
        return {
          ...prev,
          specialties: [...filteredSpecialties, ...specialties]
        };
      });
    }
  };

  const handleCustomSpecialtyKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomSpecialtyBlur();
    }
  };

  const handleSpecialtySelect = (specialty) => {
    if (specialty === 'أخرى') {
      setShowCustomInput(true);
      setIsSpecialtyDropdownOpen(false);
    } else {
      setFormData(prev => ({
        ...prev,
        specialties: prev.specialties.includes(specialty)
          ? prev.specialties.filter(item => item !== specialty)
          : [...prev.specialties, specialty]
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
      (e.keyCode < 96 || e.keyCode > 105) &&
      e.keyCode !== 32 && // space
      e.keyCode !== 189 && // hyphen
      e.keyCode !== 187 && // plus
      e.keyCode !== 219 && // left parenthesis
      e.keyCode !== 221) { // right parenthesis
      e.preventDefault();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('الاسم مطلوب');
      return false;
    }
    if (!formData.email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('رقم الهاتف مطلوب');
      return false;
    }

    if (!validatePhoneNumber(formData.phone, formData.countryCode)) {
      setError('رقم الهاتف غير صحيح. يرجى إدخال رقم هاتف صحيح');
      return false;
    }
    if (!formData.experience.trim()) {
      setError('وصف الخبرة مطلوب');
      return false;
    }
    if (formData.specialties.length === 0) {
      setError('يجب اختيار مجال واحد على الأقل');
      return false;
    }
    if (!formData.motivation.trim()) {
      setError('سبب الرغبة في الانضمام مطلوب');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const api = (await import('../../../lib/api')).default;
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];

      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        setError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }

      const response = await api.post('/auth/apply-creator', {
        name: formData.name,
        portfolio: formData.portfolio,
        experience: formData.experience,
        specialties: formData.specialties,
        motivation: formData.motivation,
        phone: `${formData.countryCode}${formData.phone}`,
        countryCode: formData.countryCode,
      });

      if (response.data.success) {
        await refreshUserData();
        try {
          localStorage.removeItem('creatorApplyDraft');
        } catch (storageError) {
          console.error('Failed to clear creator application draft after submit:', storageError);
        }
        setFormData(createInitialFormData());
        setCustomSpecialty('');
        setShowCustomInput(false);
        setPhoneError('');
        setSuccess(true);
      } else {
        setError(response.data.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const firstError = validationErrors[0];
        setError(firstError.msg || 'بيانات غير صحيحة');
      } else {
        setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    }

    setLoading(false);
  };

  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6 text-orange-500" />,
      title: "مستقبل الإبداع العربي",
      description: "انضم إلى أكبر منصة عربية مخصصة لتصميم ونشر قوالب نوشن الاحترافية وبناء هويتك الرقمية."
    },
    {
      icon: <Award className="w-6 h-6 text-purple-500" />,
      title: "أرباح ودخل مادي مستمر",
      description: "اعرض قوالبك المدفوعة لآلاف المستخدمين المهتمين واحصل على عوائد مالية مجزية شهرياً."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: "دعم فني وتسويق مخصص",
      description: "نساعدك في تسويق أعمالك، وتقديم مراجعات تقنية احترافية لضمان جودة قوالبك وتطوير مهاراتك."
    }
  ];

  // Show loading state while checking authentication
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center font-sans" dir="rtl">
        <div className="text-center relative">
          <div className="w-20 h-20 relative mx-auto mb-6 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin absolute"></div>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-xl font-bold text-accent dark:text-dark-text-primary animate-pulse">جاري التحقق من الحساب...</p>
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary mt-2">يرجى الانتظار لحظات</p>
        </div>
      </div>
    );
  }

  // Check if user already has a pending or approved creator status
  if (user?.creatorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/10 border border-yellow-200/50 dark:border-yellow-900/30">
            <Clock className="w-12 h-12 text-yellow-500 dark:text-yellow-400 animate-spin-slow" style={{ animationDuration: '6s' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-600 dark:text-yellow-400 mb-4 tracking-tight">
            طلبك قيد المراجعة والتدقيق
          </h1>
          <p className="text-base sm:text-lg text-accent dark:text-dark-text-secondary leading-relaxed mb-8">
            أهلاً بك يا مبدع! لقد استلمنا طلبك للانضمام إلى نخبة مبدعي عرب نوشن. فريقنا التقني يقوم حالياً بمراجعة طلبك للتأكد من مطابقة المعايير. سنقوم بالرد عليك خلال <span className="font-bold text-yellow-600 dark:text-yellow-400">3-5 أيام عمل</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={async () => {
                try {
                  await checkAuthStatus();
                } catch (error) {
                  console.error('Failed to refresh status:', error);
                }
              }}
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-3 group"
            >
              <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              <span>تحديث حالة الطلب</span>
            </button>
            <Link 
              href="/creators" 
              className="btn-secondary px-8 py-4 text-base flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform"
            >
              <span>تصفح المبدعين الآخرين</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user?.creatorStatus === 'approved') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/10 border border-green-200/50 dark:border-green-900/30 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400 mb-4 tracking-tight">
            تهانينا الحارة! تم قبولك كمبدع
          </h1>
          <p className="text-base sm:text-lg text-accent dark:text-dark-text-secondary leading-relaxed mb-8">
            أنت الآن مبدع معتمد بشكل رسمي في عرب نوشن! يمكنك الآن التوجه إلى لوحة التحكم الخاصة بك للبدء في نشر قوالبك الإبداعية وبيعها لآلاف المستخدمين.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/profile" 
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-3 shadow-green-500/20"
            >
              <span>دخول لوحة التحكم</span>
              <Sparkles className="w-5 h-5" />
            </Link>
            <Link 
              href="/creators" 
              className="btn-secondary px-8 py-4 text-base flex items-center justify-center gap-3"
            >
              <span>تصفح المبدعين</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (user?.creatorStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-24 h-24 bg-red-50 dark:bg-red-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10 border border-red-200/50 dark:border-red-900/30">
            <X className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mb-4 tracking-tight">
            نعتذر، لم يتم قبول طلبك حالياً
          </h1>
          <p className="text-base sm:text-lg text-accent dark:text-dark-text-secondary leading-relaxed mb-8">
            نشكرك جزيل الشكر على وقتك واهتمامك بالانضمام إلينا. للأسف، لم تكن الشروط مستوفاة في طلبك الحالي لتصميم القوالب. لا تستسلم، يمكنك دائماً تطوير مهاراتك وإعادة المحاولة في وقت لاحق!
          </p>

          <div className="flex justify-center">
            <Link 
              href="/creators" 
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-3"
            >
              <span>استكشف أعمال المبدعين لإلهامك</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show success state only if user doesn't have a pending status yet
  if (success && user?.creatorStatus !== 'pending') {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 font-sans" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white/40 dark:bg-dark-secondary/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/5 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-green-50 dark:bg-green-950/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/10 border border-green-200/50 dark:border-green-900/30 animate-pulse">
            <Check className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400 mb-4 tracking-tight">
            تم إرسال طلبك بنجاح تام!
          </h1>
          <p className="text-base sm:text-lg text-accent dark:text-dark-text-secondary leading-relaxed mb-8">
            نشكرك على رغبتك في الانضمام إلينا والبدء في هذه الرحلة الممتعة. لقد قمنا بتسجيل طلبك بنجاح، وسيتواصل معك أحد مراجعينا الفنيين لمراجعة تفاصيل طلبك وأعمالك قريباً.
          </p>

          <div className="flex justify-center">
            <Link 
              href="/creators" 
              className="btn-primary px-8 py-4 text-base flex items-center justify-center gap-3"
            >
              <span>تصفح المنصة والمبدعين</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh transition-colors duration-300 font-sans relative overflow-hidden pb-20" dir="rtl">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[40vw] h-[40vw] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container-custom py-12 sm:py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          
          {/* Premium Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 sm:mb-20"
          >
            {/* Pulsing Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs sm:text-sm mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>انضم لمستقبل الإبداع العربي الرقمي</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-normal py-2 mb-6 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              كُن من صنّاع المحتوى والنخبة
            </h1>
            
            <p className="text-base sm:text-xl text-accent dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              حوّل مهاراتك في تنظيم وتصميم قوالب نوشن الرقمية إلى عوائد مالية مستمرة وشهرة واسعة في المنطقة العربية بأكملها.
            </p>
          </motion.div>

          {/* Premium Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative bg-white/40 dark:bg-dark-secondary/25 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>

                <div className="w-12 h-12 bg-gray-50 dark:bg-dark-tertiary rounded-2xl flex items-center justify-center mb-5 border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                  {b.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-accent dark:text-dark-text-primary mb-3">
                  {b.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-dark-text-secondary leading-relaxed font-medium flex-1">
                  {b.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Premium Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-white/40 dark:bg-dark-secondary/20 backdrop-blur-2xl rounded-[3rem] border border-white/30 dark:border-white/5 p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden"
          >
            {/* Subtle glow border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent-500/5 pointer-events-none rounded-[3rem]"></div>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              
              {/* SECTION: Personal Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-accent dark:text-dark-text-primary">
                    المعلومات الشخصية الأساسية
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  
                  {/* Name field */}
                  <div className="space-y-2 relative group">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      الاسم الكامل *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pl-12 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10 font-medium"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                      <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">يمكنك استخدام اسمك الفني أو تعديله كما ترغب بالظهور للجمهور.</p>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2 relative group">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pl-12 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-gray-100 dark:bg-dark-tertiary/10 text-gray-500 dark:text-gray-400 placeholder-gray-400 outline-none font-medium cursor-not-allowed"
                        placeholder="example@email.com"
                        required
                        disabled={isAuthenticated}
                      />
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">هذا هو البريد الإلكتروني الأساسي المرتبط بحسابك الحالي.</p>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary mb-1">
                      رقم الهاتف لتواصل المشرفين *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      
                      {/* Dropdown for Country Code */}
                      <div className="relative w-full sm:w-56" ref={countryDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="w-full px-4 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white outline-none flex items-center justify-between hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <ReactCountryFlag
                              countryCode={countryOptions.find(c => c.code === formData.countryCode)?.countryCode || 'EG'}
                              svg
                              style={{ width: '20px', height: '14px', borderRadius: '3px' }}
                            />
                            <span className="font-bold text-sm sm:text-base">({formData.countryCode})</span>
                          </div>
                          <span className="text-xs sm:text-sm font-bold truncate pr-2">
                            {countryOptions.find(c => c.code === formData.countryCode)?.name || 'Egypt'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isCountryDropdownOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
                            >
                              {countryOptions.map((country, index) => (
                                <button
                                  key={`${country.code}-${country.name}-${index}`}
                                  type="button"
                                  onClick={() => handleCountrySelect(country)}
                                  className="w-full px-4 py-3 text-right flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200"
                                >
                                  <ReactCountryFlag
                                    countryCode={country.countryCode}
                                    svg
                                    style={{ width: '18px', height: '12px', borderRadius: '2px' }}
                                  />
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-text-secondary flex-1 text-right truncate">
                                    {country.name} ({country.code})
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Phone input field */}
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onKeyDown={handlePhoneKeyDown}
                          className={`w-full px-5 py-4 pl-12 border-2 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 font-medium ${phoneError
                            ? 'border-red-500 focus:ring-red-500/10'
                            : 'border-gray-100 dark:border-white/5 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10'
                          }`}
                          placeholder="50 123 4567"
                          required
                        />
                        <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION: Professional Info */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 pb-4 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-accent dark:text-dark-text-primary">
                    الخبرة المهنية وصناعة القوالب
                  </h2>
                </div>

                <div className="space-y-6">
                  
                  {/* Portfolio field */}
                  <div className="space-y-2 relative group">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      رابط معرض أعمالك السابقة أو موقعك الشخصي
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full px-5 py-4 pl-12 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10 font-medium"
                        placeholder="https://example.com/portfolio (اختياري)"
                      />
                      <Globe className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">يمكنك مشاركة معرض أعمالك، موقعك الشخصي، أو أي منصة عرض أخرى تدعم مهاراتك.</p>
                  </div>

                  {/* Experience description */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      صف لنا خبرتك في إنشاء قوالب نوشن الرقمية أو التصميم *
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-5 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10 resize-none font-medium leading-relaxed"
                      placeholder="أخبرنا عن سنوات خبرتك، نوعية المشاريع التي قمت بتطويرها، وأبرز الأدوات والميزات التي تتقن استخدامها في نوشن..."
                      required
                    />
                  </div>

                  {/* Specialty selection */}
                  <div className="space-y-3 relative">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      المجالات والقطاعات التي تبدع وتختص فيها *
                    </label>
                    <p className="text-xs text-gray-400">اختر مجالاً واحداً أو أكثر من القائمة التالية لعرضها على ملفك الشخصي.</p>

                    <div className="relative" ref={specialtyDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                        className="w-full px-5 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white outline-none flex items-center justify-between hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 cursor-pointer text-right"
                      >
                        <span className="font-bold text-sm sm:text-base flex-1">
                          {formData.specialties.length > 0
                            ? formData.specialties.join('، ')
                            : 'اضغط هنا لاختيار مجالات اختصاصك'
                          }
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isSpecialtyDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isSpecialtyDropdownOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
                          >
                            {specialtyOptions.map((specialty) => (
                              <button
                                key={specialty}
                                type="button"
                                onClick={() => handleSpecialtySelect(specialty)}
                                className={`w-full px-4 py-3 text-right flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors duration-200 ${formData.specialties.includes(specialty)
                                  ? 'bg-primary/5 text-primary'
                                  : 'text-gray-700 dark:text-dark-text-secondary'
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-bold flex-1 text-right">
                                  {specialty}
                                </span>
                                {formData.specialties.includes(specialty) && (
                                  <Check className="w-4 h-4 text-primary" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Selected specialties chips */}
                    {formData.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.specialties.map((specialty) => (
                          <motion.span
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={specialty}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-primary/10 text-primary border border-primary/20"
                          >
                            <span>{specialty}</span>
                            <button
                              type="button"
                              onClick={() => handleSpecialtySelect(specialty)}
                              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Custom Specialty input if "أخرى" checked */}
                  <AnimatePresence>
                    {showCustomInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                          اكتب مجالك واختصاصك الخاص بشكل مخصص
                        </label>
                        <input
                          type="text"
                          name="customSpecialty"
                          value={customSpecialty}
                          onChange={handleChange}
                          onBlur={handleCustomSpecialtyBlur}
                          onKeyDown={handleCustomSpecialtyKeyDown}
                          className="w-full px-5 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10 font-medium"
                          placeholder="مثال: الهندسة المعمارية، الطب الوقائي، التخطيط المالي"
                        />
                        <p className="text-xs text-gray-400 mt-1">اكتب التخصص ثم اضغط خارج الحقل أو Enter للتأكيد. يمكنك إضافة تخصصات متعددة بفصلها بفاصلة.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Motivation field */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-bold text-accent dark:text-dark-text-primary">
                      لماذا ترغب بالانضمام كمبدع في منصة عرب نوشن؟ *
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-dark-tertiary/20 text-accent dark:text-white placeholder-gray-400 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-gray-300 dark:hover:border-white/10 resize-none font-medium leading-relaxed"
                      placeholder="أخبرنا عن شغفك، أهدافك، وما الذي تصبو لتحقيقه كصانع قوالب ومحتوى رقمي معنا..."
                      required
                    />
                  </div>

                </div>
              </div>

              {/* Terms and Submission */}
              <div className="space-y-6 pt-6">
                
                {/* Custom Styled Checklist box */}
                <div className="bg-gray-50/50 dark:bg-dark-tertiary/30 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${formData.agreeToTerms
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                        : 'border-gray-300 dark:border-white/10 group-hover:border-primary bg-white dark:bg-dark-tertiary'
                      }`}>
                        {formData.agreeToTerms && (
                          <Check className="w-4 h-4 font-black" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-right leading-relaxed font-semibold">
                      <span className="text-xs sm:text-sm text-accent dark:text-dark-text-secondary select-none">
                        أوافق بالكامل على{' '}
                        <Link href="/terms" className="text-primary hover:underline font-bold transition-all">
                          شروط وأحكام الانضمام
                        </Link>
                        {' '}و{' '}
                        <Link href="/privacy" className="text-primary hover:underline font-bold transition-all">
                          سياسة الخصوصية للمبدعين
                        </Link>
                        {' '}وأشهد بأن جميع المعلومات الواردة في طلبي صحيحة وموثوقة بنسبة 100%.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Smooth Error animation */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 dark:text-red-400 text-sm font-bold">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit and Cancel Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-100 dark:border-white/5">
                  <Link 
                    href="/" 
                    className="btn-secondary text-center px-10 py-4 text-base flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>إلغاء الطلب</span>
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-3 px-10 py-4 text-base font-black shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري إرسال طلبك...</span>
                      </>
                    ) : (
                      <>
                        <span>إرسال طلب الانضمام</span>
                        <Sparkles className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
