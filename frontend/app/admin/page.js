'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { formatDate } from '../../lib/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import { Settings, Mail, ExternalLink } from 'lucide-react';
import { BreadcrumbWrapper } from '../../components/Breadcrumb.js';

// Import subcomponents
import StatsCards from './components/StatsCards';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import UserDetailsModal from './components/UserDetailsModal';

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading, refreshUserData } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredUserCount, setFilteredUserCount] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isRefreshing = useRef(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      const currentRole = user?.role?.toString().toLowerCase().trim();

      if (currentRole !== 'admin') {
        if (isRefreshing.current) {
          setLoading(false);
          router.push('/');
          return;
        }

        isRefreshing.current = true;
        
        try {
          const result = await refreshUserData();
          const freshRole = result.user?.role?.toString().toLowerCase().trim();
          
          if (result.success && freshRole === 'admin') {
            return;
          } else {
            setLoading(false);
            router.push('/');
          }
        } catch (error) {
          setLoading(false);
          router.push('/');
        }
        return;
      }

      setLoading(false);
      fetchUsers();
      fetchStats();
    };

    checkAdminAccess();
  }, [isAuthenticated, user?.role, router, authLoading, refreshUserData]);

  // Real-time updates for admin dashboard
  useEffect(() => {
    if (!isAuthenticated || user?.role?.toLowerCase() !== 'admin') return;

    let intervalId;
    const onFocus = () => {
      fetchStats();
      fetchUsers();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        fetchUsers();
      }
    };

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        fetchStats();
        fetchUsers();
      }, 30000); // Poll every 30 seconds
    };

    startPolling();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, user]);

  // Auto-apply filters when filter values change (except search term)
  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      fetchUsers();
    }
  }, [filterRole, sortBy, sortOrder]);

  // Debounced search effect
  useEffect(() => {
    if (isAuthenticated && user?.role?.toLowerCase() === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300); // reduced to 300ms for better responsiveness

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('limit', '50');

      const response = await api.get(`/admin/users?${params.toString()}`);
      const normalizedUsers = (response.data.users || []).map(u => ({
        ...u,
        role: u.role?.toLowerCase(),
        creatorStatus: u.creatorStatus?.toLowerCase()
      }));
      setUsers(normalizedUsers);

      // Update filtered user count based on API response for accuracy
      const { count } = response.data;
      if (typeof count === 'number') {
        setFilteredUserCount(count);
      } else {
        setFilteredUserCount(normalizedUsers.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUserCount(0);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats', { timeout: 30000 }); // 30 second timeout
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats if API fails
      setStats({
        totalUsers: 0,
        googleUsers: 0,
        regularUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        googleUsersPercentage: 0,
        pendingApplications: 0,
        approvedCreators: 0,
        rejectedApplications: 0,
        adminUsers: 0,
        totalTemplates: 0,
        pendingTemplates: 0,
        approvedTemplates: 0,
        rejectedTemplates: 0,
        totalBlogs: 0,
        pendingBlogs: 0,
        publishedBlogs: 0,
        rejectedBlogs: 0,
        draftBlogs: 0,
        recentUsers: 0,
        recentTemplates: 0,
        recentBlogs: 0,
        unreadNotifications: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // CSV Export function for filtered users
  const exportUsersCSV = async () => {
    try {
      setExportLoading(true);

      // Fetch all users matching existing filters without the default view limit
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      // Request a high enough limit to get all filtered users (up to 2000 for safety)
      params.append('limit', Math.min(filteredUserCount || 1000, 2000).toString());

      const response = await api.get(`/admin/users?${params.toString()}`);
      const usersToExport = response.data.users || [];

      const csvData = usersToExport.map(user => ({
        id: user._id,
        name: user.name || '',
        username: user.username || '---',
        email: user.email || '',
        role: user.role?.toLowerCase() === 'admin' ? 'مدير' : user.role?.toLowerCase() === 'creator' ? 'مبدع' : 'مستخدم',
        creatorStatus: {
          'approved': 'مبدع معتمد',
          'pending': 'قيد المراجعة',
          'rejected': 'مرفوض',
          'none': '---'
        }[user.creatorStatus] || '---',
        registrationType: user.googleId ? 'Google' : 'البريد الإلكتروني',
        createdAt: formatDate(user.createdAt),
        verified: user.isEmailVerified ? 'مفعل' : 'غير مفعل',
        bio: (user.bio || '').replace(/\n/g, ' ')
      }));

      // Create CSV content
      const headers = ['المعرف', 'الاسم', 'اسم المستخدم', 'البريد الإلكتروني', 'نوع المستخدم', 'حالة المبدع', 'نوع التسجيل', 'تاريخ الإنشاء', 'تفعيل البريد', 'النبذة'];
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          Object.values(row).map(value =>
            `"${value.toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      // Add BOM for proper Arabic display in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Generate filename with current filters
      const filterSuffix = filterRole !== 'all' ? `_${filterRole}` : '';
      const searchSuffix = searchTerm ? `_search_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
      const filename = `notion_arabs_users${filterSuffix}${searchSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting users:', error);
      showError('حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setExportLoading(false);
    }
  };

  const isAdmin = user?.role?.toString().toLowerCase().trim() === 'admin';

  if (!isAuthenticated || !isAdmin) {
    if (isAuthenticated && loading) {
      return (
        <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center" dir="rtl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري التحقق من الصلاحيات...</p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary flex items-center justify-center transition-colors duration-300" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4 p-8 bg-white dark:bg-dark-secondary rounded-2xl shadow-xl text-center border-none"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="heading-2 mb-4 text-gray-900 dark:text-white">غير مصرح لك بالوصول</h1>
          <p className="body-large mb-6 text-gray-600 dark:text-gray-400">هذه الصفحة مخصصة للمديرين فقط</p>
          <Link href="/" className="btn-primary inline-flex">
            العودة للرئيسية
          </Link>
        </motion.div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'لوحة الإدارة', url: '/admin' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300 pb-20" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary-500/5 dark:bg-orange-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-accent-500/5 dark:bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header section with Breadcrumbs */}
      <div className="relative z-10">
        <BreadcrumbWrapper items={breadcrumbItems} />
      </div>

      <main className="container-custom relative z-10">
        {/* Page Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 dark:bg-orange-950/40 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-600 dark:text-orange-500" />
              </div>
              <h1 className="heading-2 mb-0">لوحة الإدارة</h1>
            </div>
            <p className="text-accent-600 dark:text-dark-text-secondary pr-1">
              مرحباً بك في لوحة التحكم، يمكنك إدارة المستخدمين والمحتوى من هنا.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/email-import" className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              استيراد البريد
            </Link>
            <Link href="/admin/settings" className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Link>
            <Link href="/" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              عرض الموقع
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid Stats */}
        <StatsCards stats={stats} />

        {/* Search & Management Section */}
        <section id="users-list" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
            <h2 className="heading-3 mb-0">إدارة المستخدمين</h2>
          </div>

          {/* Filters Card */}
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            resetFilters={() => {
              setSearchTerm('');
              setFilterRole('all');
              setSortBy('createdAt');
              setSortOrder('desc');
            }}
          />

          {/* Table Card */}
          <UserTable
            users={users}
            usersLoading={usersLoading}
            loading={loading}
            filteredUserCount={filteredUserCount}
            exportUsersCSV={exportUsersCSV}
            exportLoading={exportLoading}
            setSelectedUser={setSelectedUser}
            setShowDetailsModal={setShowDetailsModal}
            formatDate={formatDate}
          />
        </section>
      </main>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={selectedUser}
        formatDate={formatDate}
      />
    </div>
  );
}
