'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ExternalLink, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import Footer from '../../components/Footer';

const projects = [
    {
        id: 'yuyan-academy',
        slug: 'yuyan-academy',
        name: 'أكاديمية YuYan',
        logo: '/projects/YuYan Academy/logo.svg',
        invertLogoInLight: false,
        cover: '/projects/YuYan Academy/Contact Form.png',
        description: 'تصميم صفحة هبوط (Landing Page) مؤقتة لجمع بيانات الطلاب المهتمين (الاسم، الإيميل، الهاتف) وربطها لحظياً بقاعدة بيانات Notion.',
        tags: ['تطوير ويب', 'Notion API', 'تعليم'],
        color: 'from-emerald-500/10 to-teal-500/5',
        accent: 'bg-emerald-500',
        images: [
            '/projects/YuYan Academy/Contact Form.png',
            '/projects/YuYan Academy/Notion DB.png',
        ],
    },
    {
        id: 'resaltk',
        slug: 'resaltk',
        name: 'منصة رسالتك',
        logo: '/projects/Resaltk/Logo.webp',
        invertLogoInLight: true,
        cover: '/projects/Resaltk/Dashboard.webp',
        description:
            'نظام مركزي لإدارة مهام وأفكار واجتماعات ومستندات تطوير تطبيق موجه لطلاب الماجستير والدكتوراه والباحثين.',
        tags: ['إدارة مشاريع', 'لوحة تحكم', 'أتمتة'],
        color: 'from-violet-500/10 to-purple-500/5',
        accent: 'bg-violet-500',
        images: [
            '/projects/Resaltk/Dashboard.webp',
            '/projects/Resaltk/9.webp',
            '/projects/Resaltk/10.webp',
        ],
    },
    {
        id: 'gold-tracker',
        slug: 'gold-investment',
        name: 'نظام متتبع الذهب',
        logo: '/projects/Gold Tracker/Logo.webp',
        cover: '/projects/Gold Tracker/Dashboard.webp',
        description:
            'لوحة تحكم مخصصة تعتمد على ربط مباشر بأسعار الذهب وحساب الأرباح ونسبة العائد تلقائيًا.',
        tags: ['مالية', 'تتبع الاستثمارات', 'تقارير'],
        color: 'from-amber-500/10 to-yellow-500/5',
        accent: 'bg-amber-500',
        images: [
            '/projects/Gold Tracker/Dashboard.webp',
        ],
    },
    {
        id: 'trend-design',
        slug: 'trend-design',
        name: 'شركة Trend Design',
        logo: '/projects/Trend Design/Logo.webp',
        cover: '/projects/Trend Design/11.webp',
        description:
            'نظام متكامل يربط المشاريع، العملاء، التصميم، المالية، المبيعات، الموارد البشرية، والتسويق في لوحة تحكم مركزية واحدة.',
        tags: ['تصميم', 'إدارة العملاء', 'إبداع'],
        color: 'from-rose-500/10 to-pink-500/5',
        accent: 'bg-rose-500',
        images: [
            '/projects/Trend Design/11.webp',
            '/projects/Trend Design/12.webp',
            '/projects/Trend Design/13.webp',
        ],
    },
    {
        id: 'personal-portfolio',
        slug: 'personal-portfolio',
        name: 'موقع أعمال لمطور ويب',
        logo: '/projects/Personal Portfolio/Logo.png',
        invertLogoInLight: true,
        cover: '/projects/Personal Portfolio/HeroSection.png',
        description: 'تطوير معرض أعمال (Portfolio) تعرض خدمات تطوير المواقع، متصلة بـ Notion API لاستقبال طلبات العملاء.',
        tags: ['تطوير ويب', 'Notion API', 'مستقل'],
        color: 'from-blue-500/10 to-sky-500/5',
        accent: 'bg-blue-500',
        images: [
            '/projects/Personal Portfolio/HeroSection.png',
            '/projects/Personal Portfolio/Contact Form.png',
            '/projects/Personal Portfolio/Notion DB.png',
        ],
    },
    {
        id: 'personal-portfolio-2',
        slug: 'personal-portfolio-2',
        name: 'موقع شخصي لخبير نوشن',
        logo: '/projects/Personal Portfolio - 2/Logo.webp',
        invertLogoInLight: true,
        cover: '/projects/Personal Portfolio - 2/HeroSection.png',
        description: 'بناء منصة متكاملة لخبير بناء أنظمة نوشن، مزودة ببوابة دخول للعملاء وربط مباشر لاستفساراتهم بنظام إدارة العملاء الداخلي.',
        tags: ['استشارات', 'Notion API', 'بوابة عملاء'],
        color: 'from-blue-500/10 to-indigo-500/5',
        accent: 'bg-indigo-500',
        images: [
            '/projects/Personal Portfolio - 2/HeroSection.png',
            '/projects/Personal Portfolio - 2/Contact Form.png',
            '/projects/Personal Portfolio - 2/Sign In Form.png',
            '/projects/Personal Portfolio - 2/Notion DB (Contact Form).png',
            '/projects/Personal Portfolio - 2/Notion DB (SignIn Form).png',
        ],
    },
];

