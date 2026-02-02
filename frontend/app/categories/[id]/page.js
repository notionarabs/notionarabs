import { Suspense } from 'react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb';
import Image from 'next/image';
import { LayoutDashboard, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import api from '../../../lib/api';
import LoadingIndicator from '../../../components/LoadingIndicator';
import StarRating from '../../../components/StarRating';
import CategoryTemplatesClient from './CategoryTemplatesClient';
import { getCategoryName } from '../../../lib/categoryMapping';
import { getApiBaseUrl } from '../../../lib/apiConfig';

// Fetch initial data on the server
async function getCategoryTemplates(categoryName, page = 1, limit = 12, sortBy = 'createdAt') {
  try {
    const apiUrl = getApiBaseUrl();
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
  const categoryName = getCategoryName(categorySlug);

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
        <BreadcrumbWrapper
          items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'التصنيفات', url: '/categories' },
            { name: categoryName, url: `/categories/${categorySlug}` }
          ]}
        />

        {/* Header */}
        <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-card-border transition-colors duration-300">
          <div className="container-custom py-8 sm:py-10 md:py-12">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-accent-900 dark:text-white mb-4 sm:mb-6 px-4">قوالب {categoryName}</h1>
              <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4">
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

