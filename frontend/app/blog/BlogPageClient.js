'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '../../lib/dateUtils';
import api from '../../lib/api';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useToast } from '../../contexts/ToastContext';
import Footer from '../../components/Footer';
import { BreadcrumbWrapper } from '../../components/Breadcrumb';
import { Search, XCircle, Newspaper } from 'lucide-react';
import { blogCategories as categories } from '../../lib/blogCategories';

const sortOptions = [
  { name: "الأحدث", value: "newest" },
  { name: "الأقدم", value: "oldest" },
  { name: "الأكثر مشاهدة", value: "views" }
];

export default function BlogPageClient({ initialBlogs, initialPagination }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [allBlogPosts, setAllBlogPosts] = useState(initialBlogs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(initialPagination || {
    current: 1,
    pages: 1,
    total: 0,
    limit: 9
  });
  const { showError } = useToast();
  const sortButtonRef = useRef(null);
  const sortMenuRef = useRef(null);

  const blogPosts = allBlogPosts;

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let backendSortBy = 'publishedAt';
      let backendSortOrder = 'desc';

      if (sortBy === 'oldest') {
        backendSortBy = 'publishedAt';
        backendSortOrder = 'asc';
      } else if (sortBy === 'views') {
        backendSortBy = 'views';
        backendSortOrder = 'desc';
      }

      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        sortBy: backendSortBy,
        sortOrder: backendSortOrder
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await api.get(`/blogs?${params.toString()}`);

      if (response.data.success) {
        setAllBlogPosts(response.data.blogs || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            current: response.data.pagination.current,
            pages: response.data.pagination.pages,
            total: response.data.pagination.total
          }));
        }
      } else {
        setError('فشل في تحميل المقالات');
        showError('فشل في تحميل المقالات');
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('فشل في تحميل المقالات');
      showError('فشل في تحميل المقالات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip first load if we have initial data
    if (initialBlogs && pagination.current === initialPagination.current && !searchTerm && selectedCategory === 'all' && sortBy === 'newest') {
      return;
    }
    fetchBlogPosts();
  }, [searchTerm, selectedCategory, sortBy, pagination.current]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!isSortOpen) return;
      if (sortButtonRef.current?.contains(event.target) || sortMenuRef.current?.contains(event.target)) return;
      setIsSortOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSortOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen bg-secondary-50 dark:bg-[#0a0a0a] text-foreground dark:text-white transition-colors duration-300" dir="rtl">
      <BreadcrumbWrapper items={[{ name: 'المدونة', url: '/blog' }]} />
      
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-black text-foreground dark:text-white mb-6 tracking-tight">
              مدونة <span className="text-primary drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]">عرب نوشن</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/60 dark:text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              مكانك الأول لتعلم أسرار الإنتاجية، احتراف نظم نوشن، ومتابعة أحدث الابتكارات التقنية بأيادٍ عربية.
            </p>

             <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group p-1 rounded-[2rem] bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-card-border shadow-2xl transition-all hover:border-primary/50 focus-within:border-primary">
                <input
                  type="text"
                  placeholder="عن ماذا تريد أن تقرأ اليوم؟ (مثال: تنظيم الوقت، برمجة، إدارة فريق)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchBlogPosts()}
                  className="w-full bg-transparent border-none focus:ring-0 px-8 py-5 text-lg text-foreground dark:text-white placeholder:text-foreground/40 dark:placeholder:text-white/30"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchTerm && (
                    <button 
                      type="button"
                      onClick={() => { setSearchTerm(''); fetchBlogPosts(); }}
                      className="p-2 text-foreground/40 hover:text-primary transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => fetchBlogPosts()}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {blogPosts.some(post => post.featured) && (
        <section className="py-20">
          <div className="container-custom px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-px bg-primary/30" />
              <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-widest">المقال المميز</h2>
            </div>

            {(() => {
              const post = blogPosts.find(p => p.featured);
              return (
                <Link href={`/blog/${post.slug}`} className="group block relative overflow-hidden rounded-[3rem] bg-card border border-card-border hover:border-primary/40 transition-all duration-700 shadow-2xl shadow-primary/5">
                  <div className="flex flex-col lg:flex-row min-h-[500px]">
                    <div className="w-full lg:w-1/2 relative overflow-hidden h-64 lg:h-auto">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-blue-600 opacity-90 group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 flex items-center justify-center text-white/10">
                          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                          </svg>
                       </div>
                       <div className="absolute top-8 right-8 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/5 text-white font-black text-xs uppercase tracking-widest">
                        نظام مختار
                       </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                      <div className="flex flex-wrap gap-3 mb-8">
                        {(post.categories || [post.category]).slice(0, 3).map((cat, i) => (
                          <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-3xl lg:text-5xl font-black text-foreground dark:text-white mb-6 leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-lg text-foreground/60 dark:text-white/40 mb-10 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-6 pb-10 border-b border-card-border mb-10">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-primary/10 border border-card-border overflow-hidden p-0.5">
                              {post.author?.profilePicture ? (
                                <img src={post.author.profilePicture} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-black">{post.author?.name?.charAt(0)}</div>
                              )}
                           </div>
                           <div>
                              <p className="text-xs text-foreground/40 dark:text-white/30 font-bold uppercase tracking-widest">المؤلف</p>
                              <p className="text-sm font-black text-foreground dark:text-white">{post.author?.name || "كاتب عرب نوشن"}</p>
                           </div>
                         </div>
                         <div className="h-8 w-px bg-card-border" />
                         <div>
                            <p className="text-xs text-foreground/40 dark:text-white/30 font-bold uppercase tracking-widest">وقت القراءة</p>
                            <p className="text-sm font-black text-foreground dark:text-white">{post.readTime || "5 دقائق"}</p>
                         </div>
                      </div>

                      <div className="btn-primary inline-flex self-start px-8 py-4 rounded-2xl">
                        اقرأ المقال الكامل
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="py-20">
        <div className="container-custom px-4 sm:px-6">
           <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-primary/30" />
                <h2 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-widest">أحدث المقالات</h2>
              </div>

               <div className="flex items-center gap-6">
                  {loading ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-foreground/40 dark:text-white/30 hidden sm:block">
                      تم العثور على <span className="text-foreground dark:text-white">{pagination.total}</span> مقال متاح
                    </p>
                  )}

                  <div className="relative">
                    <button
                      ref={sortButtonRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSortOpen(!isSortOpen);
                      }}
                      className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold hover:border-primary/40 transition-all focus:outline-none"
                    >
                      <span className="text-foreground/40 dark:text-white/30 tracking-widest">الترتيب:</span>
                      <span className="text-foreground dark:text-white">{sortOptions.find(o => o.value === sortBy)?.name}</span>
                    </button>
                    {isSortOpen && (
                      <div ref={sortMenuRef} className="absolute z-50 mt-3 w-48 left-0 rounded-2xl bg-white dark:bg-dark-secondary border border-card-border shadow-2xl overflow-hidden">
                        {sortOptions.map((opt) => (
                          <button key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortOpen(false); }} className={`w-full text-right px-6 py-4 text-sm font-bold transition-all ${sortBy === opt.value ? 'bg-primary/10 text-primary' : 'text-foreground/60 dark:text-white/50 hover:bg-white/5 hover:text-primary'}`}>
                            {opt.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
               </div>
           </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[500px] rounded-[2.5rem] bg-card border-none animate-pulse" />
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 opacity-0 animate-[fadeIn_0.6s_ease-in-out_forwards]">
              {blogPosts.map((post, index) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group h-full">
                  <div
                    className="relative overflow-hidden rounded-[2.5rem] bg-card border border-card-border hover:border-primary/40 transition-all duration-500 shadow-2xl shadow-primary/5 h-full flex flex-col"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-56 overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600 opacity-90 transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 flex items-center justify-center text-white/10 group-hover:rotate-12 transition-transform duration-700">
                          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5h-2.5" />
                          </svg>
                          <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {post.category || post.categories?.[0] || "مقال"}
                          </div>
                       </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-foreground dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-foreground/60 dark:text-white/40 mb-8 line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-6 border-t border-card-border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-card-border p-0.5">
                            {post.author?.profilePicture ? (
                              <img src={post.author.profilePicture} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary">{post.author?.name?.charAt(0)}</div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground/80 dark:text-white/70 truncate">{post.author?.name || "مبدع"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40 dark:text-white/30 uppercase tracking-widest">
                           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                           {post.readTime || "5د"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-48 bg-white/50 dark:bg-white/5 backdrop-blur-2xl rounded-[4rem] shadow-large border-none">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <Newspaper className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-4xl font-black text-accent-900 dark:text-white mb-6 tracking-tighter">لا توجد مقالات حالياً</h3>
              <p className="text-xl text-accent-700/40 dark:text-white/30 max-w-xl mx-auto mb-12 font-medium">نحن نعمل على كتابة محتوى جديد ومفيد. حاول تغيير كلمات البحث أو تصفح الأقسام الأخرى.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSortBy('newest'); }} 
                className="px-12 py-5 bg-primary text-white font-black rounded-2xl shadow-glow uppercase tracking-widest text-xs"
              >
                عرض كل المقالات
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && !loading && (
            <div className="flex justify-center mt-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setPagination(p => ({...p, current: Math.max(1, p.current - 1)})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={pagination.current <= 1}
                  className="px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold text-foreground dark:text-white hover:border-primary/40 disabled:opacity-30 focus:outline-none"
                >
                  السابق
                </button>
                <div className="flex items-center gap-2">
                   {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPagination(p => ({...p, current: i + 1})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                      className={`w-12 h-12 rounded-xl border text-sm font-bold transition-all focus:outline-none ${pagination.current === i + 1 ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-white/5 dark:bg-white/5 border-card-border text-foreground/60 dark:text-white/40 hover:border-primary/40'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setPagination(p => ({...p, current: Math.min(pagination.pages, p.current + 1)})); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  disabled={pagination.current >= pagination.pages}
                  className="px-6 py-3 rounded-2xl bg-white/5 dark:bg-white/5 border border-card-border text-sm font-bold text-foreground dark:text-white hover:border-primary/40 disabled:opacity-30 focus:outline-none"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
