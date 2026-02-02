import { generateMetadata } from '../../lib/seo';

export const metadata = generateMetadata({
    title: 'استعادة كلمة المرور',
    description: 'هل نسيت كلمة المرور؟ ادخل بريدك الإلكتروني لاستعادة الوصول إلى حسابك في عرب نوشن.',
    url: '/forgot-password'
});

export default function ForgotPasswordLayout({ children }) {
    return children;
}
