'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FollowButton from '../../components/FollowButton';
import { Search, Star, User, CheckCircle, Heart, Crown, Award, Zap } from 'lucide-react';
import Footer from '../../components/Footer';

// Map badge types to Lucide icons
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

const sortOptions = [
  { name: "الأكثر شعبية", value: "popular" },
  { name: "الأحدث", value: "newest" },
  { name: "الأعلى تقييماً", value: "rating" },
  { name: "الأكثر قوالب", value: "templates" }
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating.toFixed(1)}</span>
    </div>
  );
};

export default function CreatorsClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allCreators, setAllCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 50
  });
  const { user, isAuthenticated } = useAuth();
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const creatorsData = allCreators;

  // Fetch creators from API with server-side search and pagination
  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder: 'desc'
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (selectedSpecialty && selectedSpecialty !== 'all') {
        params.append('specialty', selectedSpecialty);
      }

      const response = await api.get(`/creators?${params.toString()}`);

      if (response.data.success) {
        setAllCreators(response.data.creators);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: response.data.pagination.current,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
        }
      } else {
        setError('فشل في تحميل المبدعين');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل المبدعين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [searchTerm, sortBy, selectedSpecialty, pagination.current]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSortOpen) {
        return;
      }
      if (
        sortButtonRef.current?.contains(event.target) ||
        sortMenuRef.current?.contains(event.target)
      ) {
        return;
      }
      setIsSortOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSortOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300" dir="rtl">
      {/* Page Header */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-accent-500 dark:text-dark-text-primary mb-4 sm:mb-6">المبدعين المميزين</h1>
            <p className="text-base sm:text-lg md:text-xl text-accent-700 dark:text-dark-text-secondary max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-0">
              تعرف على أفضل المبدعين في مجتمعنا واكتشف قوالبهم المبتكرة
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ابحث عن المبدعين... (مثال: أحمد محمد، تصميم، إنتاجية)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pr-12 text-sm sm:text-base"
                  dir="rtl"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Sort Filter */}
              <div className="w-full sm:w-56 md:w-64">
                <label className="sr-only">الترتيب</label>
                <div className="relative">
                  <button
                    ref={sortButtonRef}
                    type="button"
                    onClick={() => setIsSortOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isSortOpen}
                    className="form-input flex items-center justify-between text-sm sm:text-base text-accent-900 dark:text-dark-text-primary shadow-sm hover:border-primary-300 dark:hover:border-primary-500/60"
                  >
                    <span>
                      {sortOptions.find((option) => option.value === sortBy)?.name || sortOptions[0].name}
                    </span>
                    <span className={`text-accent-400 dark:text-dark-text-tertiary transition-transform ${isSortOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isSortOpen && (
                    <div
                      ref={sortMenuRef}
                      role="listbox"
                      className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 dark:border-dark-card-border bg-white dark:bg-dark-secondary shadow-lg overflow-hidden"
                    >
                      {sortOptions.map((option) => {
                        const isActive = option.value === sortBy;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setSortBy(option.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-right px-4 py-2.5 text-sm sm:text-base transition-colors flex items-center justify-between ${isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'text-accent-700 dark:text-dark-text-secondary hover:bg-accent-50 dark:hover:bg-dark-tertiary'
                              }`}
                          >
                            <span>{option.name}</span>
                            {isActive && (
                              <span className="text-primary-600 dark:text-primary-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              {loading ? (
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : error ? (
                <p className="text-sm sm:text-base text-red-500">{error}</p>
              ) : (
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  عرض {creatorsData.length} من {pagination.total} مبدع
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom pr-2 sm:pr-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="group card-interactive p-4 sm:p-6 md:p-8 h-full flex flex-col max-h-[600px] animate-pulse">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-4/5"></div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center">
                        <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                      </div>
                      <div className="text-center">
                        <div className="h-4 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 mt-auto">
                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : creatorsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
              {creatorsData.map((creator, index) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.username || creator.email?.split('@')[0] || creator.displayName || creator.name || creator.id}`}
                  className="group card-interactive p-4 sm:p-6 md:p-8 h-full flex flex-col max-h-[600px] opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      {creator.profilePicture ? (
                        <Image
                          src={creator.profilePicture}
                          alt={creator.name}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-md"
                          loading="lazy"
                          quality={80}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border-2 border-white shadow-md">
                          <span className="text-2xl sm:text-3xl font-bold text-primary-500 dark:text-orange-400">
                            {creator.name?.charAt(0)?.toUpperCase() || 'م'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-accent-500 dark:text-dark-text-primary group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors">
                          {creator.name}
                        </h3>
                        {creator.badges && creator.badges.length > 0 && (
                          <div className="flex items-center gap-1">
                            {creator.badges.slice(0, 2).map((badge) => {
                              const BadgeIcon = getBadgeIcon(badge.type);
                              return (
                                <div
                                  key={badge._id}
                                  className="group/badge relative"
                                >
                                  <div className="flex items-center gap-1 p-1 bg-primary-50 dark:bg-orange-500/10 border border-primary-200 dark:border-orange-500/20 rounded transition-all duration-200 hover:shadow-md">
                                    <BadgeIcon
                                      className="w-3 h-3 text-primary-600 dark:text-orange-400"
                                      strokeWidth={2}
                                    />
                                  </div>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none z-10">
                                    {badge.label}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {creator.specialties && creator.specialties.length > 0 && (
                        <p className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mb-2">
                          {creator.specialties[0]}
                        </p>
                      )}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <StarRating rating={creator.rating} />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {(creator.bio || creator.experience || creator.motivation) && (
                      <p className="text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                        {creator.bio || creator.experience || creator.motivation}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-accent-500 dark:text-dark-text-primary">{creator.templates || 0}</div>
                        <div className="text-xs text-accent-600 dark:text-dark-text-secondary">قوالب</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-accent-500 dark:text-dark-text-primary">{creator.followers || 0}</div>
                        <div className="text-xs text-accent-600 dark:text-dark-text-secondary">متابع</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/creators/${creator.username || creator.email?.split('@')[0] || creator.displayName || creator.name || creator.id}`);
                      }}
                      className="w-full btn-primary block text-center text-sm sm:text-base py-2 sm:py-3"
                    >
                      عرض الملف الشخصي
                    </button>
                    <FollowButton
                      creatorId={creator.id}
                      creatorName={creator.name}
                      onFollowChange={(isFollowing) => {
                        setAllCreators(prev => prev.map(c => {
                          if (c.id === creator.id) {
                            return {
                              ...c,
                              followers: isFollowing ? c.followers + 1 : c.followers - 1
                            };
                          }
                          return c;
                        }));
                      }}
                      className="w-full"
                      showText={true}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">لم نجد مبدعين مطابقين</h3>
              <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('popular');
                }}
                className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white dark:text-dark-text-primary mb-4">
            هل تريد أن تصبح مبدعاً؟
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 dark:text-dark-text-secondary mb-6 sm:mb-8 max-w-xs sm:max-w-2xl mx-auto px-4 sm:px-0">
            انضم إلى مجتمعنا من المبدعين وابدأ في إنشاء وبيع قوالبك الخاصة
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link href="/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-center">
              انضم كمبدع
            </Link>
            <Link href="/templates" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30 w-full sm:w-auto text-center">
              تصفح القوالب
            </Link>
          </div>
        </div>
      </section>

      <Footer />

    </main>
  );
}

