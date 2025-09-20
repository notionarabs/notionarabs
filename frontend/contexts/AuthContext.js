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

  // Debug logging for user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', user);
  }, [user]);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = Cookies.get('authToken');
      console.log('AuthContext: checkAuthStatus - token:', token ? 'exists' : 'not found');
      if (token) {
        // Set the token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verify token with backend
        const response = await api.get('/auth/me');
        console.log('AuthContext: checkAuthStatus - user data:', response.data.user);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      Cookies.remove('authToken');
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
