'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactCountryFlag from 'react-country-flag';
import { getApiBaseUrl } from '../lib/apiConfig';

const initialFormState = {
  name: '',
  email: '',
  whatsapp: '',
  countryCode: '+20',
  basedIn: '',
  linkedin: '',
  experience: [],
  coverLetter: '',
  resumeUrl: '',
  startTime: ''
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s()-]{7,}$/;

const countryOptions = [
  { name: 'Egypt', code: '+20', countryCode: 'EG' },
  { name: 'Saudi Arabia', code: '+966', countryCode: 'SA' },
  { name: 'United Arab Emirates', code: '+971', countryCode: 'AE' },
  { name: 'Kuwait', code: '+965', countryCode: 'KW' },
  { name: 'Qatar', code: '+974', countryCode: 'QA' },
  { name: 'Bahrain', code: '+973', countryCode: 'BH' },
  { name: 'Oman', code: '+968', countryCode: 'OM' },
  { name: 'Jordan', code: '+962', countryCode: 'JO' },
  { name: 'Lebanon', code: '+961', countryCode: 'LB' },
  { name: 'Palestine', code: '+970', countryCode: 'PS' },
  { name: 'Iraq', code: '+964', countryCode: 'IQ' },
  { name: 'Syria', code: '+963', countryCode: 'SY' },
  { name: 'Yemen', code: '+967', countryCode: 'YE' },
  { name: 'Libya', code: '+218', countryCode: 'LY' },
  { name: 'Tunisia', code: '+216', countryCode: 'TN' },
  { name: 'Algeria', code: '+213', countryCode: 'DZ' },
  { name: 'Morocco', code: '+212', countryCode: 'MA' },
  { name: 'Sudan', code: '+249', countryCode: 'SD' },
  { name: 'Somalia', code: '+252', countryCode: 'SO' },
  { name: 'Mauritania', code: '+222', countryCode: 'MR' },
  { name: 'United States', code: '+1', countryCode: 'US' },
  { name: 'United Kingdom', code: '+44', countryCode: 'GB' },
  { name: 'Canada', code: '+1', countryCode: 'CA' },
  { name: 'Australia', code: '+61', countryCode: 'AU' },
  { name: 'Germany', code: '+49', countryCode: 'DE' },
  { name: 'France', code: '+33', countryCode: 'FR' },
  { name: 'Turkey', code: '+90', countryCode: 'TR' }
];

const experienceOptions = [
  'مستشار نوشن معتمد أو سفير (Certified Consultant / Ambassador)',
  'مشرف معتمد (Certified Admin)',
  'بناء أنظمة نوشن للفرق والشركات',
  'أدوات الأتمتة (مثل Make – Zapier – n8n)',
  'العمل ضمن فريق أو شركة استشارات',
  'العمل مباشرة مع العملاء'
];