function LightboxModal({ project, initialIndex, onClose }) {
    const [current, setCurrent] = useState(initialIndex);
    const images = project.images;
    const total = images.length;

    const prev = () => setCurrent((i) => (i - 1 + total) % total);
    const next = () => setCurrent((i) => (i + 1) % total);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
                aria-label="إغلاق"
            >
                <X className="w-6 h-6" />
            </button>

            <div
                className="relative max-w-5xl w-full mx-4 flex items-center gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {total > 1 && (
                    <button
                        onClick={prev}
                        className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        aria-label="صورة سابقة"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                <div className="flex-1 relative">
                    <Image
                        src={images[current]}
                        alt={`${project.name} — صورة ${current + 1}`}
                        width={1200}
                        height={750}
                        className="w-full h-auto rounded-2xl object-contain max-h-[80vh]"
                        quality={90}
                        unoptimized
                    />
                    {total > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white scale-125' : 'bg-white/40'}`}
                                    aria-label={`الانتقال إلى الصورة ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {total > 1 && (
                    <button
                        onClick={next}
                        className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        aria-label="صورة تالية"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}

function ProjectCard({ project }) {
    const [lightbox, setLightbox] = useState(null); // index or null
    const router = useRouter();

    return (
        <>
            {lightbox !== null && (
                <LightboxModal
                    project={project}
                    initialIndex={lightbox}
                    onClose={() => setLightbox(null)}
                />
            )}

            <article
                onClick={() => router.push(`/projects/${project.slug}`)}
                className={`group h-full flex flex-col rounded-3xl border border-gray-200 dark:border-dark-card-border bg-gradient-to-br ${project.color} bg-white/60 dark:bg-dark-secondary/60 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-xl dark:shadow-dark-medium transition-all duration-500 cursor-pointer`}>

                {/* Cover Image */}
                <div
                    className="relative flex-shrink-0 w-full aspect-video overflow-hidden cursor-zoom-in"
                    onClick={(e) => { e.stopPropagation(); setLightbox(0); }}
                >
                    <Image
                        src={project.cover}
                        alt={`لوحة تحكم ${project.name}`}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        quality={85}
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Image count badge */}
                    {project.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {project.images.length} صور
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow">
                    {/* Logo + Name */}
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-dark-tertiary shadow-sm border border-gray-100 dark:border-dark-card-border flex-shrink-0">
                            <Image
                                src={project.logo}
                                alt={`شعار ${project.name}`}
                                fill
                                className={`object-contain p-1.5 transition-all duration-300 ${project.invertLogoInLight ? 'dark:invert-0 invert filter' : ''}`}
                                unoptimized
                            />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-accent-900 dark:text-dark-text-primary leading-tight">
                                {project.name}
                            </h2>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/70 dark:bg-dark-tertiary/70 text-accent-600 dark:text-dark-text-secondary border border-gray-200/60 dark:border-dark-card-border/60"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6 flex-grow">
                        {project.description}
                    </p>

                    <div className="mt-auto flex flex-col flex-shrink-0">
                        {/* Thumbnails row */}
                        {project.images.length > 1 ? (
                            <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scroll-smooth">
                                {project.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setLightbox(idx); }}
                                        className="relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 dark:hover:border-orange-400 transition-all focus:outline-none focus:border-primary-400"
                                        aria-label={`عرض الصورة ${idx + 1}`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${project.name} صورة ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="h-12 sm:h-14 mb-5 hidden sm:block invisible" aria-hidden="true"></div>
                        )}

                        {/* CTA */}
                        <div className="flex gap-2">
                            <Link
                                href={`/projects/${project.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500/10 dark:bg-orange-500/10 hover:bg-primary-500/20 dark:hover:bg-orange-500/20 border border-transparent text-sm font-semibold text-primary-600 dark:text-orange-400 transition-all group/btn"
                                aria-label={`تفاصيل ${project.name}`}
                            >
                                التفاصيل الكاملة
                                <ExternalLink className="w-4 h-4 rtl:rotate-180 group-hover/btn:scale-110 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}

export default function ProjectsClient() {
    return (
        <main
            className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300"
            dir="rtl"
        >
            {/* Hero */}
            <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 to-white dark:from-dark-primary dark:to-dark-secondary transition-colors duration-300">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                    <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-primary-100/30 to-transparent dark:from-orange-500/10 rounded-full blur-3xl" />
                    <div className="hidden sm:block absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-100/20 to-transparent dark:from-purple-500/5 rounded-full blur-3xl" />
                    <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04]" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.4) 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                </div>

                <div className="container-custom relative z-10 text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 text-accent-900 dark:text-dark-text-primary">
                        مشاريعنا
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-accent-600 dark:text-dark-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
                        أنظمة نوشن احترافية بنيناها لعملائنا — من لوحات التحكم الذكية إلى إدارة الفرق والمالية.
                    </p>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-accent-500 dark:from-orange-600 dark:to-orange-700 transition-colors duration-300">
                <div className="container-custom text-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                        هل تريد نظاماً مثل هذا؟
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                        نبني لك نظام نوشن مخصص يناسب طبيعة عملك — احجز استشارتك الأولى الآن.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                        <Link
                            href="/consultation"
                            className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center text-base sm:text-lg"
                        >
                            احجز استشارة مجانية
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 sm:px-10 py-3 sm:py-4 bg-white/10 text-white hover:bg-white/20 font-semibold rounded-xl border-2 border-white/30 transition-all duration-300 w-full sm:w-auto text-center text-base sm:text-lg"
                        >
                            تواصل معنا
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
