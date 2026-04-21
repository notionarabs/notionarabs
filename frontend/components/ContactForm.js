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
    details: ''
};

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s()-]{7,}$/;

export default function ContactForm() {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const countryDropdownRef = useRef(null);
    const apiBaseUrl = getApiBaseUrl();

    const formatWhatsappNumber = (countryCode, number) =>
        `${countryCode} ${number}`.replace(/\s+/g, ' ').trim();
    const isValidWhatsApp = (number, countryCode) =>
        phonePattern.test(formatWhatsappNumber(countryCode, number));
    const selectedCountry =
        countryOptions.find((country) => country.code === formData.countryCode)
        || countryOptions.find((country) => country.code === '+20');

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

    const validateForm = () => {
        const nextErrors = {};

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

        if (!formData.details.trim() || formData.details.trim().length < 10) {
            nextErrors.details = 'يرجى كتابة تفاصيل رسالتك (10 أحرف على الأقل).';
        }

        const hasErrors = Object.keys(nextErrors).length > 0;
        setErrors(nextErrors);
        if (hasErrors) {
            setStatus({ type: 'error', message: 'يرجى تصحيح الحقول المميزة أدناه.' });
        }
        return !hasErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const formattedWhatsapp = formatWhatsappNumber(formData.countryCode, formData.whatsapp);
            const response = await fetch(`${apiBaseUrl}/contact/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    whatsapp: formattedWhatsapp,
                    details: formData.details
                })
            });

            let data = {};
            try {
                data = await response.json();
            } catch (parseError) {
                data = {};
            }

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'تعذر إرسال الرسالة. يرجى المحاولة لاحقاً.');
            }

            setStatus({
                type: 'success',
                message: data.message || 'تم استلام رسالتك بنجاح! سنتواصل معك قريباً.'
            });
            setFormData(initialFormState);
            setErrors({});
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

    return (
        <div className="w-full">
            {status.message && status.type !== 'success' && (
                <div className="mb-5 rounded-xl border px-4 py-4 text-xs sm:text-sm flex items-start gap-3 border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    <span className="mt-0.5">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                        </svg>
                    </span>
                    <div className="space-y-1">
                        <p className="font-semibold">{status.message}</p>
                    </div>
                </div>
            )}

            {typeof document !== 'undefined' && createPortal(
                status.type === 'success' && status.message ? (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-sm rounded-[2rem] border-none bg-white dark:bg-dark-secondary px-6 py-8 text-center shadow-2xl backdrop-blur-xl">
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

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Name Field */}
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
                            maxLength={100}
                            value={formData.name}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                            className="w-full px-4 py-4 text-sm sm:text-base text-right border-none bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-soft focus:shadow-glow focus:ring-0 transition-all duration-300 font-medium placeholder:text-accent-400"
                            placeholder="اكتب اسمك الكامل"
                        />
                        {renderError('name')}
                    </div>

                    {/* Email Field */}
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
                            className="w-full px-4 py-4 text-sm sm:text-base text-right border-none bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-soft focus:shadow-glow focus:ring-0 transition-all duration-300 font-medium placeholder:text-accent-400"
                            placeholder="example@email.com"
                        />
                        {renderError('email')}
                    </div>

                    {/* WhatsApp Field with Country Code */}
                    <div className="form-group md:col-span-2">
                        <label htmlFor="whatsapp" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                            رقم الواتساب
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
                                    className="w-full px-4 py-4 text-sm sm:text-base text-left border-none bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-soft focus:shadow-glow focus:ring-0 transition-all duration-300 font-medium placeholder:text-accent-400"
                                    placeholder="مثال: 01034256344"
                                    style={{ direction: 'ltr', textAlign: 'right' }}
                                />
                            </div>
                            <div className="relative w-full sm:w-28" ref={countryDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                                    className={`w-full px-4 py-4 text-xs sm:text-sm border-none rounded-2xl text-right flex items-center justify-between gap-2 transition-all duration-300 shadow-soft backdrop-blur-xl ${isCountryDropdownOpen
                                        ? 'bg-primary/10 shadow-glow'
                                        : 'bg-white/50 dark:bg-white/5'
                                        }`}
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
                                        className="absolute z-50 w-full mt-3 max-h-56 overflow-auto rounded-2xl border-none bg-white dark:bg-dark-secondary shadow-2xl backdrop-blur-xl"
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

                    {/* Details Field */}
                    <div className="form-group md:col-span-2">
                        <label htmlFor="details" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2 block">
                            تفاصيل رسالتك
                            <span className="text-gray-400 dark:text-dark-text-tertiary ms-1">*</span>
                        </label>
                        <textarea
                            id="details"
                            name="details"
                            rows={5}
                            required
                            minLength={10}
                            maxLength={2000}
                            value={formData.details}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.details)}
                            aria-describedby={errors.details ? 'details-error' : undefined}
                            className="w-full px-4 py-4 text-sm sm:text-base text-right border-none bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-soft focus:shadow-glow focus:ring-0 transition-all duration-300 resize-none font-medium placeholder:text-accent-400"
                            placeholder="اكتب تفاصيل استفسارك أو رسالتك هنا..."
                        />
                        {renderError('details')}
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-glow hover:shadow-large hover:scale-105 transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                        disabled={loading}
                    >
                        {loading ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
                    </button>
                </div>
            </form>
        </div>
    );
}
