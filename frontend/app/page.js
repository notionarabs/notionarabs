'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import StarRating from '../components/StarRating';
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
  const { user, isAuthenticated } = useAuth();
  const { isMaintenanceMode, hasCheckedMaintenance } = useMaintenance();
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImageOptimization, setFailedImageOptimization] = useState(new Set());
  const animationsPlayedRef = useRef(false);
  const hasFetchedTemplatesRef = useRef(false);
  const isApprovedCreator = isAuthenticated && user?.creatorStatus === 'approved';
  const creatorCtaHref = isApprovedCreator
    ? '/profile'
    : isAuthenticated
      ? '/creators/apply'
      : '/login?redirect=/creators/apply';

  // Mark animations as played after they complete
  useEffect(() => {
    const timer = setTimeout(() => {
      animationsPlayedRef.current = true;
    }, 2000); // After all animations complete (0.9s + 1s)

    return () => clearTimeout(timer);
  }, []);

  // Fetch featured templates from API (prioritizing pinned, then most famous and highest-rated)
  useEffect(() => {
    // Don't fetch data until maintenance mode check is complete
    if (!hasCheckedMaintenance) {
      return;
    }

    // Prevent double fetching in React StrictMode
    if (hasFetchedTemplatesRef.current) {
      return;
    }
    hasFetchedTemplatesRef.current = true;

    const fetchFeaturedTemplates = async () => {
      try {
        setLoading(true);

        // Check if maintenance mode is active before making API calls
        if (isMaintenanceMode) {
          setLoading(false);
          return;
        }

        let pinnedTemplates = [];
        let regularTemplates = [];

        // Step 1: Fetch ALL templates to get pinned ones (we'll filter client-side)
        // This ensures pinned templates are always included
        const allTemplatesResponse = await api.get('/templates?limit=100&sortBy=createdAt&sortOrder=desc');

        if (allTemplatesResponse.data.success) {
          const allTemplates = allTemplatesResponse.data.templates || [];

          // Separate pinned from regular templates
          pinnedTemplates = allTemplates.filter(t => t.isPinned);
          const pinnedIds = new Set(pinnedTemplates.map(t => t._id));

          // Get high-rated templates (excluding already pinned ones)
          regularTemplates = allTemplates
            .filter(t => !pinnedIds.has(t._id) && (
              (t.rating >= 3.5 && (t.reviewsCount >= 1 || t.downloads >= 5)) ||
              t.downloads >= 10
            ))
            .slice(0, 30);
        }

        // If we don't have enough regular templates, just take the first non-pinned ones
        if (regularTemplates.length < 6) {
          const fallbackResponse = await api.get('/templates?limit=20&sortBy=downloads&sortOrder=desc');
          if (fallbackResponse.data.success) {
            const fallbackTemplates = fallbackResponse.data.templates || [];
            const existingIds = new Set([
              ...pinnedTemplates.map(t => t._id),
              ...regularTemplates.map(t => t._id)
            ]);

            const additionalTemplates = fallbackTemplates
              .filter(t => !existingIds.has(t._id))
              .slice(0, 6 - regularTemplates.length);

            regularTemplates.push(...additionalTemplates);
          }
        }

        // Sort pinned templates by pinnedAt date (most recently pinned first)
        pinnedTemplates.sort((a, b) => {
          const dateA = a.pinnedAt ? new Date(a.pinnedAt) : new Date(0);
          const dateB = b.pinnedAt ? new Date(b.pinnedAt) : new Date(0);
          return dateB - dateA;
        });

        // Sort regular templates by a combination of factors
        regularTemplates.sort((a, b) => {
          const scoreA = (a.rating || 0) * 0.5 + (a.downloads || 0) * 0.3 + (a.reviewsCount || 0) * 0.2;
          const scoreB = (b.rating || 0) * 0.5 + (b.downloads || 0) * 0.3 + (b.reviewsCount || 0) * 0.2;
          return scoreB - scoreA;
        });

        // Combine: pinned first, then regular templates (limit to 4 total)
        const combinedTemplates = [...pinnedTemplates, ...regularTemplates].slice(0, 4);

        setFeaturedTemplates(combinedTemplates);
      } catch (error) {
        console.error('Error fetching featured templates:', error);
        // Fallback to simple download-based selection
        try {
          const response = await api.get('/templates?limit=4&sortBy=downloads&sortOrder=desc');
          if (response.data.success) {
            setFeaturedTemplates(response.data.templates || []);
          }
        } catch (fallbackError) {
          console.error('Fallback fetch failed:', fallbackError);
          setFeaturedTemplates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTemplates();
  }, [hasCheckedMaintenance]);

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
                قوالب عربية عالية الجودة
              </div>

              {/* Main Heading */}
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6 ${!animationsPlayedRef.current ? 'text-reveal-delayed' : ''} leading-tight tracking-tight`}>
                <div className="block">
                  <div className="block">المنصة العربية الأولى</div>
                  <div className="block mt-2 md:mt-3 lg:mt-4"><span className="whitespace-nowrap">لقوالب نوشن</span></div>
                </div>
              </h1>

              {/* Enhanced Description with Better Typography */}
              <p className={`text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto ${!animationsPlayedRef.current ? 'text-reveal-delayed-2' : ''} leading-relaxed px-2 sm:px-0 font-medium`}>
                اكتشف قوالب نوشن عربية عالية الجودة مصممة للعمل والدراسة والتنظيم الشخصي. انضم لمجتمع المبدعين العرب وابدأ رحلتك نحو الإنتاجية.
              </p>

              {/* Enhanced CTA Buttons with Better Animations */}
              <div className={`flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 ${!animationsPlayedRef.current ? 'text-reveal-delayed-3' : ''}`}>
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 dark:bg-orange-500 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-orange-600 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  استكشف القوالب
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={creatorCtaHref}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/95 dark:bg-dark-tertiary/95 backdrop-blur-sm text-accent-700 dark:text-dark-text-primary rounded-xl border-2 border-primary-300 dark:border-orange-400/50 hover:bg-primary-50 dark:hover:bg-orange-900/20 transition-all duration-300 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  {isApprovedCreator ? 'لوحة التحكم' : 'انضم كمبدع'}
                </Link>
              </div>

              
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Templates */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-4">القوالب المميزة</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">اكتشف أفضل القوالب المصممة من قبل مجتمعنا العربي</p>
            </div>
            <Link
              href="/templates"
              className="btn-outline inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            >
              عرض الكل
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              // Loading skeleton
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="card-interactive overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="p-4 sm:p-6">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                      <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : featuredTemplates.length > 0 ? (
              featuredTemplates.slice(0, 4).map((t, idx) => (
                <Link key={t._id || idx} href={`/templates/${t.slug || t._id}`}>
                  <div
                    className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    {/* Template Image */}
                    <div className="relative overflow-hidden rounded-lg h-40">
                      {t.previewImage && typeof t.previewImage === 'string' && t.previewImage.trim() ? (
                        failedImageOptimization.has(t._id) ? (
                          // Fallback to direct img tag when Next.js optimization fails (e.g., 402 errors from Cloudinary)
                          <img
                            src={t.previewImage}
                            alt={t.title || 'Template image'}
                            className="w-full h-full object-cover object-[50%_30%]"
                            loading={idx < 3 ? 'eager' : 'lazy'}
                            onError={(e) => {
                              console.error('Direct image also failed to load:', t.previewImage);
                              // Hide broken image
                              if (e.target) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <Image
                            key={`${t._id}-${t.previewImage}`}
                            src={t.previewImage}
                            alt={t.title || 'Template image'}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover object-[50%_30%]"
                            priority={idx < 3}
                            loading={idx < 3 ? 'eager' : 'lazy'}
                            quality={85}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            onError={(e) => {
                              console.error('Image optimization failed (possibly 402 from Cloudinary):', t.previewImage);
                              // If Next.js optimization fails (e.g., 402 Payment Required), fall back to direct image
                              setFailedImageOptimization(prev => new Set(prev).add(t._id));
                            }}
                            onLoad={() => {
                              // Remove from failed set if it was previously marked as failed
                              setFailedImageOptimization(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(t._id);
                                return newSet;
                              });
                            }}
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-4 sm:p-6 relative">
                      <h3 className="font-semibold text-sm sm:text-base text-accent-900 dark:text-dark-text-primary mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                        {t.title}
                      </h3>

                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={t.rating || 0} size="small" showNumber={true} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.creator?.profilePicture ? (
                            <Image
                              src={t.creator.profilePicture}
                              alt={t.creator?.name || 'مبدع'}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover"
                              loading="lazy"
                              quality={75}
                            />
                          ) : (
                            <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                {t.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-accent-500 dark:text-dark-text-tertiary">
                            {t.creator?.name || 'مبدع غير معروف'}
                          </span>
                        </div>
                        {t.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t.price} ر.س
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">لا توجد قوالب متاحة حالياً</p>
              </div>
            )}
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
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
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
