import { generateMetadata } from '../../lib/seo';
import TestimonialsClient from './TestimonialsClient';

export const metadata = generateMetadata({
  title: 'قصص النجاح والآراء | عرب نوشن',
  description: 'ماذا يقول مجتمعنا؟ اقرأ مراجعات وقصص نجاح مستخدمي عرب نوشن وتجاربهم في تنظيم مهامهم وحياتهم باستخدام قوالبنا وأدواتنا الإبداعية.',
  url: '/testimonials',
});

export default function TestimonialsPage() {
  return <TestimonialsClient />;
}
