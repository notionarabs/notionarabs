'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft } from 'lucide-react';
import { getCategorySlug } from '../../lib/categoryMapping';

// Only import icons that are actually used
import {
  Zap, BookOpen, Briefcase, Heart, Lightbulb, Target, Code, Activity, PiggyBank, FolderTree,
  Star, Megaphone, Palette, Cpu, GraduationCap, Globe, Utensils, Dumbbell, Gamepad2, Shirt,
  Sparkles, Home, TreePine, PawPrint, Car, Smartphone, Terminal, Database, Shield, Bot,
  HardDrive, ShoppingCart, TrendingUp, Users, UserCheck, FileSpreadsheet, DollarSign,
  Building as BuildingIcon, ShieldCheck, FileText, Stethoscope, HeartHandshake, Handshake, Apple,
  ChefHat, Cake, Coffee, Music, Paintbrush, Hammer, Camera, Video, Pen, Languages,
  BookMarked, Scroll, Map, Microscope, Calculator, Atom, FlaskConical, Dna, Brain,
  Quote, Theater, Film, Gamepad as GamepadIcon, Plane, Hotel, Truck, Ship, Wheat,
  Leaf, Wrench, Building2, Sofa, Monitor, Laptop, Code2, Package, Factory,
  Warehouse as WarehouseIcon, Truck as TruckIcon, Badge, Crown as CrownIcon,
  Settings, Cog, Rocket, CheckCircle, Presentation, MessageSquare, Share2, BarChart3, PieChart
} from 'lucide-react';


