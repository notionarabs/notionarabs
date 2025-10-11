import { generateTemplateMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }) {
  try {
    // Fetch template data from API for metadata
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/templates/${params.id}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.template) {
        return generateTemplateMetadata(data.template);
      }
    }
  } catch (error) {
    console.error('Error fetching template metadata:', error);
  }

  // Fallback metadata
  return generateTemplateMetadata({
    title: 'قالب نوشن',
    description: 'قالب نوشن باللغة العربية - تحميل مجاني',
    category: 'عام',
    creator: { name: 'مبدع' },
    previewImage: null,
    tags: ['قالب', 'نوشن', 'عربي']
  });
}

export default function TemplateLayout({ children }) {
  return children;
}

