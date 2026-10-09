'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Sparkles, 
  Clock, 
  Layers, 
  Database, 
  Cpu, 
  Video, 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Lock, 
  ShieldAlert, 
  Send
} from 'lucide-react';

export default function AcademyComingSoon({ user, isAuthenticated, isClassroom = false }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans selection:bg-amber-500/20 selection:text-amber-400 flex flex-col justify-between">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 inset-x-0 h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-primary-500/15 to-purple-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="container-custom pt-14 md:pt-24 pb-16 max-w-4xl mx-auto flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Coming Soon Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 text-xs sm:text-sm font-bold mb-6"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow text-amber-500" />
          <span>قريباً في 2026 • Coming Soon</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-tajawal text-gray-900 dark:text-white leading-[1.25] mb-5"
        >
          أكاديمية عرب نوشن <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-primary-500 to-orange-500">
            في طور الإعداد النهائي
          </span>
        </motion.h1>

        {/* Subtitle / Pitch */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          نعمل حالياً على التجهيزات النهائية لإطلاق الدورة الأضخم والأشمل باللغة العربية لاحتراف نوشن وبناء أنظمة العمل الذكية (29 درساً، 6 فصول تطبيقية، ومشغل تعليمي متطور).
          <br className="hidden sm:inline" />
          <span className="text-amber-500 dark:text-amber-400 font-semibold"> ستتاح الأكاديمية قريباً لجميع أعضاء ومبدعي المجتمع!</span>
        </motion.p>

        {/* Feature Highlights Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-right mb-10"
        >
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-tajawal mb-1">
              29 درساً مسجلاً فائق الدقة
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              شرح تدريجي من الصفر يبدأ بأساسيات الواجهة والكتل حتى أدق التفاصيل الاحترافية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-tajawal mb-1">
              قواعد البيانات المتقدمة والعلاقات
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              بناء قواعد بيانات مترابطة، وإتقان الـ Rollups، والصيغ الرياضية Formulas 2.0.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-tajawal mb-1">
              استثمار الذكاء الاصطناعي Notion AI
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              تطبيقات عملية لاستغلال ميزات الذكاء الاصطناعي في تلخيص البيانات وتوليد الأفكار.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 backdrop-blur-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base font-tajawal mb-1">
              متابعة التقدم وشهادة إتمام
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              مشغل دروس متكامل يتتبع إنجازك خطوة بخطوة مع قوالب ومشاريع مرفقة للتكرار.
            </p>
          </div>
        </motion.div>

        {/* User state message */}
        {isAuthenticated && user && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>
              مرحباً <strong>{user.name}</strong>! تم تسجيل اهتمامك، وستصلك رسالة إشعار فور فتح الأكاديمية للجميع.
            </span>
          </div>
        )}

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="https://t.me/notionarabs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-xl font-bold text-white bg-[#229ED9] hover:bg-[#1f8ec4] shadow-lg shadow-[#229ED9]/20 transition flex items-center gap-2.5 text-sm sm:text-base"
          >
            <Send className="w-4 h-4" />
            <span>انضم لقناة التيليجرام لمتابعة الإطلاق</span>
          </a>

          <Link
            href="/templates"
            className="px-6 py-3.5 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition text-sm sm:text-base"
          >
            تصفح متجر قوالب نوشن
          </Link>
        </motion.div>

        {/* Admin Login Bypass Note for Website Owners */}
        <div className="mt-12 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          <span>
            {isAuthenticated ? (
              <span>(الأكاديمية مقتصرة حالياً على مديري الموقع فقط أثناء فترة الإعداد)</span>
            ) : (
              <span>
                هل أنت من مديري الموقع؟{' '}
                <Link 
                  href="/login?redirect=/academy" 
                  className="text-amber-500 underline hover:text-amber-400 transition font-medium"
                >
                  تسجيل الدخول للمعاينة
                </Link>
              </span>
            )}
          </span>
        </div>

      </div>

    </div>
  );
}
