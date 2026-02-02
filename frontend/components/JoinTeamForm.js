'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../lib/apiConfig';
import PhoneInput from './ui/PhoneInput';
import {
  User,
  Briefcase,
  FileText,
  Upload,
  Check,
  ChevronLeft,
  AlertCircle,
  Send
} from 'lucide-react';

// --- Constants ---
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



const experienceOptions = [
  'مستشار نوشن معتمد (Certified Consultant)',
  'مشرف معتمد (Certified Admin)',
  'بناء أنظمة نوشن للفرق والشركات',
  'أدوات الأتمتة (Make – Zapier – n8n)',
  'العمل ضمن فريق استشارات',
  'العمل الحر مع العملاء'
];

// --- Tabs Configuration ---
const TABS = [
  { id: 'basics', label: 'البيانات الأساسية', icon: User },
  { id: 'experience', label: 'الخبرات والمهارات', icon: Briefcase },
  { id: 'portfolio', label: 'السيرة والملفات', icon: FileText },
];

// --- Components ---
const InputGroup = ({ label, error, children, required }) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`transition-all duration-200 ${error ? 'ring-2 ring-red-100 rounded-xl' : ''}`}>
      {children}
    </div>
    {error && (
      <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs font-medium px-1">
        <AlertCircle size={12} />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const TabButton = ({ tab, isActive, onClick, hasError }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all
      ${isActive
        ? 'text-primary-600 dark:text-primary-400 bg-white dark:bg-dark-card-bg border-t-2 border-primary-500 z-10'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-dark-tertiary border-b border-gray-200 dark:border-dark-card-border'
      }
    `}
  >
    <tab.icon size={16} />
    <span>{tab.label}</span>
    {hasError && <span className="w-2 h-2 bg-red-500 rounded-full" />}
  </button>
);

export default function JoinTeamForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [activeTab, setActiveTab] = useState('basics');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  const apiBaseUrl = getApiBaseUrl();

  // --- Helpers ---
  const formatWhatsappNumber = (countryCode, number) => `${countryCode} ${number}`.replace(/\s+/g, ' ').trim();
  const isValidWhatsApp = (number, countryCode) => phonePattern.test(formatWhatsappNumber(countryCode, number));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateTab = (tabId) => {
    const newErrors = {};

    if (tabId === 'basics') {
      if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'الاسم مطلوب';
      if (!formData.email.trim() || !emailPattern.test(formData.email)) newErrors.email = 'بريد إلكتروني غير صحيح';
      if (!formData.whatsapp.trim()) newErrors.whatsapp = 'رقم الواتساب مطلوب';
      if (!formData.basedIn.trim()) newErrors.basedIn = 'الموقع مطلوب';
    }

    if (tabId === 'experience') {
      if (formData.experience.length === 0) newErrors.experience = 'اختر خبرة واحدة على الأقل';
      if (!formData.startTime.trim()) newErrors.startTime = 'موعد البدء مطلوب';
    }

    if (tabId === 'portfolio') {
      if (!resumeFile && !formData.resumeUrl) newErrors.resumeFile = 'السيرة الذاتية مطلوبة';
      if (!formData.coverLetter.trim() || formData.coverLetter.length < 20) newErrors.coverLetter = 'الرسالة قصيرة جداً';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const attemptTabSwitch = (targetTab) => {
    // Optional: Validate current tab before leaving? 
    // For "Dossier" feel, let them jump around, but highlight errors if they leave invalid state.
    // Here we'll just switch.
    setActiveTab(targetTab);
  };

  const handleNext = () => {
    const currentIndex = TABS.findIndex(t => t.id === activeTab);
    if (validateTab(activeTab)) {
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateTab('basics') || !validateTab('experience') || !validateTab('portfolio')) {
      setStatus({ type: 'error', message: 'يرجى التأكد من تعبئة جميع الحقول المطلوبة في كافة الأقسام.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    // 1. Upload Resume Logic
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
        const uploadData = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok || uploadData.success === false) throw new Error(uploadData.message || 'فشل رفع الملف');
        resumeUrl = uploadData.data?.fileUrl || '';
      } catch (error) {
        setStatus({ type: 'error', message: 'تعذر رفع السيرة الذاتية. حاول مرة أخرى.' });
        setLoading(false);
        setResumeUploading(false);
        return;
      }
      setResumeUploading(false);
    }

    // 2. Submit Form
    try {
      const formattedWhatsapp = formatWhatsappNumber(formData.countryCode, formData.whatsapp);
      const messageLines = [
        `الاسم: ${formData.name}`,
        `البريد: ${formData.email}`,
        `واتساب: ${formattedWhatsapp}`,
        `الموقع: ${formData.basedIn}`,
        `لينكدإن: ${formData.linkedin || '-'}`,
        `الخبرات: ${formData.experience.join('، ')}`,
        `السيرة الذاتية: ${resumeUrl}`,
        `موعد البدء: ${formData.startTime}`,
        '---',
        formData.coverLetter
      ];

      const response = await fetch(`${apiBaseUrl}/contact/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'طلب انضمام للفريق (Dossier)',
          category: 'careers',
          message: messageLines.join('\n'),
          whatsapp: formattedWhatsapp,
          basedIn: formData.basedIn,
          linkedin: formData.linkedin,
          experience: formData.experience,
          coverLetter: formData.coverLetter,
          resumeUrl,
          startTime: formData.startTime
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || 'فشل الإرسال');

      setStatus({ type: 'success', message: 'تم استلام ملفك بنجاح! سنقوم بمراجعته والتواصل معك.' });
      setFormData(initialFormState);
      setResumeFile(null);
      setActiveTab('basics');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'حدث خطأ غير متوقع.' });
    } finally {
      setLoading(false);
    }
  };

  if (status.type === 'success') {
    return (
      <div className="bg-white dark:bg-dark-card-bg rounded-3xl p-8 md:p-12 text-center shadow-lg border border-gray-100 dark:border-dark-card-border">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
          <Check size={40} strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-bold mb-2">تم تسجيل ملفك!</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{status.message}</p>
        <button onClick={() => setStatus({ type: '', message: '' })} className="text-primary-600 font-medium hover:underline">
          إرسال طلب آخر
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Status Messages */}
      {status.message && status.type === 'error' && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {status.message}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-dark-card-border overflow-x-auto scrolbar-hide">
        {TABS.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => attemptTabSwitch(tab.id)}
            // Simple heuristic for checking errors in other tabs could go here
            hasError={false} // Implemet logic if desired
          />
        ))}
        {/* Spacer to fill line */}
        <div className="flex-1 border-b border-gray-200 dark:border-dark-card-border bg-gray-50 dark:bg-dark-tertiary" />
      </div>

      {/* Main Card Content */}
      <div className="bg-white dark:bg-dark-card-bg shadow-xl rounded-b-3xl rounded-tr-3xl min-h-[500px] flex flex-col">
        <div className="p-6 md:p-8 flex-1">
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'basics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="الاسم الكامل" required error={errors.name}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="الاسم الثلاثي"
                    />
                  </InputGroup>

                  <InputGroup label="البريد الإلكتروني" required error={errors.email}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </InputGroup>

                  <InputGroup label="رقم الواتساب" required error={errors.whatsapp}>
                    <PhoneInput
                      value={formData.whatsapp}
                      onChange={(val) => handleChange('whatsapp', val)}
                      countryCode={formData.countryCode}
                      onCountryChange={(code) => handleChange('countryCode', code)}
                      error={errors.whatsapp}
                    />
                  </InputGroup>

                  <InputGroup label="مكان الإقامة (المدينة، الدولة)" required error={errors.basedIn}>
                    <input
                      type="text"
                      value={formData.basedIn}
                      onChange={(e) => handleChange('basedIn', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="مثال: الرياض، السعودية"
                    />
                  </InputGroup>

                  <div className="md:col-span-2">
                    <InputGroup label="رابط حساب LinkedIn (اختياري)">
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all text-left dir-ltr"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </InputGroup>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Briefcase size={20} className="text-primary-500" />
                      ما هي خبراتك؟
                      <span className="text-sm font-normal text-gray-400">(يمكن اختيار أكثر من واحدة)</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {experienceOptions.map(opt => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${formData.experience.includes(opt)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                              : 'border-gray-200 dark:border-dark-input-border bg-gray-50 dark:bg-dark-input-bg hover:bg-gray-100 dark:hover:bg-dark-secondary'
                            }
                                            `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.experience.includes(opt)}
                            onChange={() => {
                              const newExp = formData.experience.includes(opt)
                                ? formData.experience.filter(e => e !== opt)
                                : [...formData.experience, opt];
                              handleChange('experience', newExp);
                            }}
                            className="w-5 h-5 accent-primary-500"
                          />
                          <span className="text-sm font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {errors.experience && <p className="text-red-500 text-sm mt-2">{errors.experience}</p>}
                  </div>

                  <InputGroup label="متى يمكنك البدء معنا؟" required error={errors.startTime}>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      placeholder="مثال: فوراً، أو بعد شهر"
                    />
                  </InputGroup>
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${errors.resumeFile ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 bg-gray-50 dark:bg-dark-tertiary'}`}>
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setResumeFile(e.target.files[0]);
                          handleChange('resumeUrl', ''); // clear old url if any
                        }
                      }}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="w-16 h-16 bg-white dark:bg-dark-secondary rounded-full shadow-sm flex items-center justify-center mb-4 text-primary-500">
                        {resumeFile ? <Check size={32} /> : <Upload size={32} />}
                      </div>
                      <h4 className="text-lg font-bold mb-1">
                        {resumeFile ? resumeFile.name : 'ارفع السيرة الذاتية (CV)'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {resumeFile ? 'تم اختيار الملف جاهز للرفع' : 'اضغط للاختيار أو اسحب الملف هنا (PDF, DOC)'}
                      </p>
                    </label>
                  </div>
                  {errors.resumeFile && <p className="text-red-500 text-sm text-center">{errors.resumeFile}</p>}

                  <InputGroup label="لماذا تريد الانضمام إلينا؟ (Cover Letter)" required error={errors.coverLetter}>
                    <textarea
                      rows={5}
                      value={formData.coverLetter}
                      onChange={(e) => handleChange('coverLetter', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-input-bg border border-gray-200 dark:border-dark-input-border focus:bg-white dark:focus:bg-dark-secondary focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                      placeholder="أخبرنا عن شغفك ولماذا تعتقد أنك الإضافة المناسبة للفريق..."
                    />
                  </InputGroup>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-gray-100 dark:border-dark-card-border bg-gray-50 dark:bg-dark-tertiary rounded-b-3xl flex justify-between items-center">
          <div className="text-sm text-gray-500 hidden sm:block">
            الخطوة {TABS.findIndex(t => t.id === activeTab) + 1} من {TABS.length}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab !== 'basics' && (
              <button
                onClick={() => {
                  const curr = TABS.findIndex(t => t.id === activeTab);
                  setActiveTab(TABS[curr - 1].id);
                }}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-secondary transition-colors"
              >
                رجوع
              </button>
            )}

            {activeTab !== 'portfolio' ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold bg-accent-800 dark:bg-white text-white dark:text-accent-900 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                التالي <ChevronLeft size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || resumeUploading}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading || resumeUploading ? 'جارٍ الإرسال...' : 'إرسال الملف'} <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
