'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';

// TODO: Replace with actual API call
const blogPosts = [
  {
    id: 1,
    title: "10 نصائح لاستخدام نوتيون بكفاءة أكبر",
    excerpt: "اكتشف أفضل الطرق لتنظيم عملك وحياتك باستخدام نوتيون",
    content: "نوتيون هو أداة قوية لتنظيم المعلومات، ولكن هناك طرق لاستخدامه بكفاءة أكبر...",
    author: "أحمد المطيري",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-15",
    readTime: "5 دقائق",
    category: "نصائح",
    tags: ["نوتيون", "الإنتاجية", "التنظيم"],
    featured: true,
    imgSrc: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 2,
    title: "كيفية إنشاء قوالب نوتيون احترافية",
    excerpt: "دليل شامل لتصميم قوالب نوتيون جذابة ومفيدة",
    content: "إنشاء قوالب نوتيون احترافية يتطلب فهم عميق للمنصة وتصميم تجربة المستخدم...",
    author: "فاطمة نور",
    authorImg: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-12",
    readTime: "8 دقائق",
    category: "تصميم",
    tags: ["قوالب", "تصميم", "نوتيون"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "أفضل قوالب نوتيون للطلاب",
    excerpt: "مجموعة مختارة من القوالب التي تساعد الطلاب في تنظيم دراستهم",
    content: "الطلاب يحتاجون إلى تنظيم ممتاز لإدارة وقتهم ودراستهم، وهذه القوالب ستساعدهم...",
    author: "عمر خالد",
    authorImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-10",
    readTime: "6 دقائق",
    category: "الدراسة",
    tags: ["طلاب", "دراسة", "تنظيم"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "إدارة المشاريع باستخدام نوتيون",
    excerpt: "كيفية استخدام نوتيون لإدارة المشاريع الصغيرة والكبيرة",
    content: "نوتيون ليس مجرد أداة لتدوين الملاحظات، بل يمكن أن يكون نظام إدارة مشاريع قوي...",
    author: "ليلى أحمد",
    authorImg: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-08",
    readTime: "10 دقائق",
    category: "الأعمال",
    tags: ["مشاريع", "إدارة", "أعمال"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 5,
    title: "قوالب نوتيون للصحة واللياقة",
    excerpt: "تنظيم روتينك الصحي وتمارينك باستخدام قوالب نوتيون",
    content: "الصحة واللياقة البدنية تحتاج إلى تتبع منتظم، وهذه القوالب ستساعدك...",
    author: "أحمد المطيري",
    authorImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-05",
    readTime: "4 دقائق",
    category: "الصحة",
    tags: ["صحة", "لياقة", "روتين"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center"
  },
  {
    id: 6,
    title: "نوتيون للمبتدئين: دليل شامل",
    excerpt: "كل ما تحتاج معرفته للبدء مع نوتيون",
    content: "إذا كنت جديداً على نوتيون، هذا الدليل سيساعدك في فهم الأساسيات...",
    author: "نورا السعيد",
    authorImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    publishDate: "2024-01-03",
    readTime: "12 دقيقة",
    category: "تعليم",
    tags: ["مبتدئين", "دليل", "أساسيات"],
    featured: false,
    imgSrc: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center"
  }
];

const categories = [
  { name: "الكل", value: "all" },
  { name: "نصائح", value: "نصائح" },
  { name: "تصميم", value: "تصميم" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الصحة", value: "الصحة" },
  { name: "تعليم", value: "تعليم" }
];

const featuredPost = blogPosts.find(post => post.featured);

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState(blogPosts.filter(post => !post.featured));

  // Filter posts
  useEffect(() => {
    let filtered = blogPosts.filter(post => !post.featured);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">

      {/* Page Header */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-6">المدونة</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              نصائح وتوجيهات لاستخدام نوتيون وأفضل الممارسات في التنظيم والإنتاجية
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pl-12 pr-4 py-4 text-lg"
                dir="rtl"
              />
              <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-tertiary text-accent-600 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-dark-quaternary'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="heading-2 mb-4">المقال المميز</h2>
            </div>

            <div className="card-interactive overflow-hidden max-w-4xl mx-auto">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative h-64 md:h-full">
                    <Image
                      src={featuredPost.imgSrc}
                      alt={featuredPost.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                        مميز
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-sm rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h3 className="heading-3 mb-4">{featuredPost.title}</h3>
                  <p className="body-medium text-accent-600 dark:text-dark-text-secondary mb-6">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-4 mb-6">
                    <Image
                      src={featuredPost.authorImg}
                      alt={featuredPost.author}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-accent-500 dark:text-dark-text-primary">{featuredPost.author}</p>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        {formatDate(featuredPost.publishDate)}
                      </p>
                    </div>
                  </div>

                  <button className="btn-primary">
                    اقرأ المقال
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="heading-2 mb-4">المقالات الأخيرة</h2>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group card-interactive overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <Image
                      src={post.imgSrc}
                      alt={post.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-sm rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        {post.readTime}
                      </span>
                      <span className="text-accent-400 dark:text-dark-text-quaternary">•</span>
                      <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                        {formatDate(post.publishDate)}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-accent-500 dark:text-dark-text-primary mb-3 group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-accent-600 dark:text-dark-text-secondary mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={post.authorImg}
                        alt={post.author}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-accent-500 dark:text-dark-text-primary">
                        {post.author}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-dark-text-secondary text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button className="w-full btn-outline text-sm">
                      اقرأ المزيد
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">لم نجد مقالات مطابقة</h3>
              <p className="text-accent-600 dark:text-dark-text-secondary mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn-primary"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            اشترك في نشرتنا البريدية
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8">
            احصل على أحدث المقالات والنصائح حول نوتيون والإنتاجية مباشرة في بريدك الإلكتروني
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="form-input flex-1 border-0 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm focus:ring-white/50 dark:focus:ring-orange-500/50 text-accent-700 dark:text-dark-text-primary"
            />
            <button className="btn-primary px-8 py-3">
              اشترك الآن
            </button>
          </div>

          <p className="text-sm text-gray-400 dark:text-dark-text-quaternary mt-4">
            يمكنك إلغاء الاشتراك في أي وقت. نحن نحترم خصوصيتك.
          </p>
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
