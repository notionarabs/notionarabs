import { generateCategoryMetadata } from '../../../../lib/seo'

// Map category slugs to Arabic names
const categoryMap = {
  'productivity': 'الإنتاجية',
  'study': 'الدراسة',
  'business': 'الأعمال',
  'personal': 'الحياة الشخصية',
  'creativity': 'الإبداع',
  'planning': 'التخطيط',
  'technology': 'التقنية',
  'health': 'الصحة',
  'finance': 'المالية',
  'organization': 'التنظيم',
  'religious': 'ديني',
  'marketing': 'التسويق',
  'design': 'التصميم',
  'development': 'التطوير',
  'education': 'التعليم'
};

export async function generateMetadata({ params }) {
  const categorySlug = params.id;
  const categoryName = categoryMap[categorySlug] || categorySlug;

  try {
    // Fetch template count for this category
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
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

