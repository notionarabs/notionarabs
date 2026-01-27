'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, BookOpen, Briefcase, Heart, Palette, Laptop, Dumbbell, PiggyBank, FolderTree, CalendarDays, LayoutDashboard, Users, Youtube, Facebook, Send, Zap, Target, Lightbulb, TrendingUp, Crown, Sparkles, Award, Trophy, Gem, Check } from 'lucide-react';

// All categories with icons and styling
const categories = [
  { name: "الإنتاجية", Icon: Zap, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الدراسة", Icon: BookOpen, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الأعمال", Icon: TrendingUp, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "الحياة الشخصية", Icon: Heart, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30" },
  { name: "الإبداع", Icon: Lightbulb, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "التقنية", Icon: Laptop, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "الصحة", Icon: Dumbbell, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "المالية", Icon: PiggyBank, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" },
  { name: "التنظيم", Icon: FolderTree, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "التخطيط", Icon: Target, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "ديني", Icon: BookOpen, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "التسويق", Icon: Users, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "التصميم", Icon: Palette, bg: "from-fuchsia-100 to-fuchsia-200 dark:from-fuchsia-900/30 dark:to-fuchsia-800/30" },
  { name: "التطوير", Icon: Laptop, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "التعليم", Icon: BookOpen, bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30" },
  { name: "السفر", Icon: Target, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "الطعام", Icon: Heart, bg: "from-lime-100 to-lime-200 dark:from-lime-900/30 dark:to-lime-800/30" },
  { name: "الرياضة", Icon: Trophy, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الترفيه", Icon: Sparkles, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "الموضة", Icon: Gem, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "الجمال", Icon: Sparkles, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30" },
  { name: "المنزل", Icon: Settings, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "الحديقة", Icon: Target, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "الحيوانات الأليفة", Icon: Heart, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "السيارات", Icon: Zap, bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30" },
  { name: "التكنولوجيا", Icon: Laptop, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "البرمجة", Icon: Laptop, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "قواعد البيانات", Icon: FolderTree, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الأمان السيبراني", Icon: Award, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "الذكاء الاصطناعي", Icon: Zap, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "البلوك تشين", Icon: Award, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" },
  { name: "التجارة الإلكترونية", Icon: TrendingUp, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "المبيعات", Icon: TrendingUp, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "خدمة العملاء", Icon: Users, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الموارد البشرية", Icon: Users, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "المحاسبة", Icon: PiggyBank, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "الاستثمار", Icon: TrendingUp, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" },
  { name: "العقارات", Icon: Settings, bg: "from-brown-100 to-brown-200 dark:from-brown-900/30 dark:to-brown-800/30" },
  { name: "التأمين", Icon: Award, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "القانون", Icon: BookOpen, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "الطب", Icon: Heart, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "التمريض", Icon: Heart, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "العلاج الطبيعي", Icon: Dumbbell, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "التغذية", Icon: Heart, bg: "from-lime-100 to-lime-200 dark:from-lime-900/30 dark:to-lime-800/30" },
  { name: "الطبخ", Icon: Heart, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الحلويات", Icon: Sparkles, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "المشروبات", Icon: Heart, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "المطاعم", Icon: Settings, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "الفنون", Icon: Palette, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "الموسيقى", Icon: Sparkles, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "الرسم", Icon: Palette, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "النحت", Icon: Palette, bg: "from-stone-100 to-stone-200 dark:from-stone-900/30 dark:to-stone-800/30" },
  { name: "التصوير", Icon: Sparkles, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الفيديو", Icon: Sparkles, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "الكتابة", Icon: BookOpen, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "الترجمة", Icon: BookOpen, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "اللغات", Icon: BookOpen, bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30" },
  { name: "التاريخ", Icon: BookOpen, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "الجغرافيا", Icon: Target, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "العلوم", Icon: Lightbulb, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "الرياضيات", Icon: Target, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الفيزياء", Icon: Zap, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "الكيمياء", Icon: Lightbulb, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "الأحياء", Icon: Heart, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "علم النفس", Icon: Lightbulb, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "علم الاجتماع", Icon: Users, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الفلسفة", Icon: Lightbulb, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "الأدب", Icon: BookOpen, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "الشعر", Icon: BookOpen, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "المسرح", Icon: Sparkles, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "السينما", Icon: Sparkles, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "الألعاب", Icon: Trophy, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الرياضة الإلكترونية", Icon: Trophy, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "السياحة", Icon: Target, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الفندقة", Icon: Settings, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "النقل", Icon: Zap, bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30" },
  { name: "الطيران", Icon: Zap, bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30" },
  { name: "البحرية", Icon: Target, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الزراعة", Icon: Heart, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "البيئة", Icon: Heart, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "الطاقة", Icon: Zap, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" },
  { name: "البناء", Icon: Settings, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "الهندسة", Icon: Target, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "العمارة", Icon: Settings, bg: "from-stone-100 to-stone-200 dark:from-stone-900/30 dark:to-stone-800/30" },
  { name: "الديكور", Icon: Palette, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "الأثاث", Icon: Settings, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "الأدوات", Icon: Settings, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "الأجهزة", Icon: Laptop, bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30" },
  { name: "البرامج", Icon: Laptop, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "التطبيقات", Icon: Laptop, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "المواقع", Icon: Laptop, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "التطوير الويب", Icon: Laptop, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "تطوير التطبيقات", Icon: Laptop, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "التعليم الإلكتروني", Icon: BookOpen, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "الاجتماعات", Icon: Users, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "التواصل", Icon: Users, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "الشبكات الاجتماعية", Icon: Users, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "المحتوى", Icon: BookOpen, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "الإعلان", Icon: TrendingUp, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "العلاقات العامة", Icon: Users, bg: "from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30" },
  { name: "العلامة التجارية", Icon: Award, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "الاستراتيجية", Icon: Target, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "القيادة", Icon: Crown, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30" },
  { name: "الإدارة", Icon: Settings, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "المشاريع", Icon: FolderTree, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "العمليات", Icon: Settings, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "الجودة", Icon: Award, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "الابتكار", Icon: Lightbulb, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "البحث والتطوير", Icon: Lightbulb, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30" },
  { name: "التحليل", Icon: Target, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الإحصاء", Icon: Target, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30" },
  { name: "البيانات", Icon: FolderTree, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30" },
  { name: "التقارير", Icon: BookOpen, bg: "from-slate-100 to-slate-200 dark:from-slate-900/30 dark:to-slate-800/30" },
  { name: "العروض التقديمية", Icon: Sparkles, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30" },
  { name: "التدريب", Icon: BookOpen, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "التطوير المهني", Icon: TrendingUp, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30" },
  { name: "الاستشارات", Icon: Lightbulb, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  { name: "الخدمات", Icon: Settings, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30" },
  { name: "المنتجات", Icon: Award, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30" },
  { name: "التصنيع", Icon: Settings, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30" },
  { name: "التوزيع", Icon: TrendingUp, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
  { name: "المخازن", Icon: FolderTree, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" },
  { name: "اللوجستيات", Icon: Target, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30" },
  // Aliases and variations
  { name: "المراجعة", Icon: Check, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30" },
  { name: "الصحة واللياقة", Icon: Dumbbell, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30" },
  { name: "الدينية", Icon: BookOpen, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30" },
];

export default function HomePage() {
  const animationsPlayedRef = useRef(false);

  // Mark animations as played after they complete
  useEffect(() => {
    const timer = setTimeout(() => {
      animationsPlayedRef.current = true;
    }, 2000); // After all animations complete (0.9s + 1s)

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Enhanced Hero Section with Notion-inspired Animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-50 to-accent-500 dark:from-dark-primary dark:to-dark-secondary px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-14 xl:py-16 transition-colors duration-300 w-screen h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] sm:min-h-[calc(100vh-72px)] flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Floating Notion-style Blocks */}
          <div className="hidden sm:block absolute top-20 left-10 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 rounded-lg shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden sm:block absolute top-40 right-20 w-12 h-12 bg-gray-100/70 dark:bg-dark-quaternary/70 rounded-md shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-32 left-1/4 w-20 h-20 bg-white/50 dark:bg-dark-tertiary/50 rounded-xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>
          <div className="hidden lg:block absolute top-1/3 right-1/3 w-14 h-14 bg-gray-50/80 dark:bg-dark-quaternary/80 rounded-lg shadow-md dark:shadow-dark-soft floating-block-delayed notion-block-hover"></div>
          <div className="hidden md:block absolute bottom-20 right-10 w-18 h-18 bg-white/40 dark:bg-dark-tertiary/40 rounded-2xl shadow-lg dark:shadow-dark-medium floating-block notion-block-hover"></div>

          {/* Gradient Orbs */}
          <div className="hidden sm:block absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-purple-100/30 dark:from-orange-500/10 dark:to-orange-600/10 rounded-full blur-3xl motion-safe:animate-pulse"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-100/40 to-black/20 dark:from-dark-tertiary/20 dark:to-dark-primary/40 rounded-full blur-3xl motion-safe:animate-pulse"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.05]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Well-Separated Animated Template Squares */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Large Blue Template - Top Left */}
          <div className="hidden lg:block absolute top-16 left-16 w-32 h-32 bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl mb-3 shadow-lg"></div>
              <div className="w-16 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Green Template - Top Right */}
          <div className="hidden lg:block absolute top-24 right-24 w-20 h-20 bg-white/70 dark:bg-dark-tertiary/70 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Small Purple Template - Middle Left */}
          <div className="hidden md:block absolute top-1/2 left-8 w-16 h-16 bg-white/60 dark:bg-dark-tertiary/60 backdrop-blur-sm rounded-lg shadow-md dark:shadow-dark-soft floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-3">
              <div className="w-6 h-6 bg-purple-500 rounded-md mb-1"></div>
              <div className="w-8 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Extra Large Orange Template - Bottom Right */}
          <div className="hidden xl:block absolute bottom-16 right-16 w-36 h-36 bg-white/50 dark:bg-dark-tertiary/50 backdrop-blur-sm rounded-3xl shadow-2xl dark:shadow-dark-large floating-block notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-xl"></div>
              <div className="w-20 h-2 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-2"></div>
              <div className="w-16 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-12 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>

          {/* Medium Red Template - Bottom Left */}
          <div className="hidden lg:block absolute bottom-24 left-12 w-24 h-24 bg-white/65 dark:bg-dark-tertiary/65 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-dark-medium floating-block-delayed notion-block-hover border border-white/50 dark:border-dark-card-border/50 z-0 pointer-events-none">
            <div className="p-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg mb-2 shadow-md"></div>
              <div className="w-14 h-1.5 bg-gray-300 dark:bg-dark-text-quaternary rounded mb-1"></div>
              <div className="w-10 h-1 bg-gray-300 dark:bg-dark-text-quaternary rounded"></div>
            </div>
          </div>
        </div>

        <div className="container-custom relative z-10">
          {/* Hero Content */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              {/* Enhanced Badge with Better Contrast */}
              <div className={`inline-flex items-center px-4 py-2 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-full text-sm font-semibold mb-6 ${!animationsPlayedRef.current ? 'text-reveal' : ''} shadow-lg dark:shadow-dark-medium border border-primary-300 dark:border-orange-400/50 transition-colors duration-300`}>
                <span className="w-2 h-2 bg-primary-600 dark:bg-orange-400 rounded-full ml-2 pulse-glow"></span>
                خدمات وأنظمة نوشن احترافية
              </div>

              {/* Main Heading */}
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6 ${!animationsPlayedRef.current ? 'text-reveal-delayed' : ''} leading-tight tracking-tight`}>
                <div className="block">
                  <div className="block">خدمات نوشن</div>
                  <div className="block mt-2 md:mt-3 lg:mt-4"><span className="whitespace-nowrap">وأنظمة مخصصة لأعمالك</span></div>
                </div>
              </h1>

              {/* Enhanced Description with Better Typography */}
              <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayedRef.current ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                نبني لك أنظمة نوشن ذكية لإدارة العمل والمشاريع والمعرفة — من التخطيط إلى التنفيذ والأتمتة، بتصميم عربي واضح وتجربة سهلة.
              </p>

              {/* Enhanced CTA Buttons with Better Animations */}
              <div className={`flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 ${!animationsPlayedRef.current ? 'text-reveal-delayed-3' : ''}`}>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  اطلب خدمتك الآن
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-xl border-2 border-primary-300 dark:border-orange-400/50 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  تعرّف على خدماتنا
                </Link>
              </div>

              
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              هل تتشتت عملياتك بين أدوات متعددة؟
            </h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نساعدك على تحويل الفوضى إلى نظام واضح وموحد داخل نوشن، حتى يعمل فريقك بثقة وسرعة.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "أدوات كثيرة بلا رؤية موحدة",
                description: "المهام والملفات موزعة بين تطبيقات متعددة بدون لوحة تحكم واحدة.",
                Icon: FolderTree
              },
              {
                title: "غياب أولوية واضحة للعمل",
                description: "الفرق تعمل بلا مسارات أو أولويات واضحة مما يبطّئ الإنجاز.",
                Icon: Target
              },
              {
                title: "عمليات يدوية متكررة",
                description: "وقت ضائع في تحديثات وأعمال روتينية يمكن أتمتتها بسهولة.",
                Icon: Zap
              },
              {
                title: "معرفة مؤسسية مشتتة",
                description: "المعلومات المهمة غير منظمة ولا يمكن الوصول لها بسرعة.",
                Icon: BookOpen
              }
            ].map((item, idx) => (
              <div key={idx} className="card-interactive p-5 sm:p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-orange-500/10 flex items-center justify-center mb-4">
                  <item.Icon className="w-6 h-6 text-primary-600 dark:text-orange-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-10 md:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                خدمات نوشن المصممة لعملك
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-2xl">
                نبني لك نظامًا متكاملاً يغطي التخطيط، التنفيذ، المتابعة، والتحسين المستمر.
              </p>
            </div>
            <Link href="/services" className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              استكشف جميع الخدمات
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "مساحات عمل مخصصة",
                description: "تصميم قواعد بيانات ولوحات تحكم تناسب هيكل فريقك وأهدافك.",
                Icon: LayoutDashboard
              },
              {
                title: "أتمتة وتكاملات",
                description: "نربط نوشن بأدواتك ونبني تدفقات تقلل المهام اليدوية.",
                Icon: Zap
              },
              {
                title: "تدريب وتبنّي الفريق",
                description: "جلسات تدريب ومواد مساندة لضمان انتقال سلس.",
                Icon: Users
              },
              {
                title: "بوابات عملاء ومشاريع",
                description: "تجارب تواصل احترافية مع العملاء مبنية على بيانات نوشن.",
                Icon: Briefcase
              },
              {
                title: "حوكمة المعرفة",
                description: "تنظيم ملفات الشركة وسياساتها ومراجعها في مصدر واحد.",
                Icon: BookOpen
              },
              {
                title: "تحسين العمليات",
                description: "تحليل مسارات العمل وبناء نظام قابل للتوسع.",
                Icon: Settings
              }
            ].map((service, idx) => (
              <div key={idx} className="card-interactive p-5 sm:p-6 h-full">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-tertiary flex items-center justify-center shadow-sm mb-4">
                  <service.Icon className="w-6 h-6 text-primary-600 dark:text-orange-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
              كيف نعمل معك خطوة بخطوة؟
            </h2>
            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-3xl mx-auto">
              منهجية واضحة تضمن بناء نظام فعّال وقابل للتطوير مع فريقك.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "الاستماع والتحليل", detail: "نفهم تحدياتك وأهدافك بشكل دقيق." },
              { title: "تصميم الهيكل", detail: "نضع خريطة شاملة للعمليات والبيانات." },
              { title: "البناء والتنفيذ", detail: "نطوّر مساحة نوشن متكاملة وقابلة للتوسع." },
              { title: "الأتمتة والتكامل", detail: "نربط الأدوات ونقلل العمل اليدوي." },
              { title: "التدريب والتسليم", detail: "نجهّز الفريق لاستخدام النظام بثقة." },
              { title: "دعم وتحسين مستمر", detail: "تطويرات مستمرة لضمان النمو." }
            ].map((step, idx) => (
              <div key={idx} className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-dark-card-border bg-secondary-50 dark:bg-dark-primary">
                <div className="text-sm text-accent-500 dark:text-dark-text-tertiary mb-2">الخطوة {idx + 1}</div>
                <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-dark-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                نتائج يحبها عملاؤنا
              </h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary mb-6">
                نركز على النتائج القابلة للقياس وتحسين تجربة العمل بالكامل.
              </p>
              {/* TODO: Replace with real metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "مشروع مكتمل", value: "+100" },
                  { label: "فرق اعتمدت نوشن", value: "+30" },
                  { label: "تحسين كفاءة العمل", value: "40%" }
                ].map((stat, idx) => (
                  <div key={idx} className="rounded-xl bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border p-4 text-center">
                    <div className="text-lg sm:text-xl font-bold text-accent-500 dark:text-dark-text-primary">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <Link href="/testimonials" className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                شاهد آراء العملاء
                <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-4">
              {/* TODO: Replace with real testimonials */}
              {[
                {
                  name: "اسم العميل",
                  role: "مدير العمليات",
                  quote: "النظام الجديد على نوشن أعاد ترتيب كل شيء. أصبحنا نعمل بوضوح أكبر ووقت أقل."
                },
                {
                  name: "اسم العميل",
                  role: "مؤسس شركة",
                  quote: "التدريب كان احترافي، والفريق تبنّى النظام بسرعة كبيرة."
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="card-interactive p-5 sm:p-6">
                  <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-4">
                    “{testimonial.quote}”
                  </p>
                  <div className="text-sm font-semibold text-accent-900 dark:text-dark-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                    {testimonial.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            جاهز لبناء نظام نوشن يواكب نموك؟
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto">
            احجز استشارة أولية ودعنا نصمم لك نظامًا يسهّل العمل ويزيد الإنتاجية.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              احجز استشارتك
            </Link>
            <Link href="/services" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 border-primary-200 dark:border-orange-500/30 w-full sm:w-auto text-center">
              تعرّف على الخدمات
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن - منصة قوالب نوشن العربية"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  loading="lazy"
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة يوتيوب عرب نوشن">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="صفحة فيسبوك عرب نوشن">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="مجموعة فيسبوك عرب نوشن">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://t.me/Notion_Arabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="قناة تيليجرام عرب نوشن">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" aria-label="حساب تويتر عرب نوشن">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/services" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخدمات</Link></li>
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                  <li><Link href="/testimonials" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">قصص النجاح</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                  <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">احجز استشارة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-end">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
