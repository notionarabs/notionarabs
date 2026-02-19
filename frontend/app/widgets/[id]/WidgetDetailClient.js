'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Copy, Check, ChevronLeft, Sparkles, Moon, Sun, Monitor, Type, MapPin, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import Footer from '../../../components/Footer';
import QuranWidget from '../../../components/widgets/QuranWidget';
import PrayerWidget from '../../../components/widgets/PrayerWidget';

const WIDGET_DATA = {
    'quran': {
        title: 'آية اليوم الذكية',
        description: 'أداة احترافية لنوشن تعرض آيات قرآنية متجددة تلقائياً. يمكنك تخصيص الخط، اللغة، والوضع الليلي.',
        features: ['تحديث تلقائي', 'ترجمة عربي/إنجليزي', 'دعم الوضع المظلم', 'خطوط عربية متميزة'],
        settings: [
            { id: 'theme', label: 'المظهر', type: 'select', options: [{ id: 'auto', label: 'تلقائي' }, { id: 'light', label: 'نهاري' }, { id: 'dark', label: 'ليلي' }] },
            {
                id: 'font', label: 'الخط', type: 'select', options: [
                    { id: 'tajawal', label: 'تاجوال' },
                    { id: 'cairo', label: 'كايرو' },
                    { id: 'amiri', label: 'أميري' },
                    { id: 'almarai', label: 'المراعي' },
                    { id: 'changa', label: 'شانغا' }
                ]
            },
            {
                id: 'reciter', label: 'القارئ', type: 'select', options: [
                    { id: 'ar.alafasy', label: 'مشاري العفاسي' },
                    { id: 'ar.minshawi', label: 'المنشاوي' },
                    { id: 'ar.abdulsamad', label: 'عبدالباسط عبدالصمد' },
                    { id: 'ar.husary', label: 'الحصري' }
                ]
            },
            { id: 'showTranslation', label: 'إظهار الترجمة', type: 'toggle' }
        ]
    },
    'prayer': {
        title: 'مواقيت الصلاة',
        description: 'أداة تعرض مواقيت الصلاة لمدينتك واليوم الهجري. تتوافق تماماً مع واجهة نوشن.',
        features: ['مواقيت دقيقة', 'التاريخ الهجري', 'تحديد الموقع', 'تنبيهات الصلاة'],
        settings: [
            { id: 'theme', label: 'المظهر', type: 'select', options: [{ id: 'auto', label: 'تلقائي' }, { id: 'light', label: 'نهاري' }, { id: 'dark', label: 'ليلي' }] },
            {
                id: 'font', label: 'الخط', type: 'select', options: [
                    { id: 'tajawal', label: 'تاجوال' },
                    { id: 'cairo', label: 'كايرو' },
                    { id: 'amiri', label: 'أميري' },
                    { id: 'almarai', label: 'المراعي' },
                    { id: 'changa', label: 'شانغا' }
                ]
            },
            { id: 'city', label: 'المدينة / الموقع', type: 'input', placeholder: 'مثال: Riyadh' }
        ]
    }
};

