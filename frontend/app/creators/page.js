'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FollowButton from '../../components/FollowButton';
import { Search, Star, User, Youtube, Facebook, Send, X, Users } from 'lucide-react';


const specialties = [
  { name: "الكل", value: "all" },
  { name: "الإنتاجية", value: "الإنتاجية" },
  { name: "الدراسة", value: "الدراسة" },
  { name: "الأعمال", value: "الأعمال" },
  { name: "الحياة الشخصية", value: "الحياة الشخصية" },
  { name: "الإبداع", value: "الإبداع" },
  { name: "التقنية", value: "التقنية" }
];

const sortOptions = [
  { name: "الأكثر شعبية", value: "popular" },
  { name: "الأحدث", value: "newest" },
  { name: "الأعلى تقييماً", value: "rating" },
  { name: "الأكثر قوالب", value: "templates" }
];

export default function CreatorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [creatorsData, setCreatorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { user, isAuthenticated } = useAuth();

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
        <span className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
      </div>
    );
  };

  // Fetch creators from API
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: '1',
          limit: '50',
          sortBy: sortBy
        });

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        if (selectedSpecialty !== 'all') {
          params.append('specialty', selectedSpecialty);
        }

        const response = await api.get(`/creators?${params.toString()}`);

        if (response.data.success) {
          setCreatorsData(response.data.creators);
          setPagination(response.data.pagination);
        } else {
          setError('فشل في تحميل المبدعين');
        }
      } catch (err) {
        setError('حدث خطأ في تحميل المبدعين');
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [searchTerm, selectedSpecialty, sortBy]);




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
            {/* Search Bar */}
            <div className="relative mb-6 sm:mb-8">
              <input
                type="text"
                placeholder="ابحث عن المبدعين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pr-12 pl-4 py-3 sm:py-4 text-base sm:text-lg"
                dir="rtl"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Specialty Filter */}
              <div className="flex-1 relative">
                <label htmlFor="specialty-filter" className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                  التخصص
                </label>
                <select
                  id="specialty-filter"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-ms-expand]:opacity-0 [&::-webkit-calendar-picker-indicator]:text-accent-400 [&::-ms-expand]:text-accent-400 dark:[&::-webkit-calendar-picker-indicator]:text-dark-text-tertiary dark:[&::-ms-expand]:text-dark-text-tertiary"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {specialties.map((specialty) => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex-1 relative">
                <label htmlFor="sort-filter" className="block text-xs sm:text-sm font-medium text-accent-700 dark:text-dark-text-primary mb-2">
                  الترتيب
                </label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-ms-expand]:opacity-0 [&::-webkit-calendar-picker-indicator]:text-accent-400 [&::-ms-expand]:text-accent-400 dark:[&::-webkit-calendar-picker-indicator]:text-dark-text-tertiary dark:[&::-ms-expand]:text-dark-text-tertiary"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              {loading ? (
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
              ) : error ? (
                <p className="text-sm sm:text-base text-red-500">{error}</p>
              ) : (
                <p className="text-sm sm:text-base text-accent-600 dark:text-dark-text-secondary">
                  عرض {creatorsData.length} من {pagination?.total || creatorsData.length} مبدع
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
            <div className="text-center py-12 sm:py-16">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-base sm:text-lg text-accent-600 dark:text-dark-text-secondary">جاري تحميل المبدعين...</p>
            </div>
          ) : creatorsData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-stretch">
              {creatorsData.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.username || creator.email?.split('@')[0] || creator.displayName || creator.name || creator.id}`}
                  className="group card-interactive p-4 sm:p-6 md:p-8 h-full flex flex-col max-h-[600px]"
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      {creator.profilePicture ? (
                        <Image
                          src={creator.profilePicture}
                          alt={creator.name}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-md"
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
                      <h3 className="font-bold text-base sm:text-lg md:text-xl text-accent-500 dark:text-dark-text-primary group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors mb-1">
                        {creator.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <StarRating rating={creator.rating} />
                        <span className="text-xs sm:text-sm text-accent-600 dark:text-dark-text-secondary">({creator.followers || 0} متابع)</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content - Flexible */}
                  <div className="flex-1 flex flex-col">
                    {(creator.bio || creator.experience) && (
                      <p className="text-accent-600 dark:text-dark-text-secondary mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
                        {creator.bio || creator.experience}
                      </p>
                    )}

                    {/* Specialties */}
                    {creator.specialties && creator.specialties.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-2 sm:mb-3">التخصصات</h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2 max-h-20 overflow-hidden">
                          {creator.specialties.slice(0, 6).map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 sm:px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                          {creator.specialties.length > 6 && (
                            <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{creator.specialties.length - 6}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
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

                  {/* Card Footer - Always at bottom */}
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
                        // Update followers count
                        setCreatorsData(prev => prev.map(c => {
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
                  setSelectedSpecialty('all');
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
              انضم ك مبدع
            </Link>
            <Link href="/templates" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30 w-full sm:w-auto text-center">
              تصفح القوالب
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-10 md:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 sm:h-12 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary mb-6 sm:mb-8 leading-relaxed">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Link href="https://youtube.com/@notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://facebook.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://www.facebook.com/groups/notionarabs/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft" title="مجموعة فيسبوك">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://t.me/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link href="https://twitter.com/notionarabs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 dark:bg-dark-tertiary rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-primary-500 dark:hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-soft dark:shadow-dark-soft">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Company Section */}
            <div className="md:col-span-1">
              <div className="mb-6 sm:mb-8">
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">المنتج</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/templates" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                  <li><Link href="/creators" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الشركة</h4>
                <ul className="space-y-2 sm:space-y-3">
                  <li><Link href="/about" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                  <li><Link href="/blog" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                </ul>
              </div>
            </div>

            {/* Support Section */}
            <div className="md:col-span-1">
              <h4 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
                <li><Link href="/cookies" className="text-sm sm:text-base text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">ملفات تعريف الارتباط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-xs sm:text-sm text-center sm:text-right">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-6 justify-center sm:justify-end">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-xs sm:text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
