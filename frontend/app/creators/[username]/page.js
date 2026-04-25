import { generateCreatorMetadata } from '../../../lib/seo';
import CreatorProfileClient from './CreatorProfileClient';
import { getApiUrl } from '../../../lib/apiConfig';

async function getCreator(username) {
  try {
    const res = await fetch(getApiUrl(`/creators/${username}`), {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.success ? data.creator : null;
  } catch (error) {
    console.error('Error fetching creator profile for server-side rendering:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { username } = await params;
  const creator = await getCreator(username);
  
  if (!creator) {
    return {
      title: 'مبدع غير موجود | عرب نوشن',
      description: 'عذراً، لم نتمكن من العثور على المبدع المطلوب في مجتمع عرب نوشن.'
    };
  }

  return generateCreatorMetadata(creator);
}

export default async function CreatorPage({ params }) {
  const { username } = await params;
  const creator = await getCreator(username);
  
  return <CreatorProfileClient initialCreator={creator} />;
}
