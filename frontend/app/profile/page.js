'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-bw flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-bw-gray">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bw" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-bw-gray bg-bw-white sticky top-0 z-50 shadow-sm">
        <Link href="/" className="text-xl font-bold text-gradient-bw">عرب نوشن</Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-bw-gray hover:text-bw-black transition-colors">
            العودة للصفحة الرئيسية
          </Link>
          <button
            onClick={logout}
            className="text-bw-gray hover:text-bw-black transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-bw-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-black to-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-bw-black mb-2">مرحباً، {user?.name}</h1>
            <p className="text-bw-gray">{user?.email}</p>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-bw-light rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-bw-black mb-2">0</div>
              <div className="text-bw-gray">القوالب المنشورة</div>
            </div>
            <div className="bg-bw-light rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-bw-black mb-2">0</div>
              <div className="text-bw-gray">المبيعات</div>
            </div>
            <div className="bg-bw-light rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-bw-black mb-2">0</div>
              <div className="text-bw-gray">الأرباح</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-bw-black mb-4">الإجراءات السريعة</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/templates" className="block p-6 bg-bw-light rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bw-black">تصفح القوالب</h3>
                    <p className="text-sm text-bw-gray">اكتشف قوالب جديدة</p>
                  </div>
                </div>
              </Link>

              <Link href="/templates/create" className="block p-6 bg-bw-light rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bw-black">إنشاء قالب جديد</h3>
                    <p className="text-sm text-bw-gray">ابدأ بيع قوالبك</p>
                  </div>
                </div>
              </Link>

              <Link href="/profile/settings" className="block p-6 bg-bw-light rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bw-black">إعدادات الحساب</h3>
                    <p className="text-sm text-bw-gray">إدارة معلوماتك</p>
                  </div>
                </div>
              </Link>

              <Link href="/profile/orders" className="block p-6 bg-bw-light rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-bw-black">طلباتي</h3>
                    <p className="text-sm text-bw-gray">عرض مشترياتي</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
