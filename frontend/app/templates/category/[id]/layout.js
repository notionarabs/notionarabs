import { generateCategoryMetadata } from '../../../../lib/seo'
import { getCategoryName } from '../../../../lib/categoryMapping'
import { getApiBaseUrl } from '../../../../lib/apiConfig'

export async function generateMetadata({ params }) {
  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;
  const categorySlug = resolvedParams.id;
  const categoryName = getCategoryName(categorySlug);

  try {
    // Fetch template count for this category
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl}/templates?category=${categoryName}&limit=1`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const count = data.pagination?.total || 0;
      return generateCategoryMetadata(categoryName, count);
    }
  } catch (error) {
    console.error('Error fetching category metadata:', error);
  }

  // Fallback metadata
  return generateCategoryMetadata(categoryName, 0);
}

export default function CategoryLayout({ children }) {
  return children;
}

