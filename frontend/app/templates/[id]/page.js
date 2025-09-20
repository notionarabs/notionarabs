'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../../lib/dateUtils';

// This would normally come from API based on the ID
const template = {
  id: 1,
  title: "مخطط الدراسة الشامل",
  creator: {
    name: "علي حسن",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    templates: 20,
    followers: 1200
  },
  images: [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center"
  ],
  price: "25 ريال",
  isFree: false,
  rating: 4.8,
  downloads: 1200,
  category: "الدراسة",
  tags: ["دراسة", "تنظيم", "مخطط", "إنتاجية"],
  description: "قالب شامل ومتقدم لتنظيم الدراسة والمذاكرة. يتضمن جداول زمنية، تتبع التقدم، قوائم المهام، وملاحظات منظمة. مثالي للطلاب والباحثين.",
  features: [
    "جداول زمنية قابلة للتخصيص",
    "تتبع التقدم والدرجات",
    "قوائم مهام للمواد الدراسية",
    "ملاحظات منظمة ومفهرسة",
    "تقويم للامتحانات والمواعيد",
    "قوالب للبحوث والمشاريع",
    "إحصائيات الأداء",
    "تذكيرات ومواعيد"
  ],
  requirements: [
    "حساب نوتيون (مجاني أو مدفوع)",
    "متصفح حديث (Chrome, Firefox, Safari)",
    "اتصال بالإنترنت للتحميل"
  ],
  compatibility: [
    "نوتيون للويب",
    "نوتيون للجوال (iOS/Android)",
    "نوتيون لسطح المكتب"
  ],
  lastUpdated: "2024-01-15",
  version: "2.1",
  fileSize: "2.5 MB"
};

const relatedTemplates = [
  {
    id: 2,
    title: "مدير المهام المتقدم",
    creator: "منى خالد",
    price: "35 ريال",
    rating: 4.6,
    downloads: 1500,
    imgSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "مخطط البحث الأكاديمي",
    creator: "عمر خالد",
    price: "30 ريال",
    rating: 4.7,
    downloads: 980,
    imgSrc: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "منظم المشاريع",
    creator: "فاطمة نور",
    price: "40 ريال",
    rating: 4.9,
    downloads: 2100,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  }
];