// All available template categories from create template page with unique icons
const allCategories = [
  { name: "الإنتاجية", icon: Zap, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب لتحسين الإنتاجية وإدارة المهام" },
  { name: "الدراسة", icon: BookOpen, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للدراسة والبحث والتعلم" },
  { name: "الأعمال", icon: Briefcase, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30", description: "قوالب لإدارة الأعمال والمشاريع التجارية" },
  { name: "الحياة الشخصية", icon: Heart, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30", description: "قوالب للتنظيم الشخصي وإدارة الحياة اليومية" },
  { name: "الإبداع", icon: Lightbulb, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للإبداع والتصميم والفنون" },
  { name: "التقنية", icon: Code, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للبرمجة والتطوير التقني" },
  { name: "الصحة", icon: Activity, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب لمتابعة الصحة واللياقة البدنية" },
  { name: "المالية", icon: PiggyBank, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30", description: "قوالب لإدارة المال والاستثمار" },
  { name: "التنظيم", icon: FolderTree, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30", description: "قوالب لتنظيم المعلومات والمستندات" },
  { name: "التخطيط", icon: Target, bg: "from-violet-100 to-violet-200 dark:from-violet-900/30 dark:to-violet-800/30", description: "قوالب للتخطيط وإدارة المشاريع" },
  { name: "ديني", icon: Star, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30", description: "قوالب للشؤون الدينية والروحانية" },
  { name: "التسويق", icon: Megaphone, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30", description: "قوالب للتسويق والترويج" },
  { name: "التصميم", icon: Palette, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للتصميم الجرافيكي والفني" },
  { name: "التطوير", icon: Cpu, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للتطوير والبرمجة" },
  { name: "التعليم", icon: GraduationCap, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتعليم والتدريب" },
  { name: "السفر", icon: Globe, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30", description: "قوالب للتخطيط للسفر والسياحة" },
  { name: "الطعام", icon: Utensils, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للطبخ والطعام" },
  { name: "الرياضة", icon: Dumbbell, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للرياضة واللياقة البدنية" },
  { name: "الترفيه", icon: Gamepad2, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للترفيه والألعاب" },
  { name: "الموضة", icon: Shirt, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30", description: "قوالب للموضة والأزياء" },
  { name: "الجمال", icon: Sparkles, bg: "from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30", description: "قوالب للعناية والجمال" },
  { name: "المنزل", icon: Home, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب لتنظيم المنزل" },
  { name: "الحديقة", icon: TreePine, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للحدائق والنباتات" },
  { name: "الحيوانات الأليفة", icon: PawPrint, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30", description: "قوالب لرعاية الحيوانات الأليفة" },
  { name: "السيارات", icon: Car, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للسيارات والنقل" },
  { name: "التكنولوجيا", icon: Smartphone, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للتكنولوجيا والأجهزة" },
  { name: "البرمجة", icon: Terminal, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للبرمجة والتطوير" },
  { name: "قواعد البيانات", icon: Database, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30", description: "قوالب لقواعد البيانات" },
  { name: "الأمان السيبراني", icon: Shield, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للأمان السيبراني" },
  { name: "الذكاء الاصطناعي", icon: Bot, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للذكاء الاصطناعي" },
  { name: "البلوك تشين", icon: HardDrive, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للبلوك تشين" },
  { name: "التجارة الإلكترونية", icon: ShoppingCart, bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30", description: "قوالب للتجارة الإلكترونية" },
  { name: "المبيعات", icon: TrendingUp, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للمبيعات" },
  { name: "خدمة العملاء", icon: Users, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب لخدمة العملاء" },
  { name: "الموارد البشرية", icon: UserCheck, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للموارد البشرية" },
  { name: "المحاسبة", icon: FileSpreadsheet, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للمحاسبة" },
  { name: "الاستثمار", icon: DollarSign, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30", description: "قوالب للاستثمار" },
  { name: "العقارات", icon: BuildingIcon, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للعقارات" },
  { name: "التأمين", icon: ShieldCheck, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتأمين" },
  { name: "القانون", icon: FileText, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للقانون" },
  { name: "الطب", icon: Stethoscope, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للطب" },
  { name: "التمريض", icon: HeartHandshake, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30", description: "قوالب للتمريض" },
  { name: "العلاج الطبيعي", icon: Activity, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للعلاج الطبيعي" },
  { name: "التغذية", icon: Apple, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للتغذية" },
  { name: "الطبخ", icon: ChefHat, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للطبخ" },
  { name: "الحلويات", icon: Cake, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30", description: "قوالب للحلويات" },
  { name: "المشروبات", icon: Coffee, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للمشروبات" },
  { name: "المطاعم", icon: Utensils, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للمطاعم" },
  { name: "الفنون", icon: Palette, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للفنون" },
  { name: "الموسيقى", icon: Music, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للموسيقى" },
  { name: "الرسم", icon: Paintbrush, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30", description: "قوالب للرسم" },
  { name: "النحت", icon: Hammer, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للنحت" },
  { name: "التصوير", icon: Camera, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتصوير" },
  { name: "الفيديو", icon: Video, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للفيديو" },
  { name: "الكتابة", icon: Pen, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للكتابة" },
  { name: "الترجمة", icon: Languages, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للترجمة" },
  { name: "اللغات", icon: BookMarked, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب لتعلم اللغات" },
  { name: "التاريخ", icon: Scroll, bg: "from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30", description: "قوالب للتاريخ" },
  { name: "الجغرافيا", icon: Map, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للجغرافيا" },
  { name: "العلوم", icon: Microscope, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للعلوم" },
  { name: "الرياضيات", icon: Calculator, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للرياضيات" },
  { name: "الفيزياء", icon: Atom, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للفيزياء" },
  { name: "الكيمياء", icon: FlaskConical, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للكيمياء" },
  { name: "الأحياء", icon: Dna, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للأحياء" },
  { name: "علم النفس", icon: Brain, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب لعلم النفس" },
  { name: "علم الاجتماع", icon: Users, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب لعلم الاجتماع" },
  { name: "الفلسفة", icon: Lightbulb, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30", description: "قوالب للفلسفة" },
  { name: "الأدب", icon: BookMarked, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للأدب" },
  { name: "الشعر", icon: Quote, bg: "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30", description: "قوالب للشعر" },
  { name: "المسرح", icon: Theater, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للمسرح" },
  { name: "السينما", icon: Film, bg: "from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30", description: "قوالب للسينما" },
  { name: "الألعاب", icon: Gamepad2, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للألعاب" },
  { name: "الرياضة الإلكترونية", icon: GamepadIcon, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للرياضة الإلكترونية" },
  { name: "السياحة", icon: Plane, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30", description: "قوالب للسياحة" },
  { name: "الفندقة", icon: Hotel, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للفندقة" },
  { name: "النقل", icon: Truck, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للنقل" },
  { name: "الطيران", icon: Plane, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للطيران" },
  { name: "البحرية", icon: Ship, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للبحرية" },
  { name: "الزراعة", icon: Wheat, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للزراعة" },
  { name: "البيئة", icon: Leaf, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للبيئة" },
  { name: "الطاقة", icon: Zap, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30", description: "قوالب للطاقة" },
  { name: "البناء", icon: Hammer, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للبناء" },
  { name: "الهندسة", icon: Wrench, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للهندسة" },
  { name: "العمارة", icon: Building2, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للعمارة" },
  { name: "الديكور", icon: Paintbrush, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للديكور" },
  { name: "الأثاث", icon: Sofa, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للأثاث" },
  { name: "الأدوات", icon: Wrench, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للأدوات" },
  { name: "الأجهزة", icon: Monitor, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للأجهزة" },
  { name: "البرامج", icon: Laptop, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للبرامج" },
  { name: "التطبيقات", icon: Smartphone, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للتطبيقات" },
  { name: "المواقع", icon: Globe, bg: "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30", description: "قوالب للمواقع" },
  { name: "التطوير الويب", icon: Code2, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب لتطوير الويب" },
  { name: "تطوير التطبيقات", icon: Smartphone, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب لتطوير التطبيقات" },
  { name: "التعليم الإلكتروني", icon: Laptop, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتعليم الإلكتروني" },
  { name: "الاجتماعات", icon: Users, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للاجتماعات" },
  { name: "التواصل", icon: MessageSquare, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتواصل" },
  { name: "الشبكات الاجتماعية", icon: Share2, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للشبكات الاجتماعية" },
  { name: "المحتوى", icon: FileText, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للمحتوى" },
  { name: "الإعلان", icon: Megaphone, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للإعلان" },
  { name: "العلاقات العامة", icon: Handshake, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للعلاقات العامة" },
  { name: "العلامة التجارية", icon: Badge, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للعلامة التجارية" },
  { name: "الاستراتيجية", icon: CrownIcon, bg: "from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30", description: "قوالب للاستراتيجية" },
  { name: "القيادة", icon: CrownIcon, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للقيادة" },
  { name: "الإدارة", icon: Settings, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للإدارة" },
  { name: "المشاريع", icon: FolderTree, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للمشاريع" },
  { name: "العمليات", icon: Cog, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للعمليات" },
  { name: "الجودة", icon: CheckCircle, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للجودة" },
  { name: "الابتكار", icon: Rocket, bg: "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30", description: "قوالب للابتكار" },
  { name: "البحث والتطوير", icon: Search, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للبحث والتطوير" },
  { name: "التحليل", icon: BarChart3, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتحليل" },
  { name: "الإحصاء", icon: PieChart, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للإحصاء" },
  { name: "البيانات", icon: Database, bg: "from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30", description: "قوالب للبيانات" },
  { name: "التقارير", icon: FileText, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للتقارير" },
  { name: "العروض التقديمية", icon: Presentation, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للعروض التقديمية" },
  { name: "التدريب", icon: BookOpen, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للتدريب" },
  { name: "التطوير المهني", icon: TrendingUp, bg: "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30", description: "قوالب للتطوير المهني" },
  { name: "الاستشارات", icon: UserCheck, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للاستشارات" },
  { name: "الخدمات", icon: Cog, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للخدمات" },
  { name: "المنتجات", icon: Package, bg: "from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30", description: "قوالب للمنتجات" },
  { name: "التصنيع", icon: Factory, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للتصنيع" },
  { name: "التوزيع", icon: TruckIcon, bg: "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30", description: "قوالب للتوزيع" },
  { name: "المخازن", icon: WarehouseIcon, bg: "from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30", description: "قوالب للمخازن" },
  { name: "اللوجستيات", icon: TruckIcon, bg: "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30", description: "قوالب للوجستيات" }
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              جميع التصنيفات
            </h1>
            <p className="text-lg sm:text-xl text-accent-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              اكتشف جميع التصنيفات المتاحة لإنشاء قوالب نوشن مخصصة. اختر التصنيف المناسب لاحتياجاتك
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن التصنيف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border rounded-xl focus:ring-2 focus:ring-accent-500 dark:focus:ring-orange-400 focus:border-transparent transition-colors duration-200 text-accent-700 dark:text-dark-text-primary placeholder-accent-400 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(20)].map((_, idx) => (
              <div key={idx} className="group animate-pulse">
                <div className="bg-white dark:bg-dark-tertiary rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-card-border h-full flex flex-col">
                  {/* Icon Skeleton */}
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  </div>

                  {/* Category Name Skeleton */}
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4 mx-auto"></div>

                  {/* Description Skeleton */}
                  <div className="space-y-1 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mx-auto"></div>
                  </div>

                  {/* Button Skeleton */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-card-border">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredCategories.map((category, idx) => (
              <Link
                key={idx}
                href={`/categories/${getCategorySlug(category.name)}`}
                className="group"
              >
                <div className="bg-white dark:bg-dark-tertiary rounded-xl p-4 shadow-sm border border-gray-200 dark:border-dark-card-border hover:shadow-md hover:border-accent-300 dark:hover:border-orange-500/50 transition-all duration-300 h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category.bg} backdrop-blur-sm border border-white/20 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <category.icon className="w-6 h-6 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3 className="font-bold text-sm sm:text-base text-accent-500 dark:text-orange-400 text-center mb-2 group-hover:text-accent-600 dark:group-hover:text-orange-300 transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-accent-600 dark:text-gray-300 text-center leading-relaxed flex-1">
                    {category.description}
                  </p>

                  {/* View Templates Button */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-card-border">
                    <div className="flex items-center justify-center text-accent-500 dark:text-orange-400 text-xs font-medium group-hover:text-accent-600 dark:group-hover:text-orange-300 transition-colors">
                      <span>عرض القوالب</span>
                      <ChevronLeft className="w-3 h-3 mr-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
              لم يتم العثور على تصنيفات
            </h3>
            <p className="text-gray-500 dark:text-dark-text-secondary">
              جرب البحث بكلمات مختلفة أو تصفح جميع التصنيفات
            </p>
          </div>
        )}

      </div>
    </div>
  );
}