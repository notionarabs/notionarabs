'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Zap, Crown, Award, CheckCircle, Heart, Pin, PinOff,
  Layout, Clock, ThumbsUp, Trash2, AlertCircle, Eye, Download,
  ExternalLink, Calendar, Tag, CreditCard, ChevronLeft, Search,
  Filter, XCircle, User as UserIcon, Mail, Phone, Briefcase,
  GraduationCap, MessageSquare, Medal, PlusCircle, ArrowRight, ArrowLeft, TrendingUp, Activity
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';

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

export default function CreatorApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [badgePresets, setBadgePresets] = useState(null);
  const [selectedBadgeType, setSelectedBadgeType] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedApplications, setExpandedApplications] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [pinLoading, setPinLoading] = useState(null);
  const { user, isAuthenticated, loading: authLoading, refreshUserData, ensureTokenInHeaders } = useAuth();
  const router = useRouter();

  const handleImageError = (applicationId) => {
    setImageErrors(prev => ({ ...prev, [applicationId]: true }));
  };

  const toggleApplicationDetails = (applicationId) => {
    setExpandedApplications(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }));
  };

  // Filter and search applications
  const filteredApplications = applications.filter(app => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      app.name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.phone?.toLowerCase().includes(searchLower) ||
      app.specialties?.some(s => s.toLowerCase().includes(searchLower));

    // Status filter
    const matchesStatus = statusFilter === 'all' || app.creatorStatus === statusFilter;

    // Badge filter
    let matchesBadge = true;
    if (badgeFilter === 'with-badges') {
      matchesBadge = app.badges && app.badges.length > 0;
    } else if (badgeFilter === 'no-badges') {
      matchesBadge = !app.badges || app.badges.length === 0;
    } else if (badgeFilter !== 'all') {
      // Specific badge type filter
      matchesBadge = app.badges?.some(badge => badge.type === badgeFilter);
    }

    return matchesSearch && matchesStatus && matchesBadge;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.appliedAt) - new Date(a.appliedAt);
      case 'date-asc':
        return new Date(a.appliedAt) - new Date(b.appliedAt);
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  });

  useEffect(() => {
    // Don't do anything while authentication is still loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and has admin role
    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      fetchApplications();
      fetchBadgePresets(); // Load badge presets for filters
    } else if (isAuthenticated && user?.role?.toLowerCase() !== 'admin') {
      // User is authenticated but not admin
      setError('ليس لديك صلاحية للوصول إلى لوحة تحكم المدير');
      setLoading(false);
    } else if (!isAuthenticated) {
      // Not authenticated - redirect to login
      router.push('/login');
      setLoading(false);
    }
  }, [isAuthenticated, user, router, authLoading]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/creator-applications');
      const normalizedApps = (response.data.applications || []).map(app => ({
        ...app,
        creatorStatus: app.creatorStatus?.toLowerCase()
      }));
      setApplications(normalizedApps);
      setStats(response.data.stats);
    } catch (err) {
      // Set empty state if API fails
      setApplications([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/creator-applications/${userId}/status`, {
        status: newStatus
      });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === userId
            ? { ...app, creatorStatus: newStatus?.toLowerCase() }
            : app
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        [newStatus]: prev[newStatus] + 1,
        pending: prev.pending - (newStatus !== 'pending' ? 1 : 0)
      }));

      // If we're approving a user and they're currently logged in, refresh their data
      if (newStatus === 'approved') {
        const approvedUser = applications.find(app => app.id === userId);
        if (approvedUser && approvedUser.email === user?.email) {
          try {
            await refreshUserData();
          } catch (refreshError) {
            // Silent failure
          }
        }
      }
      toast.success(newStatus === 'approved' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب');
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const fetchBadgePresets = async () => {
    try {
      const response = await api.get('/admin/badge-presets');
      setBadgePresets(response.data);
    } catch (error) {
      // Silent failure
    }
  };

  const handleManageBadges = (creator) => {
    setSelectedCreator(creator);
    setSelectedBadgeType('');
    setShowBadgeModal(true);
    if (!badgePresets) {
      fetchBadgePresets();
    }
  };

  const handleAddBadge = async () => {
    if (!selectedBadgeType || !selectedCreator) return;

    try {
      setActionLoading(true);
      const badge = badgePresets.userBadges.find(b => b.type === selectedBadgeType);

      ensureTokenInHeaders && ensureTokenInHeaders();
      await api.post(`/admin/users/${selectedCreator.id}/badges`, {
        type: badge.type,
        label: badge.label,
        color: badge.color,
        icon: badge.icon
      });

      // Update local state
      const updatedApps = applications.map(app =>
        app.id === selectedCreator.id
          ? { ...app, badges: [...(app.badges || []), { ...badge, _id: Date.now().toString() }] }
          : app
      );
      setApplications(updatedApps);

      setSelectedCreator(prev => ({
        ...prev,
        badges: [...(prev.badges || []), { ...badge, _id: Date.now().toString() }]
      }));

      setSelectedBadgeType('');
      toast.success('تمت إضافة الشارة بنجاح');
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطأ في إضافة الشارة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBadge = async (userId, badgeId) => {
    try {
      ensureTokenInHeaders && ensureTokenInHeaders();
      await api.delete(`/admin/users/${userId}/badges/${badgeId}`);

      const updatedApps = applications.map(app =>
        app.id === userId
          ? { ...app, badges: app.badges.filter(b => b._id !== badgeId) }
          : app
      );
      setApplications(updatedApps);

      if (selectedCreator && selectedCreator.id === userId) {
        setSelectedCreator(prev => ({
          ...prev,
          badges: prev.badges.filter(b => b._id !== badgeId)
        }));
      }

      toast.success('تم حذف الشارة بنجاح');
    } catch (error) {
      toast.error(error.response?.data?.message || 'خطأ في حذف الشارة');
    }
  };

  const handlePinCreator = async (userId) => {
    try {
      setPinLoading(userId);
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.put(`/admin/users/${userId}/pin`);

      if (response.data.success) {
        toast.success(response.data.message);
        setApplications(prev =>
          prev.map(app =>
            app.id === userId
              ? {
                ...app,
                isPinned: response.data.user.isPinned,
                pinnedAt: response.data.user.pinnedAt
              }
              : app
          )
        );
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تثبيت المبدع');
    } finally {
      setPinLoading(null);
    }
  };

  const breadcrumbItems = [
    { name: 'لوحة التحكم', url: '/admin' },
    { name: 'طلبات الانضمام', active: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-accent-400 font-bold animate-pulse">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary text-accent-500 dark:text-dark-text-primary transition-colors duration-300 pb-20 overflow-x-hidden" dir="rtl">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -right-[5%] w-[40%] h-[40%] bg-orange-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <BreadcrumbWrapper items={breadcrumbItems} />

        <div className="container-custom pt-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <UserIcon className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">لوحة الإدارة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-accent-500 dark:text-dark-text-primary tracking-tight">
                إدارة <span className="inline-block text-gradient-orange pt-2 pb-2 -mt-2 -mb-2">المبدعين</span>
              </h1>
              <p className="text-accent-400 dark:text-dark-text-tertiary max-w-lg leading-relaxed font-medium">
                مراجعة وإدارة طلبات الانضمام لمجتمع المبدعين العرب. يمكنك الموافقة، الرفض، وتثبيت المبدعين المميزين.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Link href="/admin" className="p-3 bg-white dark:bg-dark-secondary rounded-xl border border-gray-100 dark:border-dark-card-border hover:border-orange-500/30 transition-all shadow-soft group">
                <ArrowRight className="w-5 h-5 text-accent-400 group-hover:text-orange-500 transition-colors" />
              </Link>
            </motion.div>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { id: 'total', label: 'إجمالي الطلبات', value: stats.total || 0, icon: Layout, color: 'primary', gradient: 'from-blue-500 to-indigo-600' },
              { id: 'pending', label: 'قيد المراجعة', value: stats.pending || 0, icon: Clock, color: 'amber', gradient: 'from-amber-500 to-orange-600' },
              { id: 'approved', label: 'مقبولة', value: stats.approved || 0, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
              { id: 'rejected', label: 'مرفوضة', value: stats.rejected || 0, icon: XCircle, color: 'rose', gradient: 'from-rose-500 to-red-600' }
            ].map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden"
              >
                <div className="h-full bg-white dark:bg-dark-secondary rounded-3xl p-6 border border-gray-100 dark:border-dark-card-border shadow-soft hover:shadow-large transition-all duration-300">
                  <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full`} />

                  <div className="flex flex-col gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-glow-${stat.color === 'amber' ? 'orange' : stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-accent-400 dark:text-dark-text-tertiary text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-accent-500 dark:text-dark-text-primary">{stat.value}</span>
                        {stat.id === 'pending' && stat.value > 0 && (
                          <span className="flex h-2 w-2 mb-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters & Management Area */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-primary-500 rounded-full" />
            <h2 className="text-2xl font-black text-accent-500 dark:text-dark-text-primary">طلبات الانضمام</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-dark-secondary/70 backdrop-blur-md rounded-[2rem] border border-gray-100 dark:border-dark-card-border p-6 mb-10 shadow-medium"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-12 lg:col-span-4 relative">
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
                  <Search className="w-3 h-3" />
                  البحث عن مبدع
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="الاسم، البريد أو التخصص..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border pr-12 pl-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all focus:bg-white dark:focus:bg-dark-tertiary ring-2 ring-transparent focus:ring-orange-500/10 text-right"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 group-focus-within:text-orange-500 transition-colors" />
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-2">
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
                  <Filter className="w-3 h-3" />
                  حالة الطلب
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="pending">قيد المراجعة</option>
                    <option value="approved">مقبولة</option>
                    <option value="rejected">مرفوضة</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
                  <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-2">
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
                  <Medal className="w-3 h-3" />
                  تصفية الشارات
                </label>
                <div className="relative">
                  <select
                    value={badgeFilter}
                    onChange={(e) => setBadgeFilter(e.target.value)}
                    className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
                  >
                    <option value="all">كل الشارات</option>
                    <option value="with-badges">المزود بشارات</option>
                    <option value="no-badges">بدون شارات</option>
                    {badgePresets?.userBadges?.map(badge => (
                      <option key={badge.type} value={badge.type}>{badge.label}</option>
                    ))}
                  </select>
                  <Medal className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
                  <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
                </div>
              </div>

              <div className="md:col-span-6 lg:col-span-3">
                <label className="text-[10px] font-black text-accent-300 uppercase tracking-widest mb-2 flex items-center gap-2 pr-1">
                  <TrendingUp className="w-3 h-3" />
                  ترتيب النتائج
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-50/50 dark:bg-dark-tertiary/50 border border-gray-100 dark:border-dark-card-border appearance-none pr-12 pl-10 py-4 rounded-2xl text-sm font-bold outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-tertiary ring-2 ring-transparent hover:ring-orange-500/5 text-right"
                  >
                    <option value="date-desc">الأحدث أولاً</option>
                    <option value="date-asc">الأقدم أولاً</option>
                    <option value="name-asc">الاسم (أ - ي)</option>
                    <option value="name-desc">الاسم (ي - أ)</option>
                  </select>
                  <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-300 pointer-events-none" />
                  <ChevronLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-300 pointer-events-none -rotate-90" />
                </div>
              </div>

              <div className="md:col-span-1 lg:col-span-1">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setBadgeFilter('all');
                    setSortBy('date-desc');
                  }}
                  className="w-full h-[54px] flex items-center justify-center bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-500 rounded-2xl transition-all border border-rose-100/50"
                  title="إعادة ضبط الفلاتر"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 bg-accent-500 dark:bg-dark-tertiary text-white dark:text-dark-text-primary rounded-full text-[10px] font-black tracking-widest uppercase shadow-soft">
                {sortedApplications.length} طلب موجود
              </span>
            </div>
            <button
              onClick={() => {
                const allExpanded = sortedApplications.every(app => expandedApplications[app.id]);
                const newState = {};
                sortedApplications.forEach(app => { newState[app.id] = !allExpanded; });
                setExpandedApplications(newState);
              }}
              className="group flex items-center gap-2 text-xs font-black text-orange-500 hover:text-orange-600 transition-colors"
            >
              <Activity className="w-4 h-4" />
              {sortedApplications.every(app => expandedApplications[app.id]) ? 'طي الكل' : 'توسيع الكل'}
            </button>
          </div>

          {/* Application List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {sortedApplications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-dark-secondary rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200 dark:border-dark-card-border shadow-soft"
                >
                  <div className="w-20 h-20 bg-gray-50 dark:bg-dark-tertiary rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <UserIcon className="w-10 h-10 text-accent-200" />
                  </div>
                  <h3 className="text-xl font-black text-accent-500 dark:text-dark-text-primary mb-2">لا توجد طلبات</h3>
                  <p className="text-accent-400 dark:text-dark-text-tertiary font-bold italic">لم نتمكن من العثور على أي طلبات تطابق معايير البحث</p>
                </motion.div>
              ) : (
                sortedApplications.map((app, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={app.id}
                    className={`group bg-white dark:bg-dark-secondary rounded-[2.5rem] border transition-all duration-500 shadow-soft ${expandedApplications[app.id] ? 'ring-4 ring-orange-500/10 border-orange-500/30 shadow-large' : 'border-gray-100 dark:border-dark-card-border hover:border-orange-500/20 hover:translate-y-[-4px]'}`}
                  >
                    {/* Compact Header */}
                    <div
                      onClick={() => toggleApplicationDetails(app.id)}
                      className="p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer"
                    >
                      <div className="flex items-center gap-5 flex-1 w-full">
                        <div className="relative w-16 h-16 rounded-[1.5rem] overflow-hidden bg-primary-100 dark:bg-primary-500/10 flex-shrink-0 border-2 border-white dark:border-dark-secondary shadow-soft group-hover:scale-110 transition-transform duration-500">
                          {app.profilePicture && !imageErrors[app.id] ? (
                            <Image
                              src={app.profilePicture}
                              alt={app.name || 'User'}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(app.id)}
                              unoptimized={app.profilePicture.startsWith('http')}
                            />
                          ) : (
                            <UserIcon className="w-8 h-8 text-primary-500 m-auto" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-accent-500 dark:text-dark-text-primary truncate">
                              {app.name}
                            </h3>
                            {app.isPinned && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-1 bg-orange-500 rounded-lg shadow-glow-orange">
                                <Pin className="w-3 h-3 text-white fill-current" />
                              </motion.span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-1.5">
                            <span className="flex items-center gap-2 text-[11px] font-bold text-accent-300 dark:text-dark-text-tertiary">
                              <Mail className="w-3.5 h-3.5 text-primary-500" />
                              {app.email}
                            </span>
                            <span className="flex items-center gap-2 text-[11px] font-bold text-accent-300 dark:text-dark-text-tertiary">
                              <Calendar className="w-3.5 h-3.5 text-amber-500" />
                              {new Date(app.appliedAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest ${app.creatorStatus === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30'
                            : app.creatorStatus === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30'
                              : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
                            }`}>
                            {app.creatorStatus === 'pending' ? 'قيد المراجعة' : app.creatorStatus === 'approved' ? 'مقبول' : 'مرفوض'}
                          </span>

                          <div className="flex -space-x-2 space-x-reverse">
                            {app.badges?.slice(0, 3).map((badge, bIdx) => (
                              <div
                                key={bIdx}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white dark:border-dark-secondary shadow-soft bg-white dark:bg-dark-tertiary transform hover:scale-125 hover:z-10 transition-all cursor-help"
                                title={badge.label}
                              >
                                <span className="text-base">{badge.icon || '⭐'}</span>
                              </div>
                            ))}
                            {app.badges?.length > 3 && (
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-white dark:border-dark-secondary bg-gray-50 dark:bg-dark-tertiary text-[10px] font-black text-accent-300">
                                +{app.badges.length - 3}
                              </div>
                            )}
                          </div>
                        </div>

                        <button className={`p-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl text-accent-300 transition-all duration-500 ${expandedApplications[app.id] ? 'rotate-180 bg-orange-500/10 text-orange-500' : 'group-hover:bg-orange-500/5 group-hover:text-orange-500'}`}>
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Body */}
                    <AnimatePresence>
                      {expandedApplications[app.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2 border-t border-gray-50 dark:border-dark-card-border">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
                              <div className="space-y-8">
                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                  <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                                    <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                                      <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                                    </div>
                                    رابط المعرض / الأعمال
                                  </label>
                                  <a
                                    href={app.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex items-center gap-3 text-sm font-black text-primary-500 hover:text-white transition-all bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-500 px-6 py-3.5 rounded-[1.25rem] shadow-soft hover:shadow-glow-primary"
                                  >
                                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    مشاهدة المعرض
                                    <ArrowLeft className="w-4 h-4 mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all" />
                                  </a>
                                </motion.div>

                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                  <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    رقم الهاتف
                                  </label>
                                  <p className="text-base font-black text-accent-500 dark:text-dark-text-primary px-5 py-3.5 bg-gray-50/80 dark:bg-dark-tertiary rounded-2xl inline-flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {app.phone || 'غير متوفر'}
                                  </p>
                                </motion.div>

                                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                  <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                                    <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                                      <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                                    </div>
                                    تخصصات المبدع
                                  </label>
                                  <div className="flex flex-wrap gap-2.5">
                                    {app.specialties?.length > 0 ? (
                                      app.specialties.map((spec, sIdx) => (
                                        <span key={sIdx} className="px-5 py-2.5 bg-white dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border text-xs font-black text-accent-400 dark:text-dark-text-tertiary rounded-[1rem] shadow-soft hover:scale-105 transition-transform duration-300">
                                          {spec}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-xs italic text-accent-200">لم يتم تحديد تخصصات</span>
                                    )}
                                  </div>
                                </motion.div>
                              </div>

                              <div className="space-y-8">
                                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                  <label className="flex items-center gap-2 text-[11px] font-black text-accent-300 uppercase tracking-widest mb-3">
                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    عن المبدع وخبرته
                                  </label>
                                  <div className="bg-gray-50/50 dark:bg-dark-tertiary/50 p-6 rounded-[2rem] border border-gray-100 dark:border-dark-card-border shadow-inner">
                                    <p className="text-sm font-medium text-accent-400 dark:text-dark-text-secondary leading-loose mb-6">{app.experience}</p>
                                    <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-dark-input-border/30">
                                      <label className="block text-[10px] font-black text-accent-300 uppercase tracking-widest mb-3">الدافع للانضمام</label>
                                      <div className="relative">
                                        <p className="text-sm font-black text-accent-500 dark:text-dark-text-primary italic leading-relaxed pl-4">
                                          "{app.motivation}"
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            </div>

                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-gray-100 dark:border-dark-card-border"
                            >
                              {app.creatorStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateApplicationStatus(app.id, 'approved')}
                                    className="group flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-glow-emerald hover:scale-105 active:scale-95"
                                  >
                                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    الموافقة على الطلب
                                  </button>
                                  <button
                                    onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                    className="group flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs hover:bg-rose-600 transition-all shadow-glow-rose hover:scale-105 active:scale-95"
                                  >
                                    <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    رفض الطلب
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleManageBadges(app)}
                                className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border text-accent-500 dark:text-dark-text-primary rounded-2xl font-black text-xs hover:border-orange-500/30 transition-all shadow-soft hover:scale-105 active:scale-95"
                              >
                                <Crown className="w-4 h-4 text-orange-500 group-hover:rotate-12 transition-transform" />
                                إدارة الشارات والجوائز
                              </button>

                              {app.creatorStatus === 'approved' && (
                                <button
                                  onClick={() => handlePinCreator(app.id)}
                                  disabled={pinLoading === app.id}
                                  className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all shadow-soft hover:scale-105 active:scale-95 ${app.isPinned
                                    ? 'bg-orange-500 text-white shadow-glow-orange'
                                    : 'bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border text-accent-500 dark:text-dark-text-primary hover:border-orange-500'
                                    }`}
                                >
                                  {pinLoading === app.id ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    app.isPinned ? <PinOff className="w-4 h-4 group-hover:rotate-12 transition-transform" /> : <Pin className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                  )}
                                  {app.isPinned ? 'إلغاء التثبيت من الرئيسية' : 'تثبيت بالصفحة الرئيسية'}
                                </button>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Badge Management Modal */}
      <AnimatePresence>
        {showBadgeModal && selectedCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-accent-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-white dark:bg-dark-secondary rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-dark-card-border relative"
            >
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  setSelectedCreator(null);
                  setSelectedBadgeType('');
                }}
                className="absolute top-8 left-8 p-2 bg-gray-50 dark:bg-dark-tertiary text-accent-300 hover:text-rose-500 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-accent-500 dark:text-dark-text-primary mb-2">إدارة الشارات</h3>
                <p className="text-accent-400 dark:text-dark-text-tertiary font-bold flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-orange-500" />
                  {selectedCreator.name}
                </p>
              </div>

              {/* Current Badges */}
              <div className="mb-10">
                <h4 className="flex items-center gap-2 text-xs font-black text-accent-300 uppercase tracking-widest mb-4">
                  <Medal className="w-4 h-4 text-amber-500" />
                  الشارات الحالية
                </h4>
                {selectedCreator.badges && selectedCreator.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCreator.badges.map((badge) => (
                      <div
                        key={badge._id}
                        className="group flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-tertiary border border-gray-100 dark:border-dark-card-border rounded-xl shadow-soft transition-all hover:scale-105"
                      >
                        <span className="text-sm">{badge.icon || '⭐'}</span>
                        <span className="text-[11px] font-black text-accent-400" style={{ color: badge.color }}>{badge.label}</span>
                        <button
                          onClick={() => handleRemoveBadge(selectedCreator.id, badge._id)}
                          className="p-1 text-accent-200 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 dark:bg-dark-tertiary/50 border border-dashed border-gray-200 dark:border-dark-card-border rounded-2xl text-center italic text-accent-200 text-xs">
                    لا توجد شارات نشطة حالياً
                  </div>
                )}
              </div>

              {/* Add New Badge */}
              <div className="bg-gray-50 dark:bg-dark-tertiary/30 rounded-3xl p-8 border border-gray-100 dark:border-dark-card-border">
                <h4 className="flex items-center gap-2 text-xs font-black text-accent-300 uppercase tracking-widest mb-6">
                  <PlusCircle className="w-4 h-4 text-primary-500" />
                  إضافة شارة جديدة
                </h4>
                {badgePresets ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <select
                        value={selectedBadgeType}
                        onChange={(e) => setSelectedBadgeType(e.target.value)}
                        className="w-full bg-white dark:bg-dark-secondary border border-gray-100 dark:border-dark-card-border px-6 py-4 rounded-2xl text-sm font-bold text-accent-400 outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none shadow-soft"
                      >
                        <option value="">اختر شارة من القائمة...</option>
                        {badgePresets.userBadges
                          .filter(badge => !selectedCreator.badges?.some(b => b.type === badge.type))
                          .map((badge) => (
                            <option key={badge.type} value={badge.type}>
                              {badge.icon} {badge.label}
                            </option>
                          ))}
                      </select>
                      <ChevronLeft className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-200 pointer-events-none -rotate-90" />
                    </div>

                    {selectedBadgeType && (
                      <div className="p-6 bg-white dark:bg-dark-secondary rounded-2xl border border-gray-100 dark:border-dark-card-border">
                        <p className="text-[10px] font-black text-accent-300 uppercase mb-3">معاينة الشارة</p>
                        {badgePresets.userBadges
                          .filter(badge => badge.type === selectedBadgeType)
                          .map((badge) => (
                            <div key={badge.type} className="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-dark-tertiary rounded-2xl border border-gray-100 dark:border-dark-card-border shadow-soft">
                              <span className="text-xl">{badge.icon}</span>
                              <span className="text-sm font-black" style={{ color: badge.color }}>{badge.label}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={handleAddBadge}
                        disabled={!selectedBadgeType || actionLoading}
                        className="flex-1 py-4 bg-primary-500 text-white font-black text-xs rounded-2xl hover:bg-primary-600 transition-all disabled:opacity-50 shadow-glow-primary uppercase tracking-widest"
                      >
                        {actionLoading ? 'جاري الإضافة...' : 'تأكيد الإضافة'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
