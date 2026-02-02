import { generateMetadata } from '../../lib/seo';

export const metadata = generateMetadata({
    title: 'تأكيد البريد الإلكتروني',
    description: 'يرجى تأكيد بريدك الإلكتروني لتتمكن من استخدام حسابك والوصول إلى كافة خدمات عرب نوشن.',
    url: '/verify-email'
});

export default function VerifyEmailLayout({ children }) {
    return children;
}