export default function TemplateDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPurchased, setIsPurchased] = useState(false);

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Template Details */}
        <div className="container-custom flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/NavLogoLight.svg"
              alt="عرب نوشن"
              width={240}
              height={80}
              className="h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1 lg:gap-2 xl:gap-3">
            <a href="/templates" className="nav-link nav-link-active">القوالب</a>
            <a href="/creators" className="nav-link">المبدعين</a>
            <a href="/blog" className="nav-link">المدونة</a>
            <a href="/about" className="nav-link">من نحن</a>
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 dark:text-dark-text-tertiary">مرحباً، {user?.name}</span>
                <Link href="/profile" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  الملف الشخصي
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors py-2 px-3">
                  تسجيل الدخول
                </Link>
                <Link href="/signup" className="btn-primary">
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 transition-all duration-300 border border-gray-600 dark:border-dark-card-border rounded-xl hover:bg-white/10 dark:hover:bg-dark-tertiary hover:border-gray-500 dark:hover:border-dark-text-tertiary flex-shrink-0"
              aria-label="فتح القائمة"
            >
              <svg className="w-5 h-5 text-gray-300 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-accent-500 dark:bg-dark-secondary border-b border-gray-700 dark:border-dark-card-border shadow-large dark:shadow-dark-large backdrop-blur-sm transition-colors duration-300">
          <div className="container-custom py-6 space-y-6">
            <nav className="space-y-2">
              <a href="/templates" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">القوالب</a>
              <a href="/creators" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المبدعين</a>
              <a href="/blog" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">المدونة</a>
              <a href="/about" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">من نحن</a>
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-600 dark:border-dark-card-border pt-6">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="px-4 py-3 text-gray-300 dark:text-dark-text-tertiary bg-white/5 dark:bg-dark-tertiary rounded-xl">
                    مرحباً، {user?.name}
                  </div>
                  <a href="/profile" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    الملف الشخصي
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-right py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block py-3 px-4 text-gray-300 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary hover:bg-white/10 dark:hover:bg-dark-tertiary transition-all duration-200 rounded-xl">
                    تسجيل الدخول
                  </Link>
                  <Link href="/signup" className="block py-3 px-4 btn-primary text-center">
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <section className="bg-white dark:bg-dark-secondary transition-colors duration-300 py-4">
        <div className="container-custom">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-accent-500 dark:text-dark-text-primary hover:text-primary-500 dark:hover:text-orange-500">
              الرئيسية
            </Link>
            <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
            <Link href="/templates" className="text-accent-500 dark:text-dark-text-primary hover:text-primary-500 dark:hover:text-orange-500">
              القوالب
            </Link>
            <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
            <span className="text-accent-400 dark:text-dark-text-quaternary">{template.title}</span>
          </nav>
        </div>
      </section>

      {/* Template Details */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="mb-4">
                <Image
                  src={template.images[selectedImage]}
                  alt={template.title}
                  width={800}
                  height={600}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-3 gap-4">
                {template.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-lg overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary-500 dark:ring-orange-500' : ''
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${template.title} - ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Template Info */}
            <div>
              <div className="mb-6">
                <h1 className="heading-1 mb-4">{template.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={template.creator.avatar}
                      alt={template.creator.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-accent-500 dark:text-dark-text-primary">
                        {template.creator.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={template.creator.rating} />
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                          ({template.creator.templates} قالب)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <StarRating rating={template.rating} />
                    <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      ({template.downloads} تحميل)
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-sm rounded-full">
                    {template.category}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-primary-500 dark:text-orange-500">
                    {template.price}
                  </div>
                  <div className="text-sm text-accent-600 dark:text-dark-text-secondary">
                    آخر تحديث: {formatDate(template.lastUpdated)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                {isPurchased ? (
                  <button className="w-full btn-primary text-lg py-4">
                    تحميل القالب
                  </button>
                ) : (
                  <button className="w-full btn-primary text-lg py-4">
                    شراء القالب - {template.price}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-outline">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    إضافة للمفضلة
                  </button>
                  <button className="btn-outline">
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    مشاركة
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <h3 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-3">العلامات</h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description and Features */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="heading-2 mb-6">وصف القالب</h2>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                {template.description}
              </p>

              <h3 className="heading-3 mb-4">المميزات الرئيسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-accent-600 dark:text-dark-text-secondary">{feature}</span>
                  </div>
                ))}
              </div>

              <h3 className="heading-3 mb-4">متطلبات الاستخدام</h3>
              <ul className="space-y-2 mb-8">
                {template.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3 text-accent-600 dark:text-dark-text-secondary">
                    <svg className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>

              <h3 className="heading-3 mb-4">التوافق</h3>
              <ul className="space-y-2">
                {template.compatibility.map((comp, index) => (
                  <li key={index} className="flex items-start gap-3 text-accent-600 dark:text-dark-text-secondary">
                    <svg className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="card p-6 mb-6">
                <h3 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">معلومات القالب</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-accent-600 dark:text-dark-text-secondary">الإصدار</span>
                    <span className="font-medium">{template.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent-600 dark:text-dark-text-secondary">حجم الملف</span>
                    <span className="font-medium">{template.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent-600 dark:text-dark-text-secondary">آخر تحديث</span>
                    <span className="font-medium">{formatDate(template.lastUpdated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-accent-600 dark:text-dark-text-secondary">التقييم</span>
                    <div className="flex items-center gap-1">
                      <StarRating rating={template.rating} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold text-accent-500 dark:text-dark-text-primary mb-4">المبدع</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={template.creator.avatar}
                    alt={template.creator.name}
                    width={50}
                    height={50}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-accent-500 dark:text-dark-text-primary">
                      {template.creator.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={template.creator.rating} />
                      <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        ({template.creator.templates} قالب)
                      </span>
                    </div>
                  </div>
                </div>
                <button className="w-full btn-outline">
                  عرض الملف الشخصي
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Templates */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <h2 className="heading-2 mb-8">قوالب مشابهة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedTemplates.map((template) => (
              <div key={template.id} className="card-interactive overflow-hidden">
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={template.imgSrc}
                    alt={template.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2">
                    {template.title}
                  </h3>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3">
                    بواسطة {template.creator}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <StarRating rating={template.rating} />
                      <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        ({template.downloads})
                      </span>
                    </div>
                    <div className="text-lg font-bold text-primary-500 dark:text-orange-500">
                      {template.price}
                    </div>
                  </div>
                  <button className="w-full btn-primary">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوتيون المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><a href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</a></li>
                <li><a href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</a></li>
                <li><a href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</a></li>
                <li><a href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</a></li>
                <li><a href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</a></li>
                <li><a href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</a></li>
                <li><a href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</a></li>
                <li><a href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</a></li>
                <li><a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</a></li>
                <li><a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</a>
                <a href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</a>
                <a href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
