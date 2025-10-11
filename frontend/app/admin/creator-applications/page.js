'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Star, Zap, Crown, Award, CheckCircle, Heart } from 'lucide-react';

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
  const { user, isAuthenticated, loading: authLoading, refreshUserData, ensureTokenInHeaders } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while authentication is still loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated and has admin role
    if (isAuthenticated && user?.role === 'admin') {
      fetchApplications();
    } else if (isAuthenticated && user?.role !== 'admin') {
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
      setApplications(response.data.applications);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Fetch applications error:', err);
      // Set empty state if API fails (API endpoint not implemented yet)
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
            ? { ...app, creatorStatus: newStatus }
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
        // Find the approved user
        const approvedUser = applications.find(app => app.id === userId);
        if (approvedUser && approvedUser.email === user?.email) {
          // This is the current user being approved, refresh their data
          try {
            await refreshUserData();
          } catch (refreshError) {
            console.error('Failed to refresh user data after approval:', refreshError);
          }
        }
      }
    } catch (err) {
      console.error('Update status error:', err);
      // Silently fail - API endpoint not implemented yet
    }
  };

  const fetchBadgePresets = async () => {
    try {
      const response = await api.get('/admin/badge-presets');
      setBadgePresets(response.data);
    } catch (error) {
      console.error('Error fetching badge presets:', error);
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

      console.log('Adding badge:', {
        userId: selectedCreator.id,
        badge: badge
      });

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

      // Also update the selectedCreator state so the modal shows the new badge immediately
      setSelectedCreator(prev => ({
        ...prev,
        badges: [...(prev.badges || []), { ...badge, _id: Date.now().toString() }]
      }));

      setSelectedBadgeType('');
      toast.success('تمت إضافة الشارة بنجاح');
      await fetchApplications();
    } catch (error) {
      console.error('Error adding badge:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.errors
        ? error.response.data.errors.map(e => e.msg).join(', ')
        : error.response?.data?.message || 'خطأ في إضافة الشارة';
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBadge = async (userId, badgeId) => {
    try {
      ensureTokenInHeaders && ensureTokenInHeaders();
      await api.delete(`/admin/users/${userId}/badges/${badgeId}`);

      // Update local state
      const updatedApps = applications.map(app =>
        app.id === userId
          ? { ...app, badges: app.badges.filter(b => b._id !== badgeId) }
          : app
      );
      setApplications(updatedApps);

      // Also update the selectedCreator state so the modal shows the updated badges immediately
      if (selectedCreator && selectedCreator.id === userId) {
        setSelectedCreator(prev => ({
          ...prev,
          badges: prev.badges.filter(b => b._id !== badgeId)
        }));
      }

      toast.success('تم حذف الشارة بنجاح');
      await fetchApplications();
    } catch (error) {
      console.error('Error removing badge:', error);
      toast.error(error.response?.data?.message || 'خطأ في حذف الشارة');
    }
  };

  // Show loading state while checking authentication
  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="max-w-md mx-auto bg-white dark:bg-dark-secondary rounded-xl shadow-large dark:shadow-dark-large p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
            غير مصرح لك
          </h2>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
            ليس لديك صلاحية للوصول إلى لوحة تحكم المدير
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              العودة للرئيسية
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="loading-text">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      <div className="container-custom py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="heading-1 mb-4">إدارة طلبات المبدعين</h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary">
                مراجعة وإدارة طلبات الانضمام كمبدعين
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="btn-outline"
              >
                العودة للوحة الإدارة
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-orange-400">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">مقبولة</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-600 dark:text-dark-text-tertiary">مرفوضة</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card p-6">
          <h2 className="heading-3 mb-6">طلبات المبدعين</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-accent-400 dark:text-dark-text-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-accent-600 dark:text-dark-text-secondary">لا توجد طلبات مبدعين</p>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="border border-gray-200 dark:border-dark-card-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {application.profilePicture ? (
                        <img
                          src={application.profilePicture}
                          alt={application.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 dark:from-orange-500 dark:to-orange-600 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {application.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                          {application.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                          {application.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                          {new Date(application.appliedAt).toLocaleDateString('en-US')}
                        </p>
                        {/* Creator Badges */}
                        {application.badges && application.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {application.badges.map((badge) => {
                              const BadgeIcon = getBadgeIcon(badge.type);
                              return (
                                <span
                                  key={badge._id}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-orange-500/10 border border-primary-200 dark:border-orange-500/20 text-primary-700 dark:text-orange-400"
                                >
                                  <BadgeIcon className="w-3 h-3" strokeWidth={2} />
                                  <span>{badge.label}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${application.creatorStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : application.creatorStatus === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {application.creatorStatus === 'pending' && 'قيد المراجعة'}
                        {application.creatorStatus === 'approved' && 'مقبول'}
                        {application.creatorStatus === 'rejected' && 'مرفوض'}
                      </span>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        المعرض
                      </label>
                      <a
                        href={application.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-orange-400 hover:underline text-sm"
                      >
                        {application.portfolio}
                      </a>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                        الهاتف
                      </label>
                      <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                        {application.phone}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      الخبرة
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                      {application.experience}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      التخصصات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {application.specialties?.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-dark-tertiary text-gray-700 dark:text-dark-text-secondary rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
                      الدافع
                    </label>
                    <p className="text-sm text-gray-900 dark:text-dark-text-primary">
                      {application.motivation}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-card-border">
                    {application.creatorStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'approved')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          قبول الطلب
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          رفض الطلب
                        </button>
                      </>
                    )}
                    {/* Badge Management Button - Available for all creators */}
                    <button
                      onClick={() => handleManageBadges(application)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      إدارة الشارات
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Badge Management Modal */}
      {showBadgeModal && selectedCreator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-card-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-accent-900 dark:text-dark-text-primary mb-1">
                  إدارة الشارات
                </h3>
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  {selectedCreator.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBadgeModal(false);
                  setSelectedCreator(null);
                  setSelectedBadgeType('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-dark-tertiary rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Badges */}
            <div className="mb-8">
              <h4 className="text-base font-semibold text-accent-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                الشارات الحالية
              </h4>
              {selectedCreator.badges && selectedCreator.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {selectedCreator.badges.map((badge) => (
                    <div
                      key={badge._id}
                      className="group relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 bg-gradient-to-br hover:shadow-lg transition-all duration-200"
                      style={{
                        borderColor: badge.color + '40',
                        background: `linear-gradient(135deg, ${badge.color}08 0%, ${badge.color}15 100%)`
                      }}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: badge.color }}>
                        {badge.label}
                      </span>
                      <button
                        onClick={() => handleRemoveBadge(selectedCreator.id, badge._id)}
                        className="ml-1 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-all"
                        title="حذف الشارة"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 dark:bg-dark-tertiary rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                    لا توجد شارات حالياً
                  </p>
                </div>
              )}
            </div>

            {/* Add New Badge */}
            <div className="bg-gradient-to-br from-primary-50 to-orange-50 dark:from-primary-900/10 dark:to-orange-900/10 rounded-xl p-6 border border-primary-200 dark:border-primary-800/30">
              <h4 className="text-base font-semibold text-accent-900 dark:text-dark-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة شارة جديدة
              </h4>
              {badgePresets ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-accent-700 dark:text-dark-text-secondary mb-2">
                      اختر نوع الشارة
                    </label>
                    <select
                      value={selectedBadgeType}
                      onChange={(e) => setSelectedBadgeType(e.target.value)}
                      className="w-full px-4 py-3 text-sm bg-white dark:bg-dark-tertiary border-2 border-gray-200 dark:border-dark-input-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none"
                    >
                      <option value="">اختر شارة...</option>
                      {badgePresets.userBadges
                        .filter(badge => !selectedCreator.badges?.some(b => b.type === badge.type))
                        .map((badge) => (
                          <option key={badge.type} value={badge.type}>
                            {badge.icon} {badge.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {selectedBadgeType && (
                    <div className="p-4 rounded-xl border-2 border-primary-200 dark:border-primary-800/30 bg-white dark:bg-dark-secondary">
                      <p className="text-xs font-medium text-accent-600 dark:text-dark-text-secondary mb-3 uppercase tracking-wide">
                        معاينة الشارة
                      </p>
                      {badgePresets.userBadges
                        .filter(badge => badge.type === selectedBadgeType)
                        .map((badge) => (
                          <div
                            key={badge.type}
                            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 shadow-sm"
                            style={{
                              borderColor: badge.color + '40',
                              background: `linear-gradient(135deg, ${badge.color}08 0%, ${badge.color}15 100%)`
                            }}
                          >
                            <span className="text-xl">{badge.icon}</span>
                            <span className="text-sm font-semibold" style={{ color: badge.color }}>
                              {badge.label}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => {
                        setShowBadgeModal(false);
                        setSelectedCreator(null);
                        setSelectedBadgeType('');
                      }}
                      className="px-5 py-2.5 bg-white dark:bg-dark-tertiary border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-secondary font-medium rounded-xl transition-all duration-200 text-sm"
                      disabled={actionLoading}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleAddBadge}
                      disabled={!selectedBadgeType || actionLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                    >
                      {actionLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          جاري الإضافة...
                        </span>
                      ) : 'إضافة الشارة'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-accent-600 dark:text-dark-text-secondary">
                  جاري تحميل الشارات المتاحة...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
