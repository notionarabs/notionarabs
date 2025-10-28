import { Suspense } from 'react';
import Image from 'next/image';
import { LayoutDashboard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StarRating from '../../../components/StarRating';
import CategoryTemplatesClient from './CategoryTemplatesClient';

// Map category slugs to Arabic names
const categoryMap = {
  'productivity': 'الإنتاجية',
  'study': 'الدراسة',
  'business': 'الأعمال',
  'personal': 'الحياة الشخصية',
  'creativity': 'الإبداع',
  'technology': 'التقنية',
  'health': 'الصحة',
  'finance': 'المالية',
  'organization': 'التنظيم',
  'planning': 'التخطيط',
  'religious': 'ديني',
  'marketing': 'التسويق',
  'design': 'التصميم',
  'development': 'التطوير',
  'education': 'التعليم',
  'travel': 'السفر',
  'food': 'الطعام',
  'sports': 'الرياضة',
  'entertainment': 'الترفيه',
  'fashion': 'الموضة',
  'beauty': 'الجمال',
  'home': 'المنزل',
  'garden': 'الحديقة',
  'pets': 'الحيوانات الأليفة',
  'cars': 'السيارات',
  'programming': 'البرمجة',
  'database': 'قواعد البيانات',
  'cybersecurity': 'الأمان السيبراني',
  'ai': 'الذكاء الاصطناعي',
  'blockchain': 'البلوك تشين',
  'ecommerce': 'التجارة الإلكترونية',
  'sales': 'المبيعات',
  'customer-service': 'خدمة العملاء',
  'hr': 'الموارد البشرية',
  'accounting': 'المحاسبة',
  'investment': 'الاستثمار',
  'real-estate': 'العقارات',
  'insurance': 'التأمين',
  'law': 'القانون',
  'medicine': 'الطب',
  'nursing': 'التمريض',
  'physical-therapy': 'العلاج الطبيعي',
  'nutrition': 'التغذية',
  'cooking': 'الطبخ',
  'desserts': 'الحلويات',
  'beverages': 'المشروبات',
  'restaurants': 'المطاعم',
  'arts': 'الفنون',
  'music': 'الموسيقى',
  'drawing': 'الرسم',
  'sculpture': 'النحت',
  'photography': 'التصوير',
  'video': 'الفيديو',
  'writing': 'الكتابة',
  'translation': 'الترجمة',
  'languages': 'اللغات',
  'history': 'التاريخ',
  'geography': 'الجغرافيا',
  'science': 'العلوم',
  'mathematics': 'الرياضيات',
  'physics': 'الفيزياء',
  'chemistry': 'الكيمياء',
  'biology': 'الأحياء',
  'psychology': 'علم النفس',
  'sociology': 'علم الاجتماع',
  'philosophy': 'الفلسفة',
  'literature': 'الأدب',
  'poetry': 'الشعر',
  'theater': 'المسرح',
  'cinema': 'السينما',
  'gaming': 'الألعاب',
  'esports': 'الرياضة الإلكترونية',
  'tourism': 'السياحة',
  'hospitality': 'الفندقة',
  'transportation': 'النقل',
  'aviation': 'الطيران',
  'maritime': 'البحرية',
  'agriculture': 'الزراعة',
  'environment': 'البيئة',
  'energy': 'الطاقة',
  'construction': 'البناء',
  'engineering': 'الهندسة',
  'architecture': 'العمارة',
  'decoration': 'الديكور',
  'furniture': 'الأثاث',
  'tools': 'الأدوات',
  'devices': 'الأجهزة',
  'software': 'البرامج',
  'applications': 'التطبيقات',
  'websites': 'المواقع',
  'web-development': 'التطوير الويب',
  'app-development': 'تطوير التطبيقات',
  'e-learning': 'التعليم الإلكتروني',
  'meetings': 'الاجتماعات',
  'communication': 'التواصل',
  'social-networks': 'الشبكات الاجتماعية',
  'content': 'المحتوى',
  'advertising': 'الإعلان',
  'public-relations': 'العلاقات العامة',
  'branding': 'العلامة التجارية',
  'strategy': 'الاستراتيجية',
  'leadership': 'القيادة',
  'management': 'الإدارة',
  'projects': 'المشاريع',
  'operations': 'العمليات',
  'quality': 'الجودة',
  'innovation': 'الابتكار',
  'research-development': 'البحث والتطوير',
  'analysis': 'التحليل',
  'statistics': 'الإحصاء',
  'data': 'البيانات',
  'reports': 'التقارير',
  'presentations': 'العروض التقديمية',
  'training': 'التدريب',
  'professional-development': 'التطوير المهني',
  'consulting': 'الاستشارات',
  'services': 'الخدمات',
  'products': 'المنتجات',
  'manufacturing': 'التصنيع',
  'distribution': 'التوزيع',
  'warehouses': 'المخازن',
  'logistics': 'اللوجستيات'
};

// Generate metadata for each category page
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.id;
  const categoryName = categoryMap[categorySlug] || categorySlug;

  
  return {
    title: `قوالب ${categoryName} - قوالب نوشن عربية مجانية`,
    description: `اكتشف مجموعة متنوعة من قوالب ${categoryName} المصممة خصيصاً للمستخدمين العرب. قوالب نوشن مجانية ومتخصصة لتحسين إنتاجيتك.`,
    keywords: `قوالب ${categoryName}, قوالب نوشن, قوالب عربية, ${categoryName}, إنتاجية, تنظيم`,
    openGraph: {
      title: `قوالب ${categoryName} - قوالب نوشن عربية مجانية`,
      description: `اكتشف مجموعة متنوعة من قوالب ${categoryName} المصممة خصيصاً للمستخدمين العرب.`,
      type: 'website',
      locale: 'ar_SA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `قوالب ${categoryName} - قوالب نوشن عربية مجانية`,
      description: `اكتشف مجموعة متنوعة من قوالب ${categoryName} المصممة خصيصاً للمستخدمين العرب.`,
    },
    alternates: {
      canonical: `https://www.notionarabs.com/categories/${categorySlug}`,
    },
  };
}

