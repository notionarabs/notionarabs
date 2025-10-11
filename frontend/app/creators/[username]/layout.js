import { generateCreatorMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }) {
  try {
    // Fetch creator data from API for metadata
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : 'http://localhost:5000/api';

    console.log(`[Creator Metadata] Fetching: ${apiUrl}/creators/${params.username}`);

    const response = await fetch(`${apiUrl}/creators/${params.username}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`[Creator Metadata] Response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log('[Creator Metadata] Data received:', data.success, !!data.creator);

      if (data.success && data.creator) {
        console.log('[Creator Metadata] Creator found:', data.creator.name);
        return generateCreatorMetadata(data.creator);
      }
    } else {
      console.error(`[Creator Metadata] API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('[Creator Metadata] Error response:', errorText);
    }
  } catch (error) {
    console.error('[Creator Metadata] Exception:', error.message);
  }

  // Fallback metadata
  console.log('[Creator Metadata] Using fallback metadata');
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
  // Server component wrapper for creator pages with dynamic metadata
  return children;
}

