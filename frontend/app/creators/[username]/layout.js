import { generateCreatorMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }) {
  try {
    // Fetch creator data from API for metadata
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/creators/${params.username}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.creator) {
        return generateCreatorMetadata(data.creator);
      }
    }
  } catch (error) {
    console.error('Error fetching creator metadata:', error);
  }

  // Fallback metadata
  return generateCreatorMetadata({
    name: 'مبدع',
    displayName: 'مبدع قوالب نوشن',
    bio: 'مبدع قوالب Notion باللغة العربية',
    username: params.username,
    templateCount: 0,
    profilePicture: null
  });
}

export default function CreatorLayout({ children }) {
  return children;
}

