import { generateCreatorMetadata } from '../../../lib/seo'
import api from '../../../lib/api'

export async function generateMetadata({ params }) {
  try {
    // Try to fetch creator data for metadata
    const response = await api.get(`/creators/${params.username}`)

    if (response.data.success && response.data.creator) {
      return generateCreatorMetadata(response.data.creator)
    }
  } catch (error) {
    console.error('Error fetching creator metadata:', error)
  }

  // Fallback metadata
  return generateCreatorMetadata({
    name: 'مبدع',
    displayName: 'مبدع قوالب نوشن',
    bio: 'مبدع قوالب Notion باللغة العربية',
    username: params.username,
    templateCount: 0,
    profilePicture: null
  })
}