export default function JoinTeamForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);
  const apiBaseUrl = getApiBaseUrl();
  const totalSteps = 2;
  const formatWhatsappNumber = (countryCode, number) =>
    `${countryCode} ${number}`.replace(/\s+/g, ' ').trim();
  const isValidWhatsApp = (number, countryCode) =>
    phonePattern.test(formatWhatsappNumber(countryCode, number));
  const selectedCountry =
    countryOptions.find((country) => country.code === formData.countryCode)
    || countryOptions.find((country) => country.code === '+20');

  useEffect(() => {
    setErrors({});
  }, [step]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target ?? event;
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _ignored, ...rest } = prev;
        return rest;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountrySelect = (country) => {
    handleChange({ name: 'countryCode', value: country.code });
    setIsCountryDropdownOpen(false);
  };

  const validateStep = (currentStep, shouldShowError = true) => {
    const nextErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        nextErrors.name = 'يرجى إدخال الاسم الكامل.';
      }
      if (!formData.email.trim()) {
        nextErrors.email = 'يرجى إدخال البريد الإلكتروني.';
      } else if (!emailPattern.test(formData.email.trim())) {
        nextErrors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
      }
      if (!formData.whatsapp.trim()) {
        nextErrors.whatsapp = 'يرجى إدخال رقم التواصل.';
      } else if (!isValidWhatsApp(formData.whatsapp, formData.countryCode)) {
        nextErrors.whatsapp = 'يرجى إدخال رقم صحيح مع رمز الدولة.';
      }
      if (!formData.basedIn.trim()) {
        nextErrors.basedIn = 'يرجى كتابة مكان تواجدك.';
      }
      if (formData.experience.length === 0) {
        nextErrors.experience = 'يرجى اختيار خبرة واحدة على الأقل.';
      }
    }

    if (currentStep === 2) {
      if (!resumeFile && !formData.resumeUrl) {
        nextErrors.resumeFile = 'يرجى رفع السيرة الذاتية.';
      }
      if (!formData.coverLetter.trim() || formData.coverLetter.trim().length < 20) {
        nextErrors.coverLetter = 'يرجى كتابة سبب مناسب للانضمام (20 حرفاً على الأقل).';
      }
      if (!formData.startTime.trim()) {
        nextErrors.startTime = 'يرجى تحديد موعد البدء.';
      }
    }

    const hasErrors = Object.keys(nextErrors).length > 0;
    if (shouldShowError) {
      setErrors(nextErrors);
      if (hasErrors) {
        setStatus({ type: 'error', message: 'يرجى تصحيح الحقول المميزة أدناه.' });
      }
    }
    return !hasErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step < totalSteps) {
      handleNext();
      return;
    }
    if (!validateStep(step)) {
      return;
    }
    setLoading(true);
    setStatus({ type: '', message: '' });

    let resumeUrl = formData.resumeUrl;
    if (resumeFile && !resumeUrl) {
      try {
        setResumeUploading(true);
        const formPayload = new FormData();
        formPayload.append('resume', resumeFile);
        const uploadResponse = await fetch(`${apiBaseUrl}/upload/resume`, {
          method: 'POST',
          body: formPayload
        });
        let uploadData = {};
        try {
          uploadData = await uploadResponse.json();
        } catch (parseError) {
          uploadData = {};
        }
        if (!uploadResponse.ok || uploadData.success === false) {
          throw new Error(uploadData.message || 'تعذر رفع السيرة الذاتية.');
        }
        resumeUrl = uploadData.data?.fileUrl || '';
        setFormData((prev) => ({
          ...prev,
          resumeUrl
        }));
      } catch (error) {
        setStatus({
          type: 'error',
          message: error.message || 'حدث خطأ أثناء رفع السيرة الذاتية.'
        });
        setLoading(false);
        setResumeUploading(false);
        return;
      } finally {
        setResumeUploading(false);
      }
    }

    const formattedWhatsapp = formatWhatsappNumber(formData.countryCode, formData.whatsapp);
    const messageLines = [
      `الاسم: ${formData.name}`,
      `البريد: ${formData.email}`,
      `واتساب: ${formattedWhatsapp || 'غير مذكور'}`,
      `الموقع: ${formData.basedIn}`,
      `لينكدإن: ${formData.linkedin || 'غير مذكور'}`,
      `الخبرات: ${formData.experience.length ? formData.experience.join('، ') : 'غير مذكور'}`,
      `السيرة الذاتية: ${resumeUrl || 'غير مذكور'}`,
      `موعد البدء: ${formData.startTime || 'غير مذكور'}`,
      '---',
      formData.coverLetter
    ];

    try {
      const response = await fetch(`${apiBaseUrl}/contact/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'طلب انضمام للفريق',
          category: 'careers',
          message: messageLines.join('\n'),
          whatsapp: formattedWhatsapp,
          basedIn: formData.basedIn,
          linkedin: formData.linkedin,
          experience: formData.experience,
          coverLetter: formData.coverLetter,
          resumeUrl: resumeUrl,
          startTime: formData.startTime
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseError) {
        data = {};
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'تعذر إرسال الطلب. يرجى المحاولة لاحقاً.');
      }

      setStatus({
        type: 'success',
        message: data.message || 'تم استلام طلبك بنجاح! سنعود إليك قريباً.'
      });
      setFormData(initialFormState);
      setResumeFile(null);
      setErrors({});
      setStep(1);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-xs text-red-600 dark:text-red-300">
        {errors[field]}
      </p>
    ) : null;

  const handleNext = () => {
    setStatus({ type: '', message: '' });
    if (!validateStep(step)) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStatus({ type: '', message: '' });
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="w-full">
      {status.message && status.type !== 'success' && (
        <div className={`mb-5 rounded-xl border px-4 py-4 text-xs sm:text-sm ${status.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      {typeof document !== 'undefined' && createPortal(
        status.type === 'success' && status.message ? (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl border border-gray-100 dark:border-dark-card-border bg-white dark:bg-dark-secondary px-5 py-4 text-center shadow-xl">
              <p className="text-sm sm:text-base font-medium text-accent-600 dark:text-dark-text-primary">
                {status.message}
              </p>
              <button
                type="button"
                onClick={() => setStatus({ type: '', message: '' })}
                className="btn-primary text-sm sm:text-base px-6 py-2.5 w-full mt-4"
              >
                تم
              </button>
            </div>
          </div>
        ) : null,
        document.body
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
      >
        <div className="flex items-center justify-between text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">
          <span>الخطوة {step} من {totalSteps}</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, idx) => idx + 1).map((dot) => (
              <span
                key={dot}
                className={`h-2 w-2 rounded-full transition-colors ${step >= dot
                  ? 'bg-primary-500 dark:bg-orange-500'
                  : 'bg-gray-300 dark:bg-dark-card-border'
                  }`}
              />
            ))}
          </div>
        </div>
        <div
          key={step}
          className="step-transition grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  الاسم الكامل
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="اكتب اسمك الكامل"
                />
                {renderError('name')}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  البريد الإلكتروني
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  maxLength={254}
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="example@email.com"
                />
                {renderError('email')}
              </div>

              <div className="form-group md:col-span-2">
                <label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  رقم التواصل
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="tel"
                      id="whatsapp"
                      name="whatsapp"
                      required
                      inputMode="tel"
                      pattern="^[0-9][0-9\s()-]{6,}$"
                      dir="ltr"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.whatsapp)}
                      aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-left border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                      placeholder="مثال: 01034256344"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                  <div className="relative w-full sm:w-28" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm border rounded-lg sm:rounded-xl text-right flex items-center justify-between gap-2 transition-colors duration-200 ${isCountryDropdownOpen
                        ? 'border-primary-500 ring-2 ring-primary-500'
                        : 'border-gray-200 dark:border-dark-input-border'
                        } bg-white dark:bg-dark-secondary`}
                      aria-haspopup="listbox"
                      aria-expanded={isCountryDropdownOpen}
                    >
                      <span className="flex-1 text-right truncate">
                        {selectedCountry ? selectedCountry.code : formData.countryCode}
                      </span>
                      <ReactCountryFlag
                        countryCode={selectedCountry?.countryCode || 'EG'}
                        svg
                        style={{ width: '16px', height: '12px' }}
                        className="sm:w-5 sm:h-4"
                      />
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {isCountryDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute z-50 w-full mt-2 max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg"
                      >
                        {countryOptions.map((country, index) => (
                          <button
                            key={`${country.code}-${country.name}-${index}`}
                            type="button"
                            role="option"
                            aria-selected={country.code === formData.countryCode}
                            onClick={() => handleCountrySelect(country)}
                            className={`w-full text-right px-4 py-2 text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 ${country.code === formData.countryCode
                              ? 'bg-primary-50 text-primary-600 dark:bg-orange-500/10 dark:text-orange-300'
                              : 'text-accent-600 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                              }`}
                          >
                            <span className="truncate">{country.code}</span>
                            <ReactCountryFlag
                              countryCode={country.countryCode}
                              svg
                              style={{ width: '16px', height: '12px' }}
                              className="sm:w-5 sm:h-4"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {renderError('whatsapp')}
              </div>

              <div className="form-group">
                <label htmlFor="basedIn" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  أين تقيم؟ (الدولة/المدينة)
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="basedIn"
                  name="basedIn"
                  required
                  maxLength={120}
                  value={formData.basedIn}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.basedIn)}
                  aria-describedby={errors.basedIn ? 'basedIn-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="مثال: القاهرة، مصر"
                />
                <p className="mt-1 text-xs font-normal text-gray-500 dark:text-dark-text-tertiary">
                  (يساعدنا ذلك على فهم المنطقة الزمنية والمتطلبات المالية والقانونية)
                </p>
                {renderError('basedIn')}
              </div>

              <div className="form-group">
                <label htmlFor="linkedin" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  ملف LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  inputMode="url"
                  maxLength={200}
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  هل لديك خبرة في أي من التالي؟ (يمكن اختيار أكثر من خيار)
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {experienceOptions.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs sm:text-sm cursor-pointer transition-colors ${formData.experience.includes(option)
                        ? 'border-primary-500 bg-primary-50 dark:bg-orange-500/10 dark:border-orange-400'
                        : 'border-gray-200 dark:border-dark-input-border'
                        }`}
                    >
                      <input
                        type="checkbox"
                        name="experience"
                        value={option}
                        checked={formData.experience.includes(option)}
                        onChange={(event) => {
                          const value = event.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            experience: prev.experience.includes(value)
                              ? prev.experience.filter((item) => item !== value)
                              : [...prev.experience, value]
                          }));
                        }}
                        className="accent-primary-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {renderError('experience')}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-group md:col-span-2">
                <label htmlFor="resumeFile" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  رفع السيرة الذاتية (CV/Resume)
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-200 dark:border-dark-input-border bg-white dark:bg-dark-secondary px-3 sm:px-4 py-3">
                  <input
                    type="file"
                    id="resumeFile"
                    name="resumeFile"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setResumeFile(file);
                      setFormData((prev) => ({
                        ...prev,
                        resumeUrl: ''
                      }));
                      if (errors.resumeFile) {
                        setErrors((prev) => {
                          const { resumeFile: _ignored, ...rest } = prev;
                          return rest;
                        });
                      }
                    }}
                    className="sr-only"
                  />
                  <label
                    htmlFor="resumeFile"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${resumeUploading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-tertiary dark:text-dark-text-tertiary'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20'
                      }`}
                  >
                    {resumeUploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.95-4.95l-2.83 2.83M9.88 14.12l-2.83 2.83m0-9.66 2.83 2.83m7.07 7.07 2.83 2.83" />
                        </svg>
                        جارٍ الرفع...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                        </svg>
                        اختر ملف السيرة
                      </>
                    )}
                  </label>
                  <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary break-words">
                    {resumeFile ? resumeFile.name : 'لم يتم اختيار ملف بعد'}
                  </div>
                </div>
                <p className="mt-2 text-xs text-accent-500 dark:text-dark-text-tertiary">
                  الصيغ المسموحة: PDF أو Word. الحد الأقصى 10MB.
                </p>
                {resumeUploading && (
                  <p className="mt-2 text-xs text-primary-500">جارٍ رفع السيرة الذاتية...</p>
                )}
                {renderError('resumeFile')}
              </div>

              <div className="form-group">
                <label htmlFor="startTime" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  متى يمكنك البدء؟
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <input
                  type="text"
                  id="startTime"
                  name="startTime"
                  required
                  maxLength={120}
                  value={formData.startTime}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.startTime)}
                  aria-describedby={errors.startTime ? 'startTime-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  placeholder="مثال: خلال أسبوعين"
                />
                {renderError('startTime')}
              </div>

              <div className="form-group md:col-span-2">
                <label htmlFor="coverLetter" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                  رسالة تعريفية قصيرة
                  <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={4}
                  required
                  minLength={20}
                  maxLength={1200}
                  value={formData.coverLetter}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.coverLetter)}
                  aria-describedby={errors.coverLetter ? 'coverLetter-error' : undefined}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-right border border-gray-200 dark:border-dark-input-border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                  placeholder="لماذا ترى أن هذا الدور مناسب لك؟ وما الخبرات المرتبطة؟"
                />
                {renderError('coverLetter')}
              </div>
            </>
          )}

        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full flex-col sm:flex-row gap-3 sm:items-center">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto"
              >
                رجوع
              </button>
            )}
            {step < totalSteps ? (
              <button
                key="next-btn"
                type="button"
                onClick={handleNext}
                className="btn-primary text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto"
              >
                التالي
              </button>
            ) : (
              <button
                key="submit-btn"
                type="submit"
                className="btn-primary text-sm sm:text-base px-6 sm:px-7 py-3 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading || resumeUploading}
              >
                {loading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
