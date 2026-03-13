'use client';

import { useRef, useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../lib/apiConfig';
import { getTrackingData } from './ReferralHandler';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, X, Calendar } from 'lucide-react';
import PhoneInput from './ui/PhoneInput';

// --- Constants & Config ---
const initialFormState = {
  name: '',
  email: '',
  whatsapp: '',
  countryCode: '+20',
  companyType: '', // 'Individual' or 'Company'
  teamSize: '',
  role: '',
  projectHelp: '',
  companyName: '',
  budget: '',
  timeline: '',
  companyWebsite: '',
  serviceType: [],
  details: '',
  source: 'website-contact'
};



// Reusing patterns from original file
const phonePattern = /^\+?[0-9][0-9\s()-]{7,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const apiBaseUrl = getApiBaseUrl();

// --- Components ---

const StepIndicator = ({ current, total }) => (
  <div className="w-full h-1 bg-gray-100 dark:bg-dark-card-border rounded-full overflow-hidden mb-8">
    <motion.div
      className="h-full bg-primary-500"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </div>
);

const Question = ({ children, isActive, title, subtitle }) => (
  <AnimatePresence mode='wait'>
    {isActive && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-800 dark:text-white mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-accent-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const InputField = ({ type = "text", placeholder, value, onChange, name, autoFocus, onSubmit }) => (
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    autoFocus={autoFocus}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    }}
    className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 text-2xl sm:text-3xl py-4 transition-colors outline-none text-accent-800 dark:text-white placeholder-gray-300 dark:placeholder-gray-600"
  />
);

const SelectionCard = ({ label, selected, onClick, icon }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${selected
      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
      : 'border-gray-100 dark:border-dark-card-border hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-dark-card-bg'
      }`}
  >
    <span className={`text-lg font-medium ${selected ? 'text-primary-700 dark:text-primary-400' : 'text-accent-600 dark:text-gray-300'}`}>
      {label}
    </span>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected
      ? 'border-primary-500 bg-primary-500 text-white'
      : 'border-gray-300 dark:border-gray-600 text-transparent group-hover:border-primary-400'
      }`}>
      <Check size={14} strokeWidth={3} />
    </div>
  </div>
);

