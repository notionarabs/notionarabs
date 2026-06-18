'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Layout,
  ArrowRight,
  User as UserIcon,
  Activity
} from 'lucide-react';
import { BreadcrumbWrapper } from '../../../components/Breadcrumb.js';

// Import subcomponents
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationCard from './components/ApplicationCard';
import BadgeModal from './components/BadgeModal';

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
  const [imageErrors, setImageErrors] = useState({});
  const [pinLoading, setPinLoading] = useState(null);
  const { user, isAuthenticated, loading: authLoading, refreshUserData, ensureTokenInHeaders } = useAuth();
  const { showSuccess, showError } = useToast();
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
      showSuccess(newStatus === 'approved' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب');
    } catch (err) {
      showError('حدث خطأ أثناء تحديث حالة الطلب');
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
      const response = await api.post(`/admin/users/${selectedCreator.id}/badges`, {
        type: badge.type,
        label: badge.label,
        color: badge.color,
        icon: badge.icon
      });

      const updatedUser = response.data.user;
      
      // Update local state
      const updatedApps = applications.map(app =>
        app.id === selectedCreator.id
          ? { ...app, badges: updatedUser.badges }
          : app
      );
      setApplications(updatedApps);

      setSelectedCreator(prev => ({
        ...prev,
        badges: updatedUser.badges
      }));

      setSelectedBadgeType('');
      showSuccess('تمت إضافة الشارة بنجاح');
    } catch (error) {
      showError(error.response?.data?.message || 'خطأ في إضافة الشارة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBadge = async (userId, badgeId) => {
    try {
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.delete(`/admin/users/${userId}/badges/${badgeId}`);
      const updatedUser = response.data.user;

      const updatedApps = applications.map(app =>
        app.id === userId
          ? { ...app, badges: updatedUser.badges }
          : app
      );
      setApplications(updatedApps);

      if (selectedCreator && selectedCreator.id === userId) {
        setSelectedCreator(prev => ({
          ...prev,
          badges: updatedUser.badges
        }));
      }

      showSuccess('تم حذف الشارة بنجاح');
    } catch (error) {
      showError(error.response?.data?.message || 'خطأ في حذف الشارة');
    }
  };

  const handlePinCreator = async (userId) => {
    try {
      setPinLoading(userId);
      ensureTokenInHeaders && ensureTokenInHeaders();
      const response = await api.put(`/admin/users/${userId}/pin`);

      if (response.data.success) {
        showSuccess(response.data.message);
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
      showError('حدث خطأ أثناء تثبيت المبدع');
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
              className="space-y-2 text-right"
            >
              <div className="flex items-center gap-3 mb-1 justify-start">
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

                  <div className="flex flex-col gap-4 relative z-10 text-right">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-glow-${stat.color === 'amber' ? 'orange' : stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-accent-400 dark:text-dark-text-tertiary text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                      <div className="flex items-end gap-2 justify-start">
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

          {/* Filters Component */}
          <ApplicationFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            badgeFilter={badgeFilter}
            setBadgeFilter={setBadgeFilter}
            badgePresets={badgePresets}
            sortBy={sortBy}
            setSortBy={setSortBy}
            resetFilters={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setBadgeFilter('all');
              setSortBy('date-desc');
            }}
          />

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
                sortedApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    expanded={expandedApplications[app.id]}
                    onToggle={() => toggleApplicationDetails(app.id)}
                    imageError={imageErrors[app.id]}
                    onImageError={() => handleImageError(app.id)}
                    onUpdateStatus={updateApplicationStatus}
                    onManageBadges={handleManageBadges}
                    onPinCreator={handlePinCreator}
                    pinLoading={pinLoading === app.id}
                    user={user}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Badge Modal Component */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        creator={selectedCreator}
        badgePresets={badgePresets}
        selectedBadgeType={selectedBadgeType}
        setSelectedBadgeType={setSelectedBadgeType}
        onAddBadge={handleAddBadge}
        onRemoveBadge={handleRemoveBadge}
        actionLoading={actionLoading}
      />
    </div>
  );
}
