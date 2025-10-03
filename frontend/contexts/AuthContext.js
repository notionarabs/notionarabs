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
    // Ensure axios has the token as early as possible
    const existingToken = Cookies.get('authToken');
    if (existingToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
    }

    // Check if we have cached data first to minimize loading time
    const cachedUser = localStorage.getItem('user');
    const cacheTimestamp = localStorage.getItem('userCacheTimestamp');
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // If we have a token and any cached user, optimistically restore it immediately
    // This avoids unnecessary redirects on browser back/forward/navigation
    if (existingToken && cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
      } catch { }
    } else if (cachedUser && cacheTimestamp) {
      // If no token, fall back to strict cache freshness (for non-auth flows)
      const now = Date.now();
      const timeSinceCache = now - parseInt(cacheTimestamp);
      if (timeSinceCache < cacheExpiry) {
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setLoading(false);
        setHasCheckedAuth(true);
        return;
      }
    }

    // If we haven't checked auth yet, do it now
    if (!hasCheckedAuth) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 2000); // Reduced to 2 seconds for faster UX

      checkAuthStatus().finally(() => {
        clearTimeout(timeoutId);
        setHasCheckedAuth(true);
        setLoading(false);
      });

      return () => clearTimeout(timeoutId);
    } else {
      setLoading(false);
    }
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
          // Verify token with backend with timeout
          const response = await Promise.race([
            api.get('/auth/me'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 8000)
            )
          ]);
          
          const userData = response.data.user;
          setUser(userData);

          // Cache the user data
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userCacheTimestamp', Date.now().toString());
        } catch (apiError) {
          console.warn('Auth verification failed:', apiError.message);
          
          // If it's a timeout or network error, don't clear the token
          // The user might still be authenticated
          if (apiError.message === 'Request timeout' || 
              apiError.code === 'NETWORK_ERROR' || 
              !apiError.response) {
            console.log('Network/timeout error, keeping token for retry');
            // Keep the token and try to use cached data if available
            if (cachedUser) {
              try {
                const userData = JSON.parse(cachedUser);
                setUser(userData);
                return;
              } catch (e) {
                // Cache is corrupted, continue to clear
              }
            }
          }
          
          // Clear invalid token and cache only for auth errors
          if (apiError.response?.status === 401) {
            Cookies.remove('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userCacheTimestamp');
            delete api.defaults.headers.common['Authorization'];
          }
          throw apiError; // Re-throw to be caught by callback
        }
      } else {
        // No token, user is not authenticated
        localStorage.removeItem('user');
        localStorage.removeItem('userCacheTimestamp');
      }
    } catch (error) {
      // Only clear token for authentication errors, not network errors
      if (error.response?.status === 401) {
        Cookies.remove('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userCacheTimestamp');
        delete api.defaults.headers.common['Authorization'];
      }
      throw error; // Re-throw to be caught by callback
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

      // Set loading to false after successful login
      setLoading(false);

      return { success: true };
    } catch (error) {
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

        // Set loading to false after successful verification
        setLoading(false);
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
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تحديث بيانات المستخدم'
      };
    }
  };

  // Periodic status check for pending users
  useEffect(() => {
    if (!user || user.creatorStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Failed to refresh user status:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user?.creatorStatus, refreshUserData]);

  // Check status when page becomes visible (user switches tabs back)
  useEffect(() => {
    if (!user || user.creatorStatus !== 'pending') return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Failed to refresh user status on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.creatorStatus, refreshUserData]);

  // Re-check authentication when page becomes visible (for browser back navigation)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !loading) {
        const token = Cookies.get('authToken');
        if (token && !user) {
          // We have a token but no user, re-check authentication
          try {
            await checkAuthStatus();
          } catch (error) {
            console.error('Failed to re-check auth on visibility change:', error);
          }
        }
      }
    };

    const handleFocus = async () => {
      if (!loading) {
        const token = Cookies.get('authToken');
        if (token && !user) {
          // We have a token but no user, re-check authentication
          try {
            await checkAuthStatus();
          } catch (error) {
            console.error('Failed to re-check auth on focus:', error);
          }
        }
      }
    };

    const handlePageShow = async () => {
      // This handles browser back/forward navigation
      if (!loading) {
        const token = Cookies.get('authToken');
        if (token && !user) {
          // We have a token but no user, re-check authentication
          try {
            await checkAuthStatus();
          } catch (error) {
            console.error('Failed to re-check auth on page show:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [loading, user]);

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
