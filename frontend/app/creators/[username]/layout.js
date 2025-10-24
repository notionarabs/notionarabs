import { generateCreatorMetadata } from '../../../lib/seo'

export async function generateMetadata({ params }) {
  // Await params before accessing its properties (Next.js 15+)
  const resolvedParams = await params;

  try {
    // Fetch creator data from API for metadata
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'http://api.notionarabs.com/api'
      : 'http://localhost:5000/api';

    const response = await fetch(`${apiUrl}/creators/${resolvedParams.username}`, {
      cache: 'no-store', // Always fetch fresh data for metadata
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.creator) {
        return generateCreatorMetadata(data.creator);
      }
    }
  } catch (error) {
    // Silent failure - use fallback metadata
  }

  // Fallback metadata
  return generateCreatorMetadata({
    name: 'مبدع',
    displayName: 'مبدع قوالب نوشن',
    bio: 'مبدع قوالب Notion باللغة العربية',
    username: resolvedParams.username,
    templateCount: 0,
    profilePicture: null
  });
}

export const dynamic = 'force-dynamic'

export default function CreatorLayout({ children }) {
  // Server component wrapper for creator pages with dynamic metadata
  return children;
}

