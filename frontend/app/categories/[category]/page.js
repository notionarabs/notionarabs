'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryPage({ params }) {
  const router = useRouter();
  const category = params.category;

  // Map English slug to Arabic category label for filtering
  const slugToArabic = {
    productivity: 'الإنتاجية',
    study: 'الدراسة',
    business: 'الأعمال',
    personal: 'الحياة الشخصية',
    creativity: 'الإبداع',
    technology: 'التقنية',
    health: 'الصحة',
    finance: 'المالية',
    organization: 'التنظيم',
    planning: 'التخطيط',
    work: 'العمل',
    life: 'الحياة'
  };

  useEffect(() => {
    const arabicCategory = slugToArabic[category] || category;
    router.replace(`/templates?category=${encodeURIComponent(arabicCategory)}`);
  }, [category]);

  return null;
}
