'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Sample data - in production, this would come from an API
const templates = [
  {
    id: 1,
    title: "مخطط الدراسة",
    creator: "علي حسن",
    imgSrc: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    tag: "شائع",
    price: "25 ريال",
    rating: 4.8,
    downloads: 1200,
    isFree: false,
    category: "الدراسة",
    description: "قالب شامل لتنظيم الدراسة والمذاكرة مع جداول زمنية وتتبع التقدم"
  },
  {
    id: 2,
    title: "لوحة تحكم الشركة الناشئة",
    creator: "سارة محمد",
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center",
    tag: "جديد",
    price: "45 ريال",
    rating: 4.9,
    downloads: 890,
    isFree: false,
    category: "الأعمال",
    description: "إدارة شاملة للمشاريع والمهام والموظفين في الشركات الناشئة"
  },
  {
    id: 3,
    title: "المذكرة الشخصية",
    creator: "أحمد ياسر",
    imgSrc: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&crop=center",
    tag: "مجاني",
    price: "مجاني",
    rating: 4.7,
    downloads: 2100,
    isFree: true,
    category: "الشخصي",
    description: "مذكرة شخصية بسيطة وأنيقة لتدوين الأفكار والذكريات"
  },
  {
    id: 4,
    title: "مدير المهام",
    creator: "منى خالد",
    imgSrc: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    tag: "رائج",
    price: "35 ريال",
    rating: 4.6,
    downloads: 1500,
    isFree: false,
    category: "العمل",
    description: "نظام إدارة مهام متقدم مع أولويات وتواريخ استحقاق"
  },
  {
    id: 5,
    title: "مخطط اللياقة البدنية",
    creator: "خالد العلي",
    imgSrc: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
    tag: "صحي",
    price: "30 ريال",
    rating: 4.5,
    downloads: 980,
    isFree: false,
    category: "الصحة",
    description: "تتبع التمارين والوجبات الغذائية والأهداف الصحية"
  },
  {
    id: 6,
    title: "مخطط الميزانية",
    creator: "فاطمة نور",
    imgSrc: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center",
    tag: "مالي",
    price: "20 ريال",
    rating: 4.8,
    downloads: 1800,
    isFree: false,
    category: "الحياة",
    description: "إدارة الأموال والمصروفات والادخار بطريقة منظمة"
  }
];

const categories = [
  { name: "الكل", value: "all" },
  { name: "العمل", value: "العمل" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الحياة", value: "الحياة" },
  { name: "الشخصي", value: "الشخصي" },
  { name: "الصحة", value: "الصحة" }
];

const sortOptions = [
  { name: "الأكثر شعبية", value: "popular" },
  { name: "الأحدث", value: "newest" },
  { name: "الأرخص", value: "cheapest" },
  { name: "الأغلى", value: "expensive" },
  { name: "الأعلى تقييماً", value: "rating" }
];

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('all');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

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

  // Filter and sort templates
  useEffect(() => {
    let filtered = [...templates];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      filtered = filtered.filter(template => template.isFree);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter(template => !template.isFree);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'cheapest':
        filtered.sort((a, b) => {
          if (a.isFree && !b.isFree) return -1;
          if (!a.isFree && b.isFree) return 1;
          if (a.isFree && b.isFree) return 0;
          return parseInt(a.price) - parseInt(b.price);
        });
        break;
      case 'expensive':
        filtered.sort((a, b) => {
          if (a.isFree && !b.isFree) return 1;
          if (!a.isFree && b.isFree) return -1;
          if (a.isFree && b.isFree) return 0;
          return parseInt(b.price) - parseInt(a.price);
        });
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, sortBy, priceFilter]);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Page Header */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-6">تصفح القوالب</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              اكتشف آلاف القوالب المصممة خصيصاً للعمل، الدراسة، والحياة اليومية
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="ابحث عن القوالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pl-12 pr-4 py-4 text-lg"
                dir="rtl"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Category Filter */}
              <div className="flex-1 min-w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full form-input"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex-1 min-w-48">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full form-input"
                >
                  <option value="all">جميع الأسعار</option>
                  <option value="free">مجاني فقط</option>
                  <option value="paid">مدفوع فقط</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex-1 min-w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full form-input"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-accent-600 dark:text-dark-text-secondary">
                عرض {filteredTemplates.length} من {templates.length} قالب
              </p>
              <button className="btn-outline text-sm">
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فلترة متقدمة
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group card-interactive overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <Image
                      src={template.imgSrc}
                      alt={template.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium bg-primary-100 text-primary-800">
                      {template.tag}
                    </span>
                    <div className="absolute bottom-3 right-3 bg-bw-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <StarRating rating={template.rating} />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-2 group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                      {template.title}
                    </h3>
                    <p className="body-small mb-3">بواسطة {template.creator}</p>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={template.rating} />
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">({template.downloads})</span>
                      </div>
                      <div className={`text-lg font-bold ${template.isFree ? 'text-accent-600 dark:text-dark-text-secondary' : 'text-primary-500'}`}>
                        {template.price}
                      </div>
                    </div>

                    <button className="w-full btn-primary py-2 px-4 text-base">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">لم نجد قوالب مطابقة</h3>
              <p className="text-accent-600 dark:text-dark-text-secondary mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceFilter('all');
                  setSortBy('popular');
                }}
                className="btn-primary"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            لا تجد ما تبحث عنه؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            انضم إلى مجتمعنا وابدأ في إنشاء قوالبك الخاصة وبيعها للمستخدمين الآخرين
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/templates/create" className="btn-primary text-lg px-8 py-4">
              إنشاء قالب جديد
            </Link>
            <Link href="/creators" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              تصفح المبدعين
            </Link>
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
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
