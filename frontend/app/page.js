'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

// Sample data - in production, this would come from an API
const featuredTemplates = [
  {
    title: "مخطط الدراسة",
    creator: "علي حسن",
    imgSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    tag: "شائع",
    price: "25 ريال",
    rating: 4.8,
    downloads: 1200,
    isFree: false,
  },
  {
    title: "لوحة تحكم الشركة الناشئة",
    creator: "سارة محمد",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
    tag: "جديد",
    price: "45 ريال",
    rating: 4.9,
    downloads: 890,
    isFree: false,
  },
  {
    title: "المذكرة الشخصية",
    creator: "أحمد ياسر",
    imgSrc: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&crop=center",
    tag: "مجاني",
    price: "مجاني",
    rating: 4.7,
    downloads: 2100,
    isFree: true,
  },
  {
    title: "مدير المهام",
    creator: "منى خالد",
    imgSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    tag: "رائج",
    price: "35 ريال",
    rating: 4.6,
    downloads: 1500,
    isFree: false,
  },
];

const categories = [
  { name: "العمل", count: 120, imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center" },
  { name: "الدراسة", count: 95, imgSrc: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center" },
  { name: "الأعمال", count: 70, imgSrc: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop&crop=center" },
  { name: "الحياة", count: 80, imgSrc: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop&crop=center" },
  { name: "الشخصي", count: 65, imgSrc: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center" },
  { name: "الصحة", count: 50, imgSrc: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center" },
];

const creators = [
  { name: "ليلى أحمد", templates: 20, bio: "قوالب الإنتاجية", imgSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face", rating: 4.9, earnings: "15,000 ريال" },
  { name: "عمر خالد", templates: 15, bio: "إعدادات الدراسة والبحث", imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", rating: 4.8, earnings: "12,500 ريال" },
  { name: "فاطمة نور", templates: 25, bio: "لوحات العمل والأعمال", imgSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", rating: 4.7, earnings: "18,200 ريال" },
];

const testimonials = [
  { name: "محمد العلي", role: "مطور ويب", content: "قوالب عرب نوشن ساعدتني في تنظيم مشاريعي بشكل احترافي. التصميم رائع والاستخدام سهل جداً!", rating: 5, imgSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
  { name: "نورا السعيد", role: "طالبة جامعية", content: "أفضل منصة للقوالب العربية! وفرت علي ساعات من التصميم وأصبحت دراستي أكثر تنظيماً.", rating: 5, imgSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" },
  { name: "أحمد المطيري", role: "رائد أعمال", content: "قوالب إدارة المشاريع ساعدتني في تطوير شركتي الناشئة. أنصح بها بشدة!", rating: 5, imgSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();


  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-bw-gray mr-1">{rating}</span>
      </div>
    );
  };



  return (
    <main className="min-h-screen bg-gradient-bw text-bw-black" dir="rtl">
      {/* Enhanced Header */}
      <header className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-bw-gray bg-bw-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-bold text-gradient-bw">عرب نوشن</Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-8 text-sm font-medium">
          <a href="/templates" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">القوالب</a>
          <a href="/categories" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">التصنيفات</a>
          <a href="/blog" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">المدونة</a>
          <a href="/about" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">من نحن</a>
        </nav>

        {/* Auth Buttons / User Menu */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-bw-gray">مرحباً، {user?.name}</span>
              <Link href="/profile" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">
                الملف الشخصي
              </Link>
              <button
                onClick={logout}
                className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light"
              >
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-bw-gray hover:text-bw-black transition-colors py-2 px-3 rounded-lg hover:bg-bw-light">
                تسجيل الدخول
              </Link>
              <Link href="/signup" className="btn-bw-primary px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
                إنشاء حساب
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-3 rounded-lg hover:bg-bw-light transition-colors border border-bw-gray"
          aria-label="فتح القائمة"
        >
          <svg className="w-5 h-5 text-bw-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-bw-white border-b border-bw-gray shadow-lg">
          <div className="px-4 py-6 space-y-6">
            <nav className="space-y-1">
              <a href="/templates" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">القوالب</a>
              <a href="/categories" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">التصنيفات</a>
              <a href="/blog" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">المدونة</a>
              <a href="/about" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">من نحن</a>
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-6">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-bw-gray">
                    مرحباً، {user?.name}
                  </div>
                  <a href="/profile" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">
                    الملف الشخصي
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-right py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block py-3 px-4 text-bw-gray hover:text-bw-black hover:bg-bw-light transition-colors rounded-lg">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block py-3 px-4 btn-bw-primary rounded-lg font-medium text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section with Notion-inspired Animations */}
      <section className="relative overflow-hidden hero-gradient-animation px-4 md:px-6 lg:px-12 py-16 md:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Notion-style Blocks */}
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/60 rounded-lg shadow-lg floating-block notion-block-hover"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gray-100/70 rounded-md shadow-md floating-block-delayed notion-block-hover"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-white/50 rounded-xl shadow-lg floating-block notion-block-hover"></div>
          <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-gray-50/80 rounded-lg shadow-md floating-block-delayed notion-block-hover"></div>
          <div className="absolute bottom-20 right-10 w-18 h-18 bg-white/40 rounded-2xl shadow-lg floating-block notion-block-hover"></div>

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-gray-100/40 to-black/20 rounded-full blur-3xl animate-pulse"></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Full Width Content Layout */}
          <div className="text-center mb-12">
            {/* النصوص */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-bw-black rounded-full text-sm font-medium mb-6 text-reveal shadow-lg border border-white/50">
                <span className="w-2 h-2 bg-black rounded-full ml-2 pulse-glow"></span>
                أكثر من 10,000 قالب متاح
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-gradient-bw text-reveal-delayed">
                منصتك العربية لبيع وشراء قوالب نوتيون
              </h1>

              <p className="text-xl md:text-2xl text-bw-gray mb-8 leading-relaxed max-w-3xl mx-auto text-reveal-delayed-2">
                انضم إلى مجتمع عربي متنامٍ من المبدعين، وابدأ رحلتك مع آلاف
                القوالب المصممة للعمل، الدراسة، والحياة اليومية.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 text-reveal-delayed-3">
                <a
                  href="/templates"
                  className="px-10 py-5 rounded-xl btn-bw-primary font-semibold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl notion-block-hover"
                >
                  تصفح القوالب
                  <svg className="inline-block mr-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/templates"
                  className="px-10 py-5 rounded-xl bg-white/90 backdrop-blur-sm text-black border border-gray-200 font-semibold text-xl transition-all duration-300 transform hover:scale-105 notion-block-hover shadow-lg hover:shadow-xl"
                >
                  بيع قوالبك
                </a>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 notion-block-hover stats-counter">
                  <div className="text-3xl font-bold text-black mb-2">1,200+</div>
                  <div className="text-sm text-bw-gray">قالب جاهز</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 notion-block-hover stats-counter">
                  <div className="text-3xl font-bold text-gray-700 mb-2">500+</div>
                  <div className="text-sm text-bw-gray">مبدع عربي</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 notion-block-hover stats-counter">
                  <div className="text-3xl font-bold text-bw-gray mb-2">50K+</div>
                  <div className="text-sm text-bw-gray">تحميل شهري</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50 notion-block-hover stats-counter">
                  <div className="text-3xl font-bold text-bw-black mb-2">4.9</div>
                  <div className="text-sm text-bw-gray">تقييم المستخدمين</div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Interactive Demo Section */}
          <div className="relative">
            {/* Floating UI Elements - More strategically placed */}
            <div className="absolute top-0 left-10 w-24 h-24 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg floating-block notion-block-hover border border-white/50">
              <div className="p-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg mb-2"></div>
                <div className="w-12 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-8 h-2 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div className="absolute top-20 right-20 w-20 h-20 bg-white/70 backdrop-blur-sm rounded-lg shadow-md floating-block-delayed notion-block-hover border border-white/50">
              <div className="p-3">
                <div className="w-6 h-6 bg-green-500 rounded-md mb-2"></div>
                <div className="w-10 h-1.5 bg-gray-300 rounded mb-1"></div>
                <div className="w-6 h-1.5 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/60 backdrop-blur-sm rounded-lg shadow-lg floating-block notion-block-hover border border-white/50">
              <div className="p-2">
                <div className="w-4 h-4 bg-purple-500 rounded mb-1"></div>
                <div className="w-8 h-1 bg-gray-300 rounded mb-1"></div>
                <div className="w-6 h-1 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg floating-block notion-block-hover border border-white/50">
              <div className="p-4">
                <div className="w-10 h-10 bg-orange-500 rounded-lg mb-3"></div>
                <div className="w-16 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-12 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-8 h-2 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div className="absolute bottom-1/3 right-1/4 w-18 h-18 bg-white/60 backdrop-blur-sm rounded-lg shadow-md floating-block-delayed notion-block-hover border border-white/50">
              <div className="p-3">
                <div className="w-6 h-6 bg-red-500 rounded-md mb-2"></div>
                <div className="w-12 h-1.5 bg-gray-300 rounded mb-1"></div>
                <div className="w-8 h-1.5 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Three Solid Navigation Squares */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Browse Templates Square */}
              <Link href="/templates" className="group">
                <div className="bg-black rounded-2xl p-8 shadow-2xl notion-block-hover transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="w-16 h-16 bg-white rounded-xl mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">تصفح القوالب</h3>
                  <p className="text-gray-300 leading-relaxed">
                    اكتشف آلاف القوالب الجاهزة للعمل والدراسة والحياة اليومية
                  </p>
                  <div className="mt-4 flex items-center text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-sm font-medium">ابدأ الآن</span>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Categories Square */}
              <Link href="/categories" className="group">
                <div className="bg-white rounded-2xl p-8 shadow-2xl notion-block-hover transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-3xl border-2 border-gray-100">
                  <div className="w-16 h-16 bg-gray-900 rounded-xl mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-bw-black mb-3">التصنيفات</h3>
                  <p className="text-bw-gray leading-relaxed">
                    تصفح حسب الفئة - العمل، الدراسة، الأعمال، والصحة
                  </p>
                  <div className="mt-4 flex items-center text-bw-black group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-sm font-medium">استكشف</span>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Blog/About Square */}
              <Link href="/blog" className="group">
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-8 shadow-2xl notion-block-hover transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-3xl">
                  <div className="w-16 h-16 bg-white rounded-xl mb-6 flex items-center justify-center">
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">المدونة</h3>
                  <p className="text-gray-300 leading-relaxed">
                    نصائح وتوجيهات لاستخدام نوتيون وأفضل الممارسات
                  </p>
                  <div className="mt-4 flex items-center text-white group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-sm font-medium">اقرأ المزيد</span>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Templates */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20 bg-gradient-bw">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gradient-bw mb-4">القوالب المميزة</h2>
              <p className="text-lg text-bw-gray">اكتشف أفضل القوالب المصممة من قبل مجتمعنا العربي</p>
            </div>
            <a
              href="/templates"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 btn-bw-outline rounded-lg transition-colors"
            >
              عرض الكل
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTemplates.map((t, idx) => (
              <div
                key={idx}
                className="group bg-bw-white border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={t.imgSrc}
                    alt={t.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium bg-bw-gray text-bw-black">
                    {t.tag}
                  </span>
                  <div className="absolute bottom-3 right-3 bg-bw-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <StarRating rating={t.rating} />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-bw-black mb-2 group-hover:text-black transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-sm text-bw-gray mb-3">بواسطة {t.creator}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={t.rating} />
                      <span className="text-sm text-bw-gray">({t.downloads})</span>
                    </div>
                    <div className={`text-lg font-bold ${t.isFree ? 'text-bw-gray' : 'text-bw-black'
                      }`}>
                      {t.price}
                    </div>
                  </div>

                  <button className="w-full py-2 px-4 btn-bw-primary rounded-lg transition-colors font-medium">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Categories */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20 bg-gradient-bw">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-bw mb-4">تصفح حسب التصنيف</h2>
            <p className="text-lg text-bw-gray">اختر التصنيف المناسب لاحتياجاتك</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((c, idx) => (
              <a href={`/categories/${c.name.toLowerCase()}`} key={idx} className="group">
                <div className="bg-bw-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-black hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                  <div className="h-24 md:h-28 overflow-hidden relative">
                    <Image
                      src={c.imgSrc}
                      alt={c.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="font-bold text-bw-black group-hover:text-black transition-colors mb-1">
                      {c.name}
                    </h3>
                    <p className="text-sm text-bw-gray">{c.count} قالب</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Creators */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20 bg-gradient-bw">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-bw mb-4">المبدعين المميزين</h2>
            <p className="text-lg text-bw-gray">تعرف على أفضل المبدعين في مجتمعنا</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creators.map((cr, idx) => (
              <div
                key={idx}
                className="group bg-bw-white border rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src={cr.imgSrc}
                      alt={cr.name}
                      width={60}
                      height={60}
                      className="w-15 h-15 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-bw-black group-hover:text-black transition-colors">
                      {cr.name}
                    </h3>
                    <p className="text-sm text-bw-gray">{cr.bio}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bw-gray">القوالب</span>
                    <span className="font-semibold text-bw-black">{cr.templates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bw-gray">التقييم</span>
                    <StarRating rating={cr.rating} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-bw-gray">الأرباح</span>
                    <span className="font-semibold text-bw-gray">{cr.earnings}</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 px-4 btn-bw-primary rounded-lg transition-colors font-medium">
                  عرض الملف الشخصي
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20 bg-gradient-bw">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-bw mb-4">آراء عملائنا</h2>
            <p className="text-lg text-bw-gray">ماذا يقول عملاؤنا عن منصتنا</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-bw border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.imgSrc}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-bw-black">{testimonial.name}</h4>
                    <p className="text-sm text-bw-gray">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20 bg-gradient-to-r from-black to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ابق على اطلاع بأحدث القوالب
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            اشترك في نشرتنا البريدية واحصل على إشعارات بالقوالب الجديدة والعروض الخاصة
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
            <button className="px-8 py-3 btn-bw-primary font-semibold rounded-lg transition-colors">
              اشترك الآن
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك.
          </p>
        </div>
      </section>

      {/* Enhanced Call-to-Action Banner */}
      <section className="px-4 md:px-6 lg:px-12 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-gradient-bw">
                ابدأ بيع قوالبك اليوم!
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                انضم إلى آلاف المبدعين العرب وابدأ في كسب المال من قوالبك المبتكرة
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/templates"
                  className="px-8 py-4 btn-bw-primary text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  كن مبدعاً
                  <svg className="inline-block mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="/templates"
                  className="px-8 py-4 btn-bw-primary text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  تصفح القوالب
                </a>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>بدون رسوم إعداد</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>دفع آمن وسريع</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>دعم فني 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4 text-gradient-bw">عرب نوشن</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوتيون المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-bw-white hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-bw-white hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-bw-white hover:text-black transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">المنتج</h4>
              <ul className="space-y-3">
                <li><a href="/templates" className="text-gray-400 hover:text-white transition-colors">القوالب</a></li>
                <li><a href="/categories" className="text-gray-400 hover:text-white transition-colors">التصنيفات</a></li>
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">الأسعار</a></li>
                <li><a href="/features" className="text-gray-400 hover:text-white transition-colors">المميزات</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">الشركة</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">من نحن</a></li>
                <li><a href="/blog" className="text-gray-400 hover:text-white transition-colors">المدونة</a></li>
                <li><a href="/careers" className="text-gray-400 hover:text-white transition-colors">الوظائف</a></li>
                <li><a href="/press" className="text-gray-400 hover:text-white transition-colors">الصحافة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">الدعم</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-gray-400 hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">اتصل بنا</a></li>
                <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors">الخصوصية</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors">الشروط</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">سياسة الخصوصية</a>
                <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">شروط الاستخدام</a>
                <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">ملفات تعريف الارتباط</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
