import { generateCategoryMetadata } from '../../../../lib/seo'
import api from '../../../../lib/api'

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
    // Try to fetch template count for this category
    const response = await api.get(`/templates?category=${categoryName}&limit=1`);
    
    if (response.data.success) {
      const count = response.data.pagination?.total || 0;
      return generateCategoryMetadata(categoryName, count);
    }
  } catch (error) {
    console.error('Error fetching category metadata:', error);
  }

  // Fallback metadata
  return generateCategoryMetadata(categoryName, 0);
}

