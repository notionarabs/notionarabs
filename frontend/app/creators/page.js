'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FollowButton from '../../components/FollowButton';


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
  { name: "الأكثر قوالب", value: "templates" },
  { name: "الأعلى ربحاً", value: "earnings" }
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
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-black dark:text-orange-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-accent-600 dark:text-dark-text-secondary mr-1">{rating}</span>
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
        console.error('Error fetching creators:', err);
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
      <section className="section-padding bg-white dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-6">المبدعين المميزين</h1>
            <p className="body-large text-accent-700 dark:text-dark-text-secondary max-w-3xl mx-auto">
              تعرف على أفضل المبدعين في مجتمعنا واكتشف قوالبهم المبتكرة
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="ابحث عن المبدعين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full form-input pr-12 pl-4 py-4 text-lg"
                dir="rtl"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Specialty Filter */}
              <div className="flex-1 min-w-48 relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty.value} value={specialty.value}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown indicator */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="flex-1 min-w-48 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select cursor-pointer hover:border-primary-400 hover:shadow-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown indicator */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-accent-400 dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              {loading ? (
                <p className="text-accent-600 dark:text-dark-text-secondary">جاري التحميل...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <p className="text-accent-600 dark:text-dark-text-secondary">
                  عرض {creatorsData.length} من {pagination?.total || creatorsData.length} مبدع
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Creators Grid */}
      <section className="section-padding bg-secondary-50 dark:bg-dark-primary transition-colors duration-300">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="loading-text">جاري تحميل المبدعين...</p>
              </div>
            </div>
          ) : creatorsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {creatorsData.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.username || creator.email?.split('@')[0] || creator.displayName || creator.name || creator.id}`}
                  className="group card-interactive p-8 block"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <Image
                        src={creator.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                        alt={creator.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-accent-500 dark:text-dark-text-primary group-hover:text-accent-600 dark:group-hover:text-orange-400 transition-colors mb-1">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-accent-600 dark:text-dark-text-secondary mb-2">{creator.bio || 'مبدع محتوى'}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={creator.rating} />
                        <span className="text-sm text-accent-600 dark:text-dark-text-secondary">({creator.followers || 0} متابع)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-accent-600 dark:text-dark-text-secondary mb-6 text-sm leading-relaxed">
                    {creator.bio || 'مبدع محتوى متخصص في إنشاء قوالب مبتكرة'}
                  </p>

                  {/* Specialties */}
                  {creator.specialties && creator.specialties.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-accent-500 dark:text-dark-text-primary mb-3">التخصصات</h4>
                      <div className="flex flex-wrap gap-2">
                        {creator.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-100 dark:bg-orange-500/20 text-primary-800 dark:text-orange-300 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">{creator.templates || 0}</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">قوالب</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent-500 dark:text-dark-text-primary">{creator.followers || 0}</div>
                      <div className="text-xs text-accent-600 dark:text-dark-text-secondary">متابع</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/creators/${creator.username || creator.email?.split('@')[0] || creator.displayName || creator.name || creator.id}`);
                      }}
                      className="w-full btn-primary block text-center"
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
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 dark:text-dark-text-quaternary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xl font-semibold text-accent-500 dark:text-dark-text-primary mb-2">لم نجد مبدعين مطابقين</h3>
              <p className="text-accent-600 dark:text-dark-text-secondary mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('all');
                  setSortBy('popular');
                }}
                className="btn-primary"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-accent-500 dark:bg-dark-secondary transition-colors duration-300">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-white dark:text-dark-text-primary mb-4">
            هل تريد أن تصبح مبدعاً؟
          </h2>
          <p className="body-large text-gray-300 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            انضم إلى مجتمعنا من المبدعين وابدأ في إنشاء وبيع قوالبك الخاصة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              انضم ك مبدع
            </Link>
            <Link href="/templates" className="btn-secondary text-lg px-8 py-4 bg-white/90 dark:bg-dark-tertiary/90 backdrop-blur-sm border-primary-200 dark:border-orange-500/30">
              تصفح القوالب
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent-500 dark:bg-dark-secondary text-white dark:text-dark-text-primary transition-colors duration-300">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image
                  src="/NavLogoLight.svg"
                  alt="عرب نوشن"
                  width={60}
                  height={40}
                  className="h-10 w-auto"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
              <p className="body-medium text-gray-400 dark:text-dark-text-tertiary mb-6">
                منصتك العربية الأولى لبيع وشراء قوالب نوشن المبتكرة. انضم إلى مجتمع المبدعين العرب.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">المنتج</h4>
              <ul className="space-y-3">
                <li><Link href="/templates" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">القوالب</Link></li>
                <li><Link href="/creators" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المبدعين</Link></li>
                <li><Link href="/pricing" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الأسعار</Link></li>
                <li><Link href="/features" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المميزات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الشركة</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">من نحن</Link></li>
                <li><Link href="/blog" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">المدونة</Link></li>
                <li><Link href="/careers" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الوظائف</Link></li>
                <li><Link href="/press" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الصحافة</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-lg text-white dark:text-dark-text-primary">الدعم</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/contact" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">اتصل بنا</Link></li>
                <li><Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الخصوصية</Link></li>
                <li><Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary transition-colors">الشروط</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 dark:border-dark-card-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 dark:text-dark-text-tertiary text-sm">
                © {new Date().getFullYear()} عرب نوشن. جميع الحقوق محفوظة.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">سياسة الخصوصية</Link>
                <Link href="/terms" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">شروط الاستخدام</Link>
                <Link href="/cookies" className="text-gray-400 dark:text-dark-text-tertiary hover:text-white dark:hover:text-dark-text-primary text-sm transition-colors">ملفات تعريف الارتباط</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