export default function ConsultationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [step, setStep] = useState(0); // 0-based index for easier array mapping
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showCalendar, setShowCalendar] = useState(false);


  // --- Steps Definition ---
  // We define steps dynamically based on user selection (Individual vs Company)
  const getQuestions = (data = formData) => {
    const baseSteps = [
      { id: 'marketing-intro', type: 'intro' }, // 0
      { id: 'companyType', type: 'selection' }, // 1
    ];

    let dynamicSteps = [];

    if (data.companyType === 'Individual') {
      dynamicSteps = [
        { id: 'name', type: 'input', label: 'الاسم الكامل', placeholder: 'اكتب اسمك هنا...' },
        { id: 'email', type: 'input', label: 'البريد الإلكتروني', placeholder: 'name@example.com' },
        { id: 'whatsapp', type: 'phone', label: 'رقم الواتساب' },
        { id: 'serviceType', type: 'multi-selection', label: 'نوع الخدمة المطلوبة' },
        { id: 'budget', type: 'selection', label: 'الميزانية التقديرية' },
        { id: 'timeline', type: 'selection', label: 'متى تريد البدء؟' },
        { id: 'details', type: 'textarea', label: 'نبذة عن احتياجك' },
      ];
    } else if (data.companyType === 'Company') {
      dynamicSteps = [
        { id: 'companyName', type: 'input', label: 'اسم الشركة', placeholder: 'اكتب اسم الشركة...' },
        { id: 'role', type: 'input', label: 'دورك في الشركة', placeholder: 'مثال: المدير التنفيذي' },
        { id: 'teamSize', type: 'selection', label: 'حجم الفريق' },
        { id: 'name', type: 'input', label: 'اسمك الكامل', placeholder: 'اكتب اسمك هنا...' },
        { id: 'email', type: 'input', label: 'البريد الإلكتروني للعمل', placeholder: 'name@company.com' },
        { id: 'whatsapp', type: 'phone', label: 'رقم للتواصل (واتساب)' },
        { id: 'serviceType', type: 'multi-selection', label: 'نوع الخدمة المطلوبة' }, // Added for companies
        { id: 'companyWebsite', type: 'input', label: 'موقع الشركة (اختياري)', placeholder: 'example.com' },
        { id: 'projectHelp', type: 'input', label: 'ما المشروع الذي تحتاج مساعدة فيه؟', placeholder: 'وصف قصير...' },
        { id: 'budget', type: 'selection', label: 'الميزانية التقديرية' },
        { id: 'timeline', type: 'selection', label: 'متى تريد البدء؟' },
      ];
    } else {
      // Initial state before selection
      dynamicSteps = [];
    }

    return [...baseSteps, ...dynamicSteps];
  };

  const steps = getQuestions();
  const currentQuestion = steps[step];

  // Auto-advance logic for some selections handled in render
  // Scroll to top on step change
  useEffect(() => {
    // Optional: Smooth scroll if needed, but focus flow usually doesn't need it if centered
  }, [step]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateCurrentStep = (overrideValue = undefined) => {
    if (!currentQuestion) return true;
    // Use overrideValue if provided, otherwise fallback to state
    // Important: check against undefined because the value might be empty string or false
    const val = overrideValue !== undefined ? overrideValue : formData[currentQuestion.id];

    switch (currentQuestion.id) {
      case 'name':
      case 'companyName':
      case 'role':
      case 'projectHelp':
        if (!val || val.trim().length < 2) return 'يرجى إدخال قيمة صحيحة (حرفين على الأقل).';
        break;
      case 'email':
        if (!val || !emailPattern.test(val)) return 'يرجى إدخال بريد إلكتروني صحيح.';
        break;
      case 'whatsapp':
        // Check if empty
        if (!val) return 'يرجى إدخال رقم الواتساب.';
        // Simple numeric check for now combined with existing pattern logic if strict
        break;
      case 'companyType':
        if (!val) return 'يرجى اختيار نوع الحساب.';
        break;
      case 'serviceType':
        if (!val || val.length === 0) return 'يرجى اختيار خدمة واحدة على الأقل.';
        break;
      case 'details':
        if (!val || val.trim().length < 10) return 'يرجى كتابة تفاصيل أكثر قليلاً.';
        break;
      default:
        // For other selects like budget, timeline, teamSize
        if (currentQuestion.type === 'selection' && !val) return 'يرجى اختيار إجابة.';
        break;
    }
    return null;
  };

  const handleNext = (overrideValue = undefined) => {
    const errorMsg = validateCurrentStep(overrideValue);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    // Predict the next state to calculate the correct number of steps
    // (Crucial for dynamic steps based on companyType)
    const nextFormData = overrideValue !== undefined
      ? { ...formData, [currentQuestion.id]: overrideValue }
      : formData;
    const currentSteps = getQuestions(nextFormData);

    if (step < currentSteps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit(overrideValue);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
      setError('');
    }
  };

  const handleSubmit = async (finalValue = undefined) => {
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Get tracking data (ref, utm_source) from localStorage
      const trackingData = getTrackingData();

      // Use override value for the current field if provided (fixes stale state on last step auto-advance)
      const submissionData = { ...formData, ...trackingData };

      // CRITICAL FIX: If finalValue is provided, FORCE update the current field in submission data
      // This handles cases where state hasn't updated yet (common with auto-advance or quick clicks)
      if (finalValue !== undefined && currentQuestion) {
        submissionData[currentQuestion.id] = finalValue;
      } else if (currentQuestion && !submissionData[currentQuestion.id]) {
        // Fallback: If no override, but current field is empty in state, 
        // it might be a race condition. Check if we can get it from the event? 
        // (Actually, relying on state is usually safe unless it's the very last fast-click)
      }

      const { countryCode, ...rest } = submissionData;
      const formattedWhatsapp = `${countryCode} ${rest.whatsapp}`.trim();
      const payload = { ...rest, whatsapp: formattedWhatsapp };

      const response = await fetch(`${apiBaseUrl}/contact/consultation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'تعذر إرسال الطلب.');
      }

      setStatus({ type: 'success', message: 'تم استلام طلبك بنجاح! سنتواصل معك قريباً.' });


    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'حدث خطأ. حاول مرة أخرى.' });
      setLoading(false);
    }
  };

  // Render Helpers
  const renderIntro = () => (
    <div className="text-center py-10">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
        className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400"
      >
        <CheckCircle2 size={40} />
      </motion.div>
      <h2 className="text-3xl md:text-5xl font-bold mb-4 text-accent-800 dark:text-white">أهلاً بك</h2>
      <p className="text-xl text-accent-600 dark:text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
        يسعدنا اهتمامك بالعمل معنا. لنبدأ ببضع أسئلة قصيرة لنفهم احتياجك بشكل أفضل.
      </p>
      <button
        onClick={() => setStep(1)}
        className="btn-primary text-xl px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
      >
        ابدأ الآن
      </button>
    </div>
  );

  const renderSelection = (options, multi = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
      {options.map((opt) => {
        const isSelected = multi
          ? formData[currentQuestion.id]?.includes(opt.value)
          : formData[currentQuestion.id] === opt.value;

        return (
          <SelectionCard
            key={opt.value}
            label={opt.label}
            selected={isSelected}
            onClick={() => {
              if (multi) {
                const current = formData[currentQuestion.id] || [];
                const updated = current.includes(opt.value)
                  ? current.filter(i => i !== opt.value)
                  : [...current, opt.value];
                handleChange(currentQuestion.id, updated);
              } else {
                handleChange(currentQuestion.id, opt.value);
                // Auto advance for single select - pass the value explicitly to validate against it
                // We add a small delay for visual feedback, but the value is constrained
                setTimeout(() => handleNext(opt.value), 300);
              }
            }}
          />
        );
      })}
    </div>
  );

  const renderInput = () => (
    <div className="relative">
      {currentQuestion.id === 'whatsapp' ? (
        <PhoneInput
          value={formData.whatsapp}
          onChange={(val) => handleChange('whatsapp', val)}
          countryCode={formData.countryCode}
          onCountryChange={(code) => handleChange('countryCode', code)}
          className="border-b-2 border-gray-200 dark:border-gray-700 pb-2"
          placeholder="100 000 0000"
        />
      ) : currentQuestion.type === 'textarea' ? (
        <textarea
          rows={4}
          placeholder={currentQuestion.placeholder}
          value={formData[currentQuestion.id]}
          onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
          className="w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 text-xl sm:text-2xl py-4 transition-colors outline-none text-accent-800 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 resize-none"
          autoFocus
        />
      ) : (
        <InputField
          name={currentQuestion.id}
          placeholder={currentQuestion.placeholder}
          value={formData[currentQuestion.id]}
          onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
          autoFocus
          onSubmit={handleNext}
        />
      )}
    </div>
  );

  // State for calendar modal moved to top level
  // const [showCalendar, setShowCalendar] = useState(false);  <-- Was here



  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const consultationUrl = "https://calendar.notion.so/meet/notionarabs/discovery-call";

  if (status.type === 'success') {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center py-10">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400 font-bold">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-accent-800 dark:text-white">تم استلام طلبك بنجاح!</h2>
        <p className="text-lg text-accent-600 dark:text-gray-400 max-w-xl mb-8">
          شكراً لتواصلك معنا. لقد قمنا بإرسال رابط حجز الموعد إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها) لاختيار الوقت المناسب للاجتماع.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={() => setShowCalendar(true)}
            type="button"
            className="btn-primary py-4 px-8 rounded-2xl flex items-center gap-2 text-lg shadow-xl hover:shadow-primary-500/20 transition-all font-bold"
          >
            <Calendar size={22} />
            احجز موعدك الآن
          </button>

          <button
            onClick={() => window.location.reload()}
            type="button"
            className="px-6 py-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
          >
            العودة للرئيسية
          </button>
        </div>

        {/* Calendar Modal */}
        <AnimatePresence>
          {showCalendar && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" dir="ltr">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCalendar(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative bg-white dark:bg-dark-secondary w-full max-w-5xl h-[90vh] sm:h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-4 right-4 z-[110] p-2.5 bg-gray-100/80 dark:bg-white/10 backdrop-blur-md rounded-full hover:bg-white dark:hover:bg-white/20 transition-all shadow-lg active:scale-90"
                  aria-label="إغلاق"
                >
                  <X size={20} className="text-gray-800 dark:text-white" />
                </button>

                {/* Loading Indicator */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                  <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                </div>

                <iframe
                  src={consultationUrl}
                  className="w-full h-full border-none relative z-[105]"
                  title="Book Consultation"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 min-h-[60vh] flex flex-col justify-center">

      {/* Intro Step is special */}
      {currentQuestion && currentQuestion.type === 'intro' ? (
        renderIntro()
      ) : (
        <>
          {/* Progress Bar (only meaningful after intro) */}
          <StepIndicator current={step} total={steps.length} />

          {/* Question Content */}
          <Question
            isActive={true}
            title={currentQuestion?.label || ''}
            subtitle={currentQuestion?.type === 'multi-selection' ? 'يمكنك اختيار أكثر من إجابة' : null}
          >
            {
              currentQuestion?.id === 'companyType' ? renderSelection([
                { value: 'Individual', label: 'فرد / رائد أعمال' },
                { value: 'Company', label: 'شركة / فريق عمل' }
              ]) :
                currentQuestion?.id === 'serviceType' ? renderSelection([
                  { value: 'خدمات برمجية', label: 'خدمات برمجية' },
                  { value: '(Workspace) بناء نظام نوشن', label: '(Workspace) بناء نظام نوشن' },
                  { value: '(Automation) ربط وأتمتة', label: '(Automation) ربط وأتمتة' },
                  { value: 'تدريب واستشارات', label: 'تدريب واستشارات' }
                ], true) :
                  currentQuestion?.id === 'teamSize' ? renderSelection([
                    { value: '1-5', label: '1 - 5 موظفين' },
                    { value: '5-20', label: '5 - 20 موظف' },
                    { value: '20+', label: 'أكثر من 20' }
                  ]) :
                    currentQuestion?.id === 'budget' ? renderSelection([
                      { value: 'أقل من 500', label: 'أقل من 500 ريال' },
                      { value: '500 - 1000', label: '500 - 1,000 ريال' },
                      { value: '1000 - 3000', label: '1,000 - 3,000 ريال' },
                      { value: '3000 - 10000', label: '3,000 - 10,000 ريال' },
                      { value: 'أكثر من 10000', label: 'أكثر من 10,000 ريال' }
                    ]) :
                      currentQuestion?.id === 'timeline' ? renderSelection([
                        { value: 'فوراً', label: 'فوراً' },
                        { value: '3-2 أسابيع', label: '2-3 أسابيع' },
                        { value: '2-1 شهر', label: '1-2 شهر' },
                        { value: '4-2 أشهر', label: '2-4 أشهر' },
                        { value: '8-4 أشهر', label: '4-8 أشهر' },
                        { value: 'مرن', label: 'مرن / لا يوجد موعد محدد' }
                      ]) :
                        // Default Input Steps
                        renderInput()
            }

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 mt-4 text-sm font-medium flex items-center gap-2"
              >
                <span>⚠️</span> {error}
              </motion.p>
            )}

            {/* Navigation Controls */}
            <div className="flex items-center gap-4 mt-12 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => handleNext(formData[currentQuestion.id])}
                disabled={loading}
                className="btn-primary rounded-xl px-8 py-3 text-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait w-full sm:w-auto justify-center"
              >
                {loading ? 'جارٍ الإرسال...' : (step === steps.length - 1 ? 'إرسال الطلب' : 'التالي')}
                {!loading && step !== steps.length - 1 && <ArrowLeft size={20} />}
              </button>

              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-accent-500 hover:text-accent-800 dark:text-gray-400 dark:hover:text-white transition-colors w-full sm:w-auto"
                >
                  رجوع
                </button>
              )}

              <span className="text-xs text-gray-400 mr-auto hidden sm:block">
                ضغط <strong>Enter ↵</strong> للمتابعة
              </span>
            </div>
          </Question>
        </>
      )}
    </div>
  );
}
