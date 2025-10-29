import { generateTemplateMetadata } from '../../../lib/seo'

// Server-side data fetching function for faster page loads
export async function fetchTemplateData(id) {
  try {
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api'
      : 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/templates/${id}`, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.template) {
        return data.template;
      }
    }
  } catch (error) {
    console.error('Error fetching template data:', error);
  }
  
  return null;
}

export async function generateMetadata({ params }) {
  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;

  try {
    // Fetch template data from API for metadata with revalidation
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs-fe5b3f214071.herokuapp.com/api'
      : 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/templates/${resolvedParams.id}`, {
      next: { revalidate: 60 }, // Revalidate every 1 minute for faster updates
      headers: {
        'Content-Type': 'application/json',
      }
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

