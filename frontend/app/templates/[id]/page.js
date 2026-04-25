import { generateTemplateMetadata, generateTemplateSchema } from '../../../lib/seo';
import TemplateClient from './TemplateClient';
import { getApiUrl } from '../../../lib/apiConfig';

async function getTemplate(id) {
  try {
    const res = await fetch(getApiUrl(`/templates/${id}`), {
      next: { revalidate: 60 },
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
  
  if (!template) return <TemplateClient initialTemplate={null} />;

  // Generate structured data for SEO
  const jsonLd = generateTemplateSchema(template);

  return (
    <>
      {/* Google Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplateClient initialTemplate={template} />
    </>
  );
}