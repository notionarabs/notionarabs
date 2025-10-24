import { generateCategoryMetadata } from '../../../../lib/seo'

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

export async function generateMetadata({ params }) {
  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;
  const categorySlug = resolvedParams.id;
  const categoryName = categoryMap[categorySlug] || categorySlug;

  try {
    // Fetch template count for this category
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notionarabs.com/api'
      : 'http://localhost:5000/api';
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

