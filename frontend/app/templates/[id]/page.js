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
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
  price: 25,
  originalPrice: 35,
  description: "قالب شامل ومتقدم لتنظيم الدراسة والمذاكرة بكفاءة عالية. يتضمن جداول زمنية، تتبع التقدم، وأدوات تحليل الأداء.",
  longDescription: "هذا القالب مصمم خصيصاً للطلاب والدارسين الذين يريدون تنظيم دراستهم بطريقة علمية وفعالة. يحتوي على أكثر من 20 صفحة من الأدوات والجداول المختلفة التي تساعدك في:",
  features: [
    "جدول زمني مرن للدراسة",
    "تتبع التقدم اليومي والأسبوعي",
    "أدوات تحليل الأداء",
    "قوالب للامتحانات والاختبارات",
    "نظام تذكيرات ذكي",
    "تقارير إحصائية مفصلة"
  ],
  category: "التعليم",
  tags: ["دراسة", "تعليم", "إنتاجية", "تنظيم"],
  rating: 4.8,
  reviews: 156,
  downloads: 2100,
  imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
};

const relatedTemplates = [
  {
    id: 2,
    title: "منظم المشاريع الشخصية",
    creator: "سارة أحمد",
    price: 20,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 3,
    title: "مخطط الميزانية الشهري",
    creator: "محمد علي",
    price: 15,
    imgSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center"
  },
  {
    id: 4,
    title: "منظم الروتين اليومي",
    creator: "فاطمة حسن",
    price: 18,
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
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="mb-4">
                <Image
                  src={template.imgSrc}
                  alt={template.title}
                  width={600}
                  height={400}
                  className="w-full h-80 object-cover rounded-xl"
                  quality={100}
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative overflow-hidden rounded-lg transition-all duration-200 ${selectedImage === index ? 'ring-2 ring-orange-500' : 'hover:opacity-80'
                      }`}
                  >
                    <Image
                      src={template.imgSrc}
                      alt={`${template.title} - ${index}`}
                      width={150}
                      height={100}
                      className="w-full h-20 object-cover"
                      quality={100}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Template Info */}
            <div>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-accent-600 dark:text-dark-text-secondary mb-4">
                <Link href="/templates" className="hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors">
                  القوالب
                </Link>
                <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">{template.category}</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">/</span>
                <span className="text-accent-400 dark:text-dark-text-quaternary">{template.title}</span>
              </nav>

              <h1 className="heading-1 mb-4">{template.title}</h1>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={template.creator.avatar}
                  alt={template.creator.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                  quality={100}
                />
                <div>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary">بواسطة</p>
                  <Link
                    href={`/creators/${template.creator.name.replace(/\s+/g, '-')}`}
                    className="font-medium text-accent-700 dark:text-dark-text-primary hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    {template.creator.name}
                  </Link>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={template.rating} />
                <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  ({template.reviews} تقييم)
                </span>
                <span className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  {template.downloads.toLocaleString()} تحميل
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  ${template.price}
                </span>
                {template.originalPrice && (
                  <span className="text-lg text-accent-500 dark:text-dark-text-tertiary line-through">
                    ${template.originalPrice}
                  </span>
                )}
                {template.originalPrice && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-sm font-medium">
                    خصم {Math.round((1 - template.price / template.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => setIsPurchased(true)}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 mb-6 ${isPurchased
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
              >
                {isPurchased ? 'تم الشراء ✓' : 'شراء الآن'}
              </button>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-accent-700 dark:text-dark-text-primary mb-2">الوصف</h3>
                <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-accent-100 dark:bg-dark-tertiary text-accent-700 dark:text-dark-text-secondary rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description and Features */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Long Description */}
            <div className="lg:col-span-2">
              <h2 className="heading-2 mb-6">تفاصيل القالب</h2>
              <div className="prose prose-accent dark:prose-dark max-w-none">
                <p className="text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6">
                  {template.longDescription}
                </p>

                <ul className="space-y-3">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-accent-600 dark:text-dark-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Template Stats */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-secondary rounded-xl p-6 shadow-medium dark:shadow-dark-medium">
                <h3 className="font-semibold text-accent-700 dark:text-dark-text-primary mb-4">إحصائيات القالب</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">التقييم</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={template.rating} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">عدد التقييمات</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{template.reviews}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">التحميلات</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{template.downloads.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">الفئة</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{template.category}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-accent-600 dark:text-dark-text-secondary">تاريخ الإنشاء</span>
                    <span className="font-medium text-accent-700 dark:text-dark-text-primary">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Templates */}
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <h2 className="heading-2 mb-8">قوالب مشابهة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedTemplates.map((relatedTemplate) => (
              <div key={relatedTemplate.id} className="bg-white dark:bg-dark-primary rounded-xl shadow-medium dark:shadow-dark-medium overflow-hidden transition-all duration-200 hover:shadow-large dark:hover:shadow-dark-large hover:-translate-y-1">
                <Link href={`/templates/${relatedTemplate.id}`}>
                  <div className="relative">
                    <Image
                      src={relatedTemplate.imgSrc}
                      alt={relatedTemplate.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                      quality={100}
                    />
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                      ${relatedTemplate.price}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-accent-700 dark:text-dark-text-primary mb-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      {relatedTemplate.title}
                    </h3>
                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                      بواسطة {relatedTemplate.creator}
                    </p>
                  </div>
                </Link>
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
                  height={60}
                  className="h-12 w-auto"
                  quality={100}
                  unoptimized
                />
              </div>
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm leading-relaxed">
                منصة متخصصة في قوالب نوتيون باللغة العربية، نساعدك على تنظيم حياتك وإنجاز أهدافك بكفاءة أكبر.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">القوالب</h4>
              <ul className="space-y-2">
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">جميع القوالب</Link></li>
                <li><Link href="/templates/education" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">التعليم</Link></li>
                <li><Link href="/templates/productivity" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">الإنتاجية</Link></li>
                <li><Link href="/templates/business" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">الأعمال</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">المنصة</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">من نحن</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">المبدعين</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">المدونة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">تواصل معنا</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">مركز المساعدة</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">شروط الاستخدام</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">سياسة الخصوصية</Link></li>
                <li><Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors text-sm">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © 2024 عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}