const CustomSelect = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-secondary-50 dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border p-3.5 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-bold text-sm text-right group"
            >
                <span className="group-hover:text-primary-500 transition-colors">{selectedOption?.label}</span>
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 text-gray-400 group-hover:text-primary-500 ${isOpen ? '-rotate-90' : 'rotate-0'}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-dark-secondary/95 backdrop-blur-md border border-gray-100 dark:border-dark-card-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in origin-top">
                        <div className="p-1.5 space-y-1">
                            {options.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-right px-4 py-3 text-sm font-bold transition-all rounded-xl flex items-center justify-between ${value === opt.id
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                        : 'hover:bg-secondary-100 dark:hover:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary'
                                        }`}
                                >
                                    <span>{opt.label}</span>
                                    {value === opt.id && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default function WidgetDetailClient() {
    const params = useParams();
    const id = params.id;
    const widget = WIDGET_DATA[id];

    const searchParams = useSearchParams();

    const [config, setConfig] = useState({
        theme: 'auto',
        font: 'tajawal',
        showTranslation: true,
        reciter: 'ar.alafasy',
        city: 'Riyadh',
        country: 'Saudi Arabia'
    });

    // Load config from URL if present
    useEffect(() => {
        const newConfig = { ...config };
        let hasChanges = false;

        searchParams.forEach((value, key) => {
            if (key in newConfig) {
                newConfig[key] = value === 'true' ? true : value === 'false' ? false : value;
                hasChanges = true;
            }
        });

        if (hasChanges) setConfig(newConfig);
    }, [searchParams]);

    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({ quran: 0, prayer: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.notionarabs.com';
                const res = await fetch(`${apiUrl}/api/widgets/stats`);
                const data = await res.json();
                if (data.success) {
                    setStats({
                        quran: data.stats.quran || 0,
                        prayer: data.stats.prayer || 0
                    });
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, []);

    // Detect the website's current dark/light mode for the 'auto' preview
    const [siteTheme, setSiteTheme] = useState('dark');
    useEffect(() => {
        const check = () => setSiteTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // What the preview actually renders (auto → follow site theme)
    const previewTheme = config.theme === 'auto' ? siteTheme : config.theme;

    if (!widget) return <div className="p-20 text-center">Widget not found</div>;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    // Exclude theme=auto from URL — embed page detects it via prefers-color-scheme
    const filteredConfig = Object.fromEntries(
        Object.entries(config).filter(([k, v]) => !(k === 'theme' && v === 'auto'))
    );
    const queryParams = new URLSearchParams(filteredConfig).toString();
    const embedUrl = `${baseUrl}/widgets/${id}/embed${queryParams ? '?' + queryParams : ''}`;

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const copyEmbed = () => {
        navigator.clipboard.writeText(embedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
            <div className="pt-32 pb-20 px-4">
                <div className="container-custom">
                    <Link href="/widgets" className="inline-flex items-center gap-2 text-primary-500 font-bold mb-8 hover:gap-3 transition-all">
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                        العودة لكل الأدوات
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Customization Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white dark:bg-dark-secondary rounded-3xl p-8 border border-gray-200 dark:border-dark-card-border shadow-soft">
                                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                    <Monitor className="w-5 h-5 text-primary-500" />
                                    تخصيص الأداة
                                </h2>

                                <div className="space-y-6">
                                    {widget.settings.map(setting => (
                                        <div key={setting.id} className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{setting.label}</label>

                                            {setting.type === 'select' && (
                                                <CustomSelect
                                                    value={config[setting.id]}
                                                    options={setting.options}
                                                    onChange={(val) => handleConfigChange(setting.id, val)}
                                                />
                                            )}

                                            {setting.type === 'input' && (
                                                <div className="relative group/input">
                                                    <input
                                                        type="text"
                                                        value={config[setting.id]}
                                                        placeholder={setting.placeholder}
                                                        onChange={(e) => handleConfigChange(setting.id, e.target.value)}
                                                        className="w-full bg-secondary-50 dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border p-3.5 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-bold text-sm"
                                                    />
                                                </div>
                                            )}

                                            {setting.type === 'toggle' && (
                                                <button
                                                    onClick={() => handleConfigChange(setting.id, !config[setting.id])}
                                                    className={`w-full p-3 rounded-xl border font-bold transition-all flex items-center justify-between ${config[setting.id] ? 'bg-primary-500 text-white border-primary-600' : 'bg-gray-100 dark:bg-dark-tertiary border-gray-200 dark:border-dark-card-border'
                                                        }`}
                                                >
                                                    <span>{config[setting.id] ? 'مفعّل' : 'ملغى'}</span>
                                                    <div className={`w-4 h-4 rounded-full ${config[setting.id] ? 'bg-white' : 'bg-gray-400'}`}></div>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-primary-500 text-white rounded-3xl p-8 shadow-large">
                                <h3 className="font-black text-lg mb-2">رابط التضمين الذكي</h3>
                                <p className="text-sm text-white/80 mb-6">يتغير الرابط تلقائياً بناءً على اختياراتك في الأعلى.</p>
                                <button
                                    onClick={copyEmbed}
                                    className="w-full bg-white text-primary-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
                                >
                                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    {copied ? 'تم النسخ!' : 'انسخ الرابط'}
                                </button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary-500/10 blur-3xl rounded-[3rem]"></div>
                                <div className={`relative rounded-[3rem] p-12 border transition-all ${previewTheme === 'dark' ? 'bg-[#0f0f0f] border-dark-card-border' : 'bg-white border-gray-100 shadow-2xl'
                                    }`}>
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="px-4 py-1 bg-gray-100 dark:bg-dark-tertiary rounded-full text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                                            معاينة مباشرة
                                        </div>
                                    </div>

                                    <div className="min-h-[300px] flex items-center justify-center">
                                        {id === 'quran' && <QuranWidget {...config} theme={previewTheme} userCount={stats.quran} />}
                                        {id === 'prayer' && <PrayerWidget {...config} theme={previewTheme} userCount={stats.prayer} />}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-accent-900 dark:text-white mb-4 tracking-normal leading-relaxed">
                                        {widget.title}
                                    </h1>
                                    {stats[id] > 0 && (
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold">{stats[id].toLocaleString()}+ مستخدم نشط</span>
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-gray-500 dark:text-dark-text-secondary leading-relaxed">{widget.description}</p>
                                </div>
                                <div className="bg-white dark:bg-dark-secondary p-8 rounded-3xl border border-gray-100 dark:border-dark-card-border shadow-soft">
                                    <h2 className="font-bold text-lg text-accent-900 dark:text-white mb-4">المميزات الرئيسية</h2>
                                    <ul className="space-y-3">
                                        {widget.features.map(f => (
                                            <li key={f} className="flex items-center gap-2 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
