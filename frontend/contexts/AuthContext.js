'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Only run once on mount and only if we haven't checked auth yet
    if (hasCheckedAuth) {
      setLoading(false);
      return;
    }

    // Check if we have cached data first to minimize loading time
    const cachedUser = localStorage.getItem('user');
    const cacheTimestamp = localStorage.getItem('userCacheTimestamp');
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    if (cachedUser && cacheTimestamp) {
      const now = Date.now();
      const timeSinceCache = now - parseInt(cacheTimestamp);

      if (timeSinceCache < cacheExpiry) {
        // Use cached data immediately, no loading needed
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setLoading(false);
        setHasCheckedAuth(true);
        return;
      }
    }

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000); // Reduced to 2 seconds for faster UX

    checkAuthStatus().finally(() => {
      clearTimeout(timeoutId);
      setHasCheckedAuth(true);
      setLoading(false);
    });

    return () => clearTimeout(timeoutId);
  }, [hasCheckedAuth]); // Only run when hasCheckedAuth changes

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('authToken');

      // Check if we have cached user data
      const cachedUser = localStorage.getItem('user');
      const cacheTimestamp = localStorage.getItem('userCacheTimestamp');
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      if (token && cachedUser && cacheTimestamp) {
        const now = Date.now();
        const timeSinceCache = now - parseInt(cacheTimestamp);

        if (timeSinceCache < cacheExpiry) {
          // Use cached data if it's fresh
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return;
        }
      }

      if (token) {
        // Set the token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          // Verify token with backend
          const response = await api.get('/auth/me');
          const userData = response.data.user;
          setUser(userData);

          // Cache the user data
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userCacheTimestamp', Date.now().toString());
        } catch (apiError) {
          console.error('Auth API call failed:', apiError);
          // Clear invalid token and cache
          Cookies.remove('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userCacheTimestamp');
          delete api.defaults.headers.common['Authorization'];
        }
      } else {
        // No token, user is not authenticated
        localStorage.removeItem('user');
        localStorage.removeItem('userCacheTimestamp');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any invalid token and cache
      Cookies.remove('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userCacheTimestamp');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Store token in cookie
      Cookies.set('authToken', token, { expires: 7 }); // 7 days

      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);

      // Cache the user data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userCacheTimestamp', Date.now().toString());

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تسجيل الدخول'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });

      const { requiresVerification, verificationToken, user } = response.data;

      // Don't set user or token if verification is required
      if (requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          verificationToken: verificationToken,
          user: user
        };
      }

      // Only set user and token if no verification is required (shouldn't happen with new flow)
      const { token } = response.data;
      if (token) {
        // Store token in cookie
        Cookies.set('authToken', token, { expires: 7 }); // 7 days

        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(user);
      }

      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في إنشاء الحساب'
      };
    }
  };

  const logout = () => {
    Cookies.remove('authToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);

    // Clear cached user data
    localStorage.removeItem('user');
    localStorage.removeItem('userCacheTimestamp');

    router.push('/');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Forgot password failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في إرسال طلب إعادة تعيين كلمة المرور'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Reset password failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في إعادة تعيين كلمة المرور'
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      if (!token) {
        return {
          success: false,
          error: 'رمز التأكيد مطلوب'
        };
      }

      const response = await api.post('/auth/verify-email', { token });
      const { token: authToken, user } = response.data;

      // If verification successful and we got a token, log the user in
      if (authToken && user) {
        // Store token in cookie
        Cookies.set('authToken', authToken, { expires: 7 }); // 7 days

        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        setUser(user);

        // Cache the user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userCacheTimestamp', Date.now().toString());
      }

      return {
        success: true,
        message: response.data.message,
        user: user,
        token: authToken
      };
    } catch (error) {
      let errorMessage = 'فشل في تأكيد البريد الإلكتروني';
      let errorType = 'UNKNOWN_ERROR';

      if (error.response?.status === 400) {
        const errorData = error.response?.data;
        errorMessage = errorData?.message || 'رمز التأكيد غير صحيح أو منتهي الصلاحية';
        errorType = errorData?.errorType || 'INVALID_TOKEN';
      } else if (error.response?.status === 404) {
        errorMessage = 'رمز التأكيد غير موجود';
        errorType = 'NOT_FOUND';
      } else if (error.response?.status >= 500) {
        errorMessage = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        errorType = 'SERVER_ERROR';
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'خطأ في الاتصال، تأكد من اتصالك بالإنترنت';
        errorType = 'NETWORK_ERROR';
      }

      return {
        success: false,
        error: errorMessage,
        errorType: errorType
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Resend verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في إعادة إرسال رابط التأكيد'
      };
    }
  };

  const refreshUserData = async () => {
    try {
      const token = Cookies.get('authToken');
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      // Force refresh by clearing cache
      localStorage.removeItem('user');
      localStorage.removeItem('userCacheTimestamp');

      // Fetch fresh user data
      const response = await api.get('/auth/me');
      const userData = response.data.user;

      setUser(userData);

      // Cache the new user data
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userCacheTimestamp', Date.now().toString());

      return { success: true, user: userData };
    } catch (error) {
      console.error('Refresh user data failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحديث بيانات المستخدم'
      };
    }
  };

  // Function to ensure token is set in API headers
  const ensureTokenInHeaders = () => {
    const token = Cookies.get('authToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } else {
      delete api.defaults.headers.common['Authorization'];
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    checkAuthStatus,
    refreshUserData,
    ensureTokenInHeaders,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
