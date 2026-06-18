import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Mail,
  Calendar,
  ChevronLeft,
  Briefcase,
  Phone,
  GraduationCap,
  MessageSquare,
  CheckCircle,
  XCircle,
  Crown,
  Pin,
  PinOff,
  User as UserIcon,
  Activity,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

export default function ApplicationCard({
  app,
  expanded,
  onToggle,
  imageError,
  onImageError,
  onUpdateStatus,
  onManageBadges,
  onPinCreator,
  pinLoading,
  user
}) {
  return (
    <div
      className={`group bg-white dark:bg-dark-secondary rounded-[2.5rem] border transition-all duration-500 shadow-soft ${
        expanded
          ? 'ring-4 ring-orange-500/10 border-orange-500/30 shadow-large'
          : 'border-gray-100 dark:border-dark-card-border hover:border-orange-500/20 hover:translate-y-[-4px]'
      }`}
    >
      {/* Compact Header */}
      <div
        onClick={onToggle}
        className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer"
      >
        <div className="flex items-center gap-5 flex-1 w-full text-right">
          <div className="relative w-16 h-16 rounded-[1.5rem] overflow-hidden bg-primary-100 dark:bg-primary-500/10 flex-shrink-0 border-2 border-white dark:border-dark-secondary shadow-soft group-hover:scale-110 transition-transform duration-500">
            {app.profilePicture && !imageError ? (
              <Image
                src={app.profilePicture}
                alt={app.name || 'User'}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                onError={onImageError}
                unoptimized={app.profilePicture.startsWith('http')}
              />
            ) : (
              <UserIcon className="w-8 h-8 text-primary-500 m-auto" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3 justify-start">
              <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                {app.name}
              </h3>
              {app.isPinned && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-1 bg-orange-500 rounded-lg shadow-glow-orange flex items-center justify-center">
                  <Pin className="w-3 h-3 text-white fill-current" />
                </motion.span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 justify-start">
              <span className="flex items-center gap-2 text-[11px] font-bold text-accent-300 dark:text-dark-text-tertiary">
                <Mail className="w-3.5 h-3.5 text-primary-500" />
                {app.email}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-bold text-accent-300 dark:text-dark-text-tertiary">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {new Date(app.appliedAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest ${
              app.creatorStatus === 'pending'
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30'
                : app.creatorStatus === 'approved'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
            }`}>
              {app.creatorStatus === 'pending' ? 'قيد المراجعة' : app.creatorStatus === 'approved' ? 'مقبول' : 'مرفوض'}
            </span>

            <div className="flex -space-x-2 space-x-reverse">
              {app.badges?.slice(0, 3).map((badge, bIdx) => (
                <div
                  key={bIdx}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white dark:border-dark-secondary shadow-soft bg-white dark:bg-dark-tertiary transform hover:scale-125 hover:z-10 transition-all cursor-help"
                  title={badge.label}
                >
                  <span className="text-base">{badge.icon || '⭐'}</span>
                </div>
              ))}
              {app.badges?.length > 3 && (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white dark:border-dark-secondary bg-gray-50 dark:bg-dark-tertiary text-[10px] font-black text-accent-300">
                  +{app.badges.length - 3}
                </div>
              )}
            </div>
          </div>

          <button className={`p-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl text-accent-300 transition-all duration-500 ${
            expanded ? 'rotate-180 bg-orange-500/10 text-orange-500' : 'group-hover:bg-orange-500/5 group-hover:text-orange-500'
          }`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-2 border-t border-gray-50 dark:border-dark-card-border" dir="rtl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8 text-right">
                <div className="space-y-8">
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                    <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                      <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                        <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      رابط المعرض / الأعمال
                    </label>
                    <a
                      href={app.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 text-sm font-black text-primary-500 hover:text-white transition-all bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-500 px-6 py-3.5 rounded-[1.25rem] shadow-soft hover:shadow-glow-primary"
                    >
                      <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      مشاهدة المعرض
                      <ArrowLeft className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all" />
                    </a>
                  </motion.div>

                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                      <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      رقم الهاتف
                    </label>
                    <p className="text-base font-black text-accent-500 dark:text-dark-text-primary px-5 py-3.5 bg-gray-50/80 dark:bg-dark-tertiary rounded-2xl inline-flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {app.phone || 'غير متوفر'}
                    </p>
                  </motion.div>

                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                      <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      تخصصات المبدع
                    </label>
                    <div className="flex flex-wrap gap-2.5 justify-start">
                      {app.specialties?.length > 0 ? (
                        app.specialties.map((spec, sIdx) => (
                          <span key={sIdx} className="px-5 py-2.5 bg-white dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border text-xs font-black text-accent-400 dark:text-dark-text-tertiary rounded-[1rem] shadow-soft hover:scale-105 transition-transform duration-300">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-accent-200">لم يتم تحديد تخصصات</span>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-8">
                  <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      عن المبدع وخبرته
                    </label>
                    <div className="bg-gray-50/50 dark:bg-dark-tertiary/50 p-6 rounded-[2rem] border border-gray-100 dark:border-dark-card-border shadow-inner">
                      <p className="text-sm font-medium text-accent-400 dark:text-dark-text-secondary leading-loose mb-6">{app.experience}</p>
                      <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-dark-input-border/30">
                        <label className="block text-[10px] font-black text-accent-300 uppercase tracking-widest mb-3">الدافع للانضمام</label>
                        <div className="relative">
                          <p className="text-sm font-black text-accent-500 dark:text-dark-text-primary italic leading-relaxed pl-4">
                            "{app.motivation}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-dark-card-border justify-start"
              >
                {app.creatorStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'approved')}
                      className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-glow-emerald hover:scale-105 active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      الموافقة على الطلب
                    </button>
                    <button
                      onClick={() => onUpdateStatus(app.id, 'rejected')}
                      className="group flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs hover:bg-rose-600 transition-all shadow-glow-rose hover:scale-105 active:scale-95"
                    >
                      <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      رفض الطلب
                    </button>
                  </>
                )}

                <button
                  onClick={() => onManageBadges(app)}
                  className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border text-accent-500 dark:text-dark-text-primary rounded-2xl font-black text-xs hover:border-orange-500/30 transition-all shadow-soft hover:scale-105 active:scale-95"
                >
                  <Crown className="w-4 h-4 text-orange-500 group-hover:rotate-12 transition-transform" />
                  إدارة الشارات والجوائز
                </button>

                {app.creatorStatus === 'approved' && (
                  <button
                    onClick={() => onPinCreator(app.id)}
                    disabled={pinLoading}
                    className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all shadow-soft hover:scale-105 active:scale-95 ${
                      app.isPinned
                        ? 'bg-orange-500 text-white shadow-glow-orange'
                        : 'bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border text-accent-500 dark:text-dark-text-primary hover:border-orange-500'
                    }`}
                  >
                    {pinLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : app.isPinned ? (
                      <PinOff className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    ) : (
                      <Pin className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    )}
                    {app.isPinned ? 'إلغاء التثبيت من الرئيسية' : 'تثبيت بالصفحة الرئيسية'}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
