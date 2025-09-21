'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (!formData.adminSecret) {
      setError('Admin secret مطلوب');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminSecret: formData.adminSecret
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Auto-login the admin
        document.cookie = `authToken=${data.token}; path=/; max-age=604800`; // 7 days
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userCacheTimestamp', Date.now().toString());

        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          router.push('/admin/creator-applications');
        }, 2000);
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء حساب المدير');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
        <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
          <div className="container-custom flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/NavLogoLight.svg"
                alt="عرب نوشن"
                width={180}
                height={60}
                className="h-8 sm:h-10 md:h-12 w-auto"
                quality={100}
                priority
                unoptimized
              />
            </Link>
          </div>
        </nav>

        <div className="container-custom py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="heading-1 text-green-600 dark:text-green-400 mb-4">
                تم إنشاء حساب المدير بنجاح!
              </h1>
              <p className="body-large text-accent-600 dark:text-dark-text-secondary mb-8">
                تم إنشاء حساب المدير بنجاح. سيتم توجيهك إلى لوحة تحكم المدير...
              </p>
              <Link href="/admin/creator-applications" className="btn-primary">
                الذهاب إلى لوحة تحكم المدير
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-primary transition-colors duration-300" dir="rtl">
      <nav className="bg-accent-500 dark:bg-dark-secondary shadow-medium dark:shadow-dark-medium">
        <div className="container-custom flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/NavLogoLight.svg"
              alt="عرب نوشن"
              width={180}
              height={60}
              className="h-8 sm:h-10 md:h-12 w-auto"
              quality={100}
              priority
              unoptimized
            />
          </Link>
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </nav>

      <div className="container-custom py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="heading-1 mb-4">
              إنشاء حساب مدير
            </h1>
            <p className="body-large text-accent-600 dark:text-dark-text-secondary">
              إنشاء حساب مدير لإدارة طلبات المبدعين
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                  Admin Secret
                </label>
                <input
                  type="password"
                  name="adminSecret"
                  value={formData.adminSecret}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="admin-secret-2024"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                  Default: admin-secret-2024
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء حساب المدير'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
