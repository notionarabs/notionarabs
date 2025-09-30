import { generateTemplateMetadata } from '../../../lib/seo'
import api from '../../../lib/api'

export async function generateMetadata({ params }) {
  try {
    // Try to fetch template data for metadata
    const response = await api.get(`/templates/${params.id}`)

    if (response.data.success && response.data.template) {
      return generateTemplateMetadata(response.data.template)
    }
  } catch (error) {
    console.error('Error fetching template metadata:', error)
  }

  // Fallback metadata
  return generateTemplateMetadata({
    title: 'قالب نوشن',
    description: 'قالب نوشن باللغة العربية - تحميل مجاني',
    category: 'عام',
    creator: { name: 'مبدع' },
    previewImage: null,
    tags: ['قالب', 'نوشن', 'عربي']
  })
}
