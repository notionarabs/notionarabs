import { Suspense } from 'react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb';
import LoadingIndicator from '../../../components/LoadingIndicator';
import CategoryTemplatesClient from './CategoryTemplatesClient';
import { generateMetadata as generateBaseMetadata } from '../../../lib/seo';
import { getCategoryName } from '../../../lib/categoryMapping';
import { getApiBaseUrl } from '../../../lib/apiConfig';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const categoryName = getCategoryName(id);

  return generateBaseMetadata({
    title: `قوالب ${categoryName}`,
    description: `اكتشف مجموعة متنوعة من قوالب ${categoryName} المصممة خصيصاً للمستخدمين العرب. قوالب نوشن مجانية ومتخصصة لتحسين إنتاجيتك.`,
    url: `/categories/${id}`,
    keywords: [`قوالب ${categoryName}`, 'نوشن', 'notion templates', 'قوالب عربية']
  });
}

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
      cache: 'no-store'
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

  const { templates, pagination } = await getCategoryTemplates(categoryName);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <LoadingIndicator />
      </div>
    }>
      <CategoryTemplatesClient
        categoryId={categorySlug}
        categoryName={categoryName}
        initialTemplates={templates}
        initialPagination={pagination}
      />
    </Suspense>
  );
}
