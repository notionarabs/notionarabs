import api from '../../lib/api';
import CreatorsClient from './CreatorsClient';
import { generateMetadata as generateSeoMetadata } from '../../lib/seo';

export const metadata = generateSeoMetadata({
  title: 'المبدعون',
  description: 'تعرف على أفضل المبدعين في مجتمع عرب نوشن واكتشف قوالبهم المبتكرة للغة العربية. انضم إلى مجتمع المبدعين العرب.',
  url: '/creators',
  keywords: ['المبدعين', 'creators', 'قوالب نوشن', 'مبدعين عرب', 'notion creators']
});

async function getCreators() {
  try {
    const params = new URLSearchParams({
      page: '1',
      limit: '50',
      sortBy: 'popular',
      sortOrder: 'desc'
    });
    
    const response = await api.get(`/creators?${params.toString()}`);
    if (response.data.success) {
      return {
        creators: response.data.creators || [],
        pagination: response.data.pagination || { current: 1, pages: 1, total: 0, limit: 12 }
      };
    }
    return { creators: [], pagination: { current: 1, pages: 1, total: 0, limit: 12 } };
  } catch (err) {
    console.error('Error fetching creators on server:', err.message);
    return { creators: [], pagination: { current: 1, pages: 1, total: 0, limit: 12 } };
  }
}

export const revalidate = 60;

export default async function CreatorsPage() {
  const { creators, pagination } = await getCreators();
  
  return <CreatorsClient initialCreators={creators} initialPagination={pagination} />;
}
