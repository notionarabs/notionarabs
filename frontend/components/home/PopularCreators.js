'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Star, Crown, Zap, Heart, Award } from 'lucide-react';
import api from '../../lib/api';

const getBadgeIcon = (badgeType) => {
  const iconMap = {
    'verified': CheckCircle,
    'top-creator': Star,
    'best-creator': Crown,
    'active': Zap,
    'community-favorite': Heart,
    'trusted': Award
  };
  return iconMap[badgeType] || Star;
};

export default function PopularCreators() {
  const [topCreators, setTopCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoadingCreators(true);
        const res = await api.get('/creators?limit=4');
        if (res.data.success) {
          setTopCreators(res.data.creators.map(cr => ({
            id: cr._id || cr.id,
            username: cr.username,
            name: cr.name,
            profilePicture: cr.profilePicture,
            specialty: (cr.specialties && cr.specialties.length > 0) ? cr.specialties[0] : 'صانع محتوى',
            bio: cr.bio,
            templatesCount: cr.templateCount || 0,
            followersCount: cr.followersCount || 0,
            averageRating: cr.averageRating || 0,
            badges: cr.badges || []
          })));
        }
      } catch (error) {
        console.error('Error fetching popular creators:', error);
      } finally {
        setLoadingCreators(false);
      }
    };

    fetchCreators();
  }, []);

  return (
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 relative z-10 transition-colors duration-300">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#132859] dark:text-white mb-2 sm:mb-4">المبدعون المميزون</h2>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">تعرّف على أبرز المبدعين في مجتمعنا</p>
            </div>
            <Link
              href="/creators"
              className="inline-flex items-center text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 text-accent-700 dark:text-dark-text-primary hover:text-[#f5631e] dark:hover:text-[#f5631e] transition-colors"
            >
              تصفح جميع المبدعين
              <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingCreators ? (
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border-none h-full flex flex-col overflow-hidden animate-pulse">
                  <div className="text-center mb-4 flex-shrink-0">
                    <div className="w-16 h-16 mx-auto rounded-full bg-black/5 dark:bg-white/5 mb-3" />
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-3/4 mx-auto" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-full" />
                      <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (topCreators && topCreators.length > 0) ? (
              topCreators.slice(0, 4).map((cr, idx) => (
                <Link key={cr.id || idx} href={`/creators/${cr.username || cr.email?.split('@')[0] || cr.displayName || cr.name || cr.id || cr._id || idx}`}>
                    <div className="group bg-white/80 dark:bg-dark-tertiary/80 backdrop-blur-2xl rounded-[2rem] p-6 shadow-soft hover:shadow-2xl border-none transition-all duration-300 h-full flex flex-col opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards] hover:-translate-y-2">
                    <div className="text-center mb-4 flex-shrink-0">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        {cr.profilePicture ? (
                          <div className="relative">
                            <Image
                              src={cr.profilePicture}
                              alt={cr.name || 'مبدع'}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-dark-card-border shadow-md relative z-10"
                              loading="lazy"
                              quality={80}
                              sizes="64px"
                            />
                            {/* Verified Badge on top of picture if present */}
                            {cr.badges?.some(b => b.type === 'verified') && (
                              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-secondary rounded-full p-0.5 shadow-sm z-20">
                                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#132859]/5 dark:bg-white/5 flex items-center justify-center border-2 border-white shadow-md relative z-10">
                            <span className="text-lg font-bold text-[#f5631e]">
                              {cr.name?.charAt(0)?.toUpperCase() || 'م'}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#f5631e]/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center">
                        <h3 className="font-bold text-[#132859] dark:text-white group-hover:text-[#f5631e] transition-colors relative z-10">
                          {cr.name}
                        </h3>
                        {/* Render other badges next to name */}
                        <div className="flex gap-0.5 relative z-10">
                          {cr.badges?.filter(b => b.type !== 'verified').slice(0, 2).map((badge, bIdx) => {
                            const BadgeIcon = getBadgeIcon(badge.type);
                            return (
                              <div key={bIdx} title={badge.label} className="cursor-help">
                                <BadgeIcon className="w-3.5 h-3.5 text-orange-500" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between relative z-10">
                      <p className="text-sm text-[#132859]/60 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed flex-1">
                        {cr.bio || cr.experience || cr.motivation || cr.description || 'صانع محتوى متميز'}
                      </p>

                      <div className="mt-auto flex items-center justify-between text-xs font-bold pt-4 border-t border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-1">
                          <span className="text-[#132859] dark:text-white">
                            {(cr.templatesCount || cr.templateCount || cr.totalTemplates || 0).toLocaleString()}
                          </span>
                          <span className="text-[#132859]/50 dark:text-gray-500">قالب</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#132859] dark:text-white">
                            {(cr.followersCount || cr.followers || cr.totalFollowers || 0).toLocaleString()}
                          </span>
                          <span className="text-[#132859]/50 dark:text-gray-500">متابع</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[#132859] dark:text-white">
                            {(cr.averageRating || cr.rating || cr.medianRating || 0).toFixed(1)}
                          </span>
                          <svg className="w-3 h-3 text-[#f5631e]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-accent-600 dark:text-dark-text-secondary">لا يوجد مبدعون لعرضهم حالياً.</div>
            )}
          </div>
        </div>
      </section>
  );
}
