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

  // Debug logging for user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
  }, [user]);
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
        console.log('AuthContext: Using cached data immediately');
        const userData = JSON.parse(cachedUser);
        setUser(userData);
        setLoading(false);
        setHasCheckedAuth(true);
        return;
      }
    }

    const timeoutId = setTimeout(() => {
      console.warn('AuthContext: Timeout reached, forcing loading to false');
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
      console.log('AuthContext: checkAuthStatus - token:', token ? 'exists' : 'not found');

      // Check if we have cached user data
      const cachedUser = localStorage.getItem('user');
      const cacheTimestamp = localStorage.getItem('userCacheTimestamp');
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      if (token && cachedUser && cacheTimestamp) {
        const now = Date.now();
        const timeSinceCache = now - parseInt(cacheTimestamp);

        if (timeSinceCache < cacheExpiry) {
          // Use cached data if it's fresh
          console.log('AuthContext: Using cached user data');
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
          console.log('AuthContext: checkAuthStatus - user data:', response.data.user);
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
        console.log('AuthContext: No token found, user not authenticated');
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
      console.log('AuthContext: Starting signup process');
      const response = await api.post('/auth/signup', { name, email, password });
      console.log('AuthContext: Signup response:', response.data);
      console.log('AuthContext: Response status:', response.status);

      const { requiresVerification, verificationToken, user } = response.data;
      console.log('AuthContext: Extracted values:', { requiresVerification, verificationToken, user });

      // Don't set user or token if verification is required
      if (requiresVerification) {
        console.log('AuthContext: Verification required, not setting user');
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
        console.log('AuthContext: No verification required, setting user and token');
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
      const response = await api.post('/auth/verify-email', { token });
      const { token: authToken, user } = response.data;

      // If verification successful and we got a token, log the user in
      if (authToken && user) {
        console.log('AuthContext: Setting user after email verification:', user);
        // Store token in cookie
        Cookies.set('authToken', authToken, { expires: 7 }); // 7 days

        // Set token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        setUser(user);

        // Cache the user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userCacheTimestamp', Date.now().toString());

        console.log('AuthContext: User set successfully');
      } else {
        console.log('AuthContext: No token or user data received');
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل في تأكيد البريد الإلكتروني'
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
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
