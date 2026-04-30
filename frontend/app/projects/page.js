import ProjectsClient from './ProjectsClient';

export const metadata = {
    title: 'مشاريعنا',
    description: 'استعرض أبرز المشاريع التي نفّذناها لعملائنا باستخدام نوشن — من أنظمة متكاملة لإدارة الأعمال إلى لوحات تحكم احترافية.',
    openGraph: {
        title: 'مشاريعنا',
        description: 'استعرض أبرز المشاريع التي نفّذناها لعملائنا باستخدام نوشن.',
        locale: 'ar_AR',
        type: 'website',
    },
};

export default function ProjectsPage() {
    return <ProjectsClient />;
}
