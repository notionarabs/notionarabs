'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, PlayCircle, Layers, MousePointerClick } from 'lucide-react';
import { projects } from '../../app/projects/projectsData';

export default function FeaturedProjects() {
    // Show only the first 3 projects
    const displayProjects = projects.slice(0, 3);

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            مشاريع نفذناها
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl">
                            أعمال وحلول متكاملة صممناها بعناية لتناسب احتياجات عملائنا وتسرع من نمو أعمالهم.
                        </p>
                    </div>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary-50 dark:bg-orange-900/20 text-primary-600 dark:text-orange-400 font-semibold rounded-xl hover:bg-primary-100 dark:hover:bg-orange-900/40 transition-colors"
                    >
                        تصفح كل المشاريع
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {displayProjects.map((project) => (
                        <div key={project.id} className="group flex flex-col h-full bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-card-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Project Cover Image */}
                            <div className="relative w-full overflow-hidden bg-gray-50 dark:bg-dark-secondary border-b border-gray-100 dark:border-dark-card-border">
                                <Link href={`/projects/${project.slug}`} className="block w-full h-full relative cursor-pointer" aria-label={`تفاصيل ${project.name}`}>
                                    <Image
                                        src={project.cover}
                                        alt={`صورة غلاف مشروع ${project.name}`}
                                        width={800}
                                        height={450}
                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        unoptimized
                                    />
                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                    {/* Overlay Icon - visible on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] pointer-events-none">
                                        <div className="bg-white/90 dark:bg-dark-secondary/90 text-primary-600 dark:text-orange-400 p-3 sm:p-4 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                            <MousePointerClick className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Badges */}
                                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex flex-col gap-1.5 sm:gap-2">
                                    <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold bg-white/90 dark:bg-dark-tertiary/90 text-accent-800 dark:text-dark-text-primary backdrop-blur-md shadow-sm border border-white/20 dark:border-dark-card-border/50 transition-colors">
                                        <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-500 dark:text-orange-400" />
                                        {project.tags[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 sm:p-7 flex flex-col flex-grow">
                                {/* Logo + Name */}
                                <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white dark:bg-dark-tertiary shadow-sm border border-gray-100 dark:border-dark-card-border flex-shrink-0">
                                        <Image
                                            src={project.logo}
                                            alt={`شعار ${project.name}`}
                                            fill
                                            className={`object-contain p-1.5 sm:p-2 transition-all duration-300 ${project.invertLogoInLight ? 'dark:invert-0 invert filter' : ''}`}
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-accent-900 dark:text-dark-text-primary leading-tight">
                                            {project.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-accent-600 dark:text-dark-text-secondary leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {project.description}
                                </p>

                                {/* CTA */}
                                <div className="mt-auto flex gap-2">
                                    <Link
                                        href={`/projects/${project.slug}`}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-tertiary hover:bg-primary-50 dark:hover:bg-orange-500/10 border border-gray-200 dark:border-dark-card-border hover:border-primary-200 dark:hover:border-orange-500/30 text-sm font-semibold text-accent-700 dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-orange-400 transition-all group/btn"
                                        aria-label={`تفاصيل ${project.name}`}
                                    >
                                        دراسة الحالة
                                        <ArrowLeft className="w-4 h-4 transform group-hover/btn:-translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