// Fetch initial data on the server
async function getCategoryTemplates(categoryName, page = 1, limit = 12, sortBy = 'createdAt') {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'production' ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api' : 'http://localhost:5000/api');
      const params = new URLSearchParams({
        category: categoryName,
      page: page.toString(),
      limit: limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });

    const response = await fetch(`${apiUrl}/templates?${params.toString()}`, {
      cache: 'force-cache'
    });

    if (response.ok) {
      const data = await response.json();
      return {
        templates: data.templates || [],
        pagination: data.pagination || { current: 1, pages: 1, total: 0, limit: 12 }
      };
      }
    } catch (error) {
    console.error('Error fetching category templates:', error);
  }

  return {
    templates: [],
    pagination: { current: 1, pages: 1, total: 0, limit: 12 }
  };
}

export default async function CategoryTemplatesPage({ params }) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.id;
  const categoryName = categoryMap[categorySlug] || categorySlug;
  
  // Fetch initial data on the server
  const { templates, pagination } = await getCategoryTemplates(categoryName);

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `قوالب ${categoryName}`,
    "description": `اكتشف مجموعة متنوعة من قوالب ${categoryName} المصممة خصيصاً للمستخدمين العرب. قوالب نوشن مجانية ومتخصصة لتحسين إنتاجيتك.`,
    "url": `https://www.notionarabs.com/categories/${categorySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `قوالب ${categoryName}`,
      "numberOfItems": pagination.total,
      "itemListElement": templates.slice(0, 10).map((template, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "CreativeWork",
          "name": template.title,
          "description": template.description || `قالب ${categoryName} متخصص`,
          "url": `https://www.notionarabs.com/templates/${template.slug || template._id}`,
          "author": {
            "@type": "Person",
            "name": template.creator?.name || "مبدع غير معروف"
          },
          "dateCreated": template.createdAt,
          "dateModified": template.updatedAt
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://www.notionarabs.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "التصنيفات",
          "item": "https://www.notionarabs.com/categories"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": `https://www.notionarabs.com/categories/${categorySlug}`
        }
      ]
    }
  };

    return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border">
          <div className="container-custom py-3 sm:py-4">
            <nav className="flex items-center space-x-2 space-x-reverse text-sm">
              <Link href="/" className="text-accent-600 dark:text-dark-text-secondary hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-4 h-4 text-accent-400 dark:text-dark-text-tertiary" />
              <Link href="/categories" className="text-accent-600 dark:text-dark-text-secondary hover:text-accent-700 dark:hover:text-dark-text-primary transition-colors">
                التصنيفات
              </Link>
              <ChevronLeft className="w-4 h-4 text-accent-400 dark:text-dark-text-tertiary" />
              <span className="text-accent-700 dark:text-dark-text-primary font-medium">{categoryName}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          <div className="container-custom py-8 sm:py-10 md:py-12">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 px-4">قوالب {categoryName}</h1>
              <p className="text-sm sm:text-base md:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xs sm:max-w-md md:max-w-2xl mx-auto px-4">
                اكتشف مجموعة متنوعة من قوالب {categoryName} المصممة خصيصاً للمستخدمين العرب.
              </p>
            </div>
          </div>
        </div>

        {/* Client Component for Interactive Features */}
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 flex items-center justify-center" dir="rtl">
        <LoadingIndicator />
      </div>
    }>
          <CategoryTemplatesClient 
            categorySlug={categorySlug}
            categoryName={categoryName}
            initialTemplates={templates}
            initialPagination={pagination}
          />
    </Suspense>
      </div>
    </>
  );
}

