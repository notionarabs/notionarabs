import { generateMetadata } from '../../lib/seo';

export const metadata = generateMetadata({
    title: 'تسجيل الدخول',
    description: 'قم بتسجيل الدخول إلى حسابك في عرب نوشن للوصول إلى قوالبك ومشاريعك.',
    url: '/login'
});

export default function LoginLayout({ children }) {
    return children;
}
