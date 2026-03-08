'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ExternalLink, Briefcase, Calendar, X, ChevronLeft } from 'lucide-react';
import Footer from '../../../components/Footer';
import ReactMarkdown from 'react-markdown';

function LightboxModal({ project, initialIndex, onClose }) {
    const [current, setCurrent] = useState(initialIndex);
    const images = project.images;
    const total = images.length;

    const prev = () => setCurrent((i) => (i - 1 + total) % total);
    const next = () => setCurrent((i) => (i + 1) % total);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
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
                className="relative max-w-6xl w-full mx-4 flex items-center justify-center gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {total > 1 && (
                    <button
                        onClick={prev}
                        className="flex-shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        aria-label="صورة سابقة"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}

                <div className="relative flex-1 flex flex-col items-center">
                    <Image
                        src={images[current]}
                        alt={`${project.name} — صورة ${current + 1}`}
                        width={1200}
                        height={800}
                        className="w-full h-auto rounded-xl object-contain max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                        quality={90}
                        unoptimized
                    />
                    {total > 1 && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                                    aria-label={`الانتقال إلى الصورة ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {total > 1 && (
                    <button
                        onClick={next}
                        className="flex-shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                        aria-label="صورة تالية"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
}

function ProjectImageSlider({ images, projectName, onImageClick }) {
    const [current, setCurrent] = useState(0);
    const total = images.length;

    const prev = (e) => {
        e.stopPropagation();
        setCurrent((i) => (i - 1 + total) % total);
    };
    const next = (e) => {
        e.stopPropagation();
        setCurrent((i) => (i + 1) % total);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-gray-200 dark:border-dark-card-border shadow-lg group">
            {/* Main Image */}
            <div
                className="relative w-full h-full cursor-zoom-in"
                onClick={() => onImageClick(current)}
            >
                <Image
                    src={images[current]}
                    alt={`${projectName} - slide ${current + 1}`}
                    fill
                    className="object-cover transition-all duration-500"
                    unoptimized
                />
            </div>

            {/* Navigation Arrows */}
            {total > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center transform hover:scale-110 active:scale-95"
                        aria-label="Previous Slide"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all opacity-0 group-hover:opacity-100 z-10 flex items-center justify-center transform hover:scale-110 active:scale-95"
                        aria-label="Next Slide"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                </>
            )}

            {/* Slide Indicators */}
            {total > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === current ? 'bg-white scale-125 shadow-sm' : 'bg-white/40 hover:bg-white/60'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Zoom Badge */}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/90 text-xs font-medium py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                تكبير
            </div>

            {/* Slide Count */}
            {total > 1 && (
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white/90 text-xs font-medium py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {current + 1} / {total}
                </div>
            )}
        </div>
    );
}

export default function ProjectDetailClient({ project }) {
    const [lightbox, setLightbox] = useState(null);

    // Filter images to remove duplicates if cover is already in images array
    const allImages = project.images || [];

    // Custom renderers for React Markdown
    const markdownRenderers = {
        h1: ({ children }) => <h1 className="text-2xl sm:text-3xl font-bold text-accent-900 dark:text-white mt-12 mb-6 border-b border-gray-200 dark:border-dark-card-border pb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl sm:text-2xl font-bold text-accent-800 dark:text-gray-100 mt-10 mb-5 flex items-center gap-2"><div className={`w-1.5 h-5 rounded-full ${project.accent}`}></div>{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg sm:text-xl font-semibold text-accent-800 dark:text-gray-200 mt-8 mb-4">{children}</h3>,
        p: ({ children }) => <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-5">{children}</p>,
        ul: ({ children }) => <ul className="space-y-2 mb-6 list-none pl-0 pr-4">{children}</ul>,
        li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary leading-relaxed">
                <span className={`w-2 h-2 mt-2.5 rounded-full flex-shrink-0 ${project.accent}`}></span>
                <span>{children}</span>
            </li>
        ),
        strong: ({ children }) => <strong className="font-bold text-accent-900 dark:text-white bg-primary-50/50 dark:bg-orange-500/10 px-1 rounded">{children}</strong>,
        hr: () => <hr className="my-10 border-gray-200 dark:border-dark-card-border border-dashed" />,
    };

    return (
        <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
            {lightbox !== null && (
                <LightboxModal project={project} initialIndex={lightbox} onClose={() => setLightbox(null)} />
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-dark-card-border">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-secondary-50/50 dark:from-dark-secondary dark:via-dark-secondary dark:to-dark-primary" />
                <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${project.color} opacity-50 dark:opacity-20`} />

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm font-medium mb-8">
                            <Link href="/projects" className="text-accent-500 dark:text-dark-text-tertiary hover:text-primary-500 dark:hover:text-orange-400 transition-colors">
                                مشاريعنا
                            </Link>
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                            <span className={`${project.accentText}`}>{project.name}</span>
                        </div>

                        {/* Title & Logo */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-8">
                            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-dark-tertiary shadow-sm border border-gray-100 dark:border-dark-card-border p-2 sm:p-3 flex-shrink-0`}>
                                <div className="relative w-full h-full">
                                    <Image
                                        src={project.logo}
                                        alt={project.name}
                                        fill
                                        className={`object-contain transition-all duration-300 ${project.invertLogoInLight ? 'dark:invert-0 invert filter' : ''}`}
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent-900 dark:text-white leading-[1.3] lg:leading-[1.4] mb-4">
                                    {project.title}
                                </h1>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-white/80 dark:bg-dark-tertiary border border-gray-200 dark:border-dark-card-border text-accent-600 dark:text-dark-text-secondary">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p className="text-lg sm:text-xl text-accent-700 dark:text-dark-text-secondary leading-relaxed max-w-3xl font-medium">
                            {project.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="container-custom grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

                    {/* Left Column: Markdown Content & Images */}
                    <div className="order-2 lg:order-1 space-y-12">

                        {/* Image Slider Case */}
                        <ProjectImageSlider
                            images={allImages}
                            projectName={project.name}
                            onImageClick={(idx) => setLightbox(idx)}
                        />

                        {/* Video Showcase */}
                        {project.videoUrl && (
                            <div className="pt-4 pb-8 mb-4 border-b border-gray-200 dark:border-dark-card-border">
                                <h3 className="text-xl sm:text-2xl font-bold text-accent-900 dark:text-white mb-6">فيديو استعراض المشروع</h3>
                                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-dark-card-border">
                                    <iframe
                                        src={project.videoUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Markdown Body */}
                        <article className="prose-custom max-w-none">
                            <ReactMarkdown components={markdownRenderers}>
                                {project.content}
                            </ReactMarkdown>
                        </article>
                    </div>

                    {/* Right Column: Sidebar Meta Info */}
                    <aside className="order-1 lg:order-2 lg:sticky lg:top-28 space-y-6">
                        <div className="bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border p-6 sm:p-8 rounded-3xl shadow-sm">
                            <h3 className="text-lg font-bold text-accent-900 dark:text-white mb-6 pb-4 border-b border-gray-100 dark:border-dark-card-border">
                                معلومات المشروع
                            </h3>

                            <div className="space-y-5">
                                {project.meta.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-accent-500 dark:text-dark-text-tertiary">
                                            {item.label}
                                        </span>
                                        <span className="text-base font-semibold text-accent-900 dark:text-dark-text-primary">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar CTA */}
                        <div className={`bg-gradient-to-br ${project.color} border ${project.accentBorder} p-6 sm:p-8 rounded-3xl shadow-sm text-center bg-white/60 dark:bg-dark-secondary/60 backdrop-blur-sm`}>
                            <div className={`w-12 h-12 rounded-2xl ${project.accent} flex items-center justify-center mx-auto mb-4 text-white shadow-md`}>
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-accent-900 dark:text-white mb-3">
                                هل تحتاج إلى نظام مشابه؟
                            </h3>
                            <p className="text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6">
                                نستطيع تصميم مساحة عمل مخصصة بالكامل تناسب احتياجات فريقك كأنها بنيت خصيصاً لك.
                            </p>
                            <Link
                                href="/consultation"
                                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl ${project.accent} text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                            >
                                احجز استشارة مجانية
                            </Link>
                        </div>
                    </aside>

                </div>
            </section>

            <Footer />
        </main>
    );
}
