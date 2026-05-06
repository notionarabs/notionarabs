import api from '../lib/api';
import HomePageClient from './HomePageClient';

// Server-side data fetching for statistics
async function getStats() {
  try {
    // Note: On the server, we need the full URL if it's not relative.
    // Our api instance is already configured with the correct baseURL.
    const response = await api.get('/stats/homepage');
    return response.data.success ? response.data : null;
  } catch (err) {
    console.error('Error fetching stats on server:', err.message);
    return null;
  }
}

export default async function HomePage() {
  const stats = await getStats();
  
  return <HomePageClient initialStats={stats} />;
}
