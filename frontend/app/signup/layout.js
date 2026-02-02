import { generateMetadata } from '../../lib/seo';

export const metadata = generateMetadata({
    title: 'إنشاء حساب جديد',
    description: 'انضم إلى مجتمع عرب نوشن اليوم وابدأ رحلتك في تنظيم وإدارة أعمالك وحياتك بنظام نوشن.',
    url: '/signup'
});

export default function SignupLayout({ children }) {
    return children;
}
