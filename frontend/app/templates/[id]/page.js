import { generateTemplateMetadata } from '../../../lib/seo';
import TemplateClient from './TemplateClient';
import { getApiUrl } from '../../../lib/apiConfig';

async function getTemplate(id) {
  try {
    // We use a longer timeout for the server-side fetch to handle backend cold starts
    const res = await fetch(getApiUrl(`/templates/${id}`), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.success ? data.template : null;
  } catch (error) {
    console.error('Error fetching template for server-side rendering:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const template = await getTemplate(id);
  
  if (!template) {
    return {
      title: 'قالب غير موجود | عرب نوشن',
      description: 'عذراً، لم نتمكن من العثور على القالب المطلوب في متجر عرب نوشن.'
    };
  }

  return generateTemplateMetadata(template);
}

export default async function TemplatePage({ params }) {
  const { id } = await params;
  const template = await getTemplate(id);
  
  return <TemplateClient initialTemplate={template} />;
}