import CreatorsClient from './CreatorsClient';

export const metadata = {
  title: 'المبدعون | عرب نوشن',
  description: 'تعرف على أفضل المبدعين في مجتمع عرب نوشن واكتشف قوالبهم المبتكرة للغة العربية. انضم إلى مجتمع المبدعين العرب.',
  alternates: {
    canonical: 'https://www.notionarabs.com/creators',
  },
  keywords: ['المبدعين', 'creators', 'قوالب نوشن', 'مبدعين عرب', 'notion creators'],
  openGraph: {
    title: 'المبدعون | عرب نوشن',
    description: 'تعرف على أفضل المبدعين في مجتمع عرب نوشن واكتشف قوالبهم المبتكرة',
    url: 'https://www.notionarabs.com/creators',
    type: 'website',
  },
};

export default function CreatorsPage() {
  return <CreatorsClient />;
}
