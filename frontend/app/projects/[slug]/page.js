import { projects, getProjectBySlug } from '../projectsData';
import ProjectDetailClient from './ProjectDetailClient';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const project = getProjectBySlug(resolvedParams.slug);
    if (!project) return {};

    return {
        title: `${project.title} | مشاريعنا | عرب نوشن`,
        description: project.description,
        openGraph: {
            title: project.title,
            description: project.description,
            images: [{ url: project.cover }],
            locale: 'ar_AR',
            type: 'article',
        },
    };
}

export default async function ProjectDetailPage({ params }) {
    const resolvedParams = await params;
    const project = getProjectBySlug(resolvedParams.slug);
    if (!project) notFound();

    return <ProjectDetailClient project={project} />;
}
