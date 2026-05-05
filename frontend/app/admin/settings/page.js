'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Shield, UserPlus,
  Mail, Save, RotateCcw,
  Layout, Activity, Monitor, Wrench,
  CheckCircle, XCircle, Info, Database,
  ArrowLeft
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';

const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
  <div
    className={`p-5 rounded-[2.2rem] border transition-all duration-500 flex items-center justify-between gap-4 ${checked
      ? 'bg-white dark:bg-dark-secondary border-orange-500/30 shadow-large ring-1 ring-orange-500/10'
      : 'bg-gray-50/50 dark:bg-dark-tertiary/50 border-gray-100 dark:border-dark-card-border shadow-soft'
      }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${checked
        ? 'bg-orange-500 text-white shadow-glow-orange scale-105'
        : 'bg-white dark:bg-dark-secondary text-accent-300 border border-gray-100 dark:border-dark-card-border'
        }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-black text-accent-500 dark:text-dark-text-primary">{label}</h4>
        <p className="text-[10px] font-bold text-accent-300 dark:text-dark-text-tertiary mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-500 focus:outline-none flex-shrink-0 ${checked ? 'bg-orange-500' : 'bg-accent-200 dark:bg-dark-tertiary'
        }`}
    >
      <motion.div
        animate={{ x: checked ? 26 : 2 }}
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </div>
);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'عرب نوشن',
    platformDescription: 'عرب نوشن هي المنصة العربية الأولى لاكتشاف وتحميل قوالب Notion الاحترافية. تصفح مئات القوالب المجانية والمدفوعة لتنظيم حياتك، دراستك، وأعمالك اليومية. انضم لأكبر مجتمع لمبدعي نوشن في العالم العربي.',
    maintenanceMode: false,
    registrationEnabled: true,
    creatorApplicationsEnabled: true,
    autoApproveTemplates: false,
    autoApproveBlogs: false,
    contactInfo: {
      email: 'support@notionarabs.com'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchSettings();
  }, [isAuthenticated, user, router, authLoading]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        const { contactInfo, ...baseSettings } = response.data.settings;
        setSettings({
          ...baseSettings,
          contactInfo: { email: contactInfo?.email || '' }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);
      
      if (response.data.success) {
        showSuccess('تم تحديث الإعدادات بنجاح! 🚀');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value, isContact = false) => {
    if (isContact) {
      setSettings(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [field]: value }
      }));
    } else {
      setSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-accent-300 font-bold text-xs animate-pulse">جاري تحضير الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary pb-20" dir="rtl">
      {/* Background Polish */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] -right-[10%] w-[50%] h-[50%] bg-orange-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] -left-[10%] w-[50%] h-[50%] bg-primary-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <BreadcrumbWrapper items={[
          { name: 'لوحة التحكم', url: '/admin' },
          { name: 'الإعدادات الأساسية', active: true }
        ]} />

        <div className="container-custom pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <Settings className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-xs font-black text-orange-500 uppercase tracking-widest">إدارة المنصة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                الإعدادات <span className="inline-block text-gradient-orange pt-2 pb-2 -mt-2 -mb-2">الجوهريّة</span>
              </h1>
              <p className="text-accent-400 dark:text-dark-text-tertiary font-bold max-w-lg leading-relaxed">
                هنا يمكنك التحكم في العناصر الأكثر أهمية للمنصة، مثل الهوية، حالة الوصول، والأتمتة.
              </p>
            </motion.div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="group flex items-center gap-3 px-10 py-4 bg-primary-500 text-white rounded-[1.5rem] font-black text-sm hover:scale-105 transition-all shadow-glow-primary active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                حفظ التغييرات
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Identity Column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-gray-100 dark:border-dark-card-border shadow-large relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-rose-500" />

                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">هوية المنصة</h3>
                    <p className="text-[10px] font-bold text-accent-300 uppercase tracking-wider mt-0.5">الاسم والوصف العام للموقع</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-accent-300 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-orange-500" />
                      اسم الموقع الرسمي
                    </label>
                    <input
                      type="text"
                      value={settings.platformName}
                      onChange={(e) => handleInputChange('platformName', e.target.value)}
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border px-6 py-4.5 rounded-2xl text-sm font-bold shadow-inner focus:bg-white dark:focus:bg-dark-secondary transition-all outline-none ring-offset-2 focus:ring-2 ring-orange-500/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-accent-300 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-blue-500" />
                      وصف محركات البحث (SEO)
                    </label>
                    <textarea
                      rows={4}
                      value={settings.platformDescription}
                      onChange={(e) => handleInputChange('platformDescription', e.target.value)}
                      className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border px-6 py-5 rounded-3xl text-sm font-bold shadow-inner resize-none focus:bg-white dark:focus:bg-dark-secondary transition-all leading-relaxed outline-none ring-offset-2 focus:ring-2 ring-blue-500/10"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-gray-100 dark:border-dark-card-border shadow-large relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">الدعم الفني</h3>
                    <p className="text-[10px] font-bold text-accent-300 uppercase tracking-wider mt-0.5">البريد الإلكتروني المخصص للمراسلات</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-accent-300 uppercase tracking-widest px-1">البريد الرسمي</label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value, true)}
                    className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border px-6 py-4.5 rounded-2xl text-sm font-bold shadow-inner focus:bg-white dark:focus:bg-dark-secondary transition-all outline-none ring-offset-2 focus:ring-2 ring-indigo-500/10"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Controls Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Maintenance Status Card */}
              <div className={`rounded-[2.8rem] p-10 text-white shadow-glow transition-all duration-700 relative overflow-hidden group ${settings.maintenanceMode
                ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-glow-rose'
                : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-glow-emerald'
                }`}>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-125 transition-transform duration-[2s]">
                  <Wrench className="w-56 h-56" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">حالة المنصة الآن</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-md border border-white/20">
                      <div className={`w-2 h-2 rounded-full ${settings.maintenanceMode ? 'bg-white animate-pulse' : 'bg-white brightness-150'}`} />
                      <span className="text-[10px] font-black">{settings.maintenanceMode ? 'صيانة' : 'نشط'}</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black mb-3 tracking-tighter">
                    {settings.maintenanceMode ? 'الوضع المغلق' : 'الوضع العام'}
                  </h3>
                  <p className="text-xs font-bold text-white/80 leading-relaxed mb-8 max-w-[240px]">
                    {settings.maintenanceMode
                      ? 'لا يمكن للمستخدمين تصفح الموقع حالياً، تظهر لهم صفحة الصيانة فقط.'
                      : 'الموقع متاح للجميع حالياً ويمكن للمستخدمين إجراء العمليات المختلفة.'
                    }
                  </p>

                  <button
                    onClick={() => handleInputChange('maintenanceMode', !settings.maintenanceMode)}
                    className="flex items-center gap-2 px-8 py-3.5 bg-white text-accent-500 rounded-2xl font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-large"
                  >
                    {settings.maintenanceMode ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                    {settings.maintenanceMode ? 'إعادة الموقع للعمل' : 'تفعيل وضع الصيانة'}
                  </button>
                </div>
              </div>

              {/* Toggles List */}
              <div className="space-y-4">
                <Toggle
                  checked={settings.registrationEnabled}
                  onChange={(v) => handleInputChange('registrationEnabled', v)}
                  label="تفعيل التسجيل"
                  description="السماح للأعضاء الجدد بإنشاء حسابات"
                  icon={UserPlus}
                />
                <Toggle
                  checked={settings.creatorApplicationsEnabled}
                  onChange={(v) => handleInputChange('creatorApplicationsEnabled', v)}
                  label="طلبات المنضمين"
                  description="فتح باب التقديم للمبدعين والمؤلفين"
                  icon={Shield}
                />
                <Toggle
                  checked={settings.autoApproveTemplates}
                  onChange={(v) => handleInputChange('autoApproveTemplates', v)}
                  label="نشر تلقائي للقوالب"
                  description="تجاوز المراجعة اليدوية للقوالب"
                  icon={CheckCircle}
                />
                <Toggle
                  checked={settings.autoApproveBlogs}
                  onChange={(v) => handleInputChange('autoApproveBlogs', v)}
                  label="نشر تلقائي للمقالات"
                  description="اعتماد مقالات المبدعين فورياً"
                  icon={Layout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
