'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import api from '../../lib/api';
import StarRating from '../StarRating';

export default function FeaturedTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                // First try to fetch pinned templates
                let fetchedTemplates = [];
                const pinnedResponse = await api.get('/templates?page=1&limit=3&isPinned=true&sortBy=pinnedAt&sortOrder=desc');

                if (pinnedResponse.data && pinnedResponse.data.success && pinnedResponse.data.templates) {
                    fetchedTemplates = pinnedResponse.data.templates;
                }

                // If we have less than 3 pinned templates, fill the rest with top rated
                if (fetchedTemplates.length < 3) {
                    const limitNeeded = 3 - fetchedTemplates.length;
                    const topRatedResponse = await api.get(`/templates?page=1&limit=${limitNeeded + 5}&sortBy=rating&sortOrder=desc`);

                    if (topRatedResponse.data && topRatedResponse.data.success && topRatedResponse.data.templates) {
                        const pinnedIds = fetchedTemplates.map(t => t._id);
                        const otherTemplates = topRatedResponse.data.templates
                            .filter(t => !pinnedIds.includes(t._id))
                            .slice(0, limitNeeded);

                        fetchedTemplates = [...fetchedTemplates, ...otherTemplates];
                    }
                }

                setTemplates(fetchedTemplates);
            } catch (error) {
                console.error('Error fetching featured templates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    if (loading) {
        return (
            <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
                <div className="container-custom">
                    <div className="flex justify-between items-end mb-8 sm:mb-12">
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                                قوالب مميزة
                            </h2>
                            <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">
                                أفضل القوالب المختارة لتسريع عملك
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="card-interactive overflow-hidden animate-pulse">
                                <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="p-4 sm:p-6">
                                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16"></div>
                                        <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 sm:w-20"></div>
                                    </div>
                                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!templates || templates.length === 0) {
        return null;
    }

    return (
        <section className="section-reveal py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300" data-reveal-section>
            <div className="container-custom">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12">
                    <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-500 dark:text-dark-text-primary mb-3 sm:mb-4">
                            قوالب نوشن مميزة
                        </h2>
                        <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary max-w-xl">
                            اكتشف أفضل القوالب الجاهزة التي تساعدك على تنظيم حياتك وعملك فوراً.
                        </p>
                    </div>
                    <Link
                        href="/templates"
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary-50 dark:bg-orange-900/20 text-primary-600 dark:text-orange-400 font-semibold rounded-xl hover:bg-primary-100 dark:hover:bg-orange-900/40 transition-colors"
                    >
                        عرض كل القوالب
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template, index) => (
                        <Link key={template._id} href={`/templates/${template.slug || template._id}`} className="block h-full">
                            <div
                                className="group card-interactive overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col border border-gray-200 dark:border-dark-card-border"
                            >
                                {/* Template Image */}
                                <div className="relative overflow-hidden rounded-lg h-48">
                                    {template.previewImage && typeof template.previewImage === 'string' && template.previewImage.trim() ? (
                                        template.previewImage.includes('res.cloudinary.com') ? (
                                            <img
                                                src={template.previewImage}
                                                alt={template.title}
                                                className="w-full h-full object-cover object-[50%_30%] group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    if (e.target) e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                src={template.previewImage}
                                                alt={template.title}
                                                width={400}
                                                height={300}
                                                className="w-full h-full object-cover object-[50%_30%] group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                                quality={75}
                                                placeholder="blur"
                                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                                onError={(e) => {
                                                    if (e.target) e.target.style.display = 'none';
                                                }}
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                                            <LayoutDashboard className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-600 dark:text-primary-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Template Info */}
                                <div className="p-4 sm:p-5 relative flex-1 flex flex-col bg-white dark:bg-dark-secondary">
                                    <h3 className="font-semibold text-base sm:text-lg text-accent-900 dark:text-dark-text-primary mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                                        {template.title}
                                    </h3>

                                    {/* Short Description */}
                                    <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-3 line-clamp-2 min-h-[2.5rem]">
                                        {template.description || 'وصف مختصر للقالب غير متوفر حالياً.'}
                                    </p>

                                    {/* Rating */}
                                    <div className="mb-4">
                                        <StarRating rating={template.rating || 0} size="small" showNumber={true} />
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            {template.creator?.profilePicture ? (
                                                <Image
                                                    src={template.creator.profilePicture}
                                                    alt={template.creator?.name || 'مبدع'}
                                                    width={24}
                                                    height={24}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                                                        {template.creator?.name?.charAt(0)?.toUpperCase() || 'م'}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs font-medium text-accent-600 dark:text-dark-text-tertiary">
                                                {template.creator?.name || 'مبدع غير معروف'}
                                            </span>
                                        </div>
                                        {template.isPaid ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-bold text-sm">
                                                {template.price} ج.م
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-sm">
                                                مجاني
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